module.exports = {
    dbUrl: process.env.DB_URL,
    mail: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD
    }
};