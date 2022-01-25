const { Router } = require('express')
const defaultController = require('./defaultController')
const route = Router()

route.get('/check',
    defaultController.Check
)

module.exports = route;