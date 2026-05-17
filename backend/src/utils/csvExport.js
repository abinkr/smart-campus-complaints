import { stringify } from 'csv-stringify'
import { logger } from './logger.js'

export const streamToCSV = (rows, res, columns = null) =>
  new Promise((resolve, reject) => {
    const stringifier = stringify({
      header: true,
      columns: columns ?? (rows[0] ? Object.keys(rows[0]) : []),
    })

    stringifier.on('error', (err) => {
      logger.error({ err }, 'CSV streaming failed')
      reject(err)
    })

    res.on('finish', resolve)
    res.on('error', reject)

    stringifier.pipe(res)

    for (const row of rows) {
      stringifier.write(row)
    }

    stringifier.end()
  })
