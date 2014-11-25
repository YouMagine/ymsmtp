class YmSmtpLog
	_ = require('lodash')
	constructor:(haraka)->
		@haraka=haraka
		@fs=require('fs')
		@util=require('util');
		@logfile=__dirname.replace(/\/[^\/]+\/[^\/]+$/,'')+"/logs/ymsmtp.log";

	log:(data,maxDepth=10)=>
		if typeof data=='string'
			@out(data,1)
		else	
			@out('Dump:'+@dump(data,maxDepth),1)

	out:(string,level=1)=>
		@fs.appendFile(@logfile,"[#{level}] "+new Date().toString()+' '+string.toString().trim()+"\n",(err)=>
			if (err)
				@haraka.logcrit err
  		)

	dump:(o,maxDepth,path='',objects=[],depth=0)=>
		if (maxDepth==depth)
			return '';
		pad = '~'
		out = ''
		toDump = {};
		for k,v of o
			type = typeof v
			switch type
				when 'string'
					out+="\n"+Array(depth+1).join(pad)+(type+": "+path+k+'['+v+']');
				when 'function'
					out+="\n"+Array(depth+1).join(pad)+(type+": "+path+k+'['+v.toString().split('\n')[0].replace( /{.*/gm ,'' )+']');
				when 'boolean'
					out+="\n"+Array(depth+1).join(pad)+(type+": "+path+k+'['+v+']');
				when 'number'
					out+="\n"+Array(depth+1).join(pad)+(type+": "+path+k+'['+v+']');
				when 'undefined'
					out+="\n"+Array(depth+1).join(pad)+(type+": "+path+k+'['+v+']');
				when 'object'
					if (_.indexOf objects,v) ==-1
						out+="\n"+Array(depth+1).join(pad)+"New "+type+": "+path+k+'{'+_.size(v)+'}';
						objects.push(v)
						out+=@dump(v,maxDepth,path+k+'.',objects,depth+1);
					else
						out+="\n"+Array(depth+1).join(pad)+"Seen "+type+": "+path+k+'{'+_.size(o[k])+'}';
				else
					out+=("\n"+Array(depth+1).join(pad)+"???->"+type+": "+path+k+'[NA]');
		
		return out+"\n";
		