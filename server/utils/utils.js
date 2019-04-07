exports.getJoiErrorMessages = function(err) {
    return err.details.map(err => err.message);
}