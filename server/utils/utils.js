exports.getJoiErrorMessages = function(err) {
    return err.details.map(err => err.message);
};

exports.setErrorMessages = function(errors, errorMessages) {
    let errorTypes = errorMessages.map(err => err.errType);
    
    errors.forEach(err => {
        let index = errorTypes.indexOf(err.type);
        if (index != -1) {
            err.message = errorMessages[index].message;
        }
    });

    return errors;
};