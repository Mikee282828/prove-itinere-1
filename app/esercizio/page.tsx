import Materiali from "../ui/esercizio/materiali";
import Search from "../ui/search";

export default async function Page(props: {
  searchParams?: Promise<{
    datetime?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.datetime || "";

  return (
    <div className="flex-1 py-4">

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        
        <Search/>
        <Materiali materialeRotabile={[{
          id: "B1",
          tipologia: "carrozza",
          modello: "1928",
          descrizione: "Descrizione materiale rotabile",
        }]} />
      </div>

    </div>
  )
}