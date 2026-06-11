// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";

const sql = neon(process.env.DATABASE_URL || "");

const FormSchema = z.object({
    materiale: z.array(z.string("Selezionare almeno uno dei materiali rotabili disponibili")).nonempty(),
});

export type State = {
    errors?: {
        materiale?: string[];
    };
    message?: string | null;
};

export async function createConvoglio(prevState: State, formData: FormData) {

    const validatedFields = FormSchema.safeParse({
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
        Promise.all(
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