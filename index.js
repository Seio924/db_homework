var express = require('express');
const path = require('path');
var router = express.Router();
const bodyParser = require('body-parser');

// require maria.js 
const maria = require('./maria');

const jsonParser = bodyParser.json();
router.use(express.json()); 
router.use(express.urlencoded({ extended: false }));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*
router.get('/create', function(req, res) {
  maria.query('CREATE TABLE BOARD ('
	+'TITLE VARCHAR(200) NOT NULL,'
	+'NAME VARCHAR(200) NULL ,'
  +'CONTENTS VARCHAR(200) NULL ,'
	+'PRIMARY KEY (TITLE, NAME));', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});
*/

router.get('/drop', function(req, res) {
  maria.query('DROP TABLE BOARD', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
      
      
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});



router.post('/insert', jsonParser, function(req, res) {

  const sql = 'INSERT INTO BOARD VALUES(?,?,?)';
  
  const title = req.body.title;
  const writer = req.body.writer;
  const content = req.body.content;
  const params = [title, writer, content];

  console.log(title);
  maria.query(sql, params, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

router.get('/select', function(req, res) {
  maria.query('SELECT * FROM BOARD', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

router.get('/update', function(req, res) {
  maria.query('UPDATE DEPARTMENT SET NAME="UPD ENG" WHERE DEPART_CODE=5001', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

router.get('/delete', function(req, res) {
  maria.query('DELETE FROM BOARD WHERE DEPART_CODE=5001', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

module.exports = router;