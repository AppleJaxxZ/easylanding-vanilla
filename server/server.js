const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { jwtStrategy } = require('./config/passport');
const passport = require('passport');

const routes = require('./routes/index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;
// db

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB Error => ', err));

// middlewares
app.use(express.static('public'));
app.use(express.json({ limit: '5mb' }));
app.use(cors());
// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// autoload routes
// readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)));
app.use(routes);

// listen

console.log(port);
app.listen(port, () => console.log(`Server is running on port ${port}`));
