let app = require('./index.js').app;

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("The application is running at http://%s:%s", host, port)
});
