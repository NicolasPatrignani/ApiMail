const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
/* const multer = require('multer'); */

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

/* const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'attachments');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}; */

app.set('view engine', 'ejs');
app.set('views', 'views');

/* app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
); */

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
