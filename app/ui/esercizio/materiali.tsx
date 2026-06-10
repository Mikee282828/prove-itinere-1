import { Card, CardContent } from "@/app/ui/card";
import { Train } from "lucide-react";
import { CardDescription } from "@/app/ui/card";
import { fetchMaterialeEsercizio } from "@/app/lib/data";
import { MaterialeRotabile } from "@/app/lib/definitions";

export default async function Materiali({
  data,
  inizio,
  fine,
}: {
  data: string;
  inizio: string;
  fine: string;
}) {
  let materialeRotabile: MaterialeRotabile[];
  if (data && inizio && fine) {
    materialeRotabile = await fetchMaterialeEsercizio(data, inizio, fine);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {materialeRotabile.length == 0 ? (
          <div className="text-red-500"> Nessun elemento trovato</div>
        ) : (
          materialeRotabile?.map((materiale) => (
            <Card
              key={materiale.id}
              className="overflow-hidden group hover:shadow-lg transition-shadow"
            >
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
    );
  }
}
