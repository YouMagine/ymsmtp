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

var YmQueue,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

exports.hook_queue = (function(_this) {
  return function(next, connection) {
    return new YmQueue(next, connection);
  };
})(this);

YmQueue = (function() {
  function YmQueue(next, connection) {
    this.ok = __bind(this.ok, this);
    this.deny = __bind(this.deny, this);
    this.parseBodyChildren = __bind(this.parseBodyChildren, this);
    var emlFileName, ws;
    this.data = connection.transaction.notes.ym;
    this.log = new YmSmtpLog(this).log;
    this.fs = require('fs');
    this.next = next;
    emlFileName = __dirname.replace(/\/[^\/]+\/[^\/]+$/, '') + '/spool/' + connection.uuid + '.eml';
    ws = this.fs.createWriteStream(emlFileName);
    this.data.addTask(ws);
    ws.on('error', (function(_this) {
      return function(err) {
        return _this.deny("Failed to write to spool... sorry!");
        return _this.data.ready(ws);
      };
    })(this));
    ws.once('close', (function(_this) {
      return function() {
        _this.log("Wrote " + emlFileName);
        return _this.data.ready(ws);
      };
    })(this));
    connection.transaction.message_stream.pipe(ws);
    this.data.subject = connection.transaction.body.header.get('subject');
    this.parseBodyChildren(connection.transaction.body);
    this.data.setNext((function(_this) {
      return function() {
        _this.log(_this.data);
        return _this.ok;
      };
    })(this));
  }

  YmQueue.prototype.parseBodyChildren = function(body) {
    var c, o, _i, _len, _ref;
    o = {};
    o.text = body.bodytext.trim();
    o.size = o.text.length;
    o.type = body.header.get('content-type').toLowerCase().replace('\n', ' ').replace(/\s+/, ' ').trim();
    if (o != null ? o.type.match('multipart/alternative') : void 0) {
      o = null;
    }
    if (o != null ? o.type.match('multipart/mixed') : void 0) {
      o = null;
    }
    if (o != null) {
      this.data.parts.push(o);
    }
    _ref = body.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      this.parseBodyChildren(c);
    }
    return true;
  };

  YmQueue.prototype.deny = function(message) {
    if (message == null) {
      message = "Sorry but that failed";
    }
    this.log(message);
    return this.next(DENY, message);
  };

  YmQueue.prototype.ok = function(message) {
    if (message == null) {
      message = "That turned out quite well";
    }
    this.log(message);
    return this.next(OK);
  };

  return YmQueue;

})();


//# sourceMappingURL=ymqueue.map