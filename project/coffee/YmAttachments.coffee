exports.hook_data = (next, connection)=>
	new YmAttachment(next, connection)


class YmAttachment
	constructor:(next, connection)->
		@connection=connection;
		@log=new YmSmtpLog(this).log
		@fs= require('fs')
		@next=next
		@connection.transaction.parse_body = 1
		@data=connection.transaction.notes.ym
		@connection.transaction.attachment_hooks((ct, fn, body, stream)=>@attachmentStart(ct, fn, body, stream)) 
		@next();


	attachmentStart:(contentType, fileName, body, stream)=>
		# Apply backpressure on the connection during filestream
		stream.connection = @connection
		stream.pause();
		@log("Getting attachment #{fileName}")
		path=__dirname.replace(/\/[^\/]+\/[^\/]+$/,'')+'/spool/'+@connection.uuid+'.'+@data.attachments.length+'.att'
		o = {}
		o.filename = fileName
		o.type = contentType
		o.path = path
		o.saved = null
		@data.attachments.push o

		ws = @fs.createWriteStream(path);
		@data.addTask(ws)
		ws.on('close',=>
			@log("Saved attachment #{fileName} to #{path}")
			o.saved = true
			@data.ready(ws)
			# todo: add stat info (size)
		)
		ws.on('error',(err)=>
			@log("Failed to write attachment #{fileName}")
			o.saved = false;
			@data.ready(ws)
		)
		stream.pipe(ws);
		stream.resume();

		
		

    
  


