"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "../button";
import { ChevronDownIcon } from "lucide-react";

export default function Search() {
  const searchParams = useSearchParams(); // Allows you to access the parameters of the current URL
  const pathname = usePathname(); // Allows you to access the path
  const { replace } = useRouter(); //  Enables navigation between routes within client components programmatically
  const data = useRef<HTMLInputElement>(null);
  const inizio = useRef<HTMLInputElement>(null);
  const stazione1 = useRef<HTMLInputElement>(null);
  const stazione2 = useRef<HTMLInputElement>(null);
  const [errore, setErrore] = useState("");
  function handleSearch() {
    const giorno = data.current?.value || "";
    const start = inizio.current?.value || "";
    const partenza = stazione1.current?.value || "";
    const arrivo = stazione2.current?.value || "";
    const params = new URLSearchParams(searchParams);

    if (start && giorno) {
      params.set("data", giorno);
      params.set("inizio", start);
      params.set("partenza", partenza);
      params.set("arrivo", arrivo);
      setErrore("");
    } else {
      setErrore("Attenzione! Immettere la data, l'ora di inizio e di fine.");
      params.delete("data");
      params.delete("inizio");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <div className="relative flex flex-1 shrink-0 py-2 items-end">
        <div>
          <label htmlFor="giorno" className="sr-only">
            Giorno
          </label>
          <div>Giorno</div>
          <input
            type="date"
            name="giorno"
            id="giorno"
            ref={data}
            className="cursor-pointer mr-2 flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors focus-visible:outline-amber-100 active:bg-amber-200"
          />
        </div>
        <div>
          <label htmlFor="orarioInizio" className="sr-only">
            Orario inizio
          </label>
          <div>Orario inizio</div>
          <input
            type="time"
            name="orarioInizio"
            id="orarioInizio"
            ref={inizio}
            className="cursor-pointer mr-2 flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors focus-visible:outline-amber-100 active:bg-amber-200"
          />
        </div>
        <div>
          <label
            htmlFor="codiceTreno"
            className="block text-sm/6 font-medium text-gray-900"
          >

          </label>
          <div>
            <select
              id="codiceTreno"
              name="codiceTreno"
              className="cursor-pointer mr-2 flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors focus-visible:outline-amber-100 active:bg-amber-200"
            >
              <option value="">stazione1</option>
            </select>
          </div>
        </div>
        <Button className="" onClick={handleSearch}>
          Cerca
        </Button>
      </div>
      <div className="text-red-500">{errore}</div>
    </div>
  );
}
