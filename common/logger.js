// const log4js = require('log4js');
// log4js.configure({
//     appenders: {
//         console: { type: 'console' },
//         file_conn: { type: 'datefile', filename: "../logs/logger_connect", "pattern": "-yyyy-MM-dd.log", "alwaysIncludePattern": true },
//         file_product: { type: 'datefile', filename: "../logs/logger_product", "pattern": "-yyyy-MM-dd.log", "alwaysIncludePattern": true },
//         file_udesk: { type: 'datefile', filename: "../logs/logger_udesk", "pattern": "-yyyy-MM-dd.log", "alwaysIncludePattern": true }
//     },
//     categories: {
//         default: { appenders: ['console'], level: 'debug' },
//         file_conn: { appenders: ['file_conn'], level: 'debug' },
//         file_product: { appenders: ['file_product'], level: 'debug' },
//         file_udesk: { appenders: ['file_udesk'], level: 'debug' }
//     }
// })
// const logger =
//     {
//         conn: log4js.getLogger('file_conn'),
//         product: log4js.getLogger('file_product'),
//         udesk: log4js.getLogger('file_udesk')
//     }
// module.exports = logger