module.exports = {
  port: process.env.PORT,
  gmail: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD
  },
  dbUrl: process.env.DB_URL
};