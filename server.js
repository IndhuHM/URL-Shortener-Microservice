require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require("valid-url");
 const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Basic Configuration


const port = process.env['PORT'] || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env['DB_URI'], { useNewUrlParser: true,useUnifiedTopology : true });
  const dataBase = mongoose.connection;
  dataBase.on('error', console.error.bind(console, 'connection error:'));
  dataBase.once('open', function() {
    console.log("Connected to database.");
  });

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const shortUrl = mongoose.model("shortURL", urlSchema);



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:new', function(req, res) {
   shortUrl.find({short_url: req.params.new}).then(function (docs) {
    res.redirect(docs[0].original_url);
  });
});

app.post("/api/shorturl/", function (req, res) {
  const url = validUrl.isWebUri(req.body.url);
  if (url != undefined) {
    let id = shortId.generate();

    let newUrl = new shortUrl({
      original_url: url,
      short_url: id,
    });
    newUrl.save(function (err, doc) {
      if(err) return console.error(err);
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    });
  }
  else {
    res.json({"error":"invalid URL"});
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
