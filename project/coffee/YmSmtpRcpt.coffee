class YmSmtpRcpt
	constructor:(haraka, next, connection, params)->
		@log=new YmSmtpLog(haraka).log
		connection.transaction.notes.ym=
			rcpt:params[0].toString()
			from:connection.transaction.mail_from.toString()
			ip:connection.remote_ip
			host:connection.remote_host
			uuid:connection.uuid
			parts:[]
			attachments:[]
			subject:null
			tasks:[]
			taskErrors:[]
			next:null

		# due to the async nature of nodeJS and the way we handle attachments, streams and the connection the final "next" call that is made in the queue fase should be deferred until all running
		# async tasks are ready. To do this we keep track of the tasks in an array on our ym notes. 

		# add a task to the stack
		connection.transaction.notes.ym.addTask= (object)=>
			len = connection.transaction.notes.ym.tasks.push object
			@log "Number of tasks is now: " + len
			return connection.transaction.notes.ym.tasks.indexOf object

		# remove the completed task from the stack, keep track of the tasks errors and if no more tasks are to be done check if we already have a final next() function to call
		connection.transaction.notes.ym.ready= (object,error=null)=>
			if error?
				taskErrors.push error
			i = connection.transaction.notes.ym.tasks.indexOf object
			@log("task ready:"+i)
			connection.transaction.notes.ym.tasks = connection.transaction.notes.ym.tasks.filter (o) -> o!=object
			@log "Number of tasks is now: " + connection.transaction.notes.ym.tasks.length
			if connection.transaction.notes.ym.tasks.length==0 and connection.transaction.notes.ym.next?
				connection.transaction.notes.ym.next()

		connection.transaction.notes.ym.setNext = (next)=>
			@log("Receiving final next() function")
			connection.transaction.notes.ym.next = next
			if connection.transaction.notes.ym.tasks.length==0
				connection.transaction.notes.ym.next()

		@log("New message ["+connection.transaction.notes.ym.uuid+"] from "+connection.transaction.notes.ym.from+" for "+connection.transaction.notes.ym.rcpt+" host: "+connection.transaction.notes.ym.ip)
		# If we want to somehow limit the recipient, from, ip etc we should do that here
		# for now we just log the information and move on to the queue where the magic happens
		# accept the recipient and allow the email to be delivered
		next(OK)
