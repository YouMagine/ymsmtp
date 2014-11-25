class YmSmtpRcpt
	constructor:(haraka, next, connection, params)->
		@log=new YmSmtpLog(haraka).log
		@data=
			rcpt:params[0].toString()
			from:connection.transaction.mail_from.toString()
			ip:connection.remote_ip
			host:connection.remote_host
			uuid:connection.uuid
		@log("New message ["+@data.uuid+"] from "+@data.from+" for "+@data.rcpt+" host: "+@data.ip)
		# If we want to somehow limit the recipient, from, ip etc we should do that here
		# for now we just log the information and move on to the queue where the magic happens
		next()
