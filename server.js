const express = require('express');
const Bourne = require('Bourne');
const path = require('path');
const logger = require('morgan');

var app = express();
var posts = new Bourne('posts.json');
var comments = new Bourne('comments.json');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static('public'));

app.get('/posts', function (req, res) {
  posts.find(function (err, results) {
    res.json(results);
  });
});

app.post('/posts', function (req, res) {
  posts.insert(req.body, function (err, result) {
    res.json(result);
  });
});

app.get('/*', function (req, res) {
  posts.find(function (err, results) {
    res.render('index.ejs', {
      posts: JSON.stringify(results)
    });
  });
});

app.listen(3000);
