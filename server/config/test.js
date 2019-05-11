module.exports = {
    accountActivationPageUrl: process.env.ACCOUNT_ACTIVATION_PAGE_URL,
    dbUrl: process.env.DB_TEST_URL,
    mail: {
        host: process.env.MAIL_TEST_HOST,
        port: process.env.MAIL_TEST_PORT,
        username: process.env.MAIL_TEST_USERNAME,
        password: process.env.MAIL_TEST_PASSWORD
    }
};