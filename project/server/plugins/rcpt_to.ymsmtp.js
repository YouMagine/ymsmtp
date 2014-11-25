var YmSmtpLog,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

YmSmtpLog = (function() {
  var _;

  _ = require('lodash');

  function YmSmtpLog(haraka) {
    this.dump = __bind(this.dump, this);
    this.out = __bind(this.out, this);
    this.log = __bind(this.log, this);
    this.haraka = haraka;
    this.fs = require('fs');
    this.util = require('util');
    this.logfile = __dirname.replace(/\/[^\/]+\/[^\/]+$/, '') + "/logs/ymsmtp.log";
  }

  YmSmtpLog.prototype.log = function(data, maxDepth) {
    if (maxDepth == null) {
      maxDepth = 10;
    }
    if (typeof data === 'string') {
      return this.out(data, 1);
    } else {
      return this.out('Dump:' + this.dump(data, maxDepth), 1);
    }
  };

  YmSmtpLog.prototype.out = function(string, level) {
    if (level == null) {
      level = 1;
    }
    return this.fs.appendFile(this.logfile, ("[" + level + "] ") + new Date().toString() + ' ' + string.toString().trim() + "\n", (function(_this) {
      return function(err) {
        if (err) {
          return _this.haraka.logcrit(err);
        }
      };
    })(this));
  };

  YmSmtpLog.prototype.dump = function(o, maxDepth, path, objects, depth) {
    var k, out, pad, toDump, type, v;
    if (path == null) {
      path = '';
    }
    if (objects == null) {
      objects = [];
    }
    if (depth == null) {
      depth = 0;
    }
    if (maxDepth === depth) {
      return '';
    }
    pad = '~';
    out = '';
    toDump = {};
    for (k in o) {
      v = o[k];
      type = typeof v;
      switch (type) {
        case 'string':
          out += "\n" + Array(depth + 1).join(pad) + (type + ": " + path + k + '[' + v + ']');
          break;
        case 'function':
          out += "\n" + Array(depth + 1).join(pad) + (type + ": " + path + k + '[' + v.toString().split('\n')[0].replace(/{.*/gm, '') + ']');
          break;
        case 'boolean':
          out += "\n" + Array(depth + 1).join(pad) + (type + ": " + path + k + '[' + v + ']');
          break;
        case 'number':
          out += "\n" + Array(depth + 1).join(pad) + (type + ": " + path + k + '[' + v + ']');
          break;
        case 'undefined':
          out += "\n" + Array(depth + 1).join(pad) + (type + ": " + path + k + '[' + v + ']');
          break;
        case 'object':
          if ((_.indexOf(objects, v)) === -1) {
            out += "\n" + Array(depth + 1).join(pad) + "New " + type + ": " + path + k + '{' + _.size(v) + '}';
            objects.push(v);
            out += this.dump(v, maxDepth, path + k + '.', objects, depth + 1);
          } else {
            out += "\n" + Array(depth + 1).join(pad) + "Seen " + type + ": " + path + k + '{' + _.size(o[k]) + '}';
          }
          break;
        default:
          out += "\n" + Array(depth + 1).join(pad) + "???->" + type + ": " + path + k + '[NA]';
      }
    }
    return out + "\n";
  };

  return YmSmtpLog;

})();

var YmSmtpRcpt;

YmSmtpRcpt = (function() {
  function YmSmtpRcpt(haraka, next, connection, params) {
    this.log = new YmSmtpLog(haraka).log;
    this.data = {
      rcpt: params[0].toString(),
      from: connection.transaction.mail_from.toString(),
      ip: connection.remote_ip,
      host: connection.remote_host,
      uuid: connection.uuid
    };
    this.log("New message [" + this.data.uuid + "] from " + this.data.from + " for " + this.data.rcpt + " host: " + this.data.ip);
    next(OK);
  }

  return YmSmtpRcpt;

})();

exports.hook_rcpt = function(next, connection, params) {
  return new YmSmtpRcpt(this, next, connection, params);
};


//# sourceMappingURL=rcpt_to.ymsmtp.map