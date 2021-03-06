var PeerConnection = require("peer-connection")
    , WriteStream = require("write-stream")
    , store = require("local-store")("peer-connection-demo")

    , RTCPeerConnection = require("../../index")

var pc = PeerConnection(RTCPeerConnection, {
    uri: "http://raynos.signal-channel-server.jit.su"
})

var token = setInterval(function () {
    var left = store.get("left id")

    if (left) {
        // console.log("left id", left)
        pc.createAnswer(left, function (err, answer) {
            store.set("right id", answer)
            // console.log("right id", answer)

            next()
        })

        clearInterval(token)
    }
}, 1000)

function next() {
    // console.log("creating stream")
    var stream = pc.connect("name")

    stream.write("hello world!")

    stream.pipe(WriteStream(function (chunk) {
        console.log("chunk", chunk)
    }))
}
