import Materiali from "../ui/esercizio/materiali";
import Search from "../ui/search";

export default async function Page(props: {
  searchParams?: Promise<{
    data?: string;
    inizio?: string;
    fine?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const data = searchParams?.data || "";
  const inizio = searchParams?.inizio || "";
  const fine = searchParams?.fine || "";
  return (
    <div className="flex-1 py-4">

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        
        <Search/>
        <Materiali  inizio={inizio} fine={fine} data={data}/>
      </div>

    </div>
  )
}