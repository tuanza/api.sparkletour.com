const api_url = "https://api.lushu.com"
const token = { "Authorization": "Token 584aa4c0ee0c11e7ab31525461a4d37e" }
const webclient = require('../../common/webclient')
var dao = {
    findTrip: async function (q, start, count) {
        var url = api_url + "/trip/published/find/?q=" + q
        if (start) {
            url += "&start=" + start
        }
        if (count) {
            url += "&count=" + count
        }
        var res = await webclient.get(url, token)
        return res
    },
    getTrip: async function (id) {
        var url = api_url + "/trip/published/" + id + "/"
        var res = await webclient.get(url, token)
        return res
    },
    getTripDays: async function (id, days) {
        var url = api_url + "/trip/published/" + id + "/day/batch/"
        var res = await webclient.post(url, days, token)
        return res
    },
    getTripAccomadation: async function (id, tripAccomadations) {
        var url = api_url + "/trip/published/" + id + "/accomadation/batch/"
        var res = await webclient.post(url, { "tripAccomadations": tripAccomadations }, token)
        return res
    },
    getTripPOI: async function (id, tripPois) {
        var url = api_url + "/trip/published/" + id + "/poi/batch/"
        var res = await webclient.post(url, tripPois, token)
        return res
    },
    getTripActivity: async function (id, tripActivities) {
        var url = api_url + "/trip/published/" + id + "/activity/batch/"
        var res = await webclient.post(url, { "tripActivities": tripActivities }, token)
        return res
    },
    getTripLongTransit: async function (id, tripLongTransits) {
        var url = api_url + "/trip/published/" + id + "/long-transit/batch/"
        var res = await webclient.post(url, { "tripLongTransits": tripLongTransits }, token)
        return res
    },
    getTripTransit: async function (id, tripTransits) {
        var url = api_url + "/trip/published/" + id + "/transit/batch/"
        var res = await webclient.post(url, tripTransits, token)
        return res
    },
    getTripQuote: async function (id) {
        var url = api_url + "/trip/published/" + id + "/quote/"
        var res = await webclient.get(url, token)
        return res
    }
}
module.exports = dao