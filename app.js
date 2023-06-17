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

