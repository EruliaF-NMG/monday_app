require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes');

const { DATABASE_URL: mongoUri } = process.env;
const { PORT: port } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(routes);

// Database Connection URL
mongoose.Promise = global.Promise;
mongoose.connect(mongoUri,{
  autoIndex: true,
}).then(()=>{
  console.log("Connected to MongoDB");
})
.catch((error)=>{
  console.log("Couldn't connect to MongoDB",error);
})


app.listen(port, () => {
  console.log(`Transform text integration listening on port ${port}`)
});

module.exports = app;
