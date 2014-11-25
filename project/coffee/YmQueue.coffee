exports.hook_queue = (next, connection)=>
	new YmQueue(next, connection)

class YmQueue
	constructor:(next, connection)->
		@log=new YmSmtpLog(this).log
		@fs= require('fs')
		ws = @fs.createWriteStream(__dirname.replace(/\/[^\/]+\/[^\/]+$/,'')+'/spool/'+connection.uuid+'.eml')
		ws.on('error',(err)=>
			@log "Failed to write to spool"
			return next(DENY,"Failed to write to spool... sorry!");
		)
		ws.once 'close',=>
			return next(OK)
		connection.transaction.message_stream.pipe(ws);
		
		
