// istanbul ignore file
require('./config')

const { knexSnakeCaseMappers } = require('objection')
const merge = require('lodash/merge')
const log = require('./lib/logger')

let parsedConnection
// Parse connection string and ensure SSL for production databases
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  const { parse } = require('pg-connection-string')
  parsedConnection = parse(process.env.DATABASE_URL)
  // Enable SSL for production databases (most managed services require it)
  if (process.env.NODE_ENV === 'production') {
    merge(parsedConnection, { ssl: { rejectUnauthorized: false } })
  }
}

module.exports = {
  client: 'pg',
  connection: parsedConnection || process.env.DATABASE_URL,
  log: {
    warn: msg => log.warn(msg),
    error: msg => log.error(msg),
    deprecate: msg => log.warn(msg),
    debug: msg => log.debug(msg)
  },
  asyncStackTraces: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
  ...knexSnakeCaseMappers()
}
