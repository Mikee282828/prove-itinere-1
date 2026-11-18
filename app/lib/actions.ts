// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";
import { fetchComposizioniDisponibili, fetchStazioni } from "./data";
import {
  creaTimestamp,
  differenzaInMinuti,
  distanzaStazioni,
  formattaTimeStamp,
  sommaMinutiTimestamp,
} from "./utils";
import { Stazione, Treno } from "./definitions";

const sql = neon(process.env.DATABASE_URL || "");

const CreateConvoglio = z.object({
  materiale: z
    .array(
      z.string("Selezionare almeno uno dei materiali rotabili disponibili"),
    )
    .nonempty(),
});

export type State = {
  errors?: {
    materiale?: string[];
  };
  message?: string | null;
};

// CONVOGLIO CRUD
// CREATE CONVOGLIO
export async function createConvoglio(prevState: State, formData: FormData) {
  const validatedFields = CreateConvoglio.safeParse({
    materiale: formData.getAll("materiale"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti. Creazione convoglio fallita. ",
    };
  }

  const { materiale } = validatedFields.data;

  try {
    const convoglioInserito =
      await sql`INSERT INTO convoglio DEFAULT VALUES RETURNING id`;
    console.log(convoglioInserito);
    // promise all per aspettare che finiscano tutte le query prima di revalidate
    await Promise.all(
      materiale.map(async (mat) => {
        await sql`
                INSERT INTO composizione (convoglio, id_mat)
                VALUES (${convoglioInserito[0].id}, ${mat});
                `;
      }),
    );
  } catch (error) {
    return {
      message: "Errore. Impossibile creare il convoglio",
    };
  }
  revalidatePath("/esercizio"); // clear cached path
  redirect("/esercizio"); // redirect
}

const UpdateConvoglio = z.object({
  materiale: z
    .array(
      z.string("Selezionare almeno uno dei materiali rotabili disponibili"),
    )
    .nonempty(),
});

// UPDATE CONVOGLIO
export async function updateConvoglio(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateConvoglio.safeParse({
    materiale: formData.getAll("materiale"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore validazione",
    };
  }

  const { materiale } = validatedFields.data;
  console.log(materiale, id);
  try {
    const transactionQueries = [];
    transactionQueries.push(
      sql`DELETE FROM composizione WHERE convoglio=${id}`,
    );
    transactionQueries.push(sql`
      INSERT INTO composizione (convoglio, id_mat)
      SELECT ${id}, selected.id_mat
      FROM unnest(${materiale}::varchar[]) AS selected(id_mat)`);

    await sql.transaction(transactionQueries);
  } catch (e) {
    return {
      message: "Errore database, impossibile modificare il convoglio.",
    };
  }
  revalidatePath("/esercizio");
  redirect("/esercizio");
}

export async function deleteConvoglio(id: string) {
  try {
    const transactionQueries = [];
    transactionQueries.push(
      sql`DELETE FROM composizione WHERE convoglio=${id}`,
    );
    transactionQueries.push(sql`DELETE FROM convoglio WHERE id = ${id}`);
    await sql.transaction(transactionQueries);
  } catch (error) {
    console.error(error);
  }
  revalidatePath("/dashboard/invoices");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const corsaSchema = z.object({
  data: z.iso.date("Inserire la data!"),
  codiceTreno: z.coerce
    .number("Inserire un numero compreso tra 1 e 20")
    .int()
    .max(20)
    .min(1),
  convoglio: z.coerce
    .number("Inserire un numero convoglio valido!")
    .int()
    .min(1),
  orario: z.iso.time("Inserire un orario valido!"),
  stazione: z.enum(["Torre Spaventa", "Villa San Felice"]),
  ritorno: z.iso.time("Inserire un orario valido!"),
});

export type StateCorsa = {
  errors?: {
    data?: string[];
    codiceTreno?: string[];
    convoglio?: string[];
    orario?: string[];
    stazione?: string[];
    orario_ritorno?: string[];
    data_ritorno?: string[];
    codiceTreno_ritorno?: string[];
  };
  message?: string | null;
  enteredFormData?: {
    data?: string;
    codiceTreno?: string;
    convoglio?: string;
    orario?: string;
    stazione?: string;
    orario_ritorno?: string;
    data_ritorno?: string;
    codiceTreno_ritorno?: string;
  };
  ritornoObbligatorio?: boolean;
  inizioRitorno?: string;
  dataRitorno?: string;
};

//---------CREATE CORSA---------//

const noReturnCorsaSchema = corsaSchema.omit({ ritorno: true });

export async function createCorsa(
  prevState: StateCorsa,
  formData: FormData,
): Promise<StateCorsa> {
  // prende campo name e non id! (gli input html)
  const validatedFields = noReturnCorsaSchema.safeParse({
    data: formData.get("data"),
    codiceTreno: formData.get("codiceTreno"),
    orario: formData.get("orario"),
    stazione: formData.get("stazione"),
    convoglio: formData.get("convoglio"),
  });

  console.log(
    "data " + formData.get("data"),
    "codice " + formData.get("codiceTreno"),
    "orario " + formData.get("orario"),
    "stazione " + formData.get("stazione"),
    "convoglio " + formData.get("convoglio"),
  );

  // Dati da restituire indietro nel caso di errori
  const rawData = {
    data: formData.get("data") as string,
    codiceTreno: formData.get("codiceTreno") as string,
    convoglio: formData.get("convoglio") as string,
    stazione: formData.get("stazione") as string,
    orario: formData.get("orario") as string,
  };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti. Creazione corsa fallita.",
      enteredFormData: rawData,
    };
  }

  const dati = validatedFields.data;

  //#daFare
  // * 1se il convoglio è effetivamente disponibile
  // *(manca la creazione forzata del ritorno) 2se il convoglio deve essere riportato indietro entro un tempo limite => avvisa e obbliga il ritorno
  // *(gestire il caso di cambio giorno) 3se il convoglio è disponibile e senza vincoli allora crealo

  // Controlla se ci sono treni con lo stesso codice e data di quello che si vuole creare
  try {
    const trenoPresente =
      await sql`SELECT * FROM treno WHERE treno.data = ${dati.data} AND treno.codice = ${dati.codiceTreno} `;
    if (trenoPresente.length !== 0)
      return {
        message:
          "Errore. Impossibile creare un treno con lo stesso codice di un altro treno nello stesso giorno",
        enteredFormData: rawData,
      };
  } catch (error) {
    console.error(error);
    return {
      message: "Errore di controllo",
      errors: {},
      enteredFormData: rawData,
    };
  }

  //1CONTROLLO se il convoglio è effettivamente disponibile
  try {
    const convogliDisponibili = await fetchComposizioniDisponibili(
      dati.data,
      dati.orario,
      dati.stazione,
    );
    if (
      convogliDisponibili.some(
        (convoglio) => convoglio.convoglio === String(dati.convoglio),
      )
    ) {
    } else {
      throw Error;
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Il convoglio non è disponibile nel lasso di tempo selezionato",
      errors: {},
      enteredFormData: rawData,
    };
  }

  // 2CONTROLLO se il convoglio ha bisogno di un ritorno obbligatorio o se non è possibile utilizzarlo
  try {
    const inizioTs = creaTimestamp(new Date(dati.data), dati.orario) as string;

    // Prima partenza terminale (arrivo NULL) del convoglio dopo l'inizio del nuovo treno,
    // da QUALSIASI delle due stazioni terminali
    const prossimaPartenza = await sql`
      WITH tracce_unite AS (
        SELECT orario_arrivo, orario_partenza, stazione, data, treno
        FROM traccia_passata
        UNION ALL
        SELECT orario_arrivo, orario_partenza, stazione, data, treno
        FROM traccia_corrente
      )
      SELECT
        treno.convoglio,
        tr.stazione,
        tr.data,
        tr.orario_partenza AS partenza
      FROM treno
      JOIN tracce_unite AS tr
        ON tr.data = treno.data
       AND tr.treno = treno.codice
      WHERE tr.orario_partenza >= ${inizioTs}
        AND treno.convoglio = ${dati.convoglio}
        AND tr.stazione IN ('Torre Spaventa','Villa San Felice') 
        AND tr.orario_arrivo IS NULL
        AND tr.orario_partenza IS NOT NULL
      ORDER BY tr.orario_partenza ASC
      LIMIT 1;
    `;

    if (prossimaPartenza.length > 0) {
      const prossima = prossimaPartenza[0];
      const stazioni = await fetchStazioni();
      const minutiPerSubtratta = await distanzaStazioni(50, stazioni);

      let subtrattaOccupata;
      let orarioPartenza: string = inizioTs;

      if (dati.stazione === "Villa San Felice") {
        stazioni.reverse();
        minutiPerSubtratta.reverse();
      }

      // CICLO SUBTRATTE ANDATA
      console.log(
        "-------Inizio ciclo per controllo delle subtratte in andata--------",
      );
      for (let i = 0; i < minutiPerSubtratta.length; i++) {
        // Controlla se la subtratta è occupata
        console.log("index = " + i);
        console.log(`Subtratta: ${stazioni[i].nome} - ${stazioni[i + 1].nome}`);

        subtrattaOccupata = await sql`
          SELECT * FROM subtratta
          WHERE
          ((stazione_a = ${stazioni[i].nome} AND stazione_b = ${stazioni[i + 1].nome})
          OR (stazione_a = ${stazioni[i + 1].nome} AND stazione_b = ${stazioni[i].nome}))
          AND data_treno >= ${dati.data}
          AND (fine_occupazione>${orarioPartenza} AND inizio_occupazione<${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])})
          ORDER BY data_treno,inizio_occupazione
          LIMIT 1;
        `;

        if (subtrattaOccupata.length > 0) {
          orarioPartenza = subtrattaOccupata[0].fine_occupazione;
          console.log(
            `Subtratta occupante: ${subtrattaOccupata[0].inizio_occupazione} - ${subtrattaOccupata[0].fine_occupazione}, nuovo tempo di partenza: ${orarioPartenza}`,
          );
          console.log(
            "Data treno: " +
              subtrattaOccupata[0].data_treno.getFullYear() +
              "-" +
              String(subtrattaOccupata[0].data_treno.getMonth() + 1).padStart(
                2,
                "0",
              ) +
              "-" +
              String(subtrattaOccupata[0].data_treno.getDate()).padStart(
                2,
                "0",
              ),
          );
          console.log("Codice treno: " + subtrattaOccupata[0].codice_treno);
          i--;
        } else {
          console.log(
            `Subtratta non occupata, tempo di partenza: ${orarioPartenza}, tempo di arrivo: ${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])}`,
          );
          orarioPartenza = sommaMinutiTimestamp(
            orarioPartenza,
            minutiPerSubtratta[i],
          );
        }
      }
        console.log(
        "-------Fine ciclo per controllo delle subtratte in andata--------",
      );
      // CICLO SUBTRATTE RITORNO
      console.log(
        "-------Inizio ciclo per controllo delle subtratte di ritorno--------",
      );

      // Il treno è arrivato alla stazione opposta a orarioPartenza
      const arrivoAndata = orarioPartenza;

      // CASO A: il convoglio ha già una partenza dalla stazione opposta => verrà riportato
      // indietro da quel treno. Basta che il nuovo treno ci arrivi prima.
      if (prossima.stazione !== dati.stazione) {
        const margine = differenzaInMinuti(arrivoAndata, prossima.partenza);
        if (margine < 0) {
          return {
            message: `Il convoglio selezionato non arriverà in tempo per il treno che parte ${formattaTimeStamp(prossima.partenza)}`,
            errors: {},
            enteredFormData: rawData,
          };
        }
        // altrimenti nessun ritorno obbligatorio: si prosegue con la creazione
      }
      // CASO B: la prossima partenza è dalla stessa stazione di partenza => serve un ritorno
      else {
        const inizioRitorno = arrivoAndata;

        // CICLO SUBTRATTE RITORNO
        for (let i = minutiPerSubtratta.length - 1; i >= 0; i--) {
          subtrattaOccupata = await sql`
            SELECT * FROM subtratta
            WHERE
            ((stazione_a = ${stazioni[i + 1].nome} AND stazione_b = ${stazioni[i].nome})
            OR (stazione_a = ${stazioni[i].nome} AND stazione_b = ${stazioni[i + 1].nome}))
            AND data_treno >= ${dati.data}
            AND (fine_occupazione>${orarioPartenza} AND inizio_occupazione<${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])})
            ORDER BY data_treno,inizio_occupazione
            LIMIT 1;
          `;

          if (subtrattaOccupata.length > 0) {
            orarioPartenza = subtrattaOccupata[0].fine_occupazione;
          console.log(
            `Subtratta occupante: ${subtrattaOccupata[0].inizio_occupazione} - ${subtrattaOccupata[0].fine_occupazione}, nuovo tempo di partenza: ${orarioPartenza}`,
          );
          console.log(
            "Data treno: " +
              subtrattaOccupata[0].data_treno.getFullYear() +
              "-" +
              String(subtrattaOccupata[0].data_treno.getMonth() + 1).padStart(
                2,
                "0",
              ) +
              "-" +
              String(subtrattaOccupata[0].data_treno.getDate()).padStart(
                2,
                "0",
              ),
          );
          console.log("Codice treno: " + subtrattaOccupata[0].codice_treno);
            i++;
          } else {
          console.log(
            `Subtratta non occupata, tempo di partenza: ${orarioPartenza}, tempo di arrivo: ${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])}`,
          );
            orarioPartenza = sommaMinutiTimestamp(
              orarioPartenza,
              minutiPerSubtratta[i],
            );
          }
        }
      console.log(
        "-------Fine ciclo per controllo delle subtratte di ritorno--------",
      );

        const differenza = differenzaInMinuti(
          orarioPartenza,
          prossima.partenza,
        );

        console.log(
        `L'arrivo stimato del treno che si vuole creare nella stazione originale è alle: ${orarioPartenza}`,
      );
      console.log(
        `Mentre la partenza del primo treno che utilizza lo stesso convoglio nella stessa stazione è alle: ${prossima.partenza}`,
      );
      console.log(
        `La differenza in minuti tra l'arrivo stimato del treno che si vuole creare e il primo treno che utilizza lo stesso convoglio nella stessa stazione è di ${differenza} minuti`,
      );

        if (differenza < 0) {
          return {
            message: `Il convoglio selezionato non potrà tornare in tempo per il treno che parte ${formattaTimeStamp(prossima.partenza)}`,
            errors: {},
            enteredFormData: rawData,
          };
        }
        return {
          message: `Il treno selezionato ha bisogno della programmazione di un ritorno obbligatorio prima di ${formattaTimeStamp(prossima.partenza)}`,
          errors: {},
          enteredFormData: rawData,
          ritornoObbligatorio: true,
          inizioRitorno: inizioRitorno,
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Errore. Si è verificato un errore nella verifica.",
      errors: {},
      enteredFormData: rawData,
    };
  }

  // 3CREAZIONE CORSA
  try {
    // init array di query
    const transactionQueries = [];
    //treno
    transactionQueries.push(sql`INSERT INTO treno (codice, convoglio, data, stato) 
                                VALUES (${dati.codiceTreno}, ${dati.convoglio}, ${dati.data}, 'finalizzato') 
                                ON CONFLICT (codice,data) DO NOTHING;`);

    const stazioni = await fetchStazioni();
    const minutiPerSubtratta = await distanzaStazioni(50, stazioni);
    let subtrattaOccupata;
    let orarioPartenza: string = creaTimestamp(
      new Date(dati.data),
      dati.orario,
    ) as string;

    // se Torre Spaventa => parti normalmente altrimenti inverti l'ordine delle stazioni

    if (dati.stazione === "Villa San Felice") {
      stazioni.reverse();
      minutiPerSubtratta.reverse();
    }

    // CICLO SUBTRATTE ANDATA
    console.log(
      "-------Inizio ciclo per controllo delle subtratte in andata--------",
    );

    for (let i = 0; i < minutiPerSubtratta.length; i++) {
      // Controlla se la subtratta è occupata
      console.log("---------------------------------------------------------");
      console.log("index = " + i);
      console.log(`Subtratta: ${stazioni[i].nome} - ${stazioni[i + 1].nome}`);

      subtrattaOccupata = await sql`
          SELECT * FROM subtratta 
          WHERE 
          -- Stazioni
          ((stazione_a = ${stazioni[i].nome} AND stazione_b = ${stazioni[i + 1].nome}) 
          OR (stazione_a = ${stazioni[i + 1].nome} AND stazione_b = ${stazioni[i].nome}))
          -- Data
          AND data_treno >= ${dati.data}
          -- Orari che si intersicano
          AND (fine_occupazione>${orarioPartenza} AND inizio_occupazione<${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])})
          ORDER BY data_treno,inizio_occupazione
          LIMIT 1;
        `;

      // Se la subtratta è occupata allora riassegna la partenza e riitera sulla stessa subtratta
      if (subtrattaOccupata.length > 0) {
        orarioPartenza = subtrattaOccupata[0].fine_occupazione;
        console.log(
          `Subtratta occupante: ${subtrattaOccupata[0].inizio_occupazione} - ${subtrattaOccupata[0].fine_occupazione}, nuovo tempo di partenza: ${orarioPartenza}`,
        );
        console.log(
          "Data treno: " +
            subtrattaOccupata[0].data_treno.getFullYear() +
            "-" +
            String(subtrattaOccupata[0].data_treno.getMonth() + 1).padStart(
              2,
              "0",
            ) +
            "-" +
            String(subtrattaOccupata[0].data_treno.getDate()).padStart(2, "0"),
        );
        console.log("Codice treno: " + subtrattaOccupata[0].codice_treno);
        i--;
      } else {
        console.log(
          `Subtratta non occupata, tempo di partenza: ${orarioPartenza}, tempo di arrivo: ${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])}`,
        );

        // query di inserimento andata
        //traccia
        transactionQueries.push(sql`INSERT INTO traccia_corrente (orario_arrivo,orario_partenza,stazione, treno, data)
                                        VALUES (
                                        ${i > 0 ? orarioPartenza : null},
                                        ${orarioPartenza},
                                        ${stazioni[i].nome},
                                        ${dati.codiceTreno},
                                        ${dati.data}) ON CONFLICT (treno,data,stazione) DO NOTHING;`);
        // subtratta
        transactionQueries.push(sql`INSERT INTO subtratta (stazione_a, stazione_b, inizio_occupazione, fine_occupazione, codice_treno, data_treno)
                                    VALUES (${stazioni[i].nome},${stazioni[i + 1].nome},${orarioPartenza},${sommaMinutiTimestamp(orarioPartenza, minutiPerSubtratta[i])},${dati.codiceTreno},${dati.data});
                `);

        orarioPartenza = sommaMinutiTimestamp(
          orarioPartenza,
          minutiPerSubtratta[i],
        );

        if (i === minutiPerSubtratta.length - 1) {
          transactionQueries.push(sql`INSERT INTO traccia_corrente (orario_arrivo,orario_partenza,stazione, treno, data)
                                        VALUES (
                                        ${orarioPartenza},
                                        ${null},
                                        ${stazioni[i + 1].nome},
                                        ${dati.codiceTreno},
                                        ${dati.data}) ON CONFLICT (treno,data,stazione) DO NOTHING;`);
        }
      }
    }
    console.log(
      "-------Fine ciclo per controllo delle subtratte in andata--------",
    );

    await sql.transaction(transactionQueries);
  } catch (error) {
    console.error(error);
    return {
      message: "Errore nella creazione",
      errors: {},
      enteredFormData: rawData,
    };
  }

  revalidatePath("/esercizio"); // clear cached path
  redirect("/esercizio"); // redirect
}

const corsaWithRitornoSchema = z.object({
  data: z.iso.date("Inserire la data!"),
  codiceTreno: z.coerce
    .number("Inserire un numero compreso tra 1 e 20")
    .int()
    .max(20)
    .min(1),
  convoglio: z.coerce
    .number("Inserire un numero convoglio valido!")
    .int()
    .min(1),
  orario: z.iso.time("Inserire un orario valido!"),
  stazione: z.enum(["Torre Spaventa", "Villa San Felice"]),
  data_ritorno: z.iso.date("Inserire la data di ritorno!"),
  codiceTreno_ritorno: z.coerce
    .number("Inserire un numero compreso tra 1 e 20")
    .int()
    .max(20)
    .min(1),
  orario_ritorno: z.iso.time("Inserire un orario di ritorno valido!"),
});

export async function createCorsaWithRitorno(
  prevState: StateCorsa,
  formData: FormData,
): Promise<StateCorsa> {
  const validatedFields = corsaWithRitornoSchema.safeParse({
    data: formData.get("data"),
    codiceTreno: formData.get("codiceTreno"),
    orario: formData.get("orario"),
    stazione: formData.get("stazione"),
    convoglio: formData.get("convoglio"),
    data_ritorno: formData.get("data_ritorno"),
    codiceTreno_ritorno: formData.get("codiceTreno_ritorno"),
    orario_ritorno: formData.get("orario_ritorno"),
  });

  // Dati da restituire indietro nel caso di errori
  const rawData = {
    data: formData.get("data") as string,
    codiceTreno: formData.get("codiceTreno") as string,
    convoglio: formData.get("convoglio") as string,
    stazione: formData.get("stazione") as string,
    orario: formData.get("orario") as string,
    data_ritorno: formData.get("data_ritorno") as string,
    codiceTreno_ritorno: formData.get("codiceTreno_ritorno") as string,
    orario_ritorno: formData.get("orario_ritorno") as string,
  };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti o non validi. Creazione corsa fallita.",
      enteredFormData: rawData,
    };
  }

  const dati = validatedFields.data;

  // Controllo codici treno
  try {
    if (
      dati.data === dati.data_ritorno &&
      dati.codiceTreno === dati.codiceTreno_ritorno
    ) {
      return {
        message:
          "Errore. Il treno di andata e il treno di ritorno non possono avere lo stesso codice nello stesso giorno.",
        errors: {
          codiceTreno_ritorno: [
            "Codice treno già utilizzato per il treno di andata",
          ],
        },
        enteredFormData: rawData,
      };
    }

    const trenoAndataPresente = await sql`
      SELECT * FROM treno WHERE treno.data = ${dati.data} AND treno.codice = ${dati.codiceTreno}
    `;
    if (trenoAndataPresente.length !== 0) {
      return {
        message:
          "Errore. Impossibile creare il treno di andata con lo stesso codice di un altro treno nello stesso giorno.",
        enteredFormData: rawData,
      };
    }

    const trenoRitornoPresente = await sql`
      SELECT * FROM treno WHERE treno.data = ${dati.data_ritorno} AND treno.codice = ${dati.codiceTreno_ritorno}
    `;
    if (trenoRitornoPresente.length !== 0) {
      return {
        message:
          "Errore. Impossibile creare il treno di ritorno con lo stesso codice di un altro treno nello stesso giorno.",
        errors: {
          codiceTreno_ritorno: ["Codice treno già occupato in questa data"],
        },
        enteredFormData: rawData,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Errore nel controllo dei codici treno.",
      errors: {},
      enteredFormData: rawData,
    };
  }

  // 1 CONTROLLO se il convoglio è effettivamente disponibile per l'andata
  try {
    const convogliDisponibili = await fetchComposizioniDisponibili(
      dati.data,
      dati.orario,
      dati.stazione,
    );
    if (
      !convogliDisponibili.some(
        (convoglio) => convoglio.convoglio === String(dati.convoglio),
      )
    ) {
      return {
        message:
          "Il convoglio non è disponibile nel lasso di tempo selezionato per l'andata.",
        errors: {},
        enteredFormData: rawData,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Errore nel controllo disponibilità convoglio.",
      errors: {},
      enteredFormData: rawData,
    };
  }

  // 2 CONTROLLO orari, subtratte e ritorno
  try {
    const inizioAndataTs = creaTimestamp(
      new Date(dati.data),
      dati.orario,
    ) as string;
    const inizioRitornoTs = creaTimestamp(
      new Date(dati.data_ritorno),
      dati.orario_ritorno,
    ) as string;

    // Prossima partenza terminale del convoglio già programmata dopo l'inizio del nuovo treno
    const prossimaPartenza = await sql`
      WITH tracce_unite AS (
        SELECT orario_arrivo, orario_partenza, stazione, data, treno
        FROM traccia_passata
        UNION ALL
        SELECT orario_arrivo, orario_partenza, stazione, data, treno
        FROM traccia_corrente
      )
      SELECT
        treno.convoglio,
        tr.stazione,
        tr.data,
        tr.orario_partenza AS partenza
      FROM treno
      JOIN tracce_unite AS tr
        ON tr.data = treno.data
       AND tr.treno = treno.codice
      WHERE tr.orario_partenza >= ${inizioAndataTs}
        AND treno.convoglio = ${dati.convoglio}
        AND tr.stazione IN ('Torre Spaventa', 'Villa San Felice')
        AND tr.orario_arrivo IS NULL
        AND tr.orario_partenza IS NOT NULL
      ORDER BY tr.orario_partenza ASC
      LIMIT 1;
    `;

    // SIMULAZIONE ANDATA
    const stazioniAndata = await fetchStazioni();
    const minutiPerSubtrattaAndata = await distanzaStazioni(50, stazioniAndata);

    if (dati.stazione === "Villa San Felice") {
      stazioniAndata.reverse();
      minutiPerSubtrattaAndata.reverse();
    }

    let orarioPartenzaAndata = inizioAndataTs;
    const tracceAndata: {
      stazione: string;
      arrivo: string | null;
      partenza: string | null;
    }[] = [];
    const subtratteAndata: {
      stazione_a: string;
      stazione_b: string;
      inizio: string;
      fine: string;
    }[] = [];

    for (let i = 0; i < minutiPerSubtrattaAndata.length; i++) {
      const fineStimata = sommaMinutiTimestamp(
        orarioPartenzaAndata,
        minutiPerSubtrattaAndata[i],
      );
      const subtrattaOccupata = await sql`
        SELECT * FROM subtratta
        WHERE
        ((stazione_a = ${stazioniAndata[i].nome} AND stazione_b = ${stazioniAndata[i + 1].nome})
        OR (stazione_a = ${stazioniAndata[i + 1].nome} AND stazione_b = ${stazioniAndata[i].nome}))
        AND data_treno >= ${dati.data}
        AND (fine_occupazione > ${orarioPartenzaAndata} AND inizio_occupazione < ${fineStimata})
        ORDER BY data_treno, inizio_occupazione
        LIMIT 1;
      `;

      if (subtrattaOccupata.length > 0) {
        orarioPartenzaAndata = subtrattaOccupata[0].fine_occupazione;
        i--;
      } else {
        tracceAndata.push({
          stazione: stazioniAndata[i].nome,
          arrivo: i > 0 ? orarioPartenzaAndata : null,
          partenza: orarioPartenzaAndata,
        });

        subtratteAndata.push({
          stazione_a: stazioniAndata[i].nome,
          stazione_b: stazioniAndata[i + 1].nome,
          inizio: orarioPartenzaAndata,
          fine: fineStimata,
        });

        orarioPartenzaAndata = fineStimata;

        if (i === minutiPerSubtrattaAndata.length - 1) {
          tracceAndata.push({
            stazione: stazioniAndata[i + 1].nome,
            arrivo: orarioPartenzaAndata,
            partenza: null,
          });
        }
      }
    }

    const arrivoAndataTs = orarioPartenzaAndata;

    // Controllo che il ritorno non parta prima dell'arrivo dell'andata
    const diffAndataRitorno = differenzaInMinuti(
      arrivoAndataTs,
      inizioRitornoTs,
    );
    if (diffAndataRitorno < 0) {
      return {
        message: `L'orario di partenza del ritorno (${formattaTimeStamp(inizioRitornoTs)}) non può essere antecedente all'arrivo dell'andata (${formattaTimeStamp(arrivoAndataTs)}).`,
        errors: {
          orario_ritorno: [
            "L'orario di partenza deve essere successivo all'arrivo dell'andata.",
          ],
        },
        enteredFormData: rawData,
      };
    }

    // SIMULAZIONE RITORNO
    const stazioneRitorno =
      dati.stazione === "Torre Spaventa"
        ? "Villa San Felice"
        : "Torre Spaventa";
    const stazioniRitorno = await fetchStazioni();
    const minutiPerSubtrattaRitorno = await distanzaStazioni(
      50,
      stazioniRitorno,
    );

    if (stazioneRitorno === "Villa San Felice") {
      stazioniRitorno.reverse();
      minutiPerSubtrattaRitorno.reverse();
    }

    let orarioPartenzaRitorno = inizioRitornoTs;
    const tracceRitorno: {
      stazione: string;
      arrivo: string | null;
      partenza: string | null;
    }[] = [];
    const subtratteRitorno: {
      stazione_a: string;
      stazione_b: string;
      inizio: string;
      fine: string;
    }[] = [];

    for (let i = 0; i < minutiPerSubtrattaRitorno.length; i++) {
      const fineStimata = sommaMinutiTimestamp(
        orarioPartenzaRitorno,
        minutiPerSubtrattaRitorno[i],
      );
      const subtrattaOccupata = await sql`
        SELECT * FROM subtratta
        WHERE
        ((stazione_a = ${stazioniRitorno[i].nome} AND stazione_b = ${stazioniRitorno[i + 1].nome})
        OR (stazione_a = ${stazioniRitorno[i + 1].nome} AND stazione_b = ${stazioniRitorno[i].nome}))
        AND data_treno >= ${dati.data_ritorno}
        AND (fine_occupazione > ${orarioPartenzaRitorno} AND inizio_occupazione < ${fineStimata})
        ORDER BY data_treno, inizio_occupazione
        LIMIT 1;
      `;

      if (subtrattaOccupata.length > 0) {
        orarioPartenzaRitorno = subtrattaOccupata[0].fine_occupazione;
        i--;
      } else {
        tracceRitorno.push({
          stazione: stazioniRitorno[i].nome,
          arrivo: i > 0 ? orarioPartenzaRitorno : null,
          partenza: orarioPartenzaRitorno,
        });

        subtratteRitorno.push({
          stazione_a: stazioniRitorno[i].nome,
          stazione_b: stazioniRitorno[i + 1].nome,
          inizio: orarioPartenzaRitorno,
          fine: fineStimata,
        });

        orarioPartenzaRitorno = fineStimata;

        if (i === minutiPerSubtrattaRitorno.length - 1) {
          tracceRitorno.push({
            stazione: stazioniRitorno[i + 1].nome,
            arrivo: orarioPartenzaRitorno,
            partenza: null,
          });
        }
      }
    }

    const arrivoRitornoTs = orarioPartenzaRitorno;

    // Controllo rispetto alla prossima partenza prevista per lo stesso convoglio
    if (prossimaPartenza.length > 0) {
      const prossima = prossimaPartenza[0];
      const differenza = differenzaInMinuti(arrivoRitornoTs, prossima.partenza);

      if (differenza < 0) {
        return {
          message: `Il convoglio selezionato non potrà tornare in tempo per il treno che parte ${formattaTimeStamp(prossima.partenza)} (arrivo stimato alle ${formattaTimeStamp(arrivoRitornoTs)}).`,
          errors: {},
          enteredFormData: rawData,
        };
      }
    }

    // 3 CREAZIONE CORSA (ANDATA E RITORNO) IN TRANSAZIONE
    const transactionQueries = [];

    // Treno Andata
    transactionQueries.push(sql`
      INSERT INTO treno (codice, convoglio, data, stato)
      VALUES (${dati.codiceTreno}, ${dati.convoglio}, ${dati.data}, 'finalizzato')
      ON CONFLICT (codice, data) DO NOTHING;
    `);

    // Tracce Andata
    for (const t of tracceAndata) {
      transactionQueries.push(sql`
        INSERT INTO traccia_corrente (orario_arrivo, orario_partenza, stazione, treno, data)
        VALUES (
          ${t.arrivo},
          ${t.partenza},
          ${t.stazione},
          ${dati.codiceTreno},
          ${dati.data}
        ) ON CONFLICT (treno, data, stazione) DO NOTHING;
      `);
    }

    // Subtratte Andata
    for (const s of subtratteAndata) {
      transactionQueries.push(sql`
        INSERT INTO subtratta (stazione_a, stazione_b, inizio_occupazione, fine_occupazione, codice_treno, data_treno)
        VALUES (${s.stazione_a}, ${s.stazione_b}, ${s.inizio}, ${s.fine}, ${dati.codiceTreno}, ${dati.data});
      `);
    }

    // Treno Ritorno
    transactionQueries.push(sql`
      INSERT INTO treno (codice, convoglio, data, stato)
      VALUES (${dati.codiceTreno_ritorno}, ${dati.convoglio}, ${dati.data_ritorno}, 'finalizzato')
      ON CONFLICT (codice, data) DO NOTHING;
    `);

    // Tracce Ritorno
    for (const t of tracceRitorno) {
      transactionQueries.push(sql`
        INSERT INTO traccia_corrente (orario_arrivo, orario_partenza, stazione, treno, data)
        VALUES (
          ${t.arrivo},
          ${t.partenza},
          ${t.stazione},
          ${dati.codiceTreno_ritorno},
          ${dati.data_ritorno}
        ) ON CONFLICT (treno, data, stazione) DO NOTHING;
      `);
    }

    // Subtratte Ritorno
    for (const s of subtratteRitorno) {
      transactionQueries.push(sql`
        INSERT INTO subtratta (stazione_a, stazione_b, inizio_occupazione, fine_occupazione, codice_treno, data_treno)
        VALUES (${s.stazione_a}, ${s.stazione_b}, ${s.inizio}, ${s.fine}, ${dati.codiceTreno_ritorno}, ${dati.data_ritorno});
      `);
    }

    await sql.transaction(transactionQueries);
  } catch (error) {
    console.error(error);
    return {
      message: "Errore nella creazione della corsa di andata e ritorno.",
      errors: {},
      enteredFormData: rawData,
    };
  }

  revalidatePath("/esercizio"); // clear cached path
  redirect("/esercizio"); // redirect
}

// da revisionare
const deleteSchema = corsaSchema.omit({});
export async function deleteCorsa(
  treno: Treno,
  prevState: StateCorsa,
): Promise<StateCorsa> {
  const validatedFields = deleteSchema.safeParse({
    data: treno.data,
    codiceTreno: treno.codice,
    convoglio: treno.convoglio,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validazione treno fallita",
    };
  }

  const dati = validatedFields.data;

  const transactionQueries = [];

  transactionQueries.push(
    sql`DELETE FROM subtratta WHERE codice_treno=${dati.codiceTreno} AND data_treno=${dati.data}`,
  );

  transactionQueries.push(
    sql`DELETE FROM traccia_corrente WHERE treno=${dati.codiceTreno} AND data=${dati.data}`,
  );

  transactionQueries.push(
    sql`DELETE FROM treno WHERE codice=${dati.codiceTreno} AND data=${dati.data}`,
  );

  try {
    await sql.transaction(transactionQueries);
  } catch (error) {
    return {
      message: "Errore. Impossibile eliminare la corsa",
    };
  }

  redirect("/esercizio");
}
