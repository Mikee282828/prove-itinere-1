"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "./button";

export default function Search() {
  const searchParams = useSearchParams(); // Allows you to access the parameters of the current URL
  const pathname = usePathname(); // Allows you to access the path
  const { replace } = useRouter(); //  Enables navigation between routes within client components programmatically
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const term = inputRef.current?.value || "";
    const params = new URLSearchParams(searchParams); // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters.
    if (term) {
      params.set("datetime", term);
    } else {
      params.delete("datetime");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-1 shrink-0 py-2">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input type="datetime-local" name="search" id="search" ref={inputRef} className="cursor-pointer mr-2 flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors focus-visible:outline-amber-100 active:bg-amber-200" />
      <Button className="" onClick={handleSearch}>
        Cerca
      </Button>
    </div>
  );
}
