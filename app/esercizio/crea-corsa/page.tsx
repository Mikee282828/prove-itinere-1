import { ConvoglioRaggruppato, fetchComposizioni, fetchStazioni } from "@/app/lib/data";
import { Stazione } from "@/app/lib/definitions";
import Form from "@/app/ui/esercizio/crea-corsa";

export default async function Page() {
  const convogliDisponibili:ConvoglioRaggruppato[] = await fetchComposizioni();
  const stazioni : Stazione[] = await fetchStazioni();
  return (
    <main>
      <Form convogli={convogliDisponibili} stazioni={stazioni}/>

    </main>
  );
}
