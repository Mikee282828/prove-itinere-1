import { MaterialeRotabile, Stazione } from "./definitions";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function fetchStazioni() : Promise<Stazione[]>{
  try {
    const stazioni = await sql`
      SELECT stazione.nome, stazione.distanza_capolinea as km
      FROM stazione
      ORDER BY stazione.distanza_capolinea ASC`;
    return stazioni as Stazione[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchMateriale() : Promise<MaterialeRotabile[]>{
  try {
    const materiali = await sql`
      SELECT id, modello, tipologia, descrizione
      FROM materiale_rotabile
      ORDER BY tipologia`;
    console.log(materiali);
    return materiali as MaterialeRotabile[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}