import Materiali from "../ui/esercizio/materiali";
import Search from "../ui/search";

export default async function Page(props: {
  searchParams?: Promise<{
    datetime?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.datetime || "";
  console.log(query)
  return (
    <div className="flex-1 py-4">

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        
        <Search/>
        <Materiali query={query} />
      </div>

    </div>
  )
}