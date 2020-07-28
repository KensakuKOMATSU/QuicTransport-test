// const client = require('prom-client')
const fetch = require('node-fetch')
const { snakeCase } = require('snake-case')
const RestServer = require('./rest-server')

const LOG_PREFIX='CONSUMER_STATS-'

const GAUGES = {
  "InboundVideo": [
    "bytesReceived",
    "firCount",
    "framesDecoded",
    "nackCount",
    "packetsLost",
    "packetsReceived",
    "pliCount",
    "qpSum"
  ],
  "InboundAudio": [
    "bytesReceived",
    "fecPacketsReceived",
    "packetsLost",
    "packetsReceived",
    "jitter",
  ],
  "OutboundVideo": [
    "packetsSent",
    "bytesSent",
    "retransmittedPacketsSent",
    "retransmittedBytesSent",
    "totalEncodedBytesTarget",
    "framesEncoded",
    "qpSum",
    "totalEncodeTime",
    "totalPacketSendDelay",
    "nackCount",
    "firCount",
    "pliCount",
  ],
  "OutboundAudio": [
    "packetsSent",
    "bytesSent",
    "retransmittedPacketsSent",
    "retransmittedBytesSent",
  ]
}

class StatsDB {
  static create(opts) {
    const db = new StatsDB( opts )
    const port = 9110
    RestServer.start({db, port})
    return db
  }

  constructor({pushgw, job, instance}) {
    // this.register = client.register
    // client.collectDefaultMetrics({ register: this.register })
    this._logPrefix = LOG_PREFIX
    this._pushgw = pushgw
    this._instance = instance
    this._job = job
    this._gauges = new Map()

    // this._setupGauges()
  }

  get pushgw() {
    return this._pushgw
  }

  get instance() {
    return this._instance
  }

  get metrics() {
    return this.register.metrics()
  }

  get liveness() {
    return RestServer.getLiveness()
  }

  set liveness(flag = true) {
    RestServer.setLiveness(this._liveness)
  }

  /**
   * @params {String} text
   */
  isStats = text => {
    return text.startsWith(this._logPrefix)
  }

  /**
   * @params {String} text
   */
  add = async text => {
    const _text = text.substring(this._logPrefix.length)
    const obj = JSON.parse(_text)
    return await this._add(obj)
  }

  /**
   *
   * @params {Object} obj
   * @params {string} obj.kind       - e.g. `InboundAudio`
   * @params {string} obj.peerId     - e.g. '4gzz3c1v'
   * @params {string} obj.consumerId - e.g. '40d58a46-f286-4550-9f2f-fe8890f44992'
   *
   * @private
   */
  _add = async obj => {
    const {
      name, peerId, consumerId, producerId, stats
    } = obj

    if(
        name === 'InboundVideo'
      || name === 'InboundAudio'
      || name === 'OutboundVideo'
      || name === 'OutboundAudio'
    ) {
      let labels
      switch( name ) {
        case 'InboundVideo':
        case 'InboundAudio':
          labels = { peerId, consumerId }
          break
        case 'OutboundVideo':
        case 'OutboundAudio':
          labels = { peerId, producerId }
          break
        default:
          // never come here
          labels = {}
          break;
      }
      const _name = snakeCase( name )

      const _stats = Object.entries(stats)
        .filter( ([key, val]) => (
          !isNaN(val)
        ))
        .map( ([key, val]) => {
          const _key = snakeCase( key )
          const __key = `${_name}_${_key}`

          return { name: __key, val }
        })

      return await this._sendPushgw( _stats, labels )
        .catch( err => console.error( err ))
    }
  }

  _sendPushgw = async (_stats, labels) => {
    const _id = labels.consumerId || labels.producerId
    const _instance = `${this._instance}-${_id}`
    const url = `${this.pushgw}/metrics/job/${this._job}/instance/${_instance}`
    const method = "POST"
    const _labels = Object
      .entries( labels )
      .map( ([ key, val ]) => {
        return `${key}="${val}"`
      })
    const body = _stats.map( ({name, val}) => (
      [
        `#TYPE ${name} gauge`,
        `#HELP ${name}`,
        `${name}{${_labels}} ${val}`, "\n" ].join("\n")
    )).join("\n")

    return await fetch( url, { method, body } )
      .then( async res => {
        const text = await res.text()
        return `${res.status} - ${text}`
      }).catch( err => {
        throw err
      })
  }

  _setupGauges = _ => {
    const labelNames = ['peerId', 'producerId', 'consumerId']

    Object.entries(GAUGES).forEach(( [key, arr] ) => {
      const _key = snakeCase( key )
      arr.forEach( prop_name => {
        const _prop_name = snakeCase( prop_name )
        const _name = `${_key}_${_prop_name}`
        // const g = new client.Gauge({
        //   name: _name,
        //   help: _name.split("_").join(" "),
        //   labelNames
        // })
        // this._gauges.set( _name, g )
      })
    })
  }
}

module.exports = StatsDB
