import { neon } from "@neondatabase/serverless";
import {
  convogli,
  treni,
  stazioni,
  biglietti,
  materialeRotabile,
  posti,
  composizioni,
  traccePassate,
  prenotazioni,
  utenti,
  acquisti,
  subtratte,
  tracceCorrenti,
} from "../lib/placeholder-data";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL || "");

export async function GET() {
  try {
    // Creiamo un array che conterrà TUTTE le query da eseguire nella transazione
    const transactionQueries = [];

    // 1. Tabelle di base (DDL) - Devono essere inserite nell'ordine corretto di foreign key
    transactionQueries.push(sql`CREATE TABLE IF NOT EXISTS convoglio (id BIGSERIAL PRIMARY KEY);`);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS treno (
        data      DATE    NOT NULL,
        codice    INT     NOT NULL,
        convoglio BIGINT  NOT NULL,
        subtratta INT,
        PRIMARY KEY (codice, data),
        FOREIGN KEY (convoglio) REFERENCES convoglio(id)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS stazione (
        nome                VARCHAR(255)  NOT NULL,
        distanza_capolinea  DECIMAL(6,3)  NOT NULL,
        PRIMARY KEY (nome)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE if NOT EXISTS biglietto (
        codice   BIGSERIAL PRIMARY KEY,
        importo  DECIMAL(8,2)  NOT NULL,
        partenza VARCHAR(255)  NOT NULL,
        arrivo   VARCHAR(255)  NOT NULL,
        FOREIGN KEY (partenza) REFERENCES stazione(nome),
        FOREIGN KEY (arrivo)   REFERENCES stazione(nome)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE if NOT EXISTS materiale_rotabile (
        id          VARCHAR(255) NOT NULL,
        modello     VARCHAR(255) NOT NULL,
        tipologia   VARCHAR(255) NOT NULL,
        descrizione TEXT         NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE if NOT EXISTS posto (
        numero      INTEGER NOT NULL,
        id_mat      VARCHAR(255) NOT NULL,
        PRIMARY KEY (numero, id_mat),
        FOREIGN KEY (id_mat) REFERENCES materiale_rotabile(id)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS composizione (
        convoglio                  BIGINT       NOT NULL,
        id_mat                     VARCHAR(255) NOT NULL,
        PRIMARY KEY (convoglio, id_mat),
        FOREIGN KEY (convoglio) REFERENCES convoglio(id),
        FOREIGN KEY (id_mat) REFERENCES materiale_rotabile(id)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS traccia_passata (
        orario_arrivo   TIME,
        orario_partenza TIME,
        stazione        VARCHAR(255) NOT NULL,
        data            DATE         NOT NULL,
        treno           INT          NOT NULL,
        progressivo     INT          NOT NULL,
        PRIMARY KEY (progressivo, treno, data, stazione),
        FOREIGN KEY (stazione)     REFERENCES stazione(nome),
        FOREIGN KEY (treno, data)  REFERENCES treno(codice, data)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS traccia_corrente (
        orario_arrivo   TIME,
        orario_partenza TIME,
        stazione        VARCHAR(255) NOT NULL,
        treno           INT          NOT NULL,
        data            DATE         NOT NULL,
        progressivo     INT          NOT NULL,
        PRIMARY KEY (progressivo, data, treno, stazione),
        FOREIGN KEY (stazione)    REFERENCES stazione(nome),
        FOREIGN KEY (treno, data) REFERENCES treno(codice, data)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS prenotazione (
        posto                      INTEGER      NOT NULL,
        id_mat                     VARCHAR(255) NOT NULL,
        biglietto                  BIGINT       NOT NULL,
        data                       DATE         NOT NULL,
        treno                      INT          NOT NULL,
        PRIMARY KEY (biglietto),
        FOREIGN KEY (biglietto)   REFERENCES biglietto(codice),
        FOREIGN KEY (treno, data) REFERENCES treno(codice, data),
        FOREIGN KEY (posto, id_mat) REFERENCES posto(numero, id_mat)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS utente_registrato (
        email          VARCHAR(255) NOT NULL,
        nome           VARCHAR(255) NOT NULL,
        cognome        VARCHAR(255) NOT NULL,
        password       VARCHAR(255) NOT NULL,
        codice_fiscale VARCHAR(255) UNIQUE NOT NULL,
        PRIMARY KEY (email)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS acquisto (
        id_transazione   BIGSERIAL PRIMARY KEY,
        stato_pagamento  VARCHAR(255) NOT NULL,
        istante_acquisto TIMESTAMP    NOT NULL,
        biglietto        BIGINT       NOT NULL,
        utente           VARCHAR(255) NOT NULL,
        FOREIGN KEY (biglietto) REFERENCES biglietto(codice),
        FOREIGN KEY (utente)    REFERENCES utente_registrato(email)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS utente_admin (
        email          VARCHAR(255) NOT NULL,
        nome           VARCHAR(255) NOT NULL,
        cognome        VARCHAR(255) NOT NULL,
        password       VARCHAR(255) NOT NULL,
        codice_fiscale VARCHAR(255) NOT NULL,
        PRIMARY KEY (email)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS utente_esercizio (
        email          VARCHAR(255) NOT NULL,
        nome           VARCHAR(255) NOT NULL,
        cognome        VARCHAR(255) NOT NULL,
        password       VARCHAR(255) NOT NULL,
        codice_fiscale VARCHAR(255) NOT NULL,
        PRIMARY KEY (email)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS richiesta (
        id        BIGSERIAL    PRIMARY KEY,
        stato     VARCHAR(255) NOT NULL,
        tipo      VARCHAR(255) NOT NULL,
        admin     VARCHAR(255) NOT NULL,
        operatore VARCHAR(255) NOT NULL,
        FOREIGN KEY (admin)     REFERENCES utente_admin(email),
        FOREIGN KEY (operatore) REFERENCES utente_esercizio(email)
      );
    `);
    transactionQueries.push(sql`
      CREATE TABLE IF NOT EXISTS subtratta (
        id              SMALLSERIAL,
        stazione_a      VARCHAR(255) NOT NULL,
        stazione_b      VARCHAR(255) NOT NULL,
        stato           VARCHAR(255) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (stazione_a) REFERENCES stazione(nome),
        FOREIGN KEY (stazione_b) REFERENCES stazione(nome)
      );
    `);

    // 2. Popolamento dei dati (DML)

    convogli.forEach((c) => {
      transactionQueries.push(sql`INSERT INTO convoglio (id) VALUES (${c.id}) ON CONFLICT (id) DO NOTHING;`);
    });

    treni.forEach((t) => {
      transactionQueries.push(sql`INSERT INTO treno (codice, convoglio, data, subtratta) VALUES (${t.codice}, ${t.convoglio}, ${t.data}, ${t.subtratta}) ON CONFLICT (codice,data) DO NOTHING;`);
    });

    stazioni.forEach((s) => {
      transactionQueries.push(sql`INSERT INTO stazione (nome, distanza_capolinea) VALUES (${s.nome}, ${s.km}) ON CONFLICT (nome) DO NOTHING;`);
    });

    biglietti.forEach((b) => {
      transactionQueries.push(sql`INSERT INTO biglietto (codice, importo, partenza, arrivo) VALUES (${b.codice}, ${b.importo}, ${b.partenza}, ${b.arrivo}) ON CONFLICT (codice) DO NOTHING;`);
    });

    materialeRotabile.forEach((m) => {
      transactionQueries.push(sql`INSERT INTO materiale_rotabile (id, modello, tipologia, descrizione) VALUES (${m.id}, ${m.modello}, ${m.tipologia}, ${m.descrizione}) ON CONFLICT (id) DO NOTHING;`);
    });

    posti.forEach((p) => {
      transactionQueries.push(sql`INSERT INTO posto (numero, id_mat) VALUES (${p.numero}, ${p.id_mat}) ON CONFLICT (numero, id_mat) DO NOTHING;`);
    });

    composizioni.forEach((cp) => {
      transactionQueries.push(sql`INSERT INTO composizione (convoglio, id_mat) VALUES (${cp.convoglio}, ${cp.id_mat}) ON CONFLICT (convoglio, id_mat) DO NOTHING;`);
    });

    traccePassate.forEach((tr) => {
      transactionQueries.push(sql`INSERT INTO traccia_passata (orario_arrivo, orario_partenza, stazione, data, treno, progressivo) VALUES (${tr.orario_arrivo}, ${tr.orario_partenza}, ${tr.stazione}, ${tr.data}, ${tr.treno}, ${tr.progressivo}) ON CONFLICT (progressivo, treno, data, stazione) DO NOTHING;`);
    });

    tracceCorrenti.forEach((tr) => {
      transactionQueries.push(sql`INSERT INTO traccia_corrente (orario_arrivo, orario_partenza, stazione, data, treno, progressivo) VALUES (${tr.orario_arrivo}, ${tr.orario_partenza}, ${tr.stazione}, ${tr.data}, ${tr.treno}, ${tr.progressivo}) ON CONFLICT (progressivo, treno, data, stazione) DO NOTHING;`);
    });

    prenotazioni.forEach((pr) => {
      transactionQueries.push(sql`INSERT INTO prenotazione (posto, id_mat, biglietto, data, treno) VALUES (${pr.posto}, ${pr.id_mat}, ${pr.biglietto}, ${pr.data}, ${pr.treno}) ON CONFLICT (biglietto) DO NOTHING;`);
    });

    const utentiConHash = await Promise.all(
      utenti.map(async (u) => ({
        ...u,
        hashedPassword: await bcrypt.hash(u.password, 10)
      }))
    );
    utentiConHash.forEach((u) => {
      transactionQueries.push(sql`INSERT INTO utente_registrato (email, nome, cognome, password, codice_fiscale) VALUES (${u.email}, ${u.nome}, ${u.cognome}, ${u.hashedPassword}, ${u.codice_fiscale}) ON CONFLICT (email) DO NOTHING;`);
    });

    acquisti.forEach((a) => {
      transactionQueries.push(sql`INSERT INTO acquisto (id_transazione, stato_pagamento, istante_acquisto, biglietto, utente) VALUES (${a.id_transazione}, ${a.stato_pagamento}, ${a.istante_acquisto}, ${a.biglietto}, ${a.utente}) ON CONFLICT (id_transazione) DO NOTHING;`);
    });

    subtratte.forEach((sb) => {
      transactionQueries.push(sql`INSERT INTO subtratta (stazione_a, stazione_b, stato) VALUES (${sb.stazione_a}, ${sb.stazione_b}, ${sb.stato}) ON CONFLICT (id) DO NOTHING;`);
    });

    await sql.transaction(transactionQueries);

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Errore durante il seeding:", error);
    // Non serve fare "ROLLBACK" manualmente perché sql.transaction lo gestisce da solo in caso di errore lanciato
    return Response.json({ error: String(error) }, { status: 500 });
  }
}