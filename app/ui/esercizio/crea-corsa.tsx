"use client";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { Button } from "../button";
import { ConvoglioRaggruppato } from "@/app/lib/data";
import { DaUnoAVenti, Stazione } from "@/app/lib/definitions";
import { createCorsa, StateCorsa } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form({
  convogli,
  stazioni,
}: {
  convogli: ConvoglioRaggruppato[];
  stazioni: Stazione[];
}) {
  const initialState: StateCorsa = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCorsa, initialState);
  const codiciTreni: DaUnoAVenti[] = Array.from(
    { length: 20 },
    (_, i) => i + 1,
  ) as DaUnoAVenti[];
  return (
    <form className="flex-1 p-8" action={formAction}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="data"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Data treno
              </label>
              <div className="mt-2">
                <input
                  id="data"
                  name="data"
                  type="date"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                  required                
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

            <div className="sm:col-span-2">
              <label
                htmlFor="codiceTreno"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Codice treno
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="codiceTreno"
                  name="codiceTreno"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                >
                  {codiciTreni.map((codici) => (
                    <option key={codici}>{codici}</option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
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
            <div className="sm:col-span-2">
              <label
                htmlFor="convoglio"
                className="block text-sm/6 font-medium text-gray-900"
              >
                convoglio
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="convoglio"
                  name="convoglio"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                >
                  {convogli.map((convoglio) => (
                    <option key={convoglio.convoglio}>
                      {convoglio.convoglio}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
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

            {/* Tracce */}
            {/* Torre Spaventa : andata */}
            {stazioni.map((stazione, index) => (
              <div
                key={`${stazione}${index}`}
                className="col-span-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
              >
                <div className="sm:col-span-3">
                  <label
                    htmlFor={`partenza${index + 1}`}
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Partenza da: <strong>{stazione.nome}</strong>{" "}
                    {parseFloat(String(stazione.km)).toFixed(2)} Km andata
                  </label>
                  <div className="grid grid-cols-1">
                    <input
                      id={`partenza${index + 1}`}
                      name={`partenza${index + 1}`}
                      type="time"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                      required
                    />
                    <div>
                        {state.errors?.[`partenza${index+1}`] &&
                          state.errors?.[`partenza${index+1}`]?.map((error: string) => (
                            <p
                              className="mt-2 text-sm text-red-500"
                              key={error}
                            >
                              {error}
                            </p>
                          ))}
                      </div>
                  </div>
                </div>
                {stazione.nome !== "Villa San Felice" && (
                  <div className="sm:col-span-3">
                    <label
                      htmlFor={`ritorno${index + 1}`}
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Partenza da: <strong>{stazione.nome}</strong>{" "}
                      {parseFloat(String(stazione.km)).toFixed(2)} Km ritorno
                    </label>
                    <div className="grid grid-cols-1">
                      <input
                        id={`ritorno${index + 1}`}
                        name={`ritorno${index + 1}`}
                        type="time"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                        required
                      />
                      <div>
                        {state.errors?.[`ritorno${index+1}`] &&
                          state.errors?.[`ritorno${index+1}`]?.map((error: string) => (
                            <p
                              className="mt-2 text-sm text-red-500"
                              key={error}
                            >
                              {error}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button type="reset" className="text-sm/6 font-semibold text-gray-900">
          Cancella
        </Button>
        <Button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Crea
        </Button>
      </div>
    </form>
  );
}
