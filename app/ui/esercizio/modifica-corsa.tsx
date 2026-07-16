"use client";
import { Button } from "../button";
import { Stazione, TracciaCorrente, Treno } from "@/app/lib/definitions";
import deleteCorsa, { editCorsa, StateCorsa } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form({
  stazioni,
  tracce,
  treno
}: {
  stazioni: Stazione[],
  tracce: TracciaCorrente[],
  treno: Treno[]
}) {
  const initialState: StateCorsa = { message: null, errors: {} };

  const editCorsaConTreno = editCorsa.bind(null, treno[0]);
  const deleteCorsaConTreno = deleteCorsa.bind(null, treno[0]);

  const [state, formAction] = useActionState(editCorsaConTreno, initialState);
  const [deleteState, formActionDelete] = useActionState(deleteCorsaConTreno, initialState);
  return (
    <>
      <form className="flex-1 p-8" action={formAction}>
        {state.message && (
          <div className="mt-6 p-4 rounded-md bg-red-5 breadcrumb bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{state.message}</p>
          </div>
        )}
        {deleteState.message && (
          <div className="mt-6 p-4 rounded-md bg-red-5 breadcrumb bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{deleteState.message}</p>
          </div>
        )}
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
                    type="date"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none"
                    required
                    value={new Intl.DateTimeFormat('sv-SE').format(treno[0].data)}
                    disabled
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
                    key={state.enteredFormData?.codiceTreno}
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none"
                    defaultValue={state.enteredFormData?.codiceTreno || "1"}
                    disabled
                  >
                    <option>{treno[0].codice}</option>;
                  </select>
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
                  Convoglio
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="convoglio"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none"
                    defaultValue={state.enteredFormData?.convoglio}
                    key={state.enteredFormData?.convoglio || "default"}
                    disabled
                  >
                    <option>
                      {treno[0].convoglio}
                    </option>
                  </select>
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
                  {stazione.nome !== "Villa San Felice" ? (
                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`andata${index + 1}`}
                        className="block text-sm/6 font-medium text-gray-900"
                      >
                        Partenza da: <strong>{stazione.nome}</strong>{" "}
                        {parseFloat(String(stazione.km)).toFixed(2)} Km
                      </label>
                      <div className="grid grid-cols-1">
                        <input
                          id={`andata${index + 1}`}
                          name={`andata${index + 1}`}
                          type="time"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                          required
                          defaultValue={
                            state.enteredFormData?.[
                            `andata${index + 1}` as keyof typeof state.enteredFormData
                            ] || tracce[index].orario_partenza || ""
                          }
                        />
                        <div>
                          {state.errors?.[`andata${index + 1}`] &&
                            state.errors?.[`andata${index + 1}`]?.map(
                              (error: string) => (
                                <p
                                  className="mt-2 text-sm text-red-500"
                                  key={error}
                                >
                                  {error}
                                </p>
                              ),
                            )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="sm:col-span-3"></div>
                  )}

                  {stazione.nome !== "Torre Spaventa" && (
                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`ritorno${index + 1}`}
                        className="block text-sm/6 font-medium text-gray-900"
                      >
                        Ritorno da: <strong>{stazione.nome}</strong>{" "}
                        {parseFloat(String(stazione.km)).toFixed(2)} Km
                      </label>
                      <div className="grid grid-cols-1">
                        <input
                          id={`ritorno${index + 1}`}
                          name={`ritorno${index + 1}`}
                          type="time"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer"
                          required
                          defaultValue={
                            state.enteredFormData?.[
                            `ritorno${index + 1}` as keyof typeof state.enteredFormData
                            ] || tracce[18 - index].orario_partenza || ""
                          }
                        />
                        <div>
                          {state.errors?.[`ritorno${index + 1}`] &&
                            state.errors?.[`ritorno${index + 1}`]?.map(
                              (error: string) => (
                                <p
                                  className="mt-2 text-sm text-red-500"
                                  key={error}
                                >
                                  {error}
                                </p>
                              ),
                            )}
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
            Resetta
          </Button>
          <Button className="text-sm/6 font-semibold text-white bg-red-500 hover:bg-red-400"
            type="submit"
            form="delete-form">
            Elimina
          </Button>
          <Button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Modifica
          </Button>
        </div>
        {state.message && (
          <div className="mt-6 p-4 rounded-md bg-red-5 breadcrumb bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{state.message}</p>

          </div>
        )}
        {deleteState.message && (
          <div className="mt-6 p-4 rounded-md bg-red-5 breadcrumb bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{deleteState.message}</p>
          </div>
        )}
      </form>
      <form id="delete-form" action={formActionDelete} className="hidden" />
    </>


  );
}
