'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Train, MapPin, Ticket, Users, Settings, Home } from 'lucide-react'
import { Button } from '@/app/ui/button'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'La Linea', href: '/linea', icon: MapPin },
  { name: 'Orari', href: '/orari', icon: Train },
  { name: 'Prenota', href: '/prenota', icon: Ticket },
]

const adminNavigation = [
  { name: 'Amministrazione', href: '/admin', icon: Users },
  { name: 'Esercizio', href: '/esercizio', icon: Settings },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-amber-50/95 backdrop-blur supports-backdrop-filter:bg-amber-50/80 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Train className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground tracking-tight">SFT</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <Button
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Apri menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {adminNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-amber-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-card px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Train className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">SFT</span>
              </Link>
              <Button
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Chiudi menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="space-y-2 py-6">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Back Office</p>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
