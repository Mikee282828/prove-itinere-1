## Inizio

Prima di avviare il sito è necessario creare un file .env nella root directory e inserire i seguenti campi:

```
POSTGRES_USER=iltuonomeutente 
POSTGRES_PASSWORD=unapassword 
POSTGRES_DB=iltuodb
DATABASE_URL=postgres://iltuonomeutente:unapassword@db:5432/iltuodb
```

Per avviare il sito in locale assicurarsi di avere Docker installato ed eseguire:

```
docker compose up -d --build
```

## Popolare il db

Dopo che i container Docker sono stati avviati correttamente, aprire il file /app/seed/route.js, decommentare il codice e raggiungere con il browser l'URL: http://localhost:3000/seed per popolare il db.<br>
Successivamente, dopo che il db sarà stato correttamente popolato, è consigliabile commentare il codice nel file /app/seed/route.js.

