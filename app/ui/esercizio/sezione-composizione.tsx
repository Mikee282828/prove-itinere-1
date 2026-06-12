import { TrainIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { ConvoglioRaggruppato } from "@/app/lib/data";

export default function SezioneComposizione({active,composizioni}:{active: boolean, composizioni: ConvoglioRaggruppato[]}) {
  if (active) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Composizioni Treni</h2>
        </div>
        <div className="grid gap-6">
          {composizioni.map((element,index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrainIcon className="h-5 w-5 text-primary" />
                    Convoglio: {element.convoglio}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {element.materiali.map((materiale, index) => {
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
    );
  }
}
