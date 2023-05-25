const express = require('express')

var app = express();

const maria = require('./maria');
maria.connect();
