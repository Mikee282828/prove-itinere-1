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
    materiale: z.array(z.string("Selezionare almeno uno dei materiali rotabili disponibili")).nonempty(),
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
            message: "Campi mancanti. Creazione convoglio fallita. "
        }
    }

    const { materiale } = validatedFields.data;
    console.log(materiale);

    try {
        const convoglioInserito = await sql`INSERT INTO convoglio DEFAULT VALUES RETURNING id`;
        console.log(convoglioInserito);
        await Promise.all(
            materiale.map(async (mat) => {
                await sql`
                INSERT INTO composizione (convoglio, id_mat)
                VALUES (${convoglioInserito[0].id}, ${mat});
                `
            })
        )

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
    codiceTreno: z.coerce.number("Inserire un numero compreso tra 1 e 20").int().max(20).min(1),
    convoglio: z.coerce.number("Inserire un numero convoglio valido!").int().min(1),
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
        data?: string[],
        codiceTreno?: string[],
        convoglio?: string[],
        [key: string]: string[] | undefined;
    };
    message?: string | null;
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

    //uscita anticipata in caso di errori di validazione
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Campi mancanti. Creazione corsa fallita."
        }
    }

    const dati = validatedFields.data;

    try {
        // controlla se ci sono treni con lo stesso codice e data di quello che si vuole creare
        // se sì allora uscita anticipata
        const trenoPresente = await sql`SELECT * FROM treno WHERE treno.data = ${dati.data} AND treno.codice = ${dati.codiceTreno} `;
        if (trenoPresente.length !== 0) return {
            message: "Errore. Impossibile creare due treni con lo stesso codice nello stesso giorno",
        };

        // prendi tutte le stazioni
        const stazioni = await fetchStazioni();

        // ciclare sulle subtratte di andata 
        // (OrarioArrivo>inizio_occupazione AND OrarioPartenza<fine_occupazione)
        let conflittoSubtratte;
        let orarioArrivo;
        let orarioPartenza;
        let orarioPartenzaSucc;
        // ANDATA
        for (let i = 1; i < 10; i++) {
            // assegnazione orari di arrivo alla stazione successiva, partenza dalla stazione corrente e successiva
            orarioArrivo = sommaMinuti(dati[`andata${i}` as keyof typeof dati] as string, (Math.abs(stazioni[i].km - stazioni[i - 1].km) * 1.2).toFixed(2));
            orarioPartenza = dati[`andata${i}` as keyof typeof dati];
            orarioPartenzaSucc = i < 9 ? dati[`andata${i + 1}` as keyof typeof dati] : dati.ritorno10;
            // se l'orario di partenza dalla stazione successiva è anteriore all'orario di arrivo alla stazione successiva allora uscita anticipata
            if (orarioPartenzaSucc < orarioArrivo) {
                return (
                    {
                        message: `L'orario di partenza ${orarioPartenzaSucc} da ${stazioni[i].nome} è successiva all'orario minima di arrivo ${orarioArrivo} alla stazione ${stazioni[i].nome} da ${stazioni[i - 1].nome}`
                    }
                )
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
                return (
                    {
                        message: `L'orario della subtratta "${stazioni[i - 1].nome} - ${stazioni[i].nome}"
                        è sovrapposta con l'orario del treno ${conflittoSubtratte.map((sub) => sub?.codice_treno)}`,
                    }
                )
            }
        }
        // RITORNO
        for (let i = 10; i > 1; i--) {
            // assegnazione orari di arrivo alla stazione successiva, partenza dalla stazione corrente e successiva
            orarioArrivo = sommaMinuti(dati[`ritorno${i}` as keyof typeof dati] as string, (Math.abs(stazioni[i].km - stazioni[i - 1].km) * 1.2).toFixed(2));
            orarioPartenza = dati[`ritorno${i}` as keyof typeof dati];
            orarioPartenzaSucc = i > 2 ? dati[`ritorno${i - 1}` as keyof typeof dati] : orarioArrivo;
            // se l'orario di partenza dalla stazione successiva è anteriore all'orario di arrivo alla stazione successiva allora uscita anticipata
            if (orarioPartenzaSucc < orarioArrivo) {
                return (
                    {
                        message: `L'orario di partenza ${orarioPartenzaSucc} da ${stazioni[i].nome} è successiva all'orario minima di arrivo ${orarioArrivo} alla stazione ${stazioni[i].nome} da ${stazioni[i - 1].nome}`
                    }
                )
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
                return (
                    {
                        message: `L'orario della subtratta "${stazioni[i - 1].nome} - ${stazioni[i].nome}"
                        è sovrapposta con l'orario del treno ${conflittoSubtratte.map((sub) => sub?.codice_treno)}`,
                    }
                )
            }
        }
    } catch (error) {
        return {
            message: "Errore. Impossibile creare la corsa",
            error: error,
        };
    }
    revalidatePath("/esercizio"); // clear cached path
    redirect("/esercizio"); // redirect

}