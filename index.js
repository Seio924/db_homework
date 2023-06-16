var express = require('express');
const path = require('path');
var router = express.Router();
const bodyParser = require('body-parser');

// require maria.js 
const maria = require('./maria');

const jsonParser = bodyParser.json();
router.use(express.json()); 
router.use(express.urlencoded({ extended: false }));
router.use(express.static("views"));

/* GET home page. */
router.get('/', function(req, res, next) {
  var total;
  var total_page;
  var count_page = 5;
  var current_page = 0;
  var next_page = 0;
  var prev_page = 0;

  var re = new Array(4);
  for (var i = 0; i < 4; i++) {
    re[i] = new Array(5);
  }
  var req_n = Number(req.query.page);
  
  if(req_n){
    current_page = req_n;
  }

  next_page = current_page+1;
  prev_page = current_page-1;

  maria.query('SELECT count(*) as c FROM BOARD', function(err, rows, fields) {
    total = rows[0].c;
    total_page = Math.ceil(total/count_page);

    var sql;
    //console.log(total, current_page*5 + 5)
    if (total < current_page*5 + 5){
      console.log("1");
      sql = `SELECT * FROM BOARD LIMIT ${(current_page*5).toString()},${(total).toString()}`;
      maria.query(sql, function(err, rows, fields) {
        if(!err) {
          for(var i=0; i<total%count_page; i++){
            re[0][i] = rows[i].title;
            re[1][i] = rows[i].writer;
            re[2][i] = rows[i].content;
            re[3][i] = rows[i].dt;
          }
          res.render('board_ui', { 
            title: 'Express',
            count: total%count_page,
            c_page: current_page,
            row: re,
            p_num: 5*current_page,
            next: `/?page=${next_page}`,
            prev: `/?page=${prev_page}`
          });
          
        } else {
          console.log("err : " + err);
        }
      });
    }
    else{
      console.log("2");
      sql = `SELECT * FROM BOARD LIMIT ${(current_page*5).toString()},${(current_page*5 + 5).toString()}`;
      maria.query(sql, function(err, rows, fields) {
        if(!err) {
          for(var i=0; i<count_page; i++){
            re[0][i] = rows[i].title;
            re[1][i] = rows[i].writer;
            re[2][i] = rows[i].content;
            re[3][i] = rows[i].dt;
          }
          res.render('board_ui', { 
            title: 'Express',
            count: 5,
            c_page: current_page,
            row: re,
            p_num: 5*current_page,
            next: `/?page=${next_page}`,
            prev: `/?page=${prev_page}`
          });
          
        } else {
          console.log("err : " + err);
        }
      });
    }
  });

});

router.get('/write_board', function(req, res, next) {
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
  const date = new Date();

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const dateStr = year + '-' + month + '-' + day;

  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const timeStr = hours + ':' + minutes + ':' + seconds;


  const sql = 'INSERT INTO BOARD(title, writer, content, dt) VALUES(?,?,?,?)';
  
  const title = req.body.title;
  const writer = req.body.writer;
  const content = req.body.content;
  const dt = dateStr + ' ' + timeStr;
  const params = [title, writer, content, dt];

  console.log(title);
  maria.query(sql, params, function(err, rows, fields) {
    if(!err) {
      console.log(rows);
      //res.send(rows); // responses send rows
      res.redirect('/');
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
  //res.render('board_ui', { title: 'Express' });
});

router.get('/select', function(req, res) {
  maria.query('SELECT count(*) as c FROM BOARD', function(err, rows, fields) {
    if(!err) {
      console.log(rows[0].c);
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