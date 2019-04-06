module.exports = {
  port: process.env.PORT,
  mail: {
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD
  },
  dbUrl: process.env.DB_URL
};