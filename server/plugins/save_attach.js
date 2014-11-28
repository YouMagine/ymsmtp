exports.hook_data = function (next, connection) {
    // enable mail body parsing
    connection.transaction.parse_body = 1;
    connection.transaction.attachment_hooks(
        function (ct, fn, body, stream) {
            start_att(connection, ct, fn, body, stream)
        }
    );
    next();
}

function start_att (connection, ct, fn, body, stream) {
    connection.loginfo("Got attachment: " + ct + ", " + fn);
    connection.transaction.notes.attachment_count++;

    stream.connection = connection; // Allow backpressure
    stream.pause();

    var tmp = require('tmp');
    var fs = require('fs');

    tmp.file(function (err, path, fd) {
        connection.loginfo("Got tempfile: " + path + " (" + fd + ")");
        var ws = fs.createWriteStream(path);
        stream.pipe(ws);
        stream.resume();
        ws.on('close', function () {
            connection.loginfo("End of stream reached");
            fs.fstat(fd, function (err, stats) {
                connection.loginfo("Got data of length: " + stats.size);
                // Close the tmp file descriptor
                fs.close(fd, function(){});
            });
        });
    });
}