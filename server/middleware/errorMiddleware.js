const winston = require('../config/winston');

exports.errorHandler =  function (err, req, res, next) {
    let status = err.status || 500;
    let response = {
        status: null
    };

    if (err.name == "HttpClientError") {
        response.status = 'fail';
        response.data = {};
        
        if (err.message instanceof Array) {
            response.data.errors = err.message;
        }
        else {
            response.data.errors = [err.message];
        }
    }
    else {
        response.status = 'error',
        response.message = 'Something went wrong';
    }

    // winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack || e}`);

    winston.error({
        status: err.status || 500,
        errMessage: err.message,
        requestUrl: req.originalUrl,
        requestMethod: req.method,
        ip: req.ip,
        stackTrace: err.stack || e
    })

    return res.status(status).json(response)
}