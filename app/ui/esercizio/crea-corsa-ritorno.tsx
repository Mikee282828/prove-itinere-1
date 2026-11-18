"use client";
import { Button } from "../button";
import { createCorsaWithRitorno, StateCorsa } from "@/app/lib/actions";
import { useActionState, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { CodiciTreno } from "@/app/lib/definitions";
import { cn, estraiData, formattaTimeStamp } from "@/app/lib/utils";

export default function Form({
  data,
  orario,
  stazione,
  convoglio,
  codiceTreno,
  tempo_ritorno_min,
  treniDisponibili
}: {
  data: string,
  orario: string,
  stazione: string,
  convoglio: string,
  codiceTreno: string,
  tempo_ritorno_min: string,
  treniDisponibili: CodiciTreno | null;
}) {
  const inDataRitorno = useRef<HTMLInputElement>(null);
  const inCodiceRitorno = useRef<HTMLSelectElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: StateCorsa = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCorsaWithRitorno, initialState);

  const searchParams = useSearchParams(); // Allows you to access the parameters of the current URL
  const pathname = usePathname(); // Allows you to access the path
  const { replace } = useRouter(); //  Enables navigation between routes within client components programmatically

  const params = new URLSearchParams(searchParams); // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters.

  const handleDateSearch = (term: string) => {
    if (term) {
      params.set("data_ritorno", term);
    } else {
      params.delete("data_ritorno");
    }
    replace(`${pathname}?${params}`);
  };

  // stringa d'errore da mostrare
  const [errore, setErrore] = useState("");

  function allReset() {
    formRef.current?.reset();
    params.delete("data_ritorno");
    params.delete("orario_ritorno");
    setErrore("");
    replace(`${pathname}?${params}`);
  }

  return (
    <form
      ref={formRef}
      className="flex-1 p-8"
      action={formAction}
    >
      {state.message && (
        <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-800">{state.message}</p>
        </div>
      )}

      {/* Input form */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-10">
            {/* Input data treno */}
            <div className="md:col-span-2 col-span-8">
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6  text-gray-300"
                  defaultValue={state.enteredFormData?.data || data || ""}
                  readOnly
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
            <div className="md:col-span-2 col-span-8">
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
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6  text-gray-300"
                  defaultValue={state.enteredFormData?.codiceTreno || codiceTreno}
                  disabled
                >
                  <option>{codiceTreno}</option>
                </select>
                <input type="hidden" name="codiceTreno" value={codiceTreno} />
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
            <div className="md:col-span-2 col-span-8">
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6  text-gray-300"
                  defaultValue={state.enteredFormData?.orario || orario || ""}
                  readOnly
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
            <div className="md:col-span-2 col-span-8">
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
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 text-gray-300"
                  defaultValue={state.enteredFormData?.stazione || stazione}
                  disabled
                >
                  <option value={stazione}>
                    {stazione}
                  </option>
                </select>
                <input type="hidden" name="stazione" value={state.enteredFormData?.stazione || stazione} />
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

            {/* Convoglio */}
            <div className="md:col-span-2 col-span-8">
              <label
                htmlFor="convoglio"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Convoglio<span className="text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  id="convoglio"
                  name="convoglio"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 text-gray-300"
                  defaultValue={state.enteredFormData?.convoglio || convoglio}
                  readOnly
                />
              </div>
              <div>
                {state.errors?.convoglio &&
                  state.errors.convoglio.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>


        {/* RITORNO */}
        Selezionare un orario di ritorno uguale o successivo a { formattaTimeStamp(tempo_ritorno_min)}<span className="text-red-400">*</span>

        <div className="space-y-12">
          <div className="text-red-500">(Inserisci data treno per visualizzare i codici treni disponibili)</div>
          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-8">

              {/* Input data treno ritorno*/}
              <div className="sm:col-span-2 col-span-8">
                <label
                  htmlFor="data_ritorno"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Data treno ritorno<span className="text-red-400">*</span>
                </label>
                <div className="mt-2">
                  <input
                    min={estraiData(tempo_ritorno_min) || ""}
                    id="data_ritorno"
                    name="data_ritorno"
                    type="date"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                    defaultValue={state.enteredFormData?.data_ritorno || searchParams.get("data_ritorno") || ""}
                    ref={inDataRitorno}
                    onChange={(e) => { handleDateSearch(e.target.value) }}
                  />
                </div>
                <div>
                  {state.errors?.data_ritorno &&
                    state.errors.data_ritorno.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>

              {/* Input Codice Treno ritorno*/}
              <div className="sm:col-span-2 col-span-8">
                <label
                  htmlFor="codiceTreno_ritorno"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Codice treno ritorno<span className="text-red-400">*</span>
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="codiceTreno_ritorno"
                    name="codiceTreno_ritorno"
                    key={state.enteredFormData?.codiceTreno_ritorno || searchParams.get("data_ritorno")}
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                    defaultValue={state.enteredFormData?.codiceTreno_ritorno || ""}
                    ref={inCodiceRitorno}
                  >
                    <option value="">
                      {treniDisponibili && treniDisponibili.length > 0
                        ? "Seleziona codice treno"
                        : "Nessun codice disponibile (inserisci data)"}
                    </option>
                    {treniDisponibili
                      ?.filter((t) => {
                        if (searchParams.get("data_ritorno") === data) {
                          return String(t.codice) !== String(codiceTreno);
                        }
                        return true;
                      })
                      .map((codici) => {
                        return (
                          <option key={codici.codice} value={codici.codice}>
                            {codici.codice}
                          </option>
                        );
                      })}
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
                <div>
                  {state.errors?.codiceTreno_ritorno &&
                    state.errors.codiceTreno_ritorno.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>

              {/* Input Orario ritorno */}
              <div className="sm:col-span-2 col-span-8">
                <label
                  htmlFor="orario_ritorno"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Orario ritorno<span className="text-red-400">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="orario_ritorno"
                    name="orario_ritorno"
                    type="time"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    defaultValue={state.enteredFormData?.orario_ritorno || ""}
                  />
                </div>
                <div>
                  {state.errors?.orario_ritorno &&
                    state.errors.orario_ritorno.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottoni */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <div className="flex gap-x-6">
          <Button type="reset" className="text-sm/6 font-semibold text-white bg-red-500 hover:bg-red-400 disabled:bg-gray-300" onClick={allReset}>
            Cancella
          </Button>
          <Button
            type="submit"
            className="disabled:bg-gray-300 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Crea
          </Button>
        </div>
      </div>
    </form>
  );
}
