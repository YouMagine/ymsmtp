# Server startup script
class YmSmtpStart
	require('colors');

	constructor:()->
		@debuglevel=10
		@name='Youmagine SMTP'
		# must be root
		if process.getuid()>1
			@err "You must be root to start #{@name}"
			process.exit(1);
		@debug 1,"Starting #{@name} "
		@checkUsers()
		@setupServer()
		@startHaraka()	

	checkUsers:=>
		posix = require('posix')
		try
			@uid=posix.getpwnam('nobody')
			@gid=posix.getgrnam('nogroup')
		catch e
			# do nothing 
			@err "I want to drop privileges to nobody/nogroup, but the unix user and group do not exist",e
			process.exit(1);


	setupServer:=>
		rsync = require('rsync');
		sync = new rsync().flags('ar').source("#{__dirname}/project/server/").destination("#{__dirname}/server/");
		sync.execute( (error, code, cmd)=>
			if error?
				@err 'Failed to sync server configuration',error,code,cmd
				process.exit(1);
			@debug 1,"Synced server configuration"
		)
    
	startHaraka:=>
		forever = require('forever-monitor');
		config=
			max:3 
			args:['--config',"#{__dirname}/server/"]
			minUptime:2000
			spinSleepTime:2000
			logFile:"#{__dirname}/logs/log.log"
			outFile:"#{__dirname}/logs/log.out"
			errFile:"#{__dirname}/logs/log.err"
			silent:true

		if @debuglevel>3
			config.silent = false

		child = new (forever.Monitor)("#{__dirname}/node_modules/Haraka/bin/haraka",config)
		child.on('start', (p,d)=>
			@debug 3,'Haraka start'.blue,'PID:',d.pid,'FPID:',d.foreverPid
		);
		child.on('stop', (p)=>
			@debug 3,'Haraka stopped'.blue
		);
		child.on('restart', ()=>
			@debug 3,'Haraka restart'.blue,'PID:',child.childData.pid,'FPID:',child.childData.foreverPid
		);
		child.on('error', (e)=>
			@err 'Haraka error'.blue,e,"Check logfiles in logs/ to see what might have happened";
		);
		child.on('exit', (c)=>
			@err 'Haraka ended'.blue,"Check logfiles in logs/ to see what might have happened";
		);
		child.start()

	debug:(level,data...)=>
		if level<=@debuglevel
			console.error 'YmSmtpStart'.green,data...

	err:(data...)=>
		if @debuglevel>0
			console.error 'YmSmtpStart'.red.bgWhite,data...

new YmSmtpStart()


