"use client";
import { Card, CardContent } from "@/app/ui/card";
import { Train } from "lucide-react";
import { CardDescription } from "@/app/ui/card";
import { MaterialeRotabile } from "@/app/lib/definitions";
import { createConvoglio, State } from "@/app/lib/actions";
import { Button } from "../button";
import { useActionState, useState } from "react";

export default function Materiali({
  materialeRotabile,
}: {
  materialeRotabile: MaterialeRotabile[] | null;
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createConvoglio, initialState);

  // useState
  const [selezionati, setSelezionati] = useState<string[]>([]);
  const [cliccato, setCliccato] = useState<boolean>(false);

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    if (isChecked) {
      // Se viene spuntata, aggiungi l'ID all'array
      setSelezionati((prev) => [...prev, id]);
    } else {
      // Se viene tolta la spunta, rimuovi l'ID dall'array
      setSelezionati((prev) => prev.filter((item) => item !== id));
    }
  };
  const handleCliccato = () => {
    if (selezionati.length < 1 && cliccato === true) return;
    if (selezionati.length < 1 && cliccato === false) {
      setCliccato(true);
    }
  };

  if (materialeRotabile) {
    return (
      <form action={formAction}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {materialeRotabile.length == 0 ? (
            <div className="text-red-500"> Nessun elemento trovato</div>
          ) : (
            materialeRotabile?.map((materiale) => (
              <Card
                key={materiale.id}
                className="overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <CardContent>
                  Seleziona{" "}
                  <input
                    type="checkbox"
                    name="materiale"
                    id={materiale.id}
                    value={materiale.id}
                    className="cursor-pointer"
                    onChange={(e) => {
                      handleCheckboxChange(materiale.id, e.target.checked);
                    }}
                  />
                </CardContent>
                <div className="aspect-video bg-linear-to-br from-primary/10 to-primary/5 flex materiales-center justify-center">
                  <Train className="h-16 w-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Serie {materiale.modello}{" "}
                  </p>
                  <h3 className="font-semibold">{materiale.id}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    Tipologia {materiale.tipologia}
                  </p>
                </CardContent>
                <CardDescription className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {materiale.descrizione}
                  </p>
                </CardDescription>
              </Card>
            ))
          )}
        </div>
        <Button
          type="submit"
          className={"my-4"}
          onClick={(e) => {
            if (selezionati.length < 1) {
              e.preventDefault();
              handleCliccato();
            }
          }}
        >
          Crea convoglio!
        </Button>
        <div
          className={`${selezionati.length == 0 && cliccato ? "block" : "hidden"} text-red-500`}
        >
          Devi selezionare almeno 1 materiale!
        </div>
        <div className={`${cliccato ? "block" : "hidden"}`}>
          Sono selezionati {selezionati.length} elementi
        </div>
        <div>{state.errors?.materiale}</div>
      </form>
    );
  }
}
