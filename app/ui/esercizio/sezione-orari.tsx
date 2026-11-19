"use client";

import { Stazione, TracciaCorrente } from "@/app/lib/definitions";
import Search from "./cerca/searchTreno";
import DiagrammaSpazioTempo from "./diagramma-spazio-tempo";
import TabellaOrarioFerroviario from "./tabella-orario-ferroviario";
import Link from "next/link";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Table as TableIcon,
  Calendar,
  TrainIcon,
} from "lucide-react";

export default function SezioneOrari({
  active,
  tracce,
  stazioni,
}: {
  active: boolean;
  tracce: TracciaCorrente[] | null;
  stazioni: Stazione[] | null;
}) {
  const searchParams = useSearchParams();
  const dataTreno = searchParams.get("dataTreno") || "";
  const [vista, setVista] = useState<"diagramma" | "tabella">("tabella");

  if (!active) return null;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Barra superiore di ricerca e scorciatoie */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex-1">
          <Search />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pb-2">
          <span>Date di prova rapide:</span>
          <Link
            href="/esercizio?dataTreno=2070-01-01"
            className="px-2 py-1 rounded bg-lime-100 hover:bg-lime-200 text-lime-900 font-medium transition cursor-pointer"
          >
            2070-01-01
          </Link>
          <Link
            href="/esercizio?dataTreno=2070-01-02"
            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition cursor-pointer"
          >
            2070-01-02
          </Link>
        </div>
      </div>

      {/* Switcher di vista (Tabella Orario Ufficiale vs Diagramma Spazio-Tempo) */}
      {tracce !== null && tracce.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVista("tabella")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                vista === "tabella"
                  ? "bg-lime-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Tabella Orari Ufficiale
            </button>
            <button
              type="button"
              onClick={() => setVista("diagramma")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                vista === "diagramma"
                  ? "bg-lime-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Activity className="h-4 w-4" />
              Diagramma Spazio-Tempo
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Data orario: <strong>{dataTreno}</strong> &bull; Fermate totali:{" "}
            <strong>{tracce.length}</strong>
          </div>
        </div>
      )}

      {/* STATO VUOTO (Nessuna data cercata) */}
      {tracce === null && (
        <div className="p-12 text-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
          <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Nessuna data selezionata
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            Seleziona una data nella barra in alto oppure carica la data di prova (2070-01-01) per visualizzare l&apos;orario ferroviario.
          </p>
          <Link
            href="/esercizio?dataTreno=2070-01-01"
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-900 text-white rounded-lg text-sm font-semibold hover:bg-lime-800 transition cursor-pointer"
          >
            <TrainIcon className="h-4 w-4" />
            Carica orario 2070-01-01
          </Link>
        </div>
      )}

      {/* STATO NESSUN RISULTATO */}
      {tracce !== null && tracce.length === 0 && (
        <div className="p-10 text-center rounded-xl border border-red-200 bg-red-50 text-red-800">
          <p className="font-semibold">Nessuna traccia trovata per la data {dataTreno}</p>
          <p className="text-sm mt-1">Puoi programmare una nuova corsa cliccando sul pulsante &quot;Crea Corsa&quot; in alto.</p>
        </div>
      )}

      {/* VISTA 1: TABELLA ORARIO FERROVIARIO */}
      {vista === "tabella" && tracce && tracce.length > 0 && (
        <TabellaOrarioFerroviario
          tracce={tracce}
          stazioni={stazioni}
          dataSelezionata={dataTreno}
        />
      )}

      {/* VISTA 2: DIAGRAMMA SPATIO-TEMPO */}
      {vista === "diagramma" && tracce && tracce.length > 0 && (
        <DiagrammaSpazioTempo
          tracce={tracce}
          stazioni={stazioni}
          dataSelezionata={dataTreno}
        />
      )}
    </div>
  );
}
