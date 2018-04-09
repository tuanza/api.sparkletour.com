module.exports = function () {
    this.code = 0
    this.message = ""
    this.data = ""
    this.succ = function (data, message) {
        this.code = 0
        this.message = message || ""
        this.data = data
    }
    this.error = function (message, code) {
        this.code = code || -1
        if (typeof message == 'object') {
            this.message = JSON.stringify(message)
        }
        else {
            this.message = message || ''
        }
        this.data = ''
    }
}