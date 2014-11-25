class YmSmtpTest
	constructor:->
		@debuglevel=10
		@name='Youmagine SMTP - test  suite'
		require 'colors'
		@debug 1,"Starting #{@name} "
		@debug 1,"Running some basic tests agains localhost:25"
		@testNet()

	testNet:()=>
		net = require('net')
		HOST = '127.0.0.1'
		PORT = 25
		step = 1
		ok = true
		client = new net.Socket()
		client.on 'error', (err)=>
			@err 'Test new Failed: '+err.toString()
			process.exit 1
		client.connect PORT, HOST, (data...)=>
			@debug 1,'Connected',data
		client.on 'close',=>
			if ok
				@debug 1,'Connection closed'
			else
				@err 'Connection closed, but tests failed'
		client.on 'data', (data)=>
			@debug 1,'Received',data.toString().trim()
			switch step
				when 1
					if data.toString().match /220.*ESMTP.*Haraka.*ready/
						step=2
						@debug 1,'OK'
						client.write("quit\n");
					else
						@err "Failed to get proper server response"
				when 2
					if data.toString().match /221.*closing/
						step=3
						@debug 1,"Making connection succeeded"
					else
						@err "Failed to properly close connection to server"
			



	debug:(level,data...)=>
		if level<=@debuglevel
			console.error 'YmSmtpTest'.green,data...

	err:(data...)=>
		if @debuglevel>0
			console.error 'YmSmtpTest'.red.bgWhite,data...

new YmSmtpTest()
