var config = require('./server/config/config');
var app = require('./server/server');

app.listen(config.port);
console.log(`HabitTracker app listening on port ${config.port}!`);