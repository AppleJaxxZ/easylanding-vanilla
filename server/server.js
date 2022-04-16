// const express = require('express');
// const bodyParser = require('body-parser');
// const path = require('path');
// const app = express();
// const port = process.env.PORT || 5000;
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.get('/api/hello', (req, res) => {
//   res.send({ express: 'Hello From Expressss' });
// });
// app.post('/api/world', (req, res) => {
//   res.send(
//     `I received your POST request. This is what you sent me: ${req.body.post}`
//   );
// });
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));

//   app.get('*', function (req, res) {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
//   });
// }

// app.listen(port, () => console.log(`Listening on port ${port}`));
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
app.use(cors());
// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// autoload routes
// readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)));
app.use(routes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Server is running on port ${port}`));
