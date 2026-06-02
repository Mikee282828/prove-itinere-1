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
} from "../lib/placeholder-data";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL || "");

//1
async function seedConvogli() {
  await sql`
    CREATE TABLE IF NOT EXISTS convoglio (
      id BIGSERIAL PRIMARY KEY
    );
  `;

  const convogliInseriti = await Promise.all(
    convogli.map((convoglio) => {
      return sql`
        INSERT INTO convoglio (id)
        VALUES (${convoglio.id})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return convogliInseriti;
}
//2
async function seedTreni() {
  await sql`
    CREATE TABLE IF NOT EXISTS treno (
      data      TIMESTAMP    NOT NULL,
      codice    INT     NOT NULL,
      convoglio BIGINT  NOT NULL,
      PRIMARY KEY (codice, data),
      FOREIGN KEY (convoglio) REFERENCES convoglio(id)
    );
  `;

  const treniInseriti = await Promise.all(
    treni.map((treno) => {
      return sql`
        INSERT INTO treno (codice, convoglio, data)
        VALUES (${treno.codice},${treno.convoglio},${treno.data})
        ON CONFLICT (codice,data) DO NOTHING;
      `;
    }),
  );

  return treniInseriti;
}
//3
async function seedStazioni() {
  await sql`
    CREATE TABLE IF NOT EXISTS stazione (
      nome                VARCHAR(255)  NOT NULL,
      distanza_capolinea  DECIMAL(6,3)  NOT NULL,
      PRIMARY KEY (nome)
    );
  `;

  const stazioniInseriti = await Promise.all(
    stazioni.map((stazione) => {
      return sql`
        INSERT INTO stazione (nome, distanza_capolinea)
        VALUES (${stazione.nome},${stazione.km})
        ON CONFLICT (nome) DO NOTHING;
      `;
    }),
  );

  return stazioniInseriti;
}
//4
async function seedBiglietti() {
  await sql`
    CREATE TABLE if NOT EXISTS biglietto (
      codice   BIGSERIAL PRIMARY KEY,
      importo  DECIMAL(8,2)  NOT NULL,
      partenza VARCHAR(255)  NOT NULL,
      arrivo   VARCHAR(255)  NOT NULL,
      FOREIGN KEY (partenza) REFERENCES stazione(nome),
      FOREIGN KEY (arrivo)   REFERENCES stazione(nome)
    );
  `;

  const bigliettiInseriti = await Promise.all(
    biglietti.map((biglietto) => {
      return sql`
        INSERT INTO biglietto (codice, importo, partenza, arrivo)
        VALUES (${biglietto.codice}, ${biglietto.importo},${biglietto.partenza},${biglietto.arrivo})
        ON CONFLICT (codice) DO NOTHING;
      `;
    }),
  );

  return bigliettiInseriti;
}
//5
async function seedMaterialeRotabile() {
  await sql`
    CREATE TABLE if NOT EXISTS materiale_rotabile (
      id          VARCHAR(255) NOT NULL,
      modello     VARCHAR(255) NOT NULL,
      tipologia   VARCHAR(255) NOT NULL,
      descrizione TEXT         NOT NULL,
      PRIMARY KEY (id)
    );
  `;

  const materialiInseriti = await Promise.all(
    materialeRotabile.map((materiale) => {
      return sql`
        INSERT INTO materiale_rotabile (id, modello, tipologia, descrizione)
        VALUES (${materiale.id},${materiale.modello},${materiale.tipologia},${materiale.descrizione})
        ON CONFLICT (id) DO NOTHING;      
        `;
    }),
  );

  return materialiInseriti;
}
//6
async function seedPosti() {
  await sql`
    CREATE TABLE if NOT EXISTS posto (
      numero      INTEGER NOT NULL,
      id_mat      VARCHAR(255) NOT NULL,
      PRIMARY KEY (numero, id_mat),
      FOREIGN KEY (id_mat)
        REFERENCES materiale_rotabile(id)
    );
  `;

  const postiInseriti = await Promise.all(
    posti.map((posto) => {
      return sql`
        INSERT INTO posto (numero,id_mat)
        VALUES (${posto.numero},${posto.id_mat})
        ON CONFLICT (numero, id_mat) DO NOTHING
      `;
    }),
  );

  return postiInseriti;
}
//7
async function seedComposizioni() {
  await sql`
    CREATE TABLE IF NOT EXISTS composizione (
      convoglio                  BIGINT       NOT NULL,
      id_mat                     VARCHAR(255) NOT NULL,
      PRIMARY KEY (convoglio, id_mat),
      FOREIGN KEY (convoglio) REFERENCES convoglio(id),
      FOREIGN KEY (id_mat) REFERENCES materiale_rotabile(id)
    );
  `;

  const composizioniInseriti = await Promise.all(
    composizioni.map((composizione) => {
      return sql`
      INSERT INTO composizione (convoglio,id_mat)
      VALUES (${composizione.convoglio},${composizione.id_mat})
      ON CONFLICT (convoglio, id_mat) DO NOTHING
    `;
    }),
  );

  return composizioniInseriti;
}

//8
async function seedTracciaPassata() {
  await sql`
    CREATE TABLE IF NOT EXISTS traccia_passata (
      orario_arrivo   TIME         NOT NULL,
      orario_partenza TIME         NOT NULL,
      stazione        VARCHAR(255) NOT NULL,
      data            TIMESTAMP         NOT NULL,
      treno           INT          NOT NULL,
      progressivo     INT          NOT NULL,
      PRIMARY KEY (progressivo, treno, data, stazione),
      FOREIGN KEY (stazione)     REFERENCES stazione(nome),
      FOREIGN KEY (treno, data)  REFERENCES treno(codice, data)
    );
  `;

  const traccePInserite = await Promise.all(
    traccePassate.map((traccia) => {
      return sql`
      INSERT INTO traccia_passata (orario_arrivo,orario_partenza,stazione,data,treno,progressivo)
      VALUES (${traccia.arrivo},${traccia.partenza},${traccia.stazione},${traccia.data},${traccia.treno},${traccia.progressivo})
      ON CONFLICT (progressivo,treno,data,stazione) DO NOTHING
    `;
    }),
  );

  return traccePInserite;
}

//9
async function seedTracciaCorrente() {
  await sql`
    CREATE TABLE IF NOT EXISTS traccia_corrente (
      orario_arrivo   TIME         NOT NULL,
      orario_partenza TIME         NOT NULL,
      stazione        VARCHAR(255) NOT NULL,
      treno           INT          NOT NULL,
      data            TIMESTAMP         NOT NULL,
      progressivo     INT          NOT NULL,
      PRIMARY KEY (progressivo, data, treno, stazione),
      FOREIGN KEY (stazione)    REFERENCES stazione(nome),
      FOREIGN KEY (treno, data) REFERENCES treno(codice, data)
    );
  `;
}

//10
async function seedPrenotazioni() {
  await sql`
    CREATE TABLE IF NOT EXISTS prenotazione (
      posto                      INTEGER      NOT NULL,
      id_mat                     VARCHAR(255) NOT NULL,
      biglietto                  BIGINT       NOT NULL,
      data                       TIMESTAMP         NOT NULL,
      treno                      INT          NOT NULL,
      PRIMARY KEY (biglietto),
      FOREIGN KEY (biglietto)   REFERENCES biglietto(codice),
      FOREIGN KEY (treno, data) REFERENCES treno(codice, data),
      FOREIGN KEY (posto, id_mat) REFERENCES posto(numero, id_mat)
    );
  `;

  const prenotazioniInserite = await Promise.all(
    prenotazioni.map((prenotazione) => {
      return sql`
      INSERT INTO prenotazione (posto,id_mat,biglietto,data,treno)
      VALUES (${prenotazione.posto},${prenotazione.id_mat},${prenotazione.biglietto},${prenotazione.data},${prenotazione.treno})
      ON CONFLICT (biglietto) DO NOTHING
    `;
    }),
  );

  return prenotazioniInserite;
}
//11
async function seedUtenti() {
  await sql`
    CREATE TABLE IF NOT EXISTS utente_registrato (
      email          VARCHAR(255) NOT NULL,
      nome           VARCHAR(255) NOT NULL,
      cognome        VARCHAR(255) NOT NULL,
      password       VARCHAR(255) NOT NULL,
      codice_fiscale VARCHAR(255) UNIQUE NOT NULL,
      PRIMARY KEY (email)
    );
  `;

  const utentiInseriti = await Promise.all(
    utenti.map(async (utente) => {
      const hashedPassword = await bcrypt.hash(utente.password, 10);
      return sql`
        INSERT INTO utente_registrato (email, nome, cognome, password, codice_fiscale)
        VALUES (${utente.email}, ${utente.nome}, ${utente.cognome}, ${hashedPassword}, ${utente.codice_fiscale})
        ON CONFLICT (email) DO NOTHING;
      `;
    }),
  );

  return utentiInseriti;
}

//12
async function seedAcquisti() {
  await sql`
    CREATE TABLE IF NOT EXISTS acquisto (
      id_transazione   BIGSERIAL PRIMARY KEY,
      stato_pagamento  VARCHAR(255) NOT NULL,
      istante_acquisto TIMESTAMP    NOT NULL,
      biglietto        BIGINT       NOT NULL,
      utente           VARCHAR(255) NOT NULL,
      FOREIGN KEY (biglietto) REFERENCES biglietto(codice),
      FOREIGN KEY (utente)    REFERENCES utente_registrato(email)
    );
  `;

  const acquistiInseriti = await Promise.all(
    acquisti.map((acquisto) => {
      return sql`
      INSERT INTO acquisto (id_transazione,stato_pagamento,istante_acquisto,biglietto,utente)
      VALUES (${acquisto.id_transazione},${acquisto.stato_pagamento},${acquisto.istante_acquisto},${acquisto.biglietto},${acquisto.utente})
      ON CONFLICT (id_transazione) DO NOTHING
    `;
    }),
  );

  return acquistiInseriti;
}

//13
async function seedUtentiAdmin() {
  await sql`
    CREATE TABLE IF NOT EXISTS utente_admin (
      email          VARCHAR(255) NOT NULL,
      nome           VARCHAR(255) NOT NULL,
      cognome        VARCHAR(255) NOT NULL,
      password       VARCHAR(255) NOT NULL,
      codice_fiscale VARCHAR(255) NOT NULL,
      PRIMARY KEY (email)
    );
  `;
}

//14
async function seedUtentiEsercizio() {
  await sql`
    CREATE TABLE IF NOT EXISTS utente_esercizio (
      email          VARCHAR(255) NOT NULL,
      nome           VARCHAR(255) NOT NULL,
      cognome        VARCHAR(255) NOT NULL,
      password       VARCHAR(255) NOT NULL,
      codice_fiscale VARCHAR(255) NOT NULL,
      PRIMARY KEY (email)
    );
  `;
}

//15
async function seedRichieste() {
  await sql`
    CREATE TABLE IF NOT EXISTS richiesta (
      id        BIGSERIAL    PRIMARY KEY,
      stato     VARCHAR(255) NOT NULL,
      tipo      VARCHAR(255) NOT NULL,
      admin     VARCHAR(255) NOT NULL,
      operatore VARCHAR(255) NOT NULL,
      FOREIGN KEY (admin)     REFERENCES utente_admin(email),
      FOREIGN KEY (operatore) REFERENCES utente_esercizio(email)
    );
  `;
}

//16
async function seedSubtratta() {
  await sql`
    CREATE TABLE IF NOT EXISTS subtratta (
      stazione_a      VARCHAR(255) NOT NULL,
      stazione_b      VARCHAR(255) NOT NULL,
      stato           VARCHAR(255) NOT NULL,
      PRIMARY KEY (stazione_a,stazione_b),
      FOREIGN KEY (stazione_a) REFERENCES stazione(nome),
      FOREIGN KEY (stazione_b) REFERENCES stazione(nome)
    );
  `;

  const subtratteInseriti = await Promise.all(
    subtratte.map((subtratta) => {
      return sql`
      INSERT INTO subtratta(stazione_a,stazione_b,stato)
      VALUES (${subtratta.stazione_a},${subtratta.stazione_b},${subtratta.stato})
      ON CONFLICT (stazione_a,stazione_b) DO NOTHING
    `;
    }),
  );

  return subtratteInseriti;
}

export async function GET() {
  try {
    await sql`BEGIN`;
    //1
    await seedConvogli();
    //2
    await seedTreni();
    //3
    await seedStazioni();
    //4
    await seedBiglietti();
    //5
    await seedMaterialeRotabile();
    //6
    await seedPosti();
    //7
    await seedComposizioni();
    //8
    await seedTracciaPassata();
    //9
    await seedTracciaCorrente();
    //10
    await seedPrenotazioni();
    //11
    await seedUtenti();
    //12
    await seedAcquisti();
    //13
    await seedUtentiAdmin();
    //14
    await seedUtentiEsercizio();
    //15
    await seedRichieste();
    //16
    await seedSubtratta();
    await sql`COMMIT`;
    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    await sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
