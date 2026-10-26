"use client";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { Button } from "../button";
import { ConvoglioRaggruppato } from "@/app/lib/data";
import { DaUnoAVenti, Stazione } from "@/app/lib/definitions";
import { createCorsa, StateCorsa } from "@/app/lib/actions";
import { useActionState, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { TrainIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function Form({
  convogli,
}: {
  convogli: ConvoglioRaggruppato[] | null;
}) {
  const initialState: StateCorsa = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCorsa, initialState);
  const codiciTreni: DaUnoAVenti[] = Array.from(
    { length: 20 },
    (_, i) => i + 1,
  ) as DaUnoAVenti[];

  const inData = useRef<HTMLInputElement>(null);
  const inCodice = useRef<HTMLSelectElement>(null);
  const inOrario = useRef<HTMLInputElement>(null);
  const inStazione = useRef<HTMLSelectElement>(null);

  const searchParams = useSearchParams(); // Allows you to access the parameters of the current URL
  const pathname = usePathname(); // Allows you to access the path
  const { replace } = useRouter(); //  Enables navigation between routes within client components programmatically

  const params = new URLSearchParams(searchParams); // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters.

  // stringa d'errore da mostrare
  const [errore, setErrore] = useState("");
  const [convoglioSelezionato, setConvoglioSelezionato] = useState<
    string | null
  >(null);

  // funzione che si triggera quando si preme il pulsante di ricerca convogli
  function handleSearch() {
    setConvoglioSelezionato(null);
    const data = inData.current?.value || "";
    const orario = inOrario.current?.value || "";
    const stazione = inStazione.current?.value || "";
    const codiceTreno = inCodice.current?.value || "";

    if (data && orario && stazione && codiceTreno) {
      params.set("data", data);
      params.set("orario", orario);
      params.set("stazione", stazione);
      params.set("codiceTreno", codiceTreno);
      setErrore("");
      replace(`${pathname}?${params.toString()}`)
    } else {
      setErrore("Attenzione! Immettere tutti i campi necessari per la ricerca dei convogli disponibili.");
      replace(`${pathname}`);
    }
  }

  return (
    <form
      className="flex-1 p-8"
      action={formAction}
      onReset={() => setConvoglioSelezionato(null)}
    >
      {state.message && (
        <div className="mt-6 p-4 rounded-md bg-red-5 breadcrumb bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-800">{state.message}</p>
        </div>
      )}

      {/* Input form */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-8">
            {/* Input data treno */}
            <div className="sm:col-span-2 col-span-8">
              <label
                htmlFor="data"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Data treno<span className="text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  id="data"
                  name="data"
                  type="date"
                  className={cn("block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer",
                    searchParams.get("data") && "text-gray-300"
                  )}
                  defaultValue={state.enteredFormData?.data || searchParams.get("data") || ""}
                  ref={inData}
                  readOnly={searchParams.get("data") ? true : false}
                />
              </div>
              <div>
                {state.errors?.data &&
                  state.errors.data.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>

            {/* Input Codice Treno */}
            <div className="sm:col-span-2 col-span-8">
              <label
                htmlFor="codiceTreno"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Codice treno<span className="text-red-400">*</span>
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="codiceTreno"
                  name="codiceTreno"
                  key={state.enteredFormData?.codiceTreno}
                  className={cn("col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer",
                    searchParams.get("codiceTreno") && "text-gray-300"
                  )}
                  defaultValue={state.enteredFormData?.codiceTreno || searchParams.get("codiceTreno") || "1"}
                  ref={inCodice}
                  disabled={searchParams.get("codiceTreno") ? true : false}
                >
                  {codiciTreni.map((codici) => {
                    return <option key={codici}>{codici}</option>;
                  })}
                </select>
                <input type="hidden" name="codiceTreno" value={searchParams.get("codiceTreno") || ""} />
                {!searchParams.get("codiceTreno") && (
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                )}
                <div>
                  {state.errors?.codiceTreno &&
                    state.errors.codiceTreno.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            {/* Input Orario treno */}
            <div className="sm:col-span-2 col-span-8">
              <label
                htmlFor="orario"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Orario treno<span className="text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  id="orario"
                  name="orario"
                  type="time"
                  className={cn("block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer",
                    searchParams.get("orario") && "text-gray-300"
                  )}
                  defaultValue={state.enteredFormData?.orario || searchParams.get("orario") || ""}
                  ref={inOrario}
                  readOnly={searchParams.get("orario") ? true : false}
                />
              </div>
              <div>
                {state.errors?.orario &&
                  state.errors.orario.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>

            {/* Input Stazione  */}
            <div className="sm:col-span-2 col-span-8">
              <label
                htmlFor="stazione"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Stazione<span className="text-red-400">*</span>
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="stazione"
                  name="stazione"
                  className={cn("col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer",
                    searchParams.get("stazione") && "text-gray-300"
                  )}
                  defaultValue={state.enteredFormData?.stazione || searchParams.get("stazione") || "Torre Spaventa"}
                  key={state.enteredFormData?.stazione}
                  ref={inStazione}
                  disabled={searchParams.get("stazione") ? true : false}
                >
                  <option value="Torre Spaventa">
                    Torre Spaventa
                  </option>
                  <option value="Villa San Felice">
                    Villa San Felice
                  </option>
                </select>
                <input type="hidden" name="stazione" value={searchParams.get("stazione") || "Torre Spaventa"} />
                {!searchParams.get("stazione") && (
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                )}
                <div>
                  {state.errors?.stazione &&
                    state.errors.stazione.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Convogli */}
        <div className="grid gap-6">
          {convogli?.map((element, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrainIcon className="h-5 w-5 text-primary" />
                    Convoglio: {element.convoglio}
                  </CardTitle>
                  <input
                    type="radio"
                    name="convoglio"
                    value={element.convoglio}
                    checked={convoglioSelezionato === element.convoglio}
                    onChange={() => setConvoglioSelezionato(element.convoglio)}
                    required
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {element?.materiali?.map((materiale, index) => {
                    return (
                      <div
                        key={`${materiale}-${index}`}
                        className="shrink-0 px-4 py-3 rounded-lg border-2 bg-amber-50"
                      >
                        <p className="font-medium text-sm">
                          {materiale}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottoni */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <div className="flex gap-x-6">
          <Button type="reset" className="text-sm/6 font-semibold text-white bg-red-500 hover:bg-red-400 disabled:bg-gray-300">
            Cancella
          </Button>
          <Button
            type="submit"
            className="disabled:bg-gray-300  rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            disabled={!convoglioSelezionato}
          >
            Crea
          </Button>
        </div>

        <Button
          type="button"
          className="rounded-md px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={(e) => {
            handleSearch();
          }}
        >
          Cerca
        </Button>
      </div>

      {/* Errori */}
      {state.message && (
        <div className="mt-6 p-4 rounded-md bg-red-5 breadcrumb bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-800">{state.message}</p>
        </div>
      )}
      <div className="text-red-500">{errore}</div>
    </form>
  );
}
