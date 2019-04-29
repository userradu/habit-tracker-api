const winston = require('../config/winston');
const utils = require('../utils/utils');

exports.errorHandler = function (err, req, res, next) {
    let errorDetails = getErrorDetails(err);
    
    winston.error({
        date: new Date(),
        status: errorDetails.status,
        errMessage: errorDetails.message,
        requestUrl: req.originalUrl,
        requestMethod: req.method,
        ip: req.ip,
        stackTrace: err.stack
    })

    return res.status(errorDetails.status).json({
        error: errorDetails.message
    })
}

function getErrorDetails(err) {
    let errorDetails = {
        status: null,
        message: null
    }

    if (err.isJoi) {
        errorDetails.status = 400;
        errorDetails.message = utils.getJoiErrorMessages(err);
    }
    else if (err.name == "HttpError") {
        errorDetails.status = err.status;
        errorDetails.message = err.message;
    }
    else {
        errorDetails.status = 500;
        errorDetails.message = 'Something went wrong';
    }

    return errorDetails;
}