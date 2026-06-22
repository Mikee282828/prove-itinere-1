// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";

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
    partenza1: z.iso.time("Formattazione orario non valida!"),
    partenza2: z.iso.time("Formattazione orario non valida!"),
    partenza3: z.iso.time("Formattazione orario non valida!"),
    partenza4: z.iso.time("Formattazione orario non valida!"),
    partenza5: z.iso.time("Formattazione orario non valida!"),
    partenza6: z.iso.time("Formattazione orario non valida!"),
    partenza7: z.iso.time("Formattazione orario non valida!"),
    partenza8: z.iso.time("Formattazione orario non valida!"),
    partenza9: z.iso.time("Formattazione orario non valida!"),
    partenza10: z.iso.time("Formattazione orario non valida!"),
    ritorno1: z.iso.time("Formattazione orario non valida!"),
    ritorno2: z.iso.time("Formattazione orario non valida!"),
    ritorno3: z.iso.time("Formattazione orario non valida!"),
    ritorno4: z.iso.time("Formattazione orario non valida!"),
    ritorno5: z.iso.time("Formattazione orario non valida!"),
    ritorno6: z.iso.time("Formattazione orario non valida!"),
    ritorno7: z.iso.time("Formattazione orario non valida!"),
    ritorno8: z.iso.time("Formattazione orario non valida!"),
    ritorno9: z.iso.time("Formattazione orario non valida!"),
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

    // prende campo name e non id!
    const validatedFields = corsaSchema.safeParse({
        data: formData.get("data"),
        codiceTreno: formData.get("codiceTreno"),
        convoglio: formData.get("convoglio"),
        partenza1: formData.get("partenza1"),
        partenza2: formData.get("partenza2"),
        partenza3: formData.get("partenza3"),
        partenza4: formData.get("partenza4"),
        partenza5: formData.get("partenza5"),
        partenza6: formData.get("partenza6"),
        partenza7: formData.get("partenza7"),
        partenza8: formData.get("partenza8"),
        partenza9: formData.get("partenza9"),
        partenza10: formData.get("partenza10"),
        ritorno1: formData.get("ritorno1"),
        ritorno2: formData.get("ritorno2"),
        ritorno3: formData.get("ritorno3"),
        ritorno4: formData.get("ritorno4"),
        ritorno5: formData.get("ritorno5"),
        ritorno6: formData.get("ritorno6"),
        ritorno7: formData.get("ritorno7"),
        ritorno8: formData.get("ritorno8"),
        ritorno9: formData.get("ritorno9"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Campi mancanti. Creazione corsa fallita."
        }
    }

    const data = validatedFields.data;

    try {
    } catch (error) {
        console.log(error);
        return {
            message: "Errore. Impossibile creare la corsa",
            error: error,
        };
    }
    revalidatePath("/esercizio"); // clear cached path
    redirect("/esercizio"); // redirect

}