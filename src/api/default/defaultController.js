const { successed, failed } = require('../../functions/response')

class defaultController {

    async Check(req, res) {
        successed(res, { v: 'dev' })

    }
}

module.exports = new defaultController()