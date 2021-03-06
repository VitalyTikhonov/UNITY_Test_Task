const express = require('express');
const mongoose = require('mongoose');

const { PORT, DATABASE_ADDRESS } = require('./configs/config');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');

mongoose.connect(DATABASE_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Сервер запущен, порт: ${PORT}`);
});
