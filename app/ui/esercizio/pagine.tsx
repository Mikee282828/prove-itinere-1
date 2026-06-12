"use client";
import { MaterialeRotabile } from "@/app/lib/definitions";
import { Calendar, Settings, TrainIcon } from "lucide-react";
import { useState } from "react";
import SezioneMateriale from "./sezione-materiale";
import SezioneConvoglio from "./sezione-composizione";
import { ConvoglioRaggruppato } from "@/app/lib/data";
import SezioneOrari from "./sezione-orari";

export type TabType = "orari" | "composizioni" | "materiale";
export default function Pagine({
  materialeRotabile,
  composizioni
}: {
  materialeRotabile: MaterialeRotabile[] | null,
  composizioni: ConvoglioRaggruppato[]
}) {
  const [activeTab, setActiveTab] = useState<TabType>("composizioni");
  return (
    <div>
      <main>
        {/* Header */}
        <section className="py-8 bg-lime-900 text-white">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-sidebar-primary" />
              <h1 className="text-2xl font-bold">Back Office di Esercizio</h1>
            </div>
            <p className="text-sidebar-foreground/70">
              Gestione orari, composizioni e materiale rotabile
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex gap-1">
              {[
                { key: "composizioni", label: "Composizioni", icon: TrainIcon },
                { key: "orari", label: "Orari", icon: Calendar },
                { key: "materiale", label: "Materiale Rotabile", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer hover:opacity-50 ${
                      activeTab === tab.key
                        ? "border-b-2 border-lime-900 text-lime-900"
                        : "border-transparent text-muted"
                    }`}
                    onClick={() => setActiveTab(tab.key as TabType)}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        <SezioneMateriale active={activeTab==="materiale"} materialeRotabile={materialeRotabile}/>
        <SezioneConvoglio active={activeTab==="composizioni"} composizioni={composizioni} />
        <SezioneOrari active={activeTab==="orari"}/>
      </main>
    </div>
  );
}
