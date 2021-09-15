const http = require('http');
const express = require('express');
const router = require('./router');
const io = require('./socket');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

app.use(cors()); 
app.use(express.urlencoded({extended: false}));
app.use(express.json());

global.__homedir = __dirname;

router(app);
mongoose.connect('mongodb://localhost/nodjs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
    const server = http.createServer(app);
    server.listen(2021);
    io(server);
});



