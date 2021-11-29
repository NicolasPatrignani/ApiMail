const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())

app.use(fileUpload({
  createParentPath: true
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

const adminRoutes = require('./routes/admin');
/* var emailRouter = require('./routes/email-route'); */

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
/* app.use('/', emailRouter); */

app.use(errorController.get404);

sequelize
  .sync()
  .then(result => {
    // console.log(result);
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
