# NodeJS-RRSM
NodeJS Implementation of RRSM Webservice. Returns QuakeML from RRSM database based on the submitted event id. The service pipeline is as follows:

    HTTP Request > SeisComp3 Event SC3ML > xsltproc to QuakeML > HTTP Response

## Service Requirements

* NodeJS
* npm
* binary installation of xsltproc
* SeisComp3

## Installing and running the service

`npm install` followed by `npm start`

## Service Configuration

* `PORT` - Port to expose the service on
* `HOST` - Host to expose the service on
* `NAME` - Name of the service
* `DOCUMENTATION_URI` - URL for document of service description
* `SEISCOMP_ROOT` - Path to SeisComp3 Binary
* `SEISCOMP_DB` - Connector to SeisComp3 Database
* `XSLTPROC_ROOT` - xslt binary
* `SCHEMA_PATH` - Path to schema conversion xslt file
* `LOGPATH` - Path to where to save logfiles
* `VERSION` - Service version
* `BASE_URL` - Base path to expose the Federator on
* `SERVICE_CLOSED` - Service closed for maintenance
