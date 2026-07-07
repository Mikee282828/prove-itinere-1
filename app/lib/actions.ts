// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";
import { fetchStazioni } from "./data";
import { sommaMinuti } from "./utils";

const sql = neon(process.env.DATABASE_URL || "");

const convoglioSchema = z.object({
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

export async function createConvoglio(prevState: State, formData: FormData) {
  const validatedFields = convoglioSchema.safeParse({
    materiale: formData.getAll("materiale"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti. Creazione convoglio fallita. ",
    };
  }

  const { materiale } = validatedFields.data;
  console.log(materiale);

  try {
    const convoglioInserito =
      await sql`INSERT INTO convoglio DEFAULT VALUES RETURNING id`;
    console.log(convoglioInserito);
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const corsaSchema = z.object({
  data: z.coerce.date("Inserire la data!"),
  codiceTreno: z.coerce
    .number("Inserire un numero compreso tra 1 e 20")
    .int()
    .max(20)
    .min(1),
  convoglio: z.coerce
    .number("Inserire un numero convoglio valido!")
    .int()
    .min(1),
  andata1: z.iso.time("Formattazione orario non valida!"),
  andata2: z.iso.time("Formattazione orario non valida!"),
  andata3: z.iso.time("Formattazione orario non valida!"),
  andata4: z.iso.time("Formattazione orario non valida!"),
  andata5: z.iso.time("Formattazione orario non valida!"),
  andata6: z.iso.time("Formattazione orario non valida!"),
  andata7: z.iso.time("Formattazione orario non valida!"),
  andata8: z.iso.time("Formattazione orario non valida!"),
  andata9: z.iso.time("Formattazione orario non valida!"),
  ritorno2: z.iso.time("Formattazione orario non valida!"),
  ritorno3: z.iso.time("Formattazione orario non valida!"),
  ritorno4: z.iso.time("Formattazione orario non valida!"),
  ritorno5: z.iso.time("Formattazione orario non valida!"),
  ritorno6: z.iso.time("Formattazione orario non valida!"),
  ritorno7: z.iso.time("Formattazione orario non valida!"),
  ritorno8: z.iso.time("Formattazione orario non valida!"),
  ritorno9: z.iso.time("Formattazione orario non valida!"),
  ritorno10: z.iso.time("Formattazione orario non valida!"),
});

export type StateCorsa = {
  errors?: {
    data?: string[];
    codiceTreno?: string[];
    convoglio?: string[];
    [key: string]: string[] | undefined;
  };
  message?: string | null;
  enteredFormData?: {
    data?: string;
    codiceTreno?: string;
    convoglio?: string;
    [key: string]: string | undefined;
  };
};

export async function createCorsa(prevState: StateCorsa, formData: FormData) {
  // prende campo name e non id! (gli input html)
  const validatedFields = corsaSchema.safeParse({
    data: formData.get("data"),
    codiceTreno: formData.get("codiceTreno"),
    convoglio: formData.get("convoglio"),
    andata1: formData.get("andata1"),
    andata2: formData.get("andata2"),
    andata3: formData.get("andata3"),
    andata4: formData.get("andata4"),
    andata5: formData.get("andata5"),
    andata6: formData.get("andata6"),
    andata7: formData.get("andata7"),
    andata8: formData.get("andata8"),
    andata9: formData.get("andata9"),
    ritorno2: formData.get("ritorno2"),
    ritorno3: formData.get("ritorno3"),
    ritorno4: formData.get("ritorno4"),
    ritorno5: formData.get("ritorno5"),
    ritorno6: formData.get("ritorno6"),
    ritorno7: formData.get("ritorno7"),
    ritorno8: formData.get("ritorno8"),
    ritorno9: formData.get("ritorno9"),
    ritorno10: formData.get("ritorno10"),
  });

  const rawData = {
    data: formData.get("data") as string,
    codiceTreno: formData.get("codiceTreno") as string,
    convoglio: formData.get("convoglio") as string,
    andata1: formData.get("andata1") as string,
    andata2: formData.get("andata2") as string,
    andata3: formData.get("andata3") as string,
    andata4: formData.get("andata4") as string,
    andata5: formData.get("andata5") as string,
    andata6: formData.get("andata6") as string,
    andata7: formData.get("andata7") as string,
    andata8: formData.get("andata8") as string,
    andata9: formData.get("andata9") as string,
    ritorno2: formData.get("ritorno2") as string,
    ritorno3: formData.get("ritorno3") as string,
    ritorno4: formData.get("ritorno4") as string,
    ritorno5: formData.get("ritorno5") as string,
    ritorno6: formData.get("ritorno6") as string,
    ritorno7: formData.get("ritorno7") as string,
    ritorno8: formData.get("ritorno8") as string,
    ritorno9: formData.get("ritorno9") as string,
    ritorno10: formData.get("ritorno10") as string,
  };

  //uscita anticipata in caso di errori di validazione
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti. Creazione corsa fallita.",
      entereFormData: rawData,
    };
  }

  const dati = validatedFields.data;

  try {
    // controlla se ci sono treni con lo stesso codice e data di quello che si vuole creare
    // se sì allora uscita anticipata
    const trenoPresente =
      await sql`SELECT * FROM treno WHERE treno.data = ${dati.data} AND treno.codice = ${dati.codiceTreno} `;
    if (trenoPresente.length !== 0)
      return {
        message:
          "Errore. Impossibile creare due treni con lo stesso codice nello stesso giorno",
        enteredFormData: rawData,
      };
    const transactionQueries = [];
    //treno
    transactionQueries.push(sql`INSERT INTO treno (codice, convoglio, data) 
                                        VALUES (${dati.codiceTreno}, ${dati.convoglio}, ${dati.data}) 
                                        ON CONFLICT (codice,data) DO NOTHING;`);

    // prendi tutte le stazioni
    const stazioni = await fetchStazioni();

    // ciclare sulle subtratte di andata
    // (OrarioArrivo>inizio_occupazione AND OrarioPartenza<fine_occupazione)
    let conflittoSubtratte;
    let orarioArrivo;
    let orarioPartenza;
    let orarioPartenzaSucc;
    let minPercorrenzaSubtratta;
    // ANDATA
    for (let i = 1; i < 10; i++) {
      // minuti di percorrenza della subtratta corrente
      minPercorrenzaSubtratta = (
        Math.abs(stazioni[i].km - stazioni[i - 1].km) * 1.2
      ).toFixed(2);
      //partenza dalla stazione corrente
      orarioPartenza = dati[`andata${i}` as keyof typeof dati];
      //arrivo alla stazione successiva
      orarioArrivo = sommaMinuti(
        orarioPartenza as string,
        minPercorrenzaSubtratta,
      );
      //partenza dalla stazione successiva
      orarioPartenzaSucc =
        i < 9 ? dati[`andata${i + 1}` as keyof typeof dati] : dati.ritorno10;
      // se l'orario di partenza dalla stazione successiva è anteriore all'orario di arrivo alla stazione successiva allora uscita anticipata
      if (orarioPartenzaSucc < orarioArrivo) {
        return {
          message: `Per la subtratta: ${stazioni[i - 1].nome} - ${stazioni[i].nome}, l'orario di partenza ${orarioPartenzaSucc} da ${stazioni[i].nome} è successiva all'orario minima di arrivo ${orarioArrivo}`,
          enteredFormData: rawData,
        };
      }
      // cerca subtratte sovrapposte agli orari che si vogliono creare
      conflittoSubtratte = await sql`
                SELECT * from subtratta as sb
                WHERE data_treno = ${dati.data}
                AND stazione_a = ${stazioni[i - 1].nome}
                AND stazione_b = ${stazioni[i].nome}
                AND ${orarioArrivo}>inizio_occupazione 
                AND ${orarioPartenza}<fine_occupazione
            `;
      // se ci sono subtratte sovrapposte allora uscita anticipata
      if (conflittoSubtratte.length > 0) {
        return {
          message: `L'orario della subtratta "${stazioni[i - 1].nome} - ${stazioni[i].nome}"
                        è sovrapposta con l'orario del treno ${conflittoSubtratte.map((sub) => sub?.codice_treno)}`,
          enteredFormData: rawData,
        };
      }
      // query di inserimento andata
      //traccia
      transactionQueries.push(sql`INSERT INTO traccia_corrente (orario_arrivo,orario_partenza,stazione, treno, data, progressivo)
                                        VALUES (${i > 1 ? sommaMinuti(dati[`andata${i - 1}` as keyof typeof dati] as string, (Math.abs(stazioni[i - 1].km - stazioni[i - 2].km) * 1.2).toFixed(2)) : null},
                                        ${orarioPartenza},
                                        ${stazioni[i - 1].nome},
                                        ${dati.codiceTreno},
                                        ${dati.data},1) ON CONFLICT (treno,data,stazione,progressivo) DO NOTHING;`);
      // subtratta
      transactionQueries.push(sql`INSERT INTO subtratta (stazione_a, stazione_b, inizio_occupazione, fine_occupazione, codice_treno, data_treno)
                                        VALUES (${stazioni[i - 1].nome},${stazioni[i].nome},${orarioPartenza},${orarioArrivo},${dati.codiceTreno},${dati.data});
                `);
    }
    // RITORNO
    for (let i = 10; i > 1; i--) {
      // minuti di percorrenza della subtratta corrente
      minPercorrenzaSubtratta = (
        Math.abs(stazioni[i - 1].km - stazioni[i - 2].km) * 1.2
      ).toFixed(2);
      //partenza dalla stazione corrente
      orarioPartenza = dati[`ritorno${i}` as keyof typeof dati];
      //arrivo alla stazione successiva
      orarioArrivo = sommaMinuti(
        dati[`ritorno${i}` as keyof typeof dati] as string,
        minPercorrenzaSubtratta,
      );
      //partenza dalla stazione successiva
      orarioPartenzaSucc =
        i > 2 && dati[`ritorno${i - 1}` as keyof typeof dati];
      // se l'orario di partenza dalla stazione successiva è anteriore all'orario di arrivo alla stazione successiva allora uscita anticipata
      if (orarioPartenzaSucc && orarioPartenzaSucc < orarioArrivo) {
        return {
          message: `Per la subtratta: ${stazioni[i - 1].nome} - ${stazioni[i - 2].nome}, l'orario di partenza ${orarioPartenzaSucc} da ${stazioni[i - 2].nome} è successiva all'orario minima di arrivo ${orarioArrivo}`,
          enteredFormData: rawData,
        };
      }
      // cerca subtratte sovrapposte agli orari che si vogliono creare
      conflittoSubtratte = await sql`
                SELECT * from subtratta as sb
                WHERE data_treno = ${dati.data}
                AND stazione_a = ${stazioni[i - 1].nome}
                AND stazione_b = ${stazioni[i - 2].nome}
                AND ${orarioArrivo}>inizio_occupazione 
                AND ${orarioPartenza}<fine_occupazione
            `;
      // se ci sono subtratte sovrapposte allora uscita anticipata
      if (conflittoSubtratte.length > 0) {
        return {
          message: `L'orario della subtratta "${stazioni[i - 1].nome} - ${stazioni[i - 2].nome}"
                        è sovrapposta con l'orario del treno ${conflittoSubtratte.map((sub) => sub?.codice_treno)}`,
          enteredFormData: rawData,
        };
      }
      //traccia
      transactionQueries.push(sql`INSERT INTO traccia_corrente (orario_arrivo,orario_partenza,stazione, treno, data, progressivo)
                                        VALUES (${
                                          i < 10
                                            ? sommaMinuti(
                                                dati[
                                                  `ritorno${i + 1}` as keyof typeof dati
                                                ] as string,
                                                (
                                                  Math.abs(
                                                    stazioni[i - 1].km -
                                                      stazioni[i].km,
                                                  ) * 1.2
                                                ).toFixed(2),
                                              )
                                            : sommaMinuti(
                                                dati[
                                                  `andata${i - 1}` as keyof typeof dati
                                                ] as string,
                                                (
                                                  Math.abs(
                                                    stazioni[i - 1].km -
                                                      stazioni[i - 2].km,
                                                  ) * 1.2
                                                ).toFixed(2),
                                              )
                                        },
                                        ${orarioPartenza},
                                        ${stazioni[i - 1].nome},
                                        ${dati.codiceTreno},
                                        ${dati.data},2) ON CONFLICT (treno,data,stazione,progressivo) DO NOTHING;`);
      // subtratta
      transactionQueries.push(sql`INSERT INTO subtratta (stazione_a, stazione_b, inizio_occupazione, fine_occupazione, codice_treno, data_treno)
                                        VALUES (${stazioni[i - 1].nome},${stazioni[i - 2].nome},${orarioPartenza},${orarioArrivo},${dati.codiceTreno},${dati.data});
                `);
    }

    // inserimento traccia ritorno della prima stazione
    transactionQueries.push(sql`INSERT INTO traccia_corrente (orario_arrivo,orario_partenza,stazione, treno, data, progressivo)
                                VALUES (${sommaMinuti(dati.ritorno2, (Math.abs(stazioni[0].km - stazioni[1].km) * 1.2).toFixed(2))},null,${stazioni[0].nome},${dati.codiceTreno},${dati.data},2) ON CONFLICT (treno,data,stazione,progressivo) DO NOTHING;`);

    // inserimento
    await sql.transaction(transactionQueries);
  } catch (error) {
    console.error(error);
    return {
      message: "Errore. Impossibile creare la corsa",
      error: error,
      enteredFormData: rawData,
    };
  }
  revalidatePath("/esercizio"); // clear cached path
  redirect("/esercizio"); // redirect
}
