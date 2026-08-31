/*1*/
CREATE TABLE convoglio (
    id BIGSERIAL PRIMARY KEY
);
/*2*/
CREATE TABLE treno (
    data      DATE    NOT NULL,
    codice    INT     NOT NULL,
    convoglio BIGINT  NOT NULL,
    PRIMARY KEY (codice, data),
    FOREIGN KEY (convoglio) REFERENCES convoglio(id)
);
/*3*/
CREATE TABLE stazione (
    nome                VARCHAR(255)  NOT NULL,
    distanza_capolinea  DECIMAL(6,3)  NOT NULL,
    PRIMARY KEY (nome)
);
/*4*/
CREATE TABLE biglietto (
    codice   BIGSERIAL PRIMARY KEY,
    importo  DECIMAL(8,2)  NOT NULL,
    partenza VARCHAR(255)  NOT NULL,
    arrivo   VARCHAR(255)  NOT NULL,
    FOREIGN KEY (partenza) REFERENCES stazione(nome),
    FOREIGN KEY (arrivo)   REFERENCES stazione(nome)
);
/*5*/
CREATE TABLE materiale_rotabile (
    id          VARCHAR(255) NOT NULL,
    modello     VARCHAR(255) NOT NULL,
    tipologia   VARCHAR(255) NOT NULL,
    descrizione TEXT         NOT NULL,
    PRIMARY KEY (id, modello)
);
/*6*/
CREATE TABLE posto (
    numero                     VARCHAR(255) NOT NULL,
    id_mat      VARCHAR(255) NOT NULL,
    mod_mat VARCHAR(255) NOT NULL,
    PRIMARY KEY (numero, id_mat, mod_mat),
    FOREIGN KEY (id_mat, mod_mat)
        REFERENCES materiale_rotabile(id, modello)
);
/*7*/
CREATE TABLE composizione (
    convoglio                  BIGINT       NOT NULL,
    id_mat      VARCHAR(255) NOT NULL,
    mod_mat VARCHAR(255) NOT NULL,
    PRIMARY KEY (convoglio, id_mat, mod_mat),
    FOREIGN KEY (convoglio) REFERENCES convoglio(id),
    FOREIGN KEY (id_mat, mod_mat)
        REFERENCES materiale_rotabile(id, modello)
);
/*8*/
CREATE TABLE traccia_passata (
    orario_arrivo   TIME         NOT NULL,
    orario_partenza TIME         NOT NULL,
    stazione        VARCHAR(255) NOT NULL,
    data            DATE         NOT NULL,
    treno           INT          NOT NULL,
    PRIMARY KEY (treno, data, stazione),
    FOREIGN KEY (stazione)     REFERENCES stazione(nome),
    FOREIGN KEY (treno, data)  REFERENCES treno(codice, data)
);
/*9*/
CREATE TABLE traccia_corrente (
    orario_arrivo   TIME         NOT NULL,
    orario_partenza TIME         NOT NULL,
    stazione        VARCHAR(255) NOT NULL,
    treno           INT          NOT NULL,
    data            DATE         NOT NULL,
    PRIMARY KEY (data, treno, stazione),
    FOREIGN KEY (stazione)    REFERENCES stazione(nome),
    FOREIGN KEY (treno, data) REFERENCES treno(codice, data)
);
/*10*/
CREATE TABLE prenotazione (
    posto                      VARCHAR(255) NOT NULL,
    id_mat      VARCHAR(255) NOT NULL,
    mod_mat VARCHAR(255) NOT NULL,
    biglietto                  BIGINT       NOT NULL,
    data                       DATE         NOT NULL,
    treno                      INT          NOT NULL,
    PRIMARY KEY (biglietto),
    FOREIGN KEY (biglietto)   REFERENCES biglietto(codice),
    FOREIGN KEY (treno, data) REFERENCES treno(codice, data),
    FOREIGN KEY (posto, id_mat, mod_mat)
        REFERENCES posto(numero, id_mat, mod_mat)
);
/*11*/
CREATE TABLE utente_registrato (
    email          VARCHAR(255) NOT NULL,
    nome           VARCHAR(255) NOT NULL,
    cognome        VARCHAR(255) NOT NULL,
    password       VARCHAR(255) NOT NULL,
    codice_fiscale VARCHAR(255) NOT NULL,
    PRIMARY KEY (email)
);
/*12*/
CREATE TABLE acquisto (
    id_transazione   BIGSERIAL PRIMARY KEY,
    stato_pagamento  VARCHAR(255) NOT NULL,
    istante_acquisto TIMESTAMP    NOT NULL,
    biglietto        BIGINT       NOT NULL,
    utente           VARCHAR(255) NOT NULL,
    FOREIGN KEY (biglietto) REFERENCES biglietto(codice),
    FOREIGN KEY (utente)    REFERENCES utente_registrato(email)
);
/*13*/
CREATE TABLE utente_admin (
    email          VARCHAR(255) NOT NULL,
    nome           VARCHAR(255) NOT NULL,
    cognome        VARCHAR(255) NOT NULL,
    password       VARCHAR(255) NOT NULL,
    codice_fiscale VARCHAR(255) NOT NULL,
    PRIMARY KEY (email)
);
/*14*/
CREATE TABLE utente_esercizio (
    email          VARCHAR(255) NOT NULL,
    nome           VARCHAR(255) NOT NULL,
    cognome        VARCHAR(255) NOT NULL,
    password       VARCHAR(255) NOT NULL,
    codice_fiscale VARCHAR(255) NOT NULL,
    PRIMARY KEY (email)
);
/*15*/
CREATE TABLE richiesta (
    id        BIGSERIAL    PRIMARY KEY,
    stato     VARCHAR(255) NOT NULL,
    tipo      VARCHAR(255) NOT NULL,
    admin     VARCHAR(255) NOT NULL,
    operatore VARCHAR(255) NOT NULL,
    FOREIGN KEY (admin)     REFERENCES utente_admin(email),
    FOREIGN KEY (operatore) REFERENCES utente_esercizio(email)
);
