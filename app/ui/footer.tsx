import Link from 'next/link'
import { Train, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground bg-lime-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Train className="h-8 w-8 text-sidebar-primary" />
              <span className="text-xl font-bold">Società Ferrovie Turistiche</span>
            </Link>
            <p className="text-sidebar-foreground/80 text-sm max-w-md">
              Viaggia nel tempo a bordo dei nostri treni storici. Una linea panoramica di 54 km 
              attraverso le più belle località della costa italiana.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Link Rapidi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/linea" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  La Linea
                </Link>
              </li>
              <li>
                <Link href="/orari" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Orari
                </Link>
              </li>
              <li>
                <Link href="/prenota" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Prenota Biglietti
                </Link>
              </li>
              <li>
                <Link href="/materiale" className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Materiale Rotabile
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contatti</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
                <MapPin className="h-4 w-4 text-sidebar-primary" />
                Stazione Torre Spaventa, Italia
              </li>
              <li className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
                <Phone className="h-4 w-4 text-sidebar-primary" />
                +39 0123 456789
              </li>
              <li className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
                <Mail className="h-4 w-4 text-sidebar-primary" />
                info@sft-treni.it
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-sidebar-border">
          <p className="text-center text-xs text-sidebar-foreground/60">
            © {new Date().getFullYear()} Società Ferrovie Turistiche. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}
