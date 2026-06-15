import { ConvoglioRaggruppato, fetchComposizioni } from "@/app/lib/data";
import Form from "@/app/ui/esercizio/crea-corsa";

export default async function Page() {
  const convogliDisponibili:ConvoglioRaggruppato[] = await fetchComposizioni();
  return (
    <main>
      <Form convogli={convogliDisponibili}/>
    </main>
  );
}
