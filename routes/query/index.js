const CONFIG = require("../../Config");
const RRSMError = require("../../lib/RRSMError");
const ERROR = require("../../static/Error");

// File system and subprocess
const Spawn = require("child_process").spawn;

/*
 * NodeJS Federator Version Implementation
 *
 * Supported Request Type:
 * > GET
 *
 * Path: /version
 *
 * Returns current service version number in text/plain
 *
 */

module.exports = function(RRSM) {

  RRSM.get(CONFIG.BASE_URL + "query", function(req, res, next) {

    // Get the query
    var query = {
      "eventid": req.query.id || req.query.eventid || null
    }

    // Cannot be null
    if(query.eventid === null) {
      return new RRSMError(req, res, ERROR.EMPTY_ID);
    }

    // Must be an integer
    if(query.eventid % 1 !== 0) {
      return new RRSMError(req, res, ERROR.INVALID_ID);
    }

    // Create a call to the seiscomp subprocess
    var seiscompPipe = Spawn(CONFIG.SEISCOMP_ROOT, [
      "exec",
      "scxmldump",
      "-d", CONFIG.SEISCOMP_DB,
      "-pam",
      "-E", "emsc" + query.eventid
    ]);

    // Create a xsltproc subprocess
    // "-" indicates to read from stdin
    var quakeMLPipe = Spawn(CONFIG.XSLTPROC_ROOT, [
      CONFIG.SCHEMA_PATH,
      "-"
    ]);

    // Keep track of the number of bytes piped to the user
    quakeMLPipe.stdout.on("data", function(data) {
      req.RequestHandler.nBytes += data.length;
    });

    // Pipe data through quakeMLPipe
    seiscompPipe.stdout.pipe(quakeMLPipe.stdin);

    // Check if seiscomp pipe exited with an error
    seiscompPipe.on("close", function(code) {

      if(code !== 0) {
        return res.status(204).end();
      }

      res.setHeader("Content-Type", "application/xml");

      // Continue to pipe data to user
      quakeMLPipe.stdout.pipe(res); 

    });
      
  });

}
