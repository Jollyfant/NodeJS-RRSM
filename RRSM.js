/*
 * Simple NodeJS Implementation of EIDA Federator
 *
 * Copyright Mathijs Koymans, 2016
 *
 * Only supports GET requests.
 *
 * Allowed query parameters:
 * >>> (event)id
 *
 */

"use strict";

// RRSM Webservice is powered by express
const RRSM = require("express")();
const RRSMError = require("./lib/RRSMError");
const ERROR = require("./static/Error");

const RequestHandler = require("./lib/Handler");
const Path = require("path");

// Wrap the service in a module
module.exports = function(CONFIG, RRSMCallback) {

  RRSM.all(CONFIG.BASE_URL + "*", function(req, res, next) {

    if(req.url === "./favicon.ico") {
      return res.status(404).end();
    }

    // Create a new request handler
    req.RequestHandler = new RequestHandler();

    // Service is closed
    if(CONFIG.SERVICE_CLOSED) {
      return new RRSMError(req, res, ERROR.SERVICE_CLOSED);
    }

    // HTTP response finished
    res.on("finish", function() {

      req.RequestHandler.Logger.info({
        "id": req.RequestHandler.id,
        "code": res.statusCode,
        "path": Path.relative(CONFIG.BASE_URL, req.path), 
        "client": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        "method": req.method,
        "nBytes": req.RequestHandler.nBytes,
        "msRequestTimeTotal": new Date() - req.RequestHandler.requestSubmitted
      }, "HTTP Request Summary");

    });

    next();

  });

  // Require version, application.wadl & query
  require("./routes/version")(RRSM);
  require("./routes/application.wadl")(RRSM);
  require("./routes/query")(RRSM);

  // Listen to incoming HTTP requests
  var server = RRSM.listen(CONFIG.PORT, CONFIG.HOST, function() {

    // If a callback function was passed
    if(RRSMCallback instanceof Function) {
      RRSMCallback("NodeJS RRSM webservice has been started");
    }

  });

  // Disable server timeouts
  server.timeout = 0;

}

// Called directly
if(require.main === module) {

  const CONFIG = require("./Config");

  // Start a single service
  new module.exports(CONFIG, function(message) {
    console.log(message);
  });

}
