import Link from 'next/link'
import { Navbar } from '@/app/ui/navbar'
import { Footer } from '@/app/ui/footer'
import { Button } from '@/app/ui/button'
import { Card, CardContent, CardDescription } from '@/app/ui/card'
import { Train, MapPin, Clock, Ticket, ChevronRight, Calendar } from 'lucide-react'
import { stazioni, materialeRotabile } from '@/app/lib/placeholder-data'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-lime-900 py-24 lg:py-32 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827zM5.373%200l-.83.828L5.96%202.243%208.2%200H5.374zM48.97%200l3.657%203.657-1.414%201.414L46.143%200h2.828zM11.03%200L7.372%203.657%208.787%205.07%2013.857%200H11.03zm32.284%200L49.8%206.485%2048.384%207.9l-7.9-7.9h2.83zM16.686%200L10.2%206.485%2011.616%207.9l7.9-7.9h-2.83zM22.344%200L13.858%208.485%2015.272%209.9l9.9-9.9h-2.828zM32%200l-3.486%203.485%201.414%201.415L searching searching3.9-3.9H32zM0%205.373l.828-.83%201.415%201.415L0%208.2V5.374zm0%205.656l.828-.829%201.415%201.415L0%2013.857v-2.83zm0%205.656l.828-.828%201.415%201.414L0%2019.514v-2.83zm0%205.657l.828-.828%201.415%201.414L0%2025.172v-2.83zM60%2039.314l-.828.828-1.415-1.414L60%2036.485v2.83zm0%205.657l-.828.828-1.415-1.414L60%2042.142v2.83z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%22.05%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Train className="h-16 w-16 text-primary-foreground/80" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance">
                Società Ferrovie Turistiche
              </h1>
              <p className="mt-6 text-lg leading-8 text-primary-foreground/80 max-w-2xl mx-auto text-pretty">
                Viaggia nel tempo a bordo dei nostri treni storici. Una linea panoramica di 54 km
                attraverso 10 stazioni pittoresche della costa italiana.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Link href="/prenota">
                  <Button className="gap-2">
                    <Ticket className="h-5 w-5" />
                    Prenota Ora
                  </Button>
                </Link>
                <Link href="/orari">
                  <Button className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <Clock className="h-5 w-5" />
                    Consulta Orari
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-[#F8F5EE]">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Un&apos;esperienza unica
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Scopri il fascino del viaggio d&apos;epoca con il nostro materiale rotabile storico
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Train className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Treni Storici</h3>
                  <p className="text-muted-foreground text-sm">
                    Locomotive a vapore e carrozze d&apos;epoca dal 1910 al 1956.
                    Un tuffo nella storia ferroviaria italiana.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">10 Stazioni Pittoresche</h3>
                  <p className="text-muted-foreground text-sm">
                    Da Torre Spaventa a Villa San Felice, attraversando borghi storici e
                    paesaggi mozzafiato.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Tutto l&apos;Anno</h3>
                  <p className="text-muted-foreground text-sm">
                    4 coppie di treni nei giorni festivi tutto l&apos;anno, più servizio feriale
                    da giugno a settembre.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stations Preview */}
        <section className="py-16 lg:py-24 bg-[#F4F0E7]">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Le Nostre Stazioni
                </h2>
                <p className="mt-2 text-muted-foreground">
                  54 km di linea panoramica attraverso la costa
                </p>
              </div>
              <Link href="/linea">
                <Button className="gap-2">
                  Scopri di più
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              {/* Line visualization */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2" />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stazioni.slice(0, 5).map((stazione) => (
                  <div key={stazione.nome} className="relative flex flex-col items-center">
                    <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary z-10" />
                    <Card className="w-full hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Km {stazione.km.toFixed(1)}</p>
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
                        <p className="text-xs text-muted-foreground mb-1">Km {stazione.km.toFixed(1)}</p>
                        <p className="font-medium text-sm">{stazione.nome}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rolling Stock Preview */}
        <section className="py-16 lg:py-24 bg-[#F8F5EE]">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Materiale Rotabile Storico
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Locomotive e carrozze d&apos;epoca dal 1910 al 1956
                </p>
              </div>
              <Link href="/materiale">
                <Button className="gap-2">
                  Vedi tutto
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {materialeRotabile.filter(rs => rs.tipologia === 'locomotiva' || rs.tipologia === 'automotrice').map((item) => (
                <Card key={item.modello} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Train className="h-16 w-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Serie {item.modello} </p>
                    <h3 className="font-semibold">{item.id}</h3>
                  </CardContent>
                  <CardDescription className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{item.descrizione}</p>
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-red-900 text-accent-foreground text-white">
          <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Pronto per il viaggio?
            </h2>
            <p className="text-lg text-accent-foreground/80 max-w-2xl mx-auto mb-8">
              Prenota il tuo biglietto e vivi un&apos;esperienza indimenticabile a bordo dei nostri treni storici.
              Scegli la tua tratta, la data e il posto a sedere.
            </p>
            <Link href="/prenota">
              <Button className="gap-2">
                <Ticket className="h-5 w-5" />
                Prenota il tuo biglietto
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  )
}
