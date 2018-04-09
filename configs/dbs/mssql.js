const dbs =
{
    cytserp:{
        user: 'CYTSERP_r',
        password: '4B34E32D',
        server: '172.16.1.50',
        port: "523",
        database: 'CYTSERP',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    },
    spdb: {
        user: 'SparkleTour_w',
        password: 'S@p0a0r&k0l4e2T6our_w',
        server: '172.16.1.231',
        port: "6152",
        database: 'SparkleTourDB',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
}
module.exports = dbs;