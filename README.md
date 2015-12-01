# Raphael

Medical prescription UX prototype

## Development

Sources are in the `code` directory. Dependencies are downloaded once with Bower
and committed into source control: **it must be possible to run the project without
running bower**.

AJAX requires a server, so there's a simple one developed with Express. You first
need to install the dependencies:

    npm install
    npm install supervisor -g

and then can start it (server binds localhost:3333 by default)

    supervisor server.js

Don't forget to also start Solr! (see below for how to run)

## Solr

Search is handled by Apache Solr. Useful commands follow:

    bin/solr start
    bin/solr create -c drugs
    bin/solr create -c cares

Two tables in CSV format are provided to initially seed the search indices.
These files can be uploaded directly from the Solr interface at http://localhost:8983/solr
Upload the data from the "documents" directory to the appropriate core. Ensure:

 - Request-Handler (qt) is "update/csv"
 - Document Type is "File upload"
 - Clear params

**Don't forget to also commit changes**! From the left sidebar, select "Core Admin"
and use the "Optimize button"

To stop solr

    bin/solr stop -all

## Data credits

- [Nomenclatore tariffario regionale Emilia-Romagna](http://salute.regione.emilia-romagna.it/documentazione/nomenclatore-tariffario-rer/nomenclatore_tariffario_rer_2014.xls/view)
- [Agenzia del farmaco](http://www.agenziafarmaco.gov.it/it/content/dati-sulle-liste-dei-farmaci-open-data)
