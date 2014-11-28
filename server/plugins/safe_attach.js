var fs = require('fs');
 
// Bind to receiving of data
exports.hook_data = function( next, connection, params ) {
 
  var haraka = this,
      uid = connection.transaction.uuid;
 
  connection.transaction.notes.attachments = {};
 
  // Make sure body gets parsed
  connection.transaction.parse_body = 1;
 
  var id = 1;
 
  // Start
  function start( content_type, filename) {
 
    haraka.loginfo("Saving Attachment: " + filename);
    var currentAttachment = '/tmp/' + uid + '-' + (filename || (id++ + '.txt'));
    connection.transaction.notes.attachments[filename] = currentAttachment;
    connection.transaction.notes.current_stream = fs.createWriteStream( currentAttachment );
 
  }
 
  // Accumulate attachment data
  function data( buf ) {
    haraka.logdebug("write data");
    if ( connection.transaction.notes.current_stream &&
        connection.transaction.notes.current_stream.writable ) {
      // haraka.loginfo("Saving " + buf.length + " bytes");
      connection.transaction.notes.current_stream.write( buf );
    }
  }
 
  // End
  function end() {
    haraka.loginfo("End of attachment");
    if ( connection.transaction.notes.current_stream ) {
      connection.transaction.notes.current_stream.on('close', function () {
        delete connection.transaction.notes.current_stream;
      });
      connection.transaction.notes.current_stream.destroySoon();
    }
  }
 
  // Bind attachment listeners
  connection.transaction.attachment_hooks( start, data, end );
 
  // Continue with email
  next();
}
 
 
exports.hook_data_post = function (next, connection) {
  connection.loginfo("data post");
  if (connection.transaction.notes.current_stream) {
    connection.transaction.notes.current_stream.on('close', function () {
      next();
    });
  }
  else {
    next();
  }
}