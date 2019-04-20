exports.errorHandler =  function (err, req, res, next) {
    let status = err.status || 500;
    let response = {
        status: null,
        data: {}
    };

    if (err.name == "HttpClientError") {
        response.status = 'fail';
        
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

    return res.status(status).json(response)
}