const express = require('express');
const dotenv = require ('dotenv');
const connectDB = require('./config/db');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const cors=require('cors');

//Route files
const restaurants = require('./routes/restaurants');
const reservations = require('./routes/reservations');

//Load env vars
dotenv.config({path: './config/config.env'});

//Connect db
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

const limiter=rateLimit({
    windowsMs:10*60*1000, //10 mins
    max: 100
});
app.use(limiter);

app.use(cors());

//Mount routes
app.use('/api/restaurants', restaurants);
app.use('/api/auth',auth);
app.use('/api/reservations', reservations);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, ' mode on port ', PORT))

process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});