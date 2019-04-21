const appRoot = require('app-root-path');
const path = require("path");
const fs = require("fs");
const winston = require('winston');
require('winston-daily-rotate-file');

const logDirectory = path.resolve(`${appRoot}`, "logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const options = {
    file: {
        filename: path.resolve(logDirectory, '%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
    },
    console: {
        level: 'debug',
        json: false,
        colorize: true
    }
};

const logger = winston.createLogger({
    transports: [
        new (winston.transports.DailyRotateFile)(options.file),
        new winston.transports.Console(options.console)
    ]
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

module.exports = logger;
