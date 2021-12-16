const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
var flash = require('req-flash');
const path = require("path");

const logging = require('./config/logging');
const config = require('./config/config');
const routes = require('./routes/routes');
const passport = require('passport');
const initializePassport = require('./config/passport-config');
const user = require('./schema/user');

const app = express();

/**
 * passport config
 */
initializePassport(
    passport,
    email => user.find(elm => elm.email === email),
    id => user.find(elm => elm.id === id)
)


/* Mongodb connection */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info('Mongo Connected');
    })
    .catch((error) => {
        logging.error(error);
    });

    
/**View engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
    session({
        secret: 'djhxcvxfgshajfgjhgsjhfgsakjeauytsdfy',
        resave: false,
        saveUninitialized: true
    })
);

app.use(flash());
app.use(passport.initialize())
app.use(passport.session())


/* Looging Middleware */
app.use((req, res, next) => {
    logging.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        logging.info(`METHOD d: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });
    if(typeof req.session.user===undefined)
    {
        return res.redirect("/users/login");
    }
    next();
});

/* Parse the body */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/** Rules of our API */
/* API access policy */
/* Middleware for headers */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/* Routes */
app.get('/', (req, res) => {
    res.send('Welcome to Yocket assignment');
});
/* GET register page. */
app.get('/index', function (req, res) {
    res.render('index');
});
app.use('/users', routes);

// try code
var callback1 = function(req, res, next){
    console.log("A");
    next();
}
var callback2 = function(req, res, next){
    console.log("B");
    next();
}

app.get("/sample",[callback1, callback2], function(req, res, next){
    console.log("C");
    next();
},function(req, res){
    res.send("response");
})
// try code 
/* Error Handling Middleware */
app.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

/* Listening for requests */
app.listen(config.server.port, () => {
    logging.info(`Server is running at ${config.server.host}:${config.server.port}`);
});

module.exports = app;