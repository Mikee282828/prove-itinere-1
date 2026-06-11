// This file contains placeholder data
import {
  MaterialeRotabile,
  Treno,
  Stazione,
  TracciaPassata,
  Utente,
  Convoglio,
  Posto,
  Composizione,
  Prenotazione,
  Biglietto,
  Acquisto,
  Subtratta,
} from "@/app/lib/definitions";
//1
export const convogli: Convoglio[] = [
  {
    id: 1,
  },
  {
    id: 2,
  },
  {
    id: 3,
  },
  {
    id: 4,
  },
  {
    id: 5,
  },
];
//2 modificare campo convoglio
export const treni: Treno[] = [
  {
    codice: 1,
    convoglio: 1,
    data: new Date(),
    subtratta: null
  },
  {
    codice: 1,
    convoglio: 1,
    data: new Date("2025-12-1"),
    subtratta: null
  },
  {
    codice: 2,
    convoglio: 2,
    data: new Date(),
    subtratta: null
  },
  {
    codice: 3,
    convoglio: 3,
    data: new Date(),
    subtratta: null
  },
  {
    codice: 4,
    convoglio: 4,
    data: new Date(),
    subtratta: null
  },
  {
    codice: 5,
    convoglio: 5,
    data: new Date(),
    subtratta: null
  },
];
//3
export const stazioni: Stazione[] = [
  { nome: "Torre Spaventa", km: 0.0 },
  { nome: "Prato Terra", km: 2.7 },
  { nome: "Rocca Pietrosa", km: 7.58 },
  { nome: "Villa Pietrosa", km: 12.68 },
  { nome: "Villa Santa Maria", km: 16.9 },
  { nome: "Pietra Santa Maria", km: 23.95 },
  { nome: "Castro Marino", km: 31.5 },
  { nome: "Porto Spigola", km: 39.5 },
  { nome: "Porto San Felice", km: 46.0 },
  { nome: "Villa San Felice", km: 54.68 },
];
//4
export const biglietti: Biglietto[] = [
  {
    codice: 1,
    importo: 5,
    partenza: "Torre Spaventa",
    arrivo: "Prato Terra",
  },
];
//5
export const materialeRotabile: MaterialeRotabile[] = [
  // Carrozze modello 1928
  {
    id: "B1",
    tipologia: "carrozza",
    modello: "1928",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "B2",
    tipologia: "carrozza",
    modello: "1928",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "B3",
    tipologia: "carrozza",
    modello: "1928",
    descrizione: "Descrizione materiale rotabile",
  },
  // Carrozze modello 1930
  {
    id: "C6",
    tipologia: "carrozza",
    modello: "1930",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "C9",
    tipologia: "carrozza",
    modello: "1930",
    descrizione: "Descrizione materiale rotabile",
  },
  // Carrozze modello 1952
  {
    id: "C12",
    tipologia: "carrozza",
    modello: "1952",
    descrizione: "Descrizione materiale rotabile",
  },
  // Bagagliai modello 1910
  {
    id: "CD1",
    tipologia: "bagagliaio",
    modello: "1910",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "CD2",
    tipologia: "bagagliaio",
    modello: "1910",
    descrizione: "Descrizione materiale rotabile",
  },
  // Automotrici
  {
    id: "AN56.2",
    tipologia: "automotrice",
    modello: "AN56",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "AN56.4",
    tipologia: "automotrice",
    modello: "AN56",
    descrizione: "Descrizione materiale rotabile",
  },
  // Locomotive
  {
    id: "Cavour",
    tipologia: "locomotiva",
    modello: "SFT3",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "Vittorio Emanuele",
    tipologia: "locomotiva",
    modello: "SFT4",
    descrizione: "Descrizione materiale rotabile",
  },
  {
    id: "Garibaldi",
    tipologia: "locomotiva",
    modello: "SFT6",
    descrizione: "Descrizione materiale rotabile",
  },
];
//6
export const posti: Posto[] = [
  // ==========================================
  // CARROZZE SERIE 1928 (3 carrozze da 36 posti ciascuna)
  // ==========================================
  // Carrozza B1
  ...Array.from({ length: 36 }, (_, i) => ({ numero: i + 1, id_mat: "B1" })),
  // Carrozza B2
  ...Array.from({ length: 36 }, (_, i) => ({ numero: i + 1, id_mat: "B2" })),
  // Carrozza B3
  ...Array.from({ length: 36 }, (_, i) => ({ numero: i + 1, id_mat: "B3" })),

  // ==========================================
  // CARROZZE SERIE 1930 (2 carrozze da 48 posti ciascuna)
  // ==========================================
  // Carrozza C6
  ...Array.from({ length: 48 }, (_, i) => ({ numero: i + 1, id_mat: "C6" })),
  // Carrozza C9
  ...Array.from({ length: 48 }, (_, i) => ({ numero: i + 1, id_mat: "C9" })),

  // ==========================================
  // CARROZZA SERIE 1952 (1 carrozza da 52 posti)
  // ==========================================
  // Carrozza C12
  ...Array.from({ length: 52 }, (_, i) => ({ numero: i + 1, id_mat: "C12" })),

  // ==========================================
  // BAGAGLIAI SERIE 1910 (2 bagagliai da 12 posti passeggeri ciascuno)
  // ==========================================
  // Bagagliaio CD1
  ...Array.from({ length: 12 }, (_, i) => ({ numero: i + 1, id_mat: "CD1" })),
  // Bagagliaio CD2
  ...Array.from({ length: 12 }, (_, i) => ({ numero: i + 1, id_mat: "CD2" })),

  // ==========================================
  // AUTOMOTRICI A NAFTA (2 automotrici da 56 posti ciascuna)
  // ==========================================
  // Automotrice AN 56.2
  ...Array.from({ length: 56 }, (_, i) => ({
    numero: i + 1,
    id_mat: "AN56.2",
  })),
  // Automotrice AN 56.4
  ...Array.from({ length: 56 }, (_, i) => ({
    numero: i + 1,
    id_mat: "AN56.4",
  })),
];
//7
export const composizioni: Composizione[] = [
  // ==========================================
  // CONVOGLIO 1
  // ==========================================
  {
    convoglio: 1,
    id_mat: "Cavour",
  },
  {
    convoglio: 1,
    id_mat: "B1",
  },
  {
    convoglio: 1,
    id_mat: "B2",
  },
  {
    convoglio: 1,
    id_mat: "C6",
  },

  // ==========================================
  // CONVOGLIO 2
  // ==========================================
  {
    convoglio: 2,
    id_mat: "Vittorio Emanuele",
  },
  {
    convoglio: 2,
    id_mat: "B3",
  },
  {
    convoglio: 2,
    id_mat: "C9",
  },
  {
    convoglio: 2,
    id_mat: "C12",
  },

  // ==========================================
  // CONVOGLIO 3
  // ==========================================
  {
    convoglio: 3,
    id_mat: "Garibaldi",
  },
  {
    convoglio: 3,
    id_mat: "CD1",
  },
  {
    convoglio: 3,
    id_mat: "CD2",
  },

  // ==========================================
  // CONVOGLIO 4
  // ==========================================
  {
    convoglio: 4,
    id_mat: "AN56.2",
  },

  // ==========================================
  // CONVOGLIO 5
  // ==========================================
  {
    convoglio: 5,
    id_mat: "AN56.4",
  },
];
//8
export const traccePassate: TracciaPassata[] = [
  // ==========================================
  // CORSA DI ANDATA (Progressivo: 1)
  // ==========================================
  {
    stazione: "Torre Spaventa",
    arrivo: "10:40:00",
    partenza: "10:43:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Prato Terra",
    arrivo: "10:55:00",
    partenza: "10:57:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Rocca Pietrosa",
    arrivo: "11:12:00",
    partenza: "11:15:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Villa Pietrosa",
    arrivo: "11:25:00",
    partenza: "11:27:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Villa Santa Maria",
    arrivo: "11:40:00",
    partenza: "11:42:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Pietra Santa Maria",
    arrivo: "11:55:00",
    partenza: "11:58:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Castro Marino",
    arrivo: "12:10:00",
    partenza: "12:12:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Porto Spigola",
    arrivo: "12:22:00",
    partenza: "12:25:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Porto San Felice",
    arrivo: "12:38:00",
    partenza: "12:40:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },
  {
    stazione: "Villa San Felice",
    arrivo: "12:55:00",
    partenza: "13:15:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 1,
  },

  // ==========================================
  // CORSA DI RITORNO (Progressivo: 2)
  // Il treno ripassa dalle stesse stazioni al contrario
  // ==========================================
  {
    stazione: "Porto San Felice",
    arrivo: "13:30:00",
    partenza: "13:32:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Porto Spigola",
    arrivo: "13:45:00",
    partenza: "13:47:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Castro Marino",
    arrivo: "13:58:00",
    partenza: "14:00:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Pietra Santa Maria",
    arrivo: "14:12:00",
    partenza: "14:15:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Villa Santa Maria",
    arrivo: "14:28:00",
    partenza: "14:30:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Villa Pietrosa",
    arrivo: "14:43:00",
    partenza: "14:45:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Rocca Pietrosa",
    arrivo: "14:55:00",
    partenza: "14:58:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Prato Terra",
    arrivo: "15:13:00",
    partenza: "15:15:00",
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  },
  {
    stazione: "Torre Spaventa",
    arrivo: "15:30:00",
    partenza: null, // Fine del servizio per questa coppia/giorno
    data: new Date("2025-12-01"),
    treno: 1,
    progressivo: 2,
  }
];
//10
export const prenotazioni: Prenotazione[] = [
  {
    posto: 1,
    id_mat: "B1",
    biglietto: 1,
    data: new Date("2025-12-1"),
    treno: 1,
  },
];
//11
export const utenti: Utente[] = [
  {
    email: "email@utente.com",
    nome: "nome",
    cognome: "cognome",
    password: "pizza",
    codice_fiscale: "CGNNMO00A01H501U",
  },
];
//12
export const acquisti: Acquisto[] = [
  {
    id_transazione: 1,
    stato_pagamento: "accettato",
    istante_acquisto: new Date(),
    biglietto: 1,
    utente: "email@utente.com",
  },
];
//16
export const subtratte: Subtratta[] = [
  { stato: "libero", stazione_a: "Torre Spaventa", stazione_b: "Prato Terra" },
  { stato: "libero", stazione_a: "Prato Terra", stazione_b: "Rocca Pietrosa" },
  { stato: "libero", stazione_a: "Rocca Pietrosa", stazione_b: "Villa Pietrosa" },
  { stato: "libero", stazione_a: "Villa Pietrosa", stazione_b: "Villa Santa Maria" },
  { stato: "libero", stazione_a: "Villa Santa Maria", stazione_b: "Pietra Santa Maria" },
  { stato: "libero", stazione_a: "Pietra Santa Maria", stazione_b: "Castro Marino" },
  { stato: "libero", stazione_a: "Castro Marino", stazione_b: "Porto Spigola" },
  { stato: "libero", stazione_a: "Porto Spigola", stazione_b: "Porto San Felice" },
  { stato: "libero", stazione_a: "Porto San Felice", stazione_b: "Villa San Felice" }
];
