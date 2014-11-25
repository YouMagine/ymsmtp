#!/usr/bin/node
(function() {
var YmSmtpTest,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

YmSmtpTest = (function() {
  function YmSmtpTest() {
    this.err = __bind(this.err, this);
    this.debug = __bind(this.debug, this);
    this.testNet = __bind(this.testNet, this);
    this.debuglevel = 10;
    this.name = 'Youmagine SMTP - test  suite';
    require('colors');
    this.debug(1, "Starting " + this.name + " ");
    this.debug(1, "Running some basic tests agains localhost:25");
    this.testNet();
  }

  YmSmtpTest.prototype.testNet = function() {
    var HOST, PORT, client, net, ok, step;
    net = require('net');
    HOST = '127.0.0.1';
    PORT = 25;
    step = 1;
    ok = true;
    client = new net.Socket();
    client.on('error', (function(_this) {
      return function(err) {
        _this.err('Test new Failed: ' + err.toString());
        return process.exit(1);
      };
    })(this));
    client.connect(PORT, HOST, (function(_this) {
      return function() {
        var data;
        data = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.debug(1, 'Connected', data);
      };
    })(this));
    client.on('close', (function(_this) {
      return function() {
        if (ok) {
          return _this.debug(1, 'Connection closed');
        } else {
          return _this.err('Connection closed, but tests failed');
        }
      };
    })(this));
    return client.on('data', (function(_this) {
      return function(data) {
        _this.debug(1, 'Received', data.toString().trim());
        switch (step) {
          case 1:
            if (data.toString().match(/220.*ESMTP.*Haraka.*ready/)) {
              step = 2;
              _this.debug(1, 'OK');
              return client.write("quit\n");
            } else {
              return _this.err("Failed to get proper server response");
            }
            break;
          case 2:
            if (data.toString().match(/221.*closing/)) {
              step = 3;
              return _this.debug(1, "Making connection succeeded");
            } else {
              return _this.err("Failed to properly close connection to server");
            }
        }
      };
    })(this));
  };

  YmSmtpTest.prototype.debug = function() {
    var data, level;
    level = arguments[0], data = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (level <= this.debuglevel) {
      return console.error.apply(console, ['YmSmtpTest'.green].concat(__slice.call(data)));
    }
  };

  YmSmtpTest.prototype.err = function() {
    var data;
    data = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.debuglevel > 0) {
      return console.error.apply(console, ['YmSmtpTest'.red.bgWhite].concat(__slice.call(data)));
    }
  };

  return YmSmtpTest;

})();

new YmSmtpTest();


}).call(this);

//# sourceMappingURL=test.map