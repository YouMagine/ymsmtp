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
    connection.transaction.notes.ym = {
      rcpt: params[0].toString(),
      from: connection.transaction.mail_from.toString(),
      ip: connection.remote_ip,
      host: connection.remote_host,
      uuid: connection.uuid,
      parts: [],
      attachments: [],
      subject: null,
      tasks: [],
      taskErrors: [],
      next: null
    };
    connection.transaction.notes.ym.addTask = (function(_this) {
      return function(object) {
        var len;
        len = connection.transaction.notes.ym.tasks.push(object);
        _this.log("Number of tasks is now: " + len);
        return connection.transaction.notes.ym.tasks.indexOf(object);
      };
    })(this);
    connection.transaction.notes.ym.ready = (function(_this) {
      return function(object, error) {
        var i;
        if (error == null) {
          error = null;
        }
        if (error != null) {
          taskErrors.push(error);
        }
        i = connection.transaction.notes.ym.tasks.indexOf(object);
        _this.log("task ready:" + i);
        connection.transaction.notes.ym.tasks = connection.transaction.notes.ym.tasks.filter(function(o) {
          return o !== object;
        });
        _this.log("Number of tasks is now: " + connection.transaction.notes.ym.tasks.length);
        if (connection.transaction.notes.ym.tasks.length === 0 && (connection.transaction.notes.ym.next != null)) {
          return connection.transaction.notes.ym.next();
        }
      };
    })(this);
    connection.transaction.notes.ym.setNext = (function(_this) {
      return function(next) {
        _this.log("Receiving final next() function");
        connection.transaction.notes.ym.next = next;
        if (connection.transaction.notes.ym.tasks.length === 0) {
          return connection.transaction.notes.ym.next();
        }
      };
    })(this);
    this.log("New message [" + connection.transaction.notes.ym.uuid + "] from " + connection.transaction.notes.ym.from + " for " + connection.transaction.notes.ym.rcpt + " host: " + connection.transaction.notes.ym.ip);
    next(OK);
  }

  return YmSmtpRcpt;

})();

exports.hook_rcpt = function(next, connection, params) {
  return new YmSmtpRcpt(this, next, connection, params);
};


//# sourceMappingURL=rcpt_to.ymsmtp.map