import {
  MaterialeRotabile,
  Stazione,
  TracciaCorrente,
  Treno,
} from "./definitions";
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}

export async function fetchMaterialeEsercizio(
  data: string,
  inizio: string,
  fine: string,
): Promise<MaterialeRotabile[]> {
  if (!data || !inizio || !fine || inizio > fine) return [];

  try {
    const materiali = await sql`
      SELECT mat.* 
      FROM materiale_rotabile AS mat
      WHERE mat.id NOT IN(
        SELECT comp.id_mat as id
        FROM composizione AS comp
        INNER JOIN convoglio ON comp.convoglio = convoglio.id
        INNER JOIN treno ON convoglio.id = treno.convoglio
        INNER JOIN traccia_corrente as traccia ON treno.data = traccia.data AND treno.codice = traccia.treno
        WHERE traccia.data = ${data}
        GROUP BY id_mat
        HAVING MAX(traccia.orario_arrivo)>${inizio} AND MIN(traccia.orario_partenza)<${fine}
        );
        `;
    return materiali as MaterialeRotabile[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}

export type ConvoglioRaggruppato = {
  convoglio: string; // l'ID del convoglio (es: '1', '2')
  materiali: string[]; // l'array di stringhe (es: ['Cavour', 'B1'])
};

export async function fetchComposizioniDisponibili(
  data: string,
  orario: string,
  stazione: string,
): Promise<ConvoglioRaggruppato[]> {
  if (stazione === "Torre Spaventa") {
    try {
      const composizioni = await sql`
    WITH tracce_unite AS (
    SELECT orario_arrivo, orario_partenza, stazione, data, treno
    FROM traccia_passata
    UNION ALL
    SELECT orario_arrivo, orario_partenza, stazione, data, treno
    FROM traccia_corrente
    ),
    dati_completi AS (
    SELECT 
        treno.convoglio,
        tr.stazione,
        tr.data,
        tr.orario_arrivo AS arrivo,
        -- Assegna 1 alla riga con data più recente e arrivo più tardivo
        ROW_NUMBER() OVER (
            PARTITION BY treno.convoglio
            ORDER BY tr.data DESC, tr.orario_arrivo DESC
        ) AS rn
    FROM treno
    JOIN tracce_unite AS tr
      ON tr.data = treno.data 
     AND tr.treno = treno.codice
    WHERE tr.data <= ${data}
      AND tr.stazione IN ('Torre Spaventa', 'Villa San Felice')
      AND tr.orario_arrivo IS NOT NULL
      AND tr.orario_partenza IS NULL
    ),
    convogliDisponibili AS(
    SELECT id FROM convoglio 
    WHERE id NOT IN (
    SELECT convoglio
    FROM dati_completi
    WHERE rn = 1 AND (stazione <> ${stazione} OR (stazione=${stazione} AND arrivo>${orario})))
    )
    SELECT convoglio,json_agg(id_mat) FROM composizione
    WHERE convoglio IN (SELECT id FROM convogliDisponibili)
    GROUP BY convoglio
    `;
      return composizioni as ConvoglioRaggruppato[];
    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch data.");
    }
  } else {
    try {
      const composizioni = await sql`
    WITH tracce_unite AS (
    SELECT orario_arrivo, orario_partenza, stazione, data, treno
    FROM traccia_passata
    UNION ALL
    SELECT orario_arrivo, orario_partenza, stazione, data, treno
    FROM traccia_corrente
    ),
    dati_completi AS (
    SELECT 
        treno.convoglio,
        tr.stazione,
        tr.data,
        tr.orario_arrivo AS arrivo,
        -- Assegna 1 alla riga con data più recente e arrivo più tardivo
        ROW_NUMBER() OVER (
            PARTITION BY treno.convoglio
            ORDER BY tr.data DESC, tr.orario_arrivo DESC
        ) AS rn
    FROM treno
    JOIN tracce_unite AS tr
      ON tr.data = treno.data 
     AND tr.treno = treno.codice
    WHERE tr.data <= ${data}
      AND tr.stazione IN ('Torre Spaventa', 'Villa San Felice')
      AND tr.orario_arrivo IS NOT NULL
      AND tr.orario_partenza IS NULL
    ),
    convogliDisponibili AS(
    SELECT convoglio AS id
    FROM dati_completi
    WHERE rn = 1 AND (stazione=${stazione} AND arrivo<=${orario})
    )
    SELECT convoglio,json_agg(id_mat) FROM composizione
    WHERE convoglio IN (SELECT id FROM convogliDisponibili)
    GROUP BY convoglio
    `;
      return composizioni as ConvoglioRaggruppato[];
    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch data.");
    }
  }
}

export async function fetchComposizioni(): Promise<ConvoglioRaggruppato[]> {
  try {
    const composizioni = await sql`
    SELECT convoglio, json_agg(id_mat) AS materiali 
    FROM composizione
    GROUP BY convoglio
    ORDER BY convoglio;`;
    return composizioni as ConvoglioRaggruppato[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}

export async function fetchTracceCorrenti(
  data: string,
): Promise<TracciaCorrente[]> {
  try {
    const tracce = await sql`
    SELECT * from traccia_corrente
    WHERE data = ${data} AND data >= NOW()::DATE
    ORDER BY orario_partenza ASC, orario_arrivo ASC;
    `;
    //console.log(tracce);
    return tracce as TracciaCorrente[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}

export async function fetchTracceCorrentiConId(
  data: string,
  codiceTreno: string,
): Promise<TracciaCorrente[]> {
  try {
    const tracce = await sql`
    SELECT * from traccia_corrente
    WHERE data = ${data} AND data >= NOW()::DATE AND treno = ${codiceTreno}
    ORDER BY orario_partenza ASC;
    `;
    //console.log(tracce);
    return tracce as TracciaCorrente[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}

export async function fetchTreno(
  data: string,
  codiceTreno: string,
): Promise<Treno[]> {
  try {
    const treno = await sql`
      SELECT data,codice,convoglio from treno 
      WHERE codice=${codiceTreno} AND data=${data};
    `;
    return treno as Treno[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}
function giornoPrecedente(data: string) {
  throw new Error("Function not implemented.");
}
