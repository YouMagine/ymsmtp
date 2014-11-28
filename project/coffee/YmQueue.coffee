exports.hook_queue = (next, connection)=>
	new YmQueue(next, connection)

class YmQueue
	constructor:(next, connection)->
		@data=connection.transaction.notes.ym;

		@log=new YmSmtpLog(this).log
		@fs= require('fs')
		@next=next
		emlFileName=__dirname.replace(/\/[^\/]+\/[^\/]+$/,'')+'/spool/'+connection.uuid+'.eml'
		ws = @fs.createWriteStream(emlFileName)
		@data.addTask(ws)
		ws.on('error',(err)=>
			return @deny("Failed to write to spool... sorry!")
			@data.ready(ws)
		)
		ws.once 'close',=>
			@log("Wrote #{emlFileName}")
			@data.ready(ws)
			

		connection.transaction.message_stream.pipe(ws);

		# note that information we parse is put in connection.transaction.notes.ym and there is already stuff in there from the rcpt phase
		
		@data.subject = connection.transaction.body.header.get('subject')

		# in the data parts we store everything that we find in the email body and subparts
		# note that this uses a recursive approach for getting mimeparts from the body and flattens this structure
		
		@parseBodyChildren(connection.transaction.body)

		

		# parse the email body parts and attachments
		# @log(connection.transaction.notes,1)

		
		
		# if we came this far we assume it worked
		@data.setNext(=>
			@log(@data);
			@ok;
		)
		
	parseBodyChildren:(body)=>
		o = {}
		o.text = body.bodytext.trim()
		o.size = o.text.length
		o.type = body.header.get('content-type').toLowerCase().replace('\n',' ').replace(/\s+/,' ').trim()
		# we do not need to keep certain types
		if o?.type.match 'multipart/alternative'
			o = null
		if o?.type.match 'multipart/mixed'
			o = null
		# other types to ignore?
		if o?
			@data.parts.push o
		for c in body.children
			@parseBodyChildren(c)
		return true

	deny:(message)=>
		if !message?
			message = "Sorry but that failed"
		@log message
		return @next(DENY,message);

	ok:(message)=>
		if !message?
			message = "That turned out quite well"
		@log message
		return @next(OK);