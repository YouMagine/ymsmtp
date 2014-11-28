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

var YmAttachment,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

exports.hook_data = (function(_this) {
  return function(next, connection) {
    return new YmAttachment(next, connection);
  };
})(this);

YmAttachment = (function() {
  function YmAttachment(next, connection) {
    this.attachmentStart = __bind(this.attachmentStart, this);
    this.connection = connection;
    this.log = new YmSmtpLog(this).log;
    this.fs = require('fs');
    this.next = next;
    this.connection.transaction.parse_body = 1;
    this.data = connection.transaction.notes.ym;
    this.connection.transaction.attachment_hooks((function(_this) {
      return function(ct, fn, body, stream) {
        return _this.attachmentStart(ct, fn, body, stream);
      };
    })(this));
    this.next();
  }

  YmAttachment.prototype.attachmentStart = function(contentType, fileName, body, stream) {
    var o, path, ws;
    stream.connection = this.connection;
    stream.pause();
    this.log("Getting attachment " + fileName);
    path = __dirname.replace(/\/[^\/]+\/[^\/]+$/, '') + '/spool/' + this.connection.uuid + '.' + this.data.attachments.length + '.att';
    o = {};
    o.filename = fileName;
    o.type = contentType;
    o.path = path;
    o.saved = null;
    this.data.attachments.push(o);
    ws = this.fs.createWriteStream(path);
    this.data.addTask(ws);
    ws.on('close', (function(_this) {
      return function() {
        _this.log("Saved attachment " + fileName + " to " + path);
        o.saved = true;
        return _this.data.ready(ws);
      };
    })(this));
    ws.on('error', (function(_this) {
      return function(err) {
        _this.log("Failed to write attachment " + fileName);
        o.saved = false;
        return _this.data.ready(ws);
      };
    })(this));
    stream.pipe(ws);
    return stream.resume();
  };

  return YmAttachment;

})();


//# sourceMappingURL=ymattach.map