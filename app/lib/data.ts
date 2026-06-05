import { Stazione } from "./definitions";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function fetchStazioni() : Promise<Stazione[]>{
  try {
    const stazioni = await sql`
      SELECT stazione.nome, stazione.distanza_capolinea as km
      FROM stazione
      ORDER BY stazione.distanza_capolinea ASC`;
    console.log(stazioni);
    return stazioni as Stazione[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}