// utility functions
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NomiStazioni, Subtratta, TracciaCorrente, Treno } from './definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const modelloGiornaliero = [
  // ANDATA
  { stazione: "Torre Spaventa", arrivo: null, partenza: "10:43:00", prog: 1 },
  { stazione: "Prato Terra", arrivo: "10:55:00", partenza: "10:57:00", prog: 1 },
  { stazione: "Rocca Pietrosa", arrivo: "11:12:00", partenza: "11:15:00", prog: 1 },
  { stazione: "Villa Pietrosa", arrivo: "11:25:00", partenza: "11:27:00", prog: 1 },
  { stazione: "Villa Santa Maria", arrivo: "11:40:00", partenza: "11:42:00", prog: 1 },
  { stazione: "Pietra Santa Maria", arrivo: "11:55:00", partenza: "11:58:00", prog: 1 },
  { stazione: "Castro Marino", arrivo: "12:10:00", partenza: "12:12:00", prog: 1 },
  { stazione: "Porto Spigola", arrivo: "12:22:00", partenza: "12:25:00", prog: 1 },
  { stazione: "Porto San Felice", arrivo: "12:38:00", partenza: "12:40:00", prog: 1 },
  { stazione: "Villa San Felice", arrivo: "12:55:00", partenza: "13:15:00", prog: 1 },
  // RITORNO
  { stazione: "Porto San Felice", arrivo: "13:30:00", partenza: "13:32:00", prog: 2 },
  { stazione: "Porto Spigola", arrivo: "13:45:00", partenza: "13:47:00", prog: 2 },
  { stazione: "Castro Marino", arrivo: "13:58:00", partenza: "14:00:00", prog: 2 },
  { stazione: "Pietra Santa Maria", arrivo: "14:12:00", partenza: "14:15:00", prog: 2 },
  { stazione: "Villa Santa Maria", arrivo: "14:28:00", partenza: "14:30:00", prog: 2 },
  { stazione: "Villa Pietrosa", arrivo: "14:43:00", partenza: "14:45:00", prog: 2 },
  { stazione: "Rocca Pietrosa", arrivo: "14:55:00", partenza: "14:58:00", prog: 2 },
  { stazione: "Prato Terra", arrivo: "15:13:00", partenza: "15:15:00", prog: 2 },
  { stazione: "Torre Spaventa", arrivo: "15:30:00", partenza: null, prog: 2 }
];

export function generaTracce(dataInizio: Date, dataFine: Date): TracciaCorrente[] {

  if (dataInizio > dataFine) {
    const temp: Date = dataInizio;
    dataInizio = dataFine;
    dataFine = temp;
  }

  const tutteLeTracce: TracciaCorrente[] = [];
  for (let giorni = 0; giorni <= (dataFine.getTime() - dataInizio.getTime()) / (1000 * 3600 * 24); giorni++) {

    modelloGiornaliero.forEach((modello) => {
      tutteLeTracce.push({
        stazione: modello.stazione,
        orario_arrivo: modello.arrivo,
        orario_partenza: modello.partenza,
        data: new Date(dataInizio.getTime() + (24 * 60 * 60 * 1000) * giorni),
        treno: 1,
        progressivo: modello.prog
      });
    });
  }

  return tutteLeTracce;
}

export function generaTreno(dataInizio: Date, dataFine: Date): Treno[] {

  if (dataInizio > dataFine) {
    const temp: Date = dataInizio;
    dataInizio = dataFine;
    dataFine = temp;
  }

  const treni: Treno[] = [];

  for (let giorni = 0; giorni <= (dataFine.getTime() - dataInizio.getTime()) / (1000 * 3600 * 24); giorni++) {
    treni.push({
      codice: 1,
      data: new Date(dataInizio.getTime() + (24 * 60 * 60 * 1000) * giorni),
      convoglio: 1,
    });
  }
  return treni
}

export function generaSubtratte(dataInizio: Date, dataFine: Date): Subtratta[] {
  if (dataInizio > dataFine) {
    const temp: Date = dataInizio;
    dataInizio = dataFine;
    dataFine = temp;
  }

  const subtratte: Subtratta[] = [];
  for (let giorni = 0; giorni <= (dataFine.getTime() - dataInizio.getTime()) / (1000 * 3600 * 24); giorni++) {

    for (let i = 0; i < (modelloGiornaliero.length-1); i++) {
      subtratte.push({
        stazione_a: modelloGiornaliero[i].stazione as NomiStazioni,
        stazione_b: modelloGiornaliero[i+1].stazione as NomiStazioni,
        inizio_occupazione: modelloGiornaliero[i].partenza,
        fine_occupazione: modelloGiornaliero[i+1].arrivo,
        codice_treno: 1,
        data_treno: new Date(dataInizio.getTime() + (24 * 60 * 60 * 1000) * giorni)
      });
    }

  }
  return subtratte
}