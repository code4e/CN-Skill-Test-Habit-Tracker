const express = require('express');
const app = express();
const PORT = 8000;
const db = require('./config/mongoose');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');


//body parser to parse the data coming from body (e.g data from a form)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());




//set up the view engine and set the views
app.set('view engine', 'ejs');
app.set('views', './views');

//use ejs layouts before rendering views to detect that layout is being used at the front end
app.use(expressLayouts);


// use static files middlleware and tell express where to look out for the static files
app.use(express.static('./assets'));

//handle all routes
app.use('/', require('./routes/index'));

app.listen(PORT, () => console.log(`Server is up and running on PORT ${PORT}`));

