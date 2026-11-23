"use client";

import React, { useMemo } from "react";
import { Stazione, TracciaCorrente } from "@/app/lib/definitions";
import { formatOrario } from "@/app/lib/utils";
import Link from "next/link";
import { ArrowDown, ArrowUp, TrainIcon, AlertTriangle } from "lucide-react";

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

export default function TabellaOrarioFerroviario({
  tracce,
  stazioni,
  dataSelezionata,
}: {
  tracce: TracciaCorrente[] | null;
  stazioni: Stazione[] | null;
  dataSelezionata?: string;
}) {
  const listaStazioni = useMemo(() => {
    if (stazioni && stazioni.length >= 10) {
      return [...stazioni].sort(
        (a, b) => parseFloat(String(a.km)) - parseFloat(String(b.km)),
      );
    }
    return STAZIONI_DEFAULT;
  }, [stazioni]);

  // Raggruppamento e separazione per Andata e Ritorno
  const { treniAndata, treniRitorno } = useMemo(() => {
    if (!tracce || tracce.length === 0) {
      return { treniAndata: [] as TracciaCorrente[][], treniRitorno: [] as TracciaCorrente[][] };
    }

    const perTreno = new Map<number, TracciaCorrente[]>();
    tracce.forEach((tr) => {
      const arr = perTreno.get(tr.treno) || [];
      arr.push(tr);
      perTreno.set(tr.treno, arr);
    });

    const andata: TracciaCorrente[][] = [];
    const ritorno: TracciaCorrente[][] = [];

    perTreno.forEach((arr) => {
      // Ordina cronologicamente
      const sorted = [...arr].sort((a, b) => {
        const timeA = a.orario_partenza || a.orario_arrivo;
        const timeB = b.orario_partenza || b.orario_arrivo;

        const msA = timeA ? new Date(timeA).getTime() : 0;
        const msB = timeB ? new Date(timeB).getTime() : 0;

        return msA - msB;
      });

      // Se la prima stazione registrata è Torre Spaventa o ha arrivo nullo a Torre Spaventa -> Andata
      const primaStazione = sorted[0]?.stazione;
      if (primaStazione === "Torre Spaventa") {
        andata.push(sorted);
      } else {
        ritorno.push(sorted);
      }
    });
    
    const ordinaPerPartenza = (a: TracciaCorrente[], b: TracciaCorrente[]) => {
      const depA = a[0]?.orario_partenza || a[0]?.orario_arrivo;
      const depB = b[0]?.orario_partenza || b[0]?.orario_arrivo;
      const msA = depA ? new Date(depA).getTime() : 0;
      const msB = depB ? new Date(depB).getTime() : 0;
      if (msA !== msB) return msA - msB;
      return (a[0]?.treno || 0) - (b[0]?.treno || 0);
    };

    return {
      treniAndata: andata.sort(ordinaPerPartenza),
      treniRitorno: ritorno.sort(ordinaPerPartenza),
    };
  }, [tracce]);

  if (!tracce || tracce.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        Nessun orario ferroviario disponibile per la data selezionata.
      </div>
    );
  }

  const numStazioni = listaStazioni.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
      {/* Intestazione */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrainIcon className="h-5 w-5 text-lime-900" />
            Quadro Orario Ufficiale di Linea
          </h2>
          <p className="text-xs text-gray-500">
            Rappresentazione standard ferroviaria: Treni di Andata (↓) &bull; Treni di Ritorno (↑)
            {dataSelezionata && <span className="font-semibold text-lime-900 ml-1">({dataSelezionata})</span>}
          </p>
        </div>
      </div>

      {/* Tabella Orario Stile Ufficiale FS / Didattico */}
      <div className="overflow-x-auto">
        <table className="w-auto mx-auto border-collapse font-sans text-xs">
          {/* Raggruppamento macro-colonne */}
          <thead>
            {/* Riga 1: Macro-intestazioni (Treni Andata, Kilometrica, Nome Stazione, Treni Ritorno) */}
            <tr className="border-b border-gray-300 text-gray-500 text-[11px]">
              {/* Macro Treni Andata */}
              <th
                colSpan={Math.max(1, treniAndata.length)}
                className="py-1 px-2 font-normal text-center"
              >
                <div className="flex flex-col items-center">
                  <span>treni</span>
                  <div className="w-full border-t border-gray-400 mt-0.5"></div>
                </div>
              </th>

              {/* p/a andata */}
              <th className="py-1 px-1"></th>

              {/* Kilometrica */}
              <th className="py-1 px-3 font-normal text-center whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <span>Kilometrica</span>
                  <div className="w-full border-t border-gray-400 mt-0.5"></div>
                </div>
              </th>

              {/* Nome stazione */}
              <th className="py-1 px-4 font-normal text-center whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <span>Nome stazione</span>
                  <div className="w-full border-t border-gray-400 mt-0.5"></div>
                </div>
              </th>

              {/* a/p ritorno */}
              <th className="py-1 px-1"></th>

              {/* Macro Treni Ritorno */}
              <th
                colSpan={Math.max(1, treniRitorno.length)}
                className="py-1 px-2 font-normal text-center"
              >
                <div className="flex flex-col items-center">
                  <span>treni</span>
                  <div className="w-full border-t border-gray-400 mt-0.5"></div>
                </div>
              </th>
            </tr>

            {/* Riga 2: Dettaglio colonne treni (Numero, Tipologia) */}
            <tr className="border-b-2 border-gray-800 text-center">
              {/* Colonne Treni Andata */}
              {treniAndata.map((trenoArray) => {
                const cod = trenoArray[0]?.treno;
                const dataRaw = trenoArray[0]?.data;
                const conv = trenoArray[0]?.convoglio

                const dataStr = dataRaw
                  ? (dataRaw instanceof Date ? dataRaw.toISOString().slice(0, 10) : String(dataRaw))
                  : "";

                return (
                  <th
                    key={`th-andata-${cod}`}
                    className="py-2 px-3 border-x border-gray-300 bg-slate-50 font-medium"
                  >
                    <Link
                      href={dataStr ? `/esercizio/${cod}_${dataStr}/edit` : `/esercizio`}
                      className="font-bold text-sm text-gray-900 hover:text-lime-700 underline underline-offset-2"
                      title="Modifica corsa"
                    >
                      {cod}
                    </Link>
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                      conv
                    </div>
                    <div className="text-[9px] text-gray-400 font-normal">
                      {conv}
                    </div>
                  </th>
                );
              })}

              {treniAndata.length === 0 && (
                <th className="py-2 px-3 text-gray-400 italic text-[11px] border-x">
                  Nessun treno
                </th>
              )}

              {/* Freccia discesa andata */}
              <th className="py-2 px-1 text-center align-bottom border-r border-gray-400">
                <ArrowDown className="h-3.5 w-3.5 mx-auto text-gray-600 mb-0.5" />
              </th>

              {/* Header km */}
              <th className="py-2 px-3 text-center text-gray-600 font-bold border-r border-gray-200">
                <div className="text-[10px] text-gray-400 font-normal">Dist.</div>
                <div>km</div>
              </th>

              {/* Header nome stazione */}
              <th className="py-2 px-4 text-center text-gray-700 font-bold border-r border-gray-400">
                &nbsp;
              </th>

              {/* Freccia salita ritorno */}
              <th className="py-2 px-1 text-center align-top border-r border-gray-300">
                <ArrowUp className="h-3.5 w-3.5 mx-auto text-gray-600 mt-0.5" />
              </th>

              {/* Colonne Treni Ritorno */}
              {treniRitorno.map((trenoArray) => {
                const cod = trenoArray[0]?.treno;
                const dataRaw = trenoArray[0]?.data;
                const conv = trenoArray[0]?.convoglio;
                const dataStr = dataRaw
                  ? (dataRaw instanceof Date ? dataRaw.toISOString().slice(0, 10) : String(dataRaw))
                  : "";

                return (
                  <th
                    key={`th-ritorno-${cod}`}
                    className="py-2 px-3 border-x border-gray-300 bg-slate-50 font-medium"
                  >
                    <Link
                      href={dataStr ? `/esercizio/${cod}_${dataStr}/edit` : `/esercizio`}
                      className="font-bold text-sm text-gray-900 hover:text-lime-700 underline underline-offset-2"
                      title="Modifica corsa"
                    >
                      {cod}
                    </Link>
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                      conv
                    </div>
                    <div className="text-[9px] text-gray-400 font-normal">
                      {conv}
                    </div>
                  </th>
                );
              })}

              {treniRitorno.length === 0 && (
                <th className="py-2 px-3 text-gray-400 italic text-[11px] border-x">
                  Nessun treno
                </th>
              )}
            </tr>
          </thead>

          {/* Corpo Tabella */}
          <tbody className="divide-y divide-gray-100">
            {listaStazioni.map((stazione, sIdx) => {
              const isCapolineaIniziale = sIdx === 0;
              const isCapolineaFinale = sIdx === numStazioni - 1;
              const kmDisplay = isCapolineaIniziale
                ? "»»"
                : parseFloat(String(stazione.km)).toFixed(0);

              // 1. CASO CAPOLINEA INIZIALE (Torre Spaventa): Solo 1 riga (p per andata, a per ritorno)
              if (isCapolineaIniziale) {
                return (
                  <tr
                    key={`staz-${stazione.nome}`}
                    className="hover:bg-slate-50 border-b border-gray-200"
                  >
                    {/* Treni Andata: Orario Partenza */}
                    {treniAndata.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_partenza) : "-";
                      return (
                        <td
                          key={tIdx}
                          className="py-1 px-3 border-x border-gray-300 text-center font-mono font-bold text-gray-900"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniAndata.length === 0 && <td className="border-x text-center">-</td>}

                    {/* Andata: p */}
                    <td className="py-1 px-1.5 text-center font-semibold text-gray-700 border-r border-gray-400 bg-gray-50">
                      p
                    </td>

                    {/* Dist. km */}
                    <td className="py-1 px-3 text-center font-mono text-gray-600 border-r border-gray-200">
                      {kmDisplay}
                    </td>

                    {/* Nome Stazione */}
                    <td className="py-1 px-4 text-left font-bold text-gray-900 border-r border-gray-400 whitespace-nowrap bg-gray-50/50">
                      {stazione.nome}
                    </td>

                    {/* Ritorno: a */}
                    <td className="py-1 px-1.5 text-center font-semibold text-gray-700 border-r border-gray-300 bg-gray-50">
                      a
                    </td>

                    {/* Treni Ritorno: Orario Arrivo a Torre Spaventa */}
                    {treniRitorno.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_arrivo) : "-";
                      return (
                        <td
                          key={tIdx}
                          className="py-1 px-3 border-x border-gray-300 text-center font-mono font-bold text-gray-900"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniRitorno.length === 0 && <td className="border-x text-center">-</td>}
                  </tr>
                );
              }

              // 2. CASO CAPOLINEA FINALE (Villa San Felice): Solo 1 riga (a per andata, p per ritorno)
              if (isCapolineaFinale) {
                return (
                  <tr
                    key={`staz-${stazione.nome}`}
                    className="hover:bg-slate-50 border-t border-gray-200"
                  >
                    {/* Treni Andata: Orario Arrivo a Villa San Felice */}
                    {treniAndata.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_arrivo) : "-";
                      return (
                        <td
                          key={tIdx}
                          className="py-1 px-3 border-x border-gray-300 text-center font-mono font-bold text-gray-900"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniAndata.length === 0 && <td className="border-x text-center">-</td>}

                    {/* Andata: a */}
                    <td className="py-1 px-1.5 text-center font-semibold text-gray-700 border-r border-gray-400 bg-gray-50">
                      a
                    </td>

                    {/* Dist. km */}
                    <td className="py-1 px-3 text-center font-mono text-gray-600 border-r border-gray-200">
                      {kmDisplay}
                    </td>

                    {/* Nome Stazione */}
                    <td className="py-1 px-4 text-left font-bold text-gray-900 border-r border-gray-400 whitespace-nowrap bg-gray-50/50">
                      {stazione.nome}
                    </td>

                    {/* Ritorno: p */}
                    <td className="py-1 px-1.5 text-center font-semibold text-gray-700 border-r border-gray-300 bg-gray-50">
                      p
                    </td>

                    {/* Treni Ritorno: Orario Partenza da Villa San Felice */}
                    {treniRitorno.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_partenza) : "-";
                      return (
                        <td
                          key={tIdx}
                          className="py-1 px-3 border-x border-gray-300 text-center font-mono font-bold text-gray-900"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniRitorno.length === 0 && <td className="border-x text-center">-</td>}
                  </tr>
                );
              }

              // 3. CASO STAZIONI INTERMEDIE: 2 righe
              // Sub-riga A: Andata 'a' (Arrivo) / Ritorno 'p' (Partenza verso monte)
              // Sub-riga B: Andata 'p' (Partenza) / Ritorno 'a' (Arrivo da valle)
              return (
                <React.Fragment key={`staz-${stazione.nome}`}>
                  {/* Sottoriga A */}
                  <tr className="hover:bg-slate-50/70">
                    {/* Treni Andata: Arrivo */}
                    {treniAndata.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_arrivo) : "-";
                      return (
                        <td
                          key={`a-${tIdx}`}
                          className="py-0.5 px-3 border-x border-gray-300 text-center font-mono text-gray-800"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniAndata.length === 0 && <td className="border-x text-center">-</td>}

                    {/* Andata: a */}
                    <td className="py-0.5 px-1.5 text-center font-medium text-gray-600 border-r border-gray-400 bg-gray-50/60">
                      a
                    </td>

                    {/* Dist. km (con rowSpan=2) */}
                    <td
                      rowSpan={2}
                      className="py-1 px-3 text-center font-mono font-medium text-gray-700 border-r border-gray-200 align-middle"
                    >
                      {kmDisplay}
                    </td>

                    {/* Nome Stazione (con rowSpan=2) */}
                    <td
                      rowSpan={2}
                      className="py-1 px-4 text-left font-semibold text-gray-800 border-r border-gray-400 whitespace-nowrap align-middle bg-gray-50/30"
                    >
                      {stazione.nome}
                    </td>

                    {/* Ritorno: p (Partenza verso monte) */}
                    <td className="py-0.5 px-1.5 text-center font-medium text-gray-600 border-r border-gray-300 bg-gray-50/60">
                      p
                    </td>

                    {/* Treni Ritorno: Partenza */}
                    {treniRitorno.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_partenza) : "-";
                      return (
                        <td
                          key={`p-${tIdx}`}
                          className="py-0.5 px-3 border-x border-gray-300 text-center font-mono text-gray-800"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniRitorno.length === 0 && <td className="border-x text-center">-</td>}
                  </tr>

                  {/* Sottoriga B */}
                  <tr className="hover:bg-slate-50/70 border-b border-gray-200">
                    {/* Treni Andata: Partenza */}
                    {treniAndata.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_partenza) : "-";
                      return (
                        <td
                          key={`p-${tIdx}`}
                          className="py-0.5 px-3 border-x border-gray-300 text-center font-mono text-gray-800"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniAndata.length === 0 && <td className="border-x text-center">-</td>}

                    {/* Andata: p */}
                    <td className="py-0.5 px-1.5 text-center font-medium text-gray-600 border-r border-gray-400 bg-gray-50/60">
                      p
                    </td>

                    {/* Ritorno: a (Arrivo da valle) */}
                    <td className="py-0.5 px-1.5 text-center font-medium text-gray-600 border-r border-gray-300 bg-gray-50/60">
                      a
                    </td>

                    {/* Treni Ritorno: Arrivo */}
                    {treniRitorno.map((treno, tIdx) => {
                      const tr = treno.find((item) => item.stazione === stazione.nome);
                      const orario = tr ? formatOrario(tr.orario_arrivo) : "-";
                      return (
                        <td
                          key={`a-${tIdx}`}
                          className="py-0.5 px-3 border-x border-gray-300 text-center font-mono text-gray-800"
                        >
                          {orario}
                        </td>
                      );
                    })}
                    {treniRitorno.length === 0 && <td className="border-x text-center">-</td>}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Didascalia del verso di percorrenza conforme allo schema */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <ArrowDown className="h-4 w-4 text-blue-600" />
            <span>Verso percorrenza Andata (Torre Spaventa ➔ Villa San Felice)</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <ArrowUp className="h-4 w-4 text-red-600" />
            <span>Verso percorrenza Ritorno (Villa San Felice ➔ Torre Spaventa)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] max-w-md flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Nota di lettura:</strong> Nelle stazioni intermedie sono riportate l&apos;ora di arrivo (<strong>a</strong>) e di partenza (<strong>p</strong>). I treni di andata procedono dall&apos;alto verso il basso, mentre i treni di ritorno procedono dal basso verso l&apos;alto.
          </span>
        </div>
      </div>
    </div>
  );
}
