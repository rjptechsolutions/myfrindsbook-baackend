const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');
const morgan = require('morgan');
//const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error');
const advanceResults = require('./middleware/advanceResults');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

//Router files
const posts = require('./routes/posts'); 
const users = require('./routes/user'); 
const auth = require('./routes/auth');
const comment = require('./routes/comment');
//Init
const app = express();

//Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());


//Morgan Logger
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
  });
  app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors())

//set static folder
app.use(express.static(path.join(__dirname,'public')))



//Mount routers
app.use('/api/v1/posts', posts);
app.use('/api/v1/user', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/comment', comment);

//middlelwaer
//app.use(logger);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

//handel unhandel promise rejections

process.on('unhandledRejection',(err,promise) => {
    console.log(`Error:${err.message}`.red);
    //closed server & exit process
    //server.close(() =>process.exit(1));
})