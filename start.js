#!/usr/bin/node
(function() {
var YmSmtpStart,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

YmSmtpStart = (function() {
  require('colors');

  function YmSmtpStart() {
    this.err = __bind(this.err, this);
    this.debug = __bind(this.debug, this);
    this.startHaraka = __bind(this.startHaraka, this);
    this.setupServer = __bind(this.setupServer, this);
    this.checkUsers = __bind(this.checkUsers, this);
    this.debuglevel = 10;
    this.name = 'Youmagine SMTP';
    if (process.getuid() > 1) {
      this.err("You must be root to start " + this.name);
      process.exit(1);
    }
    this.debug(1, "Starting " + this.name + " ");
    this.checkUsers();
    this.setupServer();
    this.startHaraka();
  }

  YmSmtpStart.prototype.checkUsers = function() {
    var e, posix;
    posix = require('posix');
    try {
      this.uid = posix.getpwnam('nobody');
      return this.gid = posix.getgrnam('nogroup');
    } catch (_error) {
      e = _error;
      this.err("I want to drop privileges to nobody/nogroup, but the unix user and group do not exist", e);
      return process.exit(1);
    }
  };

  YmSmtpStart.prototype.setupServer = function() {
    var rsync, sync;
    rsync = require('rsync');
    sync = new rsync().flags('ar').source("" + __dirname + "/project/server/").destination("" + __dirname + "/server/");
    return sync.execute((function(_this) {
      return function(error, code, cmd) {
        if (error != null) {
          _this.err('Failed to sync server configuration', error, code, cmd);
          process.exit(1);
        }
        return _this.debug(1, "Synced server configuration");
      };
    })(this));
  };

  YmSmtpStart.prototype.startHaraka = function() {
    var child, config, forever;
    forever = require('forever-monitor');
    config = {
      max: 3,
      args: ['--config', "" + __dirname + "/server/"],
      minUptime: 2000,
      spinSleepTime: 2000,
      logFile: "" + __dirname + "/logs/log.log",
      outFile: "" + __dirname + "/logs/log.out",
      errFile: "" + __dirname + "/logs/log.err",
      silent: true
    };
    if (this.debuglevel > 3) {
      config.silent = false;
    }
    child = new forever.Monitor("" + __dirname + "/node_modules/Haraka/bin/haraka", config);
    child.on('start', (function(_this) {
      return function(p, d) {
        return _this.debug(3, 'Haraka start'.blue, 'PID:', d.pid, 'FPID:', d.foreverPid);
      };
    })(this));
    child.on('stop', (function(_this) {
      return function(p) {
        return _this.debug(3, 'Haraka stopped'.blue);
      };
    })(this));
    child.on('restart', (function(_this) {
      return function() {
        return _this.debug(3, 'Haraka restart'.blue, 'PID:', child.childData.pid, 'FPID:', child.childData.foreverPid);
      };
    })(this));
    child.on('error', (function(_this) {
      return function(e) {
        return _this.err('Haraka error'.blue, e, "Check logfiles in logs/ to see what might have happened");
      };
    })(this));
    child.on('exit', (function(_this) {
      return function(c) {
        return _this.err('Haraka ended'.blue, "Check logfiles in logs/ to see what might have happened");
      };
    })(this));
    return child.start();
  };

  YmSmtpStart.prototype.debug = function() {
    var data, level;
    level = arguments[0], data = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (level <= this.debuglevel) {
      return console.error.apply(console, ['YmSmtpStart'.green].concat(__slice.call(data)));
    }
  };

  YmSmtpStart.prototype.err = function() {
    var data;
    data = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.debuglevel > 0) {
      return console.error.apply(console, ['YmSmtpStart'.red.bgWhite].concat(__slice.call(data)));
    }
  };

  return YmSmtpStart;

})();

new YmSmtpStart();


}).call(this);

//# sourceMappingURL=start.map