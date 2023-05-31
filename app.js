const express = require('express')
var app = express();
const indexRouter = require('./index');

const maria = require('./maria');

maria.connect(function(err){
    if (err) throw err;
    console.log('Connected')
});

app.use('/', indexRouter);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

app.listen(3000, ()=>{
    console.log('서버 실행 중');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/post', (req, res) => {
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
/*
const info = {
    "name": "s",
    "email": "s",
    "age" : 1
};


var sql = 'INSERT INTO users2(user_name, user_email, user_age) VALUES(?,?,?)';
var params = [info['name'], info['email'], info['age']]
maria.query(sql, params, function(err, rows, fields){
    if(err){
        console.log(err);
    } else{
        console.log(rows.name);
    }
});
*/

//maria.end();