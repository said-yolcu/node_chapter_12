var net = require('net')
var port = 4000
var conn

var retryInterval = 1000
var retriedTimes = 0
var maxRetries = 10

var quitting = false


// below line returns to the old mode
process.stdin.resume();

(function connect() {

    function reconnect() {
        if (retriedTimes >= maxRetries) {
            throw new Error('Max retries have benn exceeded, I give up')
        }
        retriedTimes += 1
        setTimeout(connect, retryInterval)
    }

    conn = net.createConnection(port)

    conn.on('connect', () => {
        retriedTimes = 0
        console.log('connected to server')
    })

    conn.on('error', err => {
        console.log(`Error in connection: ${err}`)
    })

    conn.on('close', () => {
        if (!quitting) {
            console.log('connection got closed, will try to reconnect')
            reconnect()
        }
    })

    conn.pipe(process.stdout, { end: false })
    //process.stdin.pipe(conn)
    /*
    I don't get why we commented out process.stdin.pipe(conn) and write to conn in 
    process.stdin data event listener
    */
}())

process.stdin.on('data', data => {
    if (data.toString().trim().toLowerCase() === 'quit') {
        quitting = true
        console.log('quitting...')
        conn.end()
        process.stdin.pause()
    } else {
        conn.write(data)
    }
})