Raphael
=======

Medical prescription UX prototype

Development
===========

Sources are in the code directory. You first need to install the dependencies:

    bower install
    npm install
    npm install supervisor -g
    supervisor server.js

The server binds localhost:3333

Search is handled by Apache Solr. Useful commands follow:

    bin/solr start
    bin/solr create -c drugs
    bin/solr create -c cares

Upload the data from the "documents" directory to the appropriate core. Ensure:

 - Request-Handler (qt) is "update/csv"
 - Document Type is "File upload"
 - Clear params

**Don't forget to also commit changes**! From the left sidebar, select "Core Admin"
and use the "Optimize button"

To stop solr

    bin/solr stop -all

Data
====

- [Nomenclatore tariffario regionale Emilia-Romagna](http://salute.regione.emilia-romagna.it/documentazione/nomenclatore-tariffario-rer/nomenclatore_tariffario_rer_2014.xls/view)
- [Agenzia del farmaco](http://www.agenziafarmaco.gov.it/it/content/dati-sulle-liste-dei-farmaci-open-data)
