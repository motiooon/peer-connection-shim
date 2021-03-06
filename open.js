var header = require("header-stream")
    , Connection = require("signal-channel/connection")

    , emit = require("./utils/emit")
    , DataChannel = require("./dataChannel")

module.exports = open

function open(connection) {
    var configuration = connection._configuration
        , stream = Connection(configuration.uri, "/v1/relay")
        , mdm = configuration.mdm

    stream = header(stream)

    stream.setHeader("remote", connection.remoteDescription)
    stream.setHeader("local", connection.localDescription)
    stream.writeHead()

    mdm.on("connection", onConnection)

    mdm.pipe(stream).pipe(mdm)

    stream.on("connect", onConnect)

    stream.on("end", onEnd)

    configuration.mdm = mdm
    configuration.stream = stream
    configuration.signal.emit("stream", stream)

    function onConnect() {
        connection.readyState = "active"
        emit(connection, "statechange")
        emit(connection, "open")
    }

    function onEnd() {
        connection.readyState = "closed"
        emit(connection, "statechange")
    }

    function onConnection(stream) {
        emit(connection, "datachannel", {
            channel: new DataChannel(stream, {
                remote: true
            })
        })
    }
}
