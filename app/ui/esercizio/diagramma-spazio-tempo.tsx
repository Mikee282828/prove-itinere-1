"use client";

import React, { useMemo, useState, useRef } from "react";
import { Stazione, TracciaCorrente } from "@/app/lib/definitions";
import { formatOrario, parseTimeToMinutes } from "@/app/lib/utils";
import {
  TrainIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Stazioni predefinite con distanze chilometriche ufficiali da Torre Spaventa
const STAZIONI_DEFAULT: Stazione[] = [
  { nome: "Torre Spaventa", km: 0.0 },
  { nome: "Prato Terra", km: 2.7 },
  { nome: "Rocca Pietrosa", km: 7.58 },
  { nome: "Villa Pietrosa", km: 12.68 },
  { nome: "Villa Santa Maria", km: 16.9 },
  { nome: "Pietra Santa Maria", km: 23.95 },
  { nome: "Castro Marino", km: 31.5 },
  { nome: "Porto Spigola", km: 39.5 },
  { nome: "Porto San Felice", km: 46.0 },
  { nome: "Villa San Felice", km: 54.68 },
];

const COLORI_TRENI = [
  { stroke: "#2563eb", fill: "#dbeafe", text: "text-blue-600", bg: "bg-blue-100", border: "border-blue-400" }, // Blu
  { stroke: "#dc2626", fill: "#fee2e2", text: "text-red-600", bg: "bg-red-100", border: "border-red-400" }, // Rosso
  { stroke: "#059669", fill: "#d1fae5", text: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-400" }, // Verde
  { stroke: "#d97706", fill: "#fef3c7", text: "text-amber-600", bg: "bg-amber-100", border: "border-amber-400" }, // Ambra
  { stroke: "#7c3aed", fill: "#ede9fe", text: "text-purple-600", bg: "bg-purple-100", border: "border-purple-400" }, // Viola
  { stroke: "#db2777", fill: "#fce7f3", text: "text-pink-600", bg: "bg-pink-100", border: "border-pink-400" }, // Rosa
  { stroke: "#0891b2", fill: "#cffafe", text: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-400" }, // Ciano
  { stroke: "#ea580c", fill: "#ffedd5", text: "text-orange-600", bg: "bg-orange-100", border: "border-orange-400" }, // Arancione
  { stroke: "#4f46e5", fill: "#e0e7ff", text: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-400" }, // Indaco
  { stroke: "#0d9488", fill: "#ccfbf1", text: "text-teal-600", bg: "bg-teal-100", border: "border-teal-400" }, // Ottanio
];

function formatMinutesToTime(min: number): string {
  const dayOffset = Math.floor(min / 1440);
  const mInDay = ((min % 1440) + 1440) % 1440;
  const totSec = Math.round(mInDay * 60);
  const h = Math.floor(totSec / 3600);
  const m = Math.floor((totSec % 3600) / 60);
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  if (dayOffset > 0) {
    return `${timeStr} (+${dayOffset}g)`;
  }
  return timeStr;
}

function getBaseDate(
  dataSelezionata?: string,
  tracce?: TracciaCorrente[] | null,
): { y: number; m: number; d: number } {
  if (dataSelezionata && dataSelezionata.trim().length >= 8) {
    const parts = dataSelezionata.trim().split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { y: parts[0], m: parts[1], d: parts[2] };
    }
  }

  if (tracce && tracce.length > 0) {
    let earliestMs = Infinity;
    for (const tr of tracce) {
      for (const field of [tr.data, tr.orario_partenza, tr.orario_arrivo]) {
        if (!field) continue;
        const d = field instanceof Date ? field : new Date(String(field));
        const ms = d.getTime();
        if (!isNaN(ms) && ms < earliestMs) {
          earliestMs = ms;
        }
      }
    }

    if (isFinite(earliestMs)) {
      const d = new Date(earliestMs);
      const formatter = new Intl.DateTimeFormat("it-IT", {
        timeZone: "Europe/Rome",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      const p = formatter.formatToParts(d);
      return {
        y: parseInt(p.find((x) => x.type === "year")?.value || "2070", 10),
        m: parseInt(p.find((x) => x.type === "month")?.value || "1", 10),
        d: parseInt(p.find((x) => x.type === "day")?.value || "1", 10),
      };
    }
  }

  return { y: 2070, m: 1, d: 1 };
}

function parseContinuousMinutes(
  val: string | Date | null | undefined,
  baseDate: { y: number; m: number; d: number },
): number | null {
  if (!val) return null;

  let d: Date | null = null;
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) d = val;
  } else if (typeof val === "string") {
    const str = val.trim();
    // Se è solo formato HH:mm o HH:mm:ss senza data
    const matchSimpleTime = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (matchSimpleTime) {
      const h = parseInt(matchSimpleTime[1], 10);
      const m = parseInt(matchSimpleTime[2], 10);
      const s = matchSimpleTime[3] ? parseInt(matchSimpleTime[3], 10) : 0;
      return h * 60 + m + s / 60;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }

  if (d) {
    const formatter = new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const yr = parseInt(parts.find((p) => p.type === "year")?.value || String(baseDate.y), 10);
    const mo = parseInt(parts.find((p) => p.type === "month")?.value || String(baseDate.m), 10);
    const dy = parseInt(parts.find((p) => p.type === "day")?.value || String(baseDate.d), 10);
    const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const s = parseInt(parts.find((p) => p.type === "second")?.value || "0", 10);

    const msTarget = Date.UTC(yr, mo - 1, dy);
    const msBase = Date.UTC(baseDate.y, baseDate.m - 1, baseDate.d);
    const dayDiff = Math.round((msTarget - msBase) / (24 * 60 * 60 * 1000));

    return dayDiff * 1440 + h * 60 + m + s / 60;
  }

  return null;
}

export type FermataProcessata = {
  stazione: string;
  t_arr: number | null;
  t_dep: number | null;
  orario_arrivo_raw: string | Date | null;
  orario_partenza_raw: string | Date | null;
  attesaMinuti: number;
};

export type TrenoProcessato = {
  codice: number;
  convoglio?: number;
  colore: (typeof COLORI_TRENI)[0];
  direzione: "andata" | "ritorno";
  fermate: FermataProcessata[];
  partenzaCapolinea: number;
  arrivoCapolinea: number;
};

export type ConflittoSubtratta = {
  subtratta: string;
  treno1: number;
  treno2: number;
  tipo: "scontro_frontale" | "tamponamento";
  intervallo: string;
  descrizione: string;
};

export default function DiagrammaSpazioTempo({
  tracce,
  stazioni,
  dataSelezionata,
}: {
  tracce: TracciaCorrente[] | null;
  stazioni: Stazione[] | null;
  dataSelezionata?: string;
}) {
  // Lista stazioni ordinata dal capolinea 1 (Torre Spaventa) al capolinea 2 (Villa San Felice)
  const listaStazioni = useMemo(() => {
    if (stazioni && stazioni.length >= 10) {
      return [...stazioni].sort(
        (a, b) => parseFloat(String(a.km)) - parseFloat(String(b.km)),
      );
    }
    return STAZIONI_DEFAULT;
  }, [stazioni]);

  // Opzioni grafiche
  const [scalaRealeKm, setScalaRealeKm] = useState(true);
  const [mostraAttese, setMostraAttese] = useState(true);
  const [mostraInfoVincoli, setMostraInfoVincoli] = useState(false);
  const [trenoEvidenziato, setTrenoEvidenziato] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    treno: number;
    convoglio?: number;
    stazione: string;
    arr?: string | null;
    dep?: string | null;
    attesa?: number;
    direzione: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mappa stazione -> km e indice
  const stazioniMap = useMemo(() => {
    const map = new Map<string, { index: number; km: number }>();
    listaStazioni.forEach((s, idx) => {
      map.set(s.nome, { index: idx, km: parseFloat(String(s.km)) });
    });
    return map;
  }, [listaStazioni]);

  const maxKm = useMemo(() => {
    return parseFloat(String(listaStazioni[listaStazioni.length - 1]?.km || 54.68));
  }, [listaStazioni]);

  // Elaborazione tracce raggruppate per treno
  const { treniProcessati, minTimeMinuti, maxTimeMinuti, conflitti } = useMemo(() => {
    if (!tracce || tracce.length === 0) {
      return {
        treniProcessati: [] as TrenoProcessato[],
        minTimeMinuti: 600, // 10:00
        maxTimeMinuti: 960, // 16:00
        conflitti: [] as ConflittoSubtratta[],
      };
    }

    const baseDate = getBaseDate(dataSelezionata, tracce);

    // Raggruppa per treno
    const perTreno = new Map<number, TracciaCorrente[]>();
    tracce.forEach((tr) => {
      const arr = perTreno.get(tr.treno) || [];
      arr.push(tr);
      perTreno.set(tr.treno, arr);
    });

    let overallMin = Infinity;
    let overallMax = -Infinity;

    const listaTreni: TrenoProcessato[] = [];

    let colorIdx = 0;
    perTreno.forEach((tracceTreno, cod) => {
      // Ordina le fermate cronologicamente con minuti continui
      const fermateOrd: FermataProcessata[] = tracceTreno
        .map((tr) => {
          const t_arr = parseContinuousMinutes(tr.orario_arrivo, baseDate);
          const t_dep = parseContinuousMinutes(tr.orario_partenza, baseDate);

          if (t_arr !== null) {
            overallMin = Math.min(overallMin, t_arr);
            overallMax = Math.max(overallMax, t_arr);
          }
          if (t_dep !== null) {
            overallMin = Math.min(overallMin, t_dep);
            overallMax = Math.max(overallMax, t_dep);
          }

          const attesaMinuti =
            t_arr !== null && t_dep !== null && t_dep > t_arr
              ? Math.round((t_dep - t_arr) * 10) / 10
              : 0;

          return {
            stazione: tr.stazione,
            t_arr,
            t_dep,
            orario_arrivo_raw: tr.orario_arrivo,
            orario_partenza_raw: tr.orario_partenza,
            attesaMinuti,
          };
        })
        .sort((a, b) => {
          const timeA = a.t_dep ?? a.t_arr ?? 0;
          const timeB = b.t_dep ?? b.t_arr ?? 0;
          return timeA - timeB;
        });

      if (fermateOrd.length === 0) return;

      // Determina la direzione del treno
      const primaStazione = fermateOrd[0].stazione;
      const ultimaStazione = fermateOrd[fermateOrd.length - 1].stazione;
      const idxPrima = stazioniMap.get(primaStazione)?.index ?? 0;
      const idxUltima = stazioniMap.get(ultimaStazione)?.index ?? 9;
      const direzione: "andata" | "ritorno" = idxPrima <= idxUltima ? "andata" : "ritorno";

      const tPartenza = fermateOrd[0].t_dep ?? fermateOrd[0].t_arr ?? 0;
      const tArrivo =
        fermateOrd[fermateOrd.length - 1].t_arr ??
        fermateOrd[fermateOrd.length - 1].t_dep ??
        tPartenza;

      const convoglio = tracceTreno[0]?.convoglio;

      listaTreni.push({
        codice: cod,
        convoglio,
        colore: COLORI_TRENI[colorIdx % COLORI_TRENI.length],
        direzione,
        fermate: fermateOrd,
        partenzaCapolinea: tPartenza,
        arrivoCapolinea: tArrivo,
      });

      colorIdx++;
    });

    // Se non ci sono orari validi, imposta default
    if (!isFinite(overallMin) || !isFinite(overallMax)) {
      overallMin = 600;
      overallMax = 960;
    }

    // Arrotonda ai 30 minuti precedenti e successivi per un asse pulito (senza limitare artificialmente a 1440)
    const minTimeMinuti = Math.max(0, Math.floor((overallMin - 15) / 30) * 30);
    const maxTimeMinuti = Math.ceil((overallMax + 30) / 30) * 30;

    // ANALISI CONFLITTI E VINCOLI SUBTRATTE
    // Ogni spostamento tra fermata i e fermata i+1 occupa la subtratta tra stazione_A e stazione_B
    type OccupazioneSubtratta = {
      treno: number;
      convoglio?: number;
      direzione: "andata" | "ritorno";
      stazMin: string;
      stazMax: string;
      inizio: number;
      fine: number;
    };

    const occupazioni: OccupazioneSubtratta[] = [];

    listaTreni.forEach((tr) => {
      for (let i = 0; i < tr.fermate.length - 1; i++) {
        const fA = tr.fermate[i];
        const fB = tr.fermate[i + 1];
        const tStart = fA.t_dep ?? fA.t_arr;
        const tEnd = fB.t_arr ?? fB.t_dep;

        if (tStart !== null && tEnd !== null && tEnd > tStart) {
          const s1 = fA.stazione;
          const s2 = fB.stazione;
          const [stazMin, stazMax] = s1 < s2 ? [s1, s2] : [s2, s1];

          occupazioni.push({
            treno: tr.codice,
            convoglio: tr.convoglio,
            direzione: tr.direzione,
            stazMin,
            stazMax,
            inizio: tStart,
            fine: tEnd,
          });
        }
      }
    });

    const conflittiTrovati: ConflittoSubtratta[] = [];

    for (let i = 0; i < occupazioni.length; i++) {
      for (let j = i + 1; j < occupazioni.length; j++) {
        const occ1 = occupazioni[i];
        const occ2 = occupazioni[j];

        // Stessa subtratta fisica
        if (
          occ1.treno !== occ2.treno &&
          occ1.stazMin === occ2.stazMin &&
          occ1.stazMax === occ2.stazMax
        ) {
          // Si sovrappongono nel tempo? (overlap se max(inizio) < min(fine))
          const overlapInizio = Math.max(occ1.inizio, occ2.inizio);
          const overlapFine = Math.min(occ1.fine, occ2.fine);

          if (overlapInizio < overlapFine) {
            const isFrontale = occ1.direzione !== occ2.direzione;
            conflittiTrovati.push({
              subtratta: `${occ1.stazMin} - ${occ1.stazMax}`,
              treno1: occ1.treno,
              treno2: occ2.treno,
              tipo: isFrontale ? "scontro_frontale" : "tamponamento",
              intervallo: `${formatMinutesToTime(overlapInizio)} - ${formatMinutesToTime(overlapFine)}`,
              descrizione: isFrontale
                ? `Violazione Vincolo 1 (Scontro frontale): Treno ${occ1.treno}${occ1.convoglio ? ` (Conv. ${occ1.convoglio})` : ""} e Treno ${occ2.treno}${occ2.convoglio ? ` (Conv. ${occ2.convoglio})` : ""} percorrono in direzioni opposte la stessa subtratta contemporaneamente.`
                : `Violazione Vincolo 2 (Tamponamento): Treno ${occ1.treno}${occ1.convoglio ? ` (Conv. ${occ1.convoglio})` : ""} e Treno ${occ2.treno}${occ2.convoglio ? ` (Conv. ${occ2.convoglio})` : ""} impegnano la stessa subtratta nella stessa direzione senza attendere la liberazione.`,
            });
          }
        }
      }
    }

    return {
      treniProcessati: listaTreni,
      minTimeMinuti,
      maxTimeMinuti: Math.max(minTimeMinuti + 60, maxTimeMinuti),
      conflitti: conflittiTrovati,
    };
  }, [tracce, listaStazioni, stazioniMap, dataSelezionata]);

  // Dimensioni SVG
  const paddingLeft = 210;
  const paddingRight = 40;
  const paddingTop = 50;
  const paddingBottom = 50;
  const chartHeight = 560;
  const baseChartWidth = 920;
  const chartWidth = Math.max(baseChartWidth, (maxTimeMinuti - minTimeMinuti) * 4) * zoom;
  const totalSvgWidth = chartWidth + paddingLeft + paddingRight;
  const totalSvgHeight = chartHeight + paddingTop + paddingBottom;

  // Funzione coordinate Y stazione
  const getYForStation = (stazioneNome: string): number => {
    const info = stazioniMap.get(stazioneNome);
    if (!info) return paddingTop;

    if (scalaRealeKm && maxKm > 0) {
      return paddingTop + (info.km / maxKm) * chartHeight;
    } else {
      return paddingTop + (info.index / (listaStazioni.length - 1)) * chartHeight;
    }
  };

  // Funzione coordinate X tempo
  const getXForTime = (minuti: number): number => {
    const span = maxTimeMinuti - minTimeMinuti;
    if (span <= 0) return paddingLeft;
    return paddingLeft + ((minuti - minTimeMinuti) / span) * chartWidth;
  };

  // Tacche temporali ogni 30 minuti
  const timeTicks = useMemo(() => {
    const ticks: { minuti: number; label: string; isHour: boolean }[] = [];
    for (let m = minTimeMinuti; m <= maxTimeMinuti; m += 30) {
      ticks.push({
        minuti: m,
        label: formatMinutesToTime(m),
        isHour: m % 60 === 0,
      });
    }
    return ticks;
  }, [minTimeMinuti, maxTimeMinuti]);

  // Totale attese in stazione per tutti i treni
  const totaleAttese = useMemo(() => {
    let count = 0;
    treniProcessati.forEach((t) => {
      t.fermate.forEach((f) => {
        if (f.attesaMinuti > 0) count++;
      });
    });
    return count;
  }, [treniProcessati]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Intestazione del Diagramma */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-lime-100 text-lime-900">
              <TrainIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Diagramma Spazio-Tempo delle Corse
              </h2>
              <p className="text-sm text-gray-500">
                Grafico orario ferroviario a binario unico &bull; Verifica attese nelle stazioni e liberazione subtratte
                {dataSelezionata && (
                  <span className="font-semibold text-lime-900 ml-1">
                    ({dataSelezionata})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Controlli di visualizzazione */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Scala Chilometrica */}
          <button
            type="button"
            onClick={() => setScalaRealeKm(!scalaRealeKm)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              scalaRealeKm
                ? "bg-lime-900 text-white border-lime-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            title="Mostra la posizione delle stazioni proporzionale ai chilometri effettivi di linea"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {scalaRealeKm ? "Scala km reale (54.7 km)" : "Spaziatura uniforme"}
          </button>

          {/* Toggle Evidenzia Attese */}
          <button
            type="button"
            onClick={() => setMostraAttese(!mostraAttese)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              mostraAttese
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            title="Evidenzia i tratti orizzontali in cui il treno è fermo in attesa della liberazione della subtratta successiva"
          >
            <Clock className="h-3.5 w-3.5" />
            {mostraAttese ? "Attese evidenziate" : "Attese standard"}
          </button>

          {/* Zoom */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 text-gray-600 hover:text-black rounded hover:bg-white transition cursor-pointer"
              title="Ingrandisci asse temporale"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 text-gray-600 hover:text-black rounded hover:bg-white transition cursor-pointer"
              title="Rimpicciolisci asse temporale"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1.5 text-gray-600 hover:text-black rounded hover:bg-white transition cursor-pointer"
              title="Reimposta zoom normale"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Tasto Regolamento Vincoli */}
          <button
            type="button"
            onClick={() => setMostraInfoVincoli(!mostraInfoVincoli)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
            Vincoli esercizio
            {mostraInfoVincoli ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Pannello Vincoli Espandibile (con riferimento ai vincoli dell'immagine allegata) */}
      {mostraInfoVincoli && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5 text-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 font-semibold text-blue-900">
              <Info className="h-5 w-5 text-blue-600" />
              Regole di Costruzione delle Corse (Linea a Binario Unico)
            </div>
            <span className="text-xs bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-full font-medium">
              10 Stazioni &bull; Capolinea: Torre Spaventa - Villa San Felice
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Vincolo 1 */}
            <div className="p-3 bg-white rounded-lg border border-red-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded text-[10px] mb-1">
                  CASO 1: VIETATO (X)
                </span>
                <p className="font-semibold text-gray-900">Scontro Frontale</p>
                <p className="text-gray-600 mt-1">
                  Due treni che marciano in direzioni opposte sulla stessa subtratta contemporaneamente. Le linee orarie
                  non possono incrociarsi tra due stazioni.
                </p>
              </div>
            </div>

            {/* Vincolo 2 */}
            <div className="p-3 bg-white rounded-lg border border-red-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded text-[10px] mb-1">
                  CASO 2: VIETATO (X)
                </span>
                <p className="font-semibold text-gray-900">Tamponamento</p>
                <p className="text-gray-600 mt-1">
                  Due treni nella stessa direzione sulla medesima subtratta. Il secondo treno non può partire finché il
                  precedente non è arrivato alla stazione successiva.
                </p>
              </div>
            </div>

            {/* Vincolo 3 */}
            <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] mb-1">
                  CASO 3: CORRETTO (OK)
                </span>
                <p className="font-semibold text-gray-900">Attesa in Stazione</p>
                <p className="text-gray-600 mt-1">
                  Se la subtratta successiva è occupata, il treno attende nella stazione di incrocio (tratto orizzontale
                  nel diagramma). Parte solo a subtratta libera.
                </p>
              </div>
            </div>

            {/* Vincolo 4 */}
            <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] mb-1">
                  CASO 4: CORRETTO (OK)
                </span>
                <p className="font-semibold text-gray-900">Partenza Contemporanea</p>
                <p className="text-gray-600 mt-1">
                  Due treni possono partire nello stesso istante da una stazione se imboccano subtratte opposte e
                  entrambe sono completamente libere.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner di Verifica Stato Vincoli */}
      {conflitti.length === 0 ? (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Tutti i vincoli di linea sono rispettati:</strong> Nessuna subtratta condivisa
              contemporaneamente. Gli incroci tra treni opposti e le precedenze avvengono regolarmente con attesa nelle
              stazioni ({totaleAttese} fermate/attese rilevate).
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span>Rilevati {conflitti.length} conflitti sulla linea a binario unico:</span>
          </div>
          <ul className="list-disc pl-7 text-xs space-y-1">
            {conflitti.map((c, i) => (
              <li key={i}>
                <strong>{c.subtratta}</strong> ({c.intervallo}): {c.descrizione}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legenda Treni & Filtro */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
        <span className="font-semibold text-gray-600 mr-2 flex items-center gap-1">
          <TrainIcon className="h-3.5 w-3.5 text-lime-900" />
          Treni in orario:
        </span>
        <button
          type="button"
          onClick={() => setTrenoEvidenziato(null)}
          className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition ${
            trenoEvidenziato === null
              ? "bg-gray-800 text-white shadow-xs"
              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          Tutti i treni ({treniProcessati.length})
        </button>

        {treniProcessati.map((t) => {
          const isSelected = trenoEvidenziato === t.codice;
          return (
            <button
              key={t.codice}
              type="button"
              onClick={() => setTrenoEvidenziato(isSelected ? null : t.codice)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium border cursor-pointer transition ${
                isSelected
                  ? "ring-2 ring-offset-1 ring-lime-900 font-bold"
                  : "hover:opacity-80"
              } ${t.colore.bg} ${t.colore.border} ${t.colore.text}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: t.colore.stroke }}
              />
              <span>Treno {t.codice}</span>
              {t.convoglio && (
                <span className="text-[10px] font-normal opacity-85">
                  (Conv. {t.convoglio})
                </span>
              )}
              <span className="text-[10px] opacity-75">
                {t.direzione === "andata" ? (
                  <span className="inline-flex items-center gap-0.5">
                    (Andata <ArrowRight className="h-2.5 w-2.5" />)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5">
                    (Ritorno <ArrowLeft className="h-2.5 w-2.5" />)
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Area Grafico SVG con Scroll Orizzontale */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-inner"
        style={{ maxHeight: "740px" }}
      >
        <svg
          width={totalSvgWidth}
          height={totalSvgHeight}
          className="select-none"
        >
          <defs>
            {/* Pattern sfondo a righe leggere */}
            <pattern
              id="grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#f8fafc"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Sfondo */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={chartWidth}
            height={chartHeight}
            fill="#ffffff"
          />

          {/* Griglia temporale verticale (ogni 30 min / 60 min) */}
          {timeTicks.map((tick) => {
            const x = getXForTime(tick.minuti);
            const isDayChange = tick.minuti % 1440 === 0 && tick.minuti > 0;
            return (
              <g key={`time-${tick.minuti}`}>
                <line
                  x1={x}
                  y1={paddingTop - 12}
                  x2={x}
                  y2={paddingTop + chartHeight + 12}
                  stroke={isDayChange ? "#0f172a" : tick.isHour ? "#cbd5e1" : "#e2e8f0"}
                  strokeWidth={isDayChange ? 2 : tick.isHour ? 1.5 : 1}
                  strokeDasharray={isDayChange ? "none" : tick.isHour ? "none" : "3,3"}
                />
                {/* Etichetta superiore orario */}
                <rect
                  x={x - 30}
                  y={paddingTop - 34}
                  width="60"
                  height="18"
                  rx="4"
                  fill={isDayChange ? "#e2e8f0" : tick.isHour ? "#f1f5f9" : "transparent"}
                />
                <text
                  x={x}
                  y={paddingTop - 21}
                  textAnchor="middle"
                  className={`text-[11px] font-mono ${
                    isDayChange
                      ? "font-extrabold fill-slate-900"
                      : tick.isHour
                        ? "font-bold fill-slate-800"
                        : "fill-slate-500"
                  }`}
                >
                  {tick.label}
                </text>
                {/* Etichetta inferiore orario */}
                <text
                  x={x}
                  y={paddingTop + chartHeight + 28}
                  textAnchor="middle"
                  className={`text-[11px] font-mono ${
                    isDayChange
                      ? "font-extrabold fill-slate-900"
                      : tick.isHour
                        ? "font-bold fill-slate-800"
                        : "fill-slate-500"
                  }`}
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Linee delle 10 stazioni (Orizzontali) */}
          {listaStazioni.map((staz, idx) => {
            const y = getYForStation(staz.nome);
            const isCapolinea =
              idx === 0 || idx === listaStazioni.length - 1;

            return (
              <g key={`station-${staz.nome}`}>
                {/* Linea orizzontale stazione lungo tutto il tempo */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke={isCapolinea ? "#14532d" : "#94a3b8"}
                  strokeWidth={isCapolinea ? 2 : 1}
                  strokeDasharray={isCapolinea ? "none" : "2,2"}
                />

                {/* Sfondo targhetta stazione a sinistra */}
                <rect
                  x={8}
                  y={y - 12}
                  width={paddingLeft - 18}
                  height={24}
                  rx="6"
                  fill={isCapolinea ? "#ecfdf5" : "#f8fafc"}
                  stroke={isCapolinea ? "#a7f3d0" : "#e2e8f0"}
                  strokeWidth={1}
                />

                {/* Pallino indicatore stazione */}
                <circle
                  cx={paddingLeft}
                  cy={y}
                  r={isCapolinea ? 5 : 3.5}
                  fill={isCapolinea ? "#14532d" : "#64748b"}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />

                {/* Testo nome stazione e km a sinistra */}
                <text
                  x={16}
                  y={y + 4}
                  className={`text-xs ${
                    isCapolinea
                      ? "font-bold fill-emerald-950"
                      : "font-medium fill-slate-800"
                  }`}
                >
                  {staz.nome}
                </text>

                <text
                  x={paddingLeft - 22}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-500"
                >
                  {parseFloat(String(staz.km)).toFixed(1)} km
                </text>

                {/* Testo nome stazione a destra */}
                <text
                  x={paddingLeft + chartWidth + 8}
                  y={y + 4}
                  className="text-[11px] font-mono fill-slate-500"
                >
                  {parseFloat(String(staz.km)).toFixed(1)} km
                </text>
              </g>
            );
          })}

          {/* TRACCE DEI TRENI */}
          {treniProcessati.map((treno) => {
            const isFocalizzato =
              trenoEvidenziato === null || trenoEvidenziato === treno.codice;
            const opacita = isFocalizzato ? 1 : 0.15;
            const strokeWidth =
              trenoEvidenziato === treno.codice ? 3.5 : 2.5;

            return (
              <g
                key={`treno-${treno.codice}`}
                opacity={opacita}
                className="transition-opacity duration-200"
              >
                {/* 1. Tratti di marcia (spostamento tra stazioni) */}
                {treno.fermate.map((fA, i) => {
                  if (i === treno.fermate.length - 1) return null;
                  const fB = treno.fermate[i + 1];

                  const tDepA = fA.t_dep ?? fA.t_arr;
                  const tArrB = fB.t_arr ?? fB.t_dep;

                  if (tDepA === null || tArrB === null) return null;

                  const x1 = getXForTime(tDepA);
                  const y1 = getYForStation(fA.stazione);
                  const x2 = getXForTime(tArrB);
                  const y2 = getYForStation(fB.stazione);

                  // Calcolo punto medio per etichetta treno
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;

                  return (
                    <g key={`tratta-${treno.codice}-${i}`}>
                      {/* Linea di marcia */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={treno.colore.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className="cursor-pointer hover:stroke-[4]"
                        onMouseEnter={(e) => {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY - 15,
                            treno: treno.codice,
                            convoglio: treno.convoglio,
                            stazione: `${fA.stazione} ➔ ${fB.stazione}`,
                            arr: formatMinutesToTime(tArrB),
                            dep: formatMinutesToTime(tDepA),
                            attesa: 0,
                            direzione: treno.direzione,
                          });
                        }}
                        onMouseMove={(e) => {
                          setTooltip((prev) =>
                            prev ? { ...prev, x: e.clientX, y: e.clientY - 15 } : null,
                          );
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />

                      {/* Badge identificativo sul primo tratto di marcia */}
                      {i === 0 && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={treno.convoglio ? "-34" : "-22"}
                            y="-9"
                            width={treno.convoglio ? "68" : "44"}
                            height="18"
                            rx="9"
                            fill={treno.colore.stroke}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          <text
                            x="0"
                            y="3.5"
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-white tracking-wide"
                          >
                            T{treno.codice}{treno.convoglio ? ` · C${treno.convoglio}` : ""}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 2. Tratti di sosta / Attesa in stazione (Linee Orizzontali) */}
                {treno.fermate.map((f, i) => {
                  if (f.t_arr === null || f.t_dep === null || f.t_dep <= f.t_arr) {
                    return null;
                  }

                  const xArr = getXForTime(f.t_arr);
                  const xDep = getXForTime(f.t_dep);
                  const y = getYForStation(f.stazione);
                  const isAttesaSignificativa = f.attesaMinuti > 1;

                  return (
                    <g key={`sosta-${treno.codice}-${i}`}>
                      {/* Evidenziazione attesa in stazione (se attiva) */}
                      {mostraAttese && isAttesaSignificativa && (
                        <rect
                          x={xArr}
                          y={y - 8}
                          width={Math.max(4, xDep - xArr)}
                          height={16}
                          rx={3}
                          fill="#fef3c7"
                          opacity={0.7}
                        />
                      )}

                      {/* Linea orizzontale di attesa stazione */}
                      <line
                        x1={xArr}
                        y1={y}
                        x2={xDep}
                        y2={y}
                        stroke={treno.colore.stroke}
                        strokeWidth={strokeWidth + (isAttesaSignificativa ? 1.5 : 0.5)}
                        strokeDasharray={isAttesaSignificativa ? "none" : "none"}
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY - 15,
                            treno: treno.codice,
                            convoglio: treno.convoglio,
                            stazione: f.stazione,
                            arr: f.t_arr !== null ? formatMinutesToTime(f.t_arr) : "-",
                            dep: f.t_dep !== null ? formatMinutesToTime(f.t_dep) : "-",
                            attesa: f.attesaMinuti,
                            direzione: treno.direzione,
                          });
                        }}
                        onMouseMove={(e) => {
                          setTooltip((prev) =>
                            prev ? { ...prev, x: e.clientX, y: e.clientY - 15 } : null,
                          );
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />

                      {/* Etichetta minuti di attesa se prolungata */}
                      {isAttesaSignificativa && xDep - xArr > 28 && (
                        <text
                          x={(xArr + xDep) / 2}
                          y={y - 10}
                          textAnchor="middle"
                          className="text-[9px] font-bold font-mono fill-amber-800"
                        >
                          +{Math.round(f.attesaMinuti)}m
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 3. Punti delle fermate */}
                {treno.fermate.map((f, i) => {
                  const y = getYForStation(f.stazione);
                  const pts: { x: number; label: string; isDep: boolean }[] = [];

                  if (f.t_arr !== null) {
                    pts.push({
                      x: getXForTime(f.t_arr),
                      label: `Arrivo ${formatMinutesToTime(f.t_arr)}`,
                      isDep: false,
                    });
                  }
                  if (f.t_dep !== null && (f.t_arr === null || f.t_dep !== f.t_arr)) {
                    pts.push({
                      x: getXForTime(f.t_dep),
                      label: `Partenza ${formatMinutesToTime(f.t_dep)}`,
                      isDep: true,
                    });
                  }

                  return (
                    <g key={`punti-${treno.codice}-${i}`}>
                      {pts.map((pt, pIdx) => (
                        <circle
                          key={pIdx}
                          cx={pt.x}
                          cy={y}
                          r={i === 0 || i === treno.fermate.length - 1 ? 4.5 : 3.5}
                          fill={pt.isDep ? treno.colore.stroke : "#ffffff"}
                          stroke={treno.colore.stroke}
                          strokeWidth={2}
                          className="cursor-pointer hover:r-[6] transition-all"
                          onMouseEnter={(e) => {
                            setTooltip({
                              x: e.clientX,
                              y: e.clientY - 15,
                              treno: treno.codice,
                              convoglio: treno.convoglio,
                              stazione: f.stazione,
                              arr: f.t_arr !== null ? formatMinutesToTime(f.t_arr) : "-",
                              dep: f.t_dep !== null ? formatMinutesToTime(f.t_dep) : "-",
                              attesa: f.attesaMinuti,
                              direzione: treno.direzione,
                            });
                          }}
                          onMouseMove={(e) => {
                            setTooltip((prev) =>
                              prev ? { ...prev, x: e.clientX, y: e.clientY - 15 } : null,
                            );
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip fisso rispetto alla viewport dello schermo */}
        {tooltip && (
          <div
            className={`fixed z-50 pointer-events-none bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-2xl border border-gray-700 space-y-1 transform -translate-x-1/2 transition-transform duration-75 ${
              tooltip.y < 120 ? "translate-y-4" : "-translate-y-full"
            }`}
            style={{
              left: Math.max(
                130,
                Math.min(
                  typeof window !== "undefined" ? window.innerWidth - 130 : 1000,
                  tooltip.x,
                ),
              ),
              top: tooltip.y,
            }}
          >
            <div className="flex items-center justify-between gap-3 font-bold border-b border-gray-700 pb-1">
              <span className="flex items-center gap-1.5">
                <TrainIcon className="h-3.5 w-3.5 text-lime-400" />
                <span>Treno {tooltip.treno}</span>
                {tooltip.convoglio && (
                  <span className="text-[11px] font-normal text-amber-300">
                    &bull; Convoglio {tooltip.convoglio}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 capitalize">
                {tooltip.direzione}
              </span>
            </div>
            <div className="text-gray-200 font-medium">{tooltip.stazione}</div>
            <div className="flex items-center gap-3 text-[11px] text-gray-300">
              {tooltip.arr && (
                <span>
                  Arr: <strong className="text-white">{tooltip.arr}</strong>
                </span>
              )}
              {tooltip.dep && (
                <span>
                  Part: <strong className="text-white">{tooltip.dep}</strong>
                </span>
              )}
            </div>
            {tooltip.attesa !== undefined && tooltip.attesa > 0 && (
              <div className="text-amber-400 text-[10px] font-semibold pt-0.5">
                ⏱ Attesa in stazione: {tooltip.attesa} min
              </div>
            )}
          </div>
        )}
      </div>

      {/* Didascalia e note grafiche sotto al diagramma */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-xs text-gray-500 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-600 inline-block" />
            <span>Tratta di corsa (marcia tra stazioni a 50 km/h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1.5 bg-amber-400 rounded-sm inline-block" />
            <span>Attesa / Sosta in stazione (liberazione subtratta)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-700 bg-white inline-block" />
            <span>Fermata / Incrocio regolare</span>
          </div>
        </div>

        <div className="text-gray-400 text-[11px]">
          Lunghezza tratta totale: <strong>54.68 km</strong> &bull; Velocità commerciale: <strong>50 km/h</strong>
        </div>
      </div>
    </div>
  );
}
