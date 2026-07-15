import { Stazione, TracciaCorrente } from "@/app/lib/definitions";
import Search from "./cerca/searchTreno";
import Link from "next/link";
import React from "react";

export default function SezioneOrari({
  active,
  tracce,
  stazioni,
}: {
  active: boolean;
  tracce: TracciaCorrente[] | null;
  stazioni: Stazione[] | null;
}) {
  if (active) {
    let tracceSmistate;
    let tracceAndata;
    let tracceRitorno;

    if (tracce && tracce.length > 0) {
      tracceSmistate = tracce && Object.groupBy(tracce, (traccia) => traccia.progressivo)
      tracceAndata = tracceSmistate?.["1"]
        ? Object.groupBy(tracceSmistate["1"], (traccia) => traccia.treno)
        : undefined;
      tracceRitorno = tracceSmistate?.["2"]
        ? Object.groupBy(tracceSmistate["2"], (traccia) => traccia.treno)
        : undefined;
    }
    
    console.log("smistate",tracceSmistate)
    console.log("andata",tracceAndata)
    console.log("ritorno",tracceRitorno)

    return (
      <div className="p-8">
        <Link
          href="/esercizio?dataTreno=2070-01-01"
          className="text-blue-500 hover:text-blue-400"
        >
          2070-01-01
        </Link>
        <Search />

        {
          tracce === null ? "" :
            (tracce?.length === 0) ? (
              <div className="text-red-500"> Nessun elemento trovato</div>
            ) :
              (<div className="flex justify-center gap-8">
                {/* orari andata */}
                <div className="flex border-x-2">
                  {tracceAndata && Object.values(tracceAndata).map((tracceArray) => {
                    return (
                      <div key={tracceArray?.[0].treno + "andata"}>
                        <Link href={`/esercizio/${tracceArray?.[0].treno}_${new Intl.DateTimeFormat('sv-SE').format(tracceArray?.[0].data)}/edit`}><strong className="border-b-2 hover:opacity-50">Treno: {tracceArray?.[0].treno}</strong></Link>
                        {tracceArray?.map((element) => {
                          return (
                            <div key={element.orario_partenza?.slice(0, 5) + "andata"}>
                              <div>
                                {element.orario_arrivo?.slice(0, 5)}
                              </div>
                              <div>
                                {element.orario_partenza?.slice(0, 5)}&#8203;
                              </div>
                            </div>)
                        })}
                      </div>)
                  })}
                </div>
                {/* partenza/arrivo */}
                <div className="border-x-2 text-center">
                  <div>
                    <strong>Andata</strong>
                  </div>
                  {stazioni?.map((el, index) => {
                    return (
                      <React.Fragment key={`andata_${el.nome}`}>
                        <div>
                          <strong>p</strong>
                        </div>
                        {index !== stazioni.length - 1 ? <div><strong>a</strong></div> : ""}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* nome stazione */}
                <div>
                  <div>
                    <strong>Nome stazione</strong>
                  </div>
                  {stazioni?.map((stazione) => {
                    return (
                      <React.Fragment key={stazione.nome}>
                        <div>
                          {stazione.nome} {parseFloat(String(stazione.km)).toFixed(2)} km
                        </div>
                        <div>
                          &#8203;
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* partenza/arrivo */}
                <div className="border-x-2 text-center">
                  <div>
                    <strong>Ritorno</strong>
                  </div>
                  {stazioni?.map((el, index) => {
                    return (
                      <React.Fragment key={`ritorno_${el.nome}`}>
                        <div>
                          <strong>a</strong>
                        </div>
                        {index !== stazioni.length - 1 ? <div><strong>p</strong></div> : ""}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* orari ritorno */}
                <div className="flex border-x-2">
                  {tracceRitorno && Object.values(tracceRitorno).map((tracceArray) => {
                    return (
                      <div key={tracceArray?.[0].treno + "ritorno"}>
                        <Link href={`/esercizio/${tracceArray?.[0].treno}_${new Intl.DateTimeFormat('sv-SE').format(tracceArray?.[0].data)}/edit`}><strong className="border-b-2 hover:opacity-50">Treno: {tracceArray?.[0].treno}</strong></Link>
                        {[...(tracceArray ?? [])].reverse().map((element) => {
                          return (
                            <div key={element.orario_partenza?.slice(0, 5) + "ritorno"}>
                              <div>
                                {element.orario_partenza?.slice(0, 5)}
                              </div>
                              <div>
                                {element.orario_arrivo?.slice(0, 5)} {/* carattere vuoto */}
                              </div>
                            </div>)
                        })}
                      </div>)
                  })}
                </div>
              </div>)}
      </div>
    );
  }
}
