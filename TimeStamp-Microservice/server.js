// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/timestamp/", (req, res) => {
  res.json({ unix: Date.now(), utc: new Date().toUTCString() });
});

app.get('/api/timestamp', (req, res) => {
  res.json({
    unix: Date.now(),
    utc: Date()
  })
})

app.get('/api/timestamp/:date_string', (req, res, next) => {
  req.date_string = /\d{5,}/.test(req.params.date_string) ? parseInt(req.params.date_string) : req.params.date_string
  next()
}, (req, res) => {
  const date = new Date(req.date_string)

  if(date.toString() === "Invalid Date") {
    res.json({error: "Invalid Date"})
  } else {
    res.json({unix: date.valueOf(), utc: date.toUTCString()})
  }
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
