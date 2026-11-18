import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");
// --- TIPI TYPESCRIPT ---
export interface TracciaTreno {
  stazione: string;
  orario_arrivo: string | null;
  orario_partenza: string | null;
}

export interface TrenoConTracce {
  data: string;
  codice: number;
  convoglio: number | string;
  stato: string;
  tracce: TracciaTreno[];
}

// --- HELPER PER FORMATTARE GLI ORARI ---
function formatTime(timestamp: string | null): string {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- HELPER PER I COLORI DELLO STATO ---
function getStatoStyle(stato: string): string {
  const s = stato.toLowerCase();
  if (s.includes('ritardo')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s.includes('soppresso') || s.includes('cancellato')) return 'bg-red-100 text-red-800 border-red-200';
  if (s.includes('regolare') || s.includes('in orario') || s.includes('attivo')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

// --- DATA FETCHING (Sostituisci con la tua query al DB) ---
async function getTreniDelGiorno(data: string): Promise<TrenoConTracce[]> {
  /* 
    Esempio con il tuo client PostgreSQL:
    const rows = await sql<TrenoConTracce[]>`
      SELECT t.data, t.codice, t.convoglio, t.stato, COALESCE(...) AS tracce
      FROM public.treno t ...
      WHERE t.data = ${data} ...
    `;
    return rows;
  */

  // Dati fittizi di esempio per visualizzare subito la UI
  try {
    const treni = await sql`
      SELECT 
      t.data,
      t.codice,
      t.convoglio,
  t.stato,
  COALESCE(
    json_agg(
      json_build_object(
        'stazione', tc.stazione,
        'orario_arrivo', tc.orario_arrivo,
        'orario_partenza', tc.orario_partenza
      )
      ORDER BY COALESCE(tc.orario_arrivo, tc.orario_partenza) ASC
    ) FILTER (WHERE tc.stazione IS NOT NULL),
    '[]'
  ) AS tracce
FROM public.treno t
LEFT JOIN public.traccia_corrente tc 
  ON tc.treno = t.codice 
  AND tc.data = t.data
WHERE t.data = ${data}
GROUP BY t.data, t.codice, t.convoglio, t.stato
ORDER BY t.codice ASC;
    `;
    return treni as TrenoConTracce[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
}

// --- PAGINA PRINCIPALE (Server Component) ---
export default async function TreniPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const resolvedParams = await searchParams;
  const dataSelezionata = resolvedParams.data || '2026-11-18';
  const treni = await getTreniDelGiorno(dataSelezionata);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Intestazione */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Circolazione Treni
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Data di riferimento:{' '}
              <span className="font-medium text-slate-700">{dataSelezionata}</span>
            </p>
          </div>

          <div className="text-sm bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs text-slate-600">
            Treni trovati: <span className="font-semibold text-slate-900">{treni.length}</span>
          </div>
        </header>

        {/* Lista Treni */}
        {treni.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            Nessun treno registrato per questa data.
          </div>
        ) : (
          <div className="space-y-6">
            {treni.map((treno) => (
              <article
                key={`${treno.data}-${treno.codice}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Header della Card Treno */}
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-slate-900 text-white font-mono text-sm font-semibold">
                      Treno {treno.codice}
                    </span>
                    <span className="text-sm text-slate-500">
                      Convoglio <strong className="text-slate-700">#{treno.convoglio}</strong>
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatoStyle(
                      treno.stato
                    )}`}
                  >
                    {treno.stato}
                  </span>
                </div>

                {/* Corpo della Card: Timeline Tracce */}
                <div className="p-6">
                  {treno.tracce.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">
                      Nessuna traccia oraria associata a questo treno.
                    </p>
                  ) : (
                    <ol className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                      {treno.tracce.map((traccia, index) => {
                        const isPrima = index === 0;
                        const isUltima = index === treno.tracce.length - 1;

                        return (
                          <li key={traccia.stazione} className="ml-6 relative">
                            {/* Pallino sulla linea */}
                            <span
                              className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ${
                                isPrima || isUltima
                                  ? 'bg-slate-900 ring-slate-900/20'
                                  : 'bg-slate-400 ring-slate-200'
                              }`}
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <span
                                className={`text-sm ${
                                  isPrima || isUltima
                                    ? 'font-semibold text-slate-900'
                                    : 'font-medium text-slate-700'
                                }`}
                              >
                                {traccia.stazione}
                              </span>

                              {/* Orari Arrivo / Partenza */}
                              <div className="flex items-center gap-4 text-xs font-mono">
                                <span className="text-slate-500">
                                  Arr:{' '}
                                  <strong className="text-slate-800">
                                    {formatTime(traccia.orario_arrivo)}
                                  </strong>
                                </span>
                                <span className="text-slate-500">
                                  Part:{' '}
                                  <strong className="text-slate-800">
                                    {formatTime(traccia.orario_partenza)}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}