const express = require('express')
const urlController = require('./../controllers/url_controller')
const protect = require('../middlewares/auth')

const urlRouter = express.Router()

urlRouter.route('/shorten/').post(protect, urlController.shorten)
urlRouter.route('/redirect/:code').get(protect, urlController.redirect)

module.exports = urlRouter
