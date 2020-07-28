const express = require('express')
const http = require('http')

// Declaration PART: express
const app = express()
const server = http.createServer(app)

let _liveness = false

/**
 * @params {boolean} flag
 * 
 */
exports.setLiveness = (flag = true) => {
  _liveness = flag
}

/**
 * 
 */
exports.getLiveness = _ => {
  return _liveness
}

exports.start = ({db, port = 9110}) => {
  // todo - should handle reject
  return new Promise(( resolve, _ ) => {
    app.get("/", (_, res) => {
      res.send('It works!')
    })

    app.get("/liveness", (_, res) => {
      const status = _liveness ? 200 : 503
      const message = _liveness ? "working" : "not working now"
      
      res.status(status).send(message)
    })

    app.get("/metrics", (_, res) => {
      res.send( db.metrics )
    })

    server.listen( port, _ => {
      console.log(`REST server started on port ${port}`)
      resolve()
    })
  })
}

exports.stop = _ => {
  // todo - should handle reject
  return new Promise((resolve, _) => {
    server.close()
    server.on('close', _ => {
      console.log('server closed')
      resolve()
    })
  })
}
