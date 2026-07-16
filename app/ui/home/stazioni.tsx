
import { fetchStazioni } from "@/app/lib/data";
import { Card, CardContent } from '@/app/ui/card'


export default async function Stazioni() {
  const stazioni = await fetchStazioni();
  return (
    <div className="relative">
      {/* Line visualization */}
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stazioni.slice(0, 5).map((stazione) => (
          <div key={stazione.nome} className="relative flex flex-col items-center">
            <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary z-10" />
            <Card className="w-full hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Km {parseFloat(String(stazione.km)).toFixed(2)}</p>
                <p className="font-medium text-sm">{stazione.nome}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stazioni.slice(5, 10).map((stazione) => (
          <div key={stazione.nome} className="relative flex flex-col items-center">
            <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary z-10" />
            <Card className="w-full hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Km {parseFloat(String(stazione.km)).toFixed(2)}</p>
                <p className="font-medium text-sm">{stazione.nome}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}