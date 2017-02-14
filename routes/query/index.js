/*
 * NodeJS RRSM Query Implementation
 *
 * Supported Request Type:
 * > GET
 *
 * Path: /query
 *
 * Returns quakeML from eventID as application/xml
 *
 */

const CONFIG = require("../../Config");
const RRSMError = require("../../lib/RRSMError");
const ERROR = require("../../static/Error");
const ALLOWED = require("../../static/Allowed");
const REGEX = require("../../static/Regex");

// File system and subprocess
const Spawn = require("child_process").spawn;

// Wrap route in a module to be required()
module.exports = function(RRSM) {

  // Handle GET requests
  RRSM.get(CONFIG.BASE_URL + "query", function(req, res, next) {

    // Key sanitization
    for(var key in req.query) {
      if(!ALLOWED.hasOwnProperty(key)) {
        return new RRSMError(req, res, ERROR.INVALID_PARAMETER, key);
      }
      if(ALLOWED[key] && !REGEX[ALLOWED[key]].test(req.query[key])) {
        return new RRSMError(req, res, ERROR.INVALID_REGEX, key);
      }
    }

    // Get the query
    var eventId = req.query.id || req.query.eventid || null;

    // eventId cannot be null
    if(eventId === null) {
      return new RRSMError(req, res, ERROR.EMPTY_ID);
    }

    // Create a call to the seiscomp subprocess
    var seiscompProcess = Spawn(CONFIG.SEISCOMP_ROOT, [
      "exec",
      "scxmldump",
      "-d", CONFIG.SEISCOMP_DB,
      "-pam",
      "-E", "emsc" + eventId
    ]);

    // Create a xsltproc subprocess
    // "-" indicates to read from stdin
    var quakeMLProcess = Spawn(CONFIG.XSLTPROC_ROOT, [
      CONFIG.SCHEMA_PATH,
      "-"
    ]);

    // Keep track of the number of bytes piped to the user
    quakeMLProcess.stdout.on("data", function(data) {
      req.RequestHandler.nBytes += data.length;
    });

    // Pipe data through quakeMLProcess
    seiscompProcess.stdout.pipe(quakeMLProcess.stdin);

    // Check if seiscomp pipe exited with an error
    seiscompProcess.on("close", function(code) {

      // If seiscomp exited with an error code that is not 0
      // forward 204 to user
      if(code !== 0) {
        return res.status(204).end();
      }

      // Write headers and continue to pipe data to user
      res.setHeader("Content-Type", "application/xml");
      quakeMLProcess.stdout.pipe(res); 

    });
      
  });

}
