var httpReq = require('request');
var webclient = {
    get: function (url, headers) {
        return this.send(url, {}, "GET", "", headers)
    },
    post: function (url, formData, headers) {
        return this.send(url, formData, "POST", "", headers)
    },
    put: function (url, formData) {
        return this.send(url, formData, "PUT")
    },
    send: function (url, formData, method, timeout, headers) {
        return new Promise(function (resolve, reject) {
            timeout = timeout || 30 * 1000
            var timeoutEventId
            var options = {
                url: url,
                method: method,
                json: true,
                body: formData
            };
            if (headers) {
                options['headers'] = headers
            }
            var hr = httpReq(options, function (error, response, data) {
                clearTimeout(timeoutEventId)
                if (error != null) {
                    reject(error)
                }
                else {
                    resolve(data)
                }
            })
            hr.on("timeout", function () {
                reject("请求超时")
                hr.abort()
            })
            timeoutEventId = setTimeout(function () {
                hr.emit('timeout', { message: 'have been timeout...' });
            }, timeout);
        })
    },
    sleep: function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

module.exports = webclient;