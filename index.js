const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
//_________________________________________________________________________________________

const app = express();
dotenv.config()
const path = require('path')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(methodOverride('_method'))

mongoose.connect(process.env.CONNECTION_URL)
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Sucess , Server Running at Port ${process.env.PORT}`);
        })
    })
    .catch(() => {
        console.log("Unable to Connect to Server");
    })

//_________________________________________________________________________________________

app.use('/', require('./routes/userRoute.js'))

app.use('*', (req, res) => {
    res.send("Error, Nothing Found")
})

app.use((err, req, res, next) => {
    console.log(err.name);
    console.log(err)
    next(err);
})
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
})