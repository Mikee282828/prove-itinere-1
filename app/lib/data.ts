import { MaterialeRotabile, Stazione } from "./definitions";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function fetchStazioni(): Promise<Stazione[]> {
  try {
    const stazioni = await sql`
      SELECT stazione.nome, stazione.distanza_capolinea as km
      FROM stazione
      ORDER BY stazione.distanza_capolinea ASC`;
    return stazioni as Stazione[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}

export async function fetchMateriale(): Promise<MaterialeRotabile[]> {
  try {
    const materiali = await sql`
      SELECT id, modello, tipologia, descrizione
      FROM materiale_rotabile
      ORDER BY tipologia`;
    return materiali as MaterialeRotabile[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}

export async function fetchMaterialeEsercizio(data: string, inizio: string, fine: string): Promise<MaterialeRotabile[]> {

  if(!data || !inizio || !fine || inizio>fine) return [];

  try {
    const materiali = await sql`
      SELECT mat.* FROM materiale_rotabile AS mat
      INNER JOIN composizione ON mat.id = composizione.id_mat
      INNER JOIN convoglio ON composizione.convoglio = convoglio.id
      INNER JOIN treno ON convoglio.id = treno.convoglio
      INNER JOIN traccia_passata as traccia ON treno.data = traccia.data AND treno.codice = traccia.treno
      WHERE traccia.data = ${data}
        AND traccia.stazione = 'Torre Spaventa'
        AND ((traccia.progressivo=2 AND traccia.orario_arrivo<= ${inizio}) 
        OR (traccia.progressivo=1 AND traccia.orario_partenza>=${fine}))
      `;
    return materiali as MaterialeRotabile[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}