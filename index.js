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

  if(current_page==0){
    prev_page=0;
  }

  maria.query('SELECT count(*) as c FROM BOARD', function(err, rows, fields) {
    total = rows[0].c;
    total_page = Math.ceil(total/count_page);

    var sql;
    
    if (total < current_page*5 + 5){
      next_page = current_page;
      
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

  
  maria.query(sql, params, function(err, rows, fields) {
    if(!err) {
      res.redirect('/');
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});


router.post('/com_insert', jsonParser, function(req, res) {
  const date = new Date();

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const dateStr = year + '-' + month + '-' + day;

  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const timeStr = hours + ':' + minutes + ':' + seconds;


  const sql = 'INSERT INTO comments(c_writer, c_content, c_dt, c_num) VALUES(?,?,?,?)';
  
  
  const c_writer = req.body.c_writer;
  const c_content = req.body.c_content;
  const c_dt = dateStr + ' ' + timeStr;
  const c_num = req.body.c_num;
  const params = [c_writer, c_content, c_dt, c_num];


  maria.query(sql, params, function(err, rows, fields) {
    if(!err) {
      res.redirect(`/select?num=${c_num}`);
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});


router.get('/select', function(req, res) {
  if(req.query.num){
    var re = new Array(4);
    var n;

    sql = `SELECT * FROM BOARD WHERE num=${req.query.num}`;
    maria.query(sql, function(err, rows, fields) {
      n = rows[0].num;
      tmp = rows;
      if(!err) {
        sql = `SELECT count(*) as count FROM comments WHERE c_num=${n}`; //댓글 없을때
        maria.query(sql, function(err, rows, fields) {
          if(!err) {
            if(rows[0].count==0){
              res.render('select_board', { 
                title: 'Express',
                s_title: tmp[0].title,
                s_writer: tmp[0].writer,
                s_content: tmp[0].content,
                s_dt: tmp[0].dt,
                s_num: tmp[0].num,
                count: 0
              });
            }
            else{
              sql = `SELECT * FROM comments WHERE c_num=${n}`;  //댓글 있을때
              maria.query(sql, function(err, rows, fields) {
                if(!err) {
                  for (var i = 0; i < 4; i++) {
                    re[i] = new Array(rows.length);
                  }

                  for(var i=0; i<rows.length; i++){
                    re[0][i] = rows[i].c_writer;
                    re[1][i] = rows[i].c_content;
                    re[2][i] = rows[i].c_dt;
                    re[3][i] = rows[i].com_num;
                  }
                  
                  res.render('select_board', { 
                    title: 'Express',
                    s_title: tmp[0].title,
                    s_writer: tmp[0].writer,
                    s_content: tmp[0].content,
                    s_dt: tmp[0].dt,
                    s_num: tmp[0].num,
                    com: re,
                    count: rows.length
                  });

                } else {
                  console.log("err : " + err);
                  res.send(err);  // response send err
                }
              });
            }
          } else {
            console.log("err : " + err);
            res.send(err);  // response send err
          }
        });
      }
      else {
        console.log("err : " + err);
        res.send(err);  // response send err
      }
    });
  }
  else{
    var t = req.query.title;
    var w = req.query.writer;
    var d = req.query.dt;
    var re = new Array(4);
    var n;

    sql = `SELECT * FROM BOARD WHERE board.title='${t}' AND board.writer='${w}' AND board.dt='${d}'`;
    maria.query(sql, function(err, rows, fields) {
      n = rows[0].num;
      tmp = rows;
      if(!err) {
        sql = `SELECT count(*) as count FROM comments WHERE c_num=${n}`; //댓글 없을때
        maria.query(sql, function(err, rows, fields) {
          if(!err) {
            if(rows[0].count==0){
              res.render('select_board', { 
                title: 'Express',
                s_title: tmp[0].title,
                s_writer: tmp[0].writer,
                s_content: tmp[0].content,
                s_dt: tmp[0].dt,
                s_num: tmp[0].num,
                count: 0
              });
            }
            else{
              sql = `SELECT * FROM comments WHERE c_num=${n}`;  //댓글 있을때
              maria.query(sql, function(err, rows, fields) {
                if(!err) {
                  for (var i = 0; i < 4; i++) {
                    re[i] = new Array(rows.length);
                  }

                  for(var i=0; i<rows.length; i++){
                    re[0][i] = rows[i].c_writer;
                    re[1][i] = rows[i].c_content;
                    re[2][i] = rows[i].c_dt;
                    re[3][i] = rows[i].com_num;
                  }
                  
                  res.render('select_board', { 
                    title: 'Express',
                    s_title: tmp[0].title,
                    s_writer: tmp[0].writer,
                    s_content: tmp[0].content,
                    s_dt: tmp[0].dt,
                    s_num: tmp[0].num,
                    com: re,
                    count: rows.length
                  });

                } else {
                  console.log("err : " + err);
                  res.send(err);  // response send err
                }
              });
            }
          } else {
            console.log("err : " + err);
            res.send(err);  // response send err
          }
        });
      }
      else {
        console.log("err : " + err);
        res.send(err);  // response send err
      }
    });
  }
  
});



router.get('/com_delete', function(req, res) {
  var com_num = req.query.com_num;
  var num = req.query.num;

  maria.query(`DELETE FROM comments WHERE com_num=${com_num}`, function(err, rows, fields) {
    if(!err) {
      res.redirect(`/select?num=${num}`);
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

router.get('/delete', function(req, res) {
  var num = req.query.num;

  maria.query(`DELETE FROM board WHERE num=${num}`, function(err, rows, fields) {
    if(!err) {
      res.redirect('/');
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

module.exports = router;