//1
export type Convoglio = {
  id: number;
};

//2
export type Treno = {
  codice: number;
  data: Date;
  convoglio: number;
  subtratta: number | null;
};

//3
export type Stazione = {
  nome: string;
  km: number;
};

//4
export type Biglietto = {
  codice: number;
  importo: number;
  partenza: string;
  arrivo: string;
};

//5
export type MaterialeRotabile = {
  id: string;
  modello: string;
  tipologia: "carrozza" | "bagagliaio" | "automotrice" | "locomotiva";
  descrizione: string;
};

//6
export type Posto = {
  numero: number;
  id_mat: string;
};

//7
export type Composizione = {
  convoglio: number;
  id_mat: string;
}

//8
export type TracciaPassata = {
  orario_partenza: string | null;
  orario_arrivo: string | null;
  stazione: string;
  data: Date;
  treno: number;
  progressivo: number;
};

//9
export type TracciaCorrente = {
  orario_partenza: string | null;
  orario_arrivo: string | null;
  stazione: string;
  data: Date;
  treno: number;
  progressivo: number;
};

//10
export type Prenotazione = {
  posto: number;
  id_mat: string;
  biglietto: number;
  data: Date;
  treno: number;
}

//11
export type Utente = {
  email: string;
  nome: string;
  cognome: string;
  password: string;
  codice_fiscale: string;
};

//12
export type Acquisto = {
  id_transazione: number;
  stato_pagamento: "accettato" | "rifiutato";
  istante_acquisto: Date;
  biglietto: number;
  utente: string;
}

//15
export type Richiesta = {
  id: number;
  stato: "in attesa"|"in gestione"|"completata"|"scartata";
  tipo: "aggiunta"|"cancellazione"
  admin: string;
  operatore: string;
}

//16
export type Subtratta = {
  stato: string;
  stazione_a: "Torre Spaventa"|"Prato Terra"|"Rocca Pietrosa"|"Villa Pietrosa"|"Villa Santa Maria"|"Pietra Santa Maria"|"Castro Marino"|"Porto Spigola"|"Porto San Felice"|"Villa San Felice";
  stazione_b: "Torre Spaventa"|"Prato Terra"|"Rocca Pietrosa"|"Villa Pietrosa"|"Villa Santa Maria"|"Pietra Santa Maria"|"Castro Marino"|"Porto Spigola"|"Porto San Felice"|"Villa San Felice";
}
