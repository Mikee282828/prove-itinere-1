"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "./button";

export default function Search() {
  const searchParams = useSearchParams(); // Allows you to access the parameters of the current URL
  const pathname = usePathname(); // Allows you to access the path
  const { replace } = useRouter(); //  Enables navigation between routes within client components programmatically
  const data = useRef<HTMLInputElement>(null);
  const inizio = useRef<HTMLInputElement>(null);
  const fine = useRef<HTMLInputElement>(null);
  const [errore, setErrore] = useState("");

  function handleSearch() {
    const giorno = data.current?.value || "";
    const start = inizio.current?.value || "";
    const end = fine.current?.value || "";
    const params = new URLSearchParams(searchParams);
    if (start && end && giorno) {
      params.set("data", giorno);
      params.set("inizio", start);
      params.set("fine", end);
      setErrore("");
    } else {
      setErrore("Attenzione! Immettere la data, l'ora di inizio e di fine.");
      params.delete("data");
      params.delete("inizio");
      params.delete("fine");
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
          <label htmlFor="orarioFine" className="sr-only">
            Orario fine
          </label>
          <div>Orario fine</div>
          <input
            type="time"
            name="orarioFine"
            id="orarioFine"
            ref={fine}
            className="cursor-pointer mr-2 flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors focus-visible:outline-amber-100 active:bg-amber-200"
          />
        </div>

        <Button className="" onClick={handleSearch}>
          Cerca
        </Button>
      </div>
      <div className="text-red-500">
        {errore}
      </div>
    </div>
  );
}
