exports.errorHandler =  function (err, req, res, next) {
    let status = err.status || 500;
    let message = err.message || 'Something went wrong';

    return res.status(status).json({
        status: 'error',
        message: message
    })
}