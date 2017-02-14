const CONFIG = require("../Config");

const Logger = require("./Logger");

var RequestHandler = function() {

  this.Logger = Logger;

  this.id = this.AssignRequestId();
  this.requestSubmitted = new Date();

  this.nBytes = 0;

}

RequestHandler.prototype.AssignRequestId = function() {

  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();

}

module.exports = RequestHandler
