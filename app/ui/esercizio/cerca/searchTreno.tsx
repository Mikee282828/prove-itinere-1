"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "../../button";
import Link from "next/link";

export default function Search() {
  const searchParams = useSearchParams(); // Allows you to access the parameters of the current URL
  const pathname = usePathname(); // Allows you to access the path
  const { replace } = useRouter(); //  Enables navigation between routes within client components programmatically
  const data = useRef<HTMLInputElement>(null);
  const [errore, setErrore] = useState("");

  function handleSearch() {
    const dataEffettivo = data.current?.value || "";
    const params = new URLSearchParams(searchParams);
    params.delete("data");
    params.delete("inizio");
    params.delete("fine");
    if (dataEffettivo) {
      params.set("dataTreno", dataEffettivo);
      setErrore("");
    } else {
      setErrore("Attenzione! Immettere la data");
      params.delete("dataTreno");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <div className="relative flex flex-1 shrink-0 py-2 items-end">
        <div>
          <label htmlFor="data" className="sr-only">
            Giorno
          </label>
          <div>Giorno</div>
          <input
            type="date"
            name="data"
            id="data"
            ref={data}
            className="cursor-pointer mr-2 flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors focus-visible:outline-amber-100 active:bg-amber-200"
          />
        </div>
        <Button className="mr-2" onClick={handleSearch}>
          Cerca
        </Button>
        <Button className="">
          <Link href="/esercizio/crea-corsa">Crea Corsa</Link>
        </Button>
      </div>
      <div className="text-red-500">{errore}</div>
    </div>
  );
}
