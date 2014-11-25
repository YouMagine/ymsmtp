# rcpt_to.ymsmtp
# documentation via: haraka -c /home/marius/Development/ymsmtp/project/server -h plugins/rcpt_to.ymsmtp
# Put your plugin code here
# type: `haraka -h Plugins` for documentation on how to create a plugin
exports.hook_rcpt = (next, connection, params) ->
	new YmSmtpRcpt(this, next, connection, params)
