//console.log("Hello World");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('customerapp', ['users']); //db: customerapp, collection(table): users
const app = express();

/*
// Middleware example
const logger = function(req, res, next){
    console.log('Logging...');
    next();
}

app.use(logger);
//end Middleware example
*/

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path middleware, public folder holds static resources - i.e. css files
app.use(express.static(path.join(__dirname, 'public')));

// User Express validator to validate form entries - run "npm install express-validator --save"
// see https://devhub.io/repos/ctavan-express-validator
// In this example, the formParam value is going to get morphed into form body format useful for printing.
// Express Validaor Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

// Parse object with json to browser instead of using res.send() -- http://localhost:3000/parse
const people = [
    {
        name: 'Jeff',
        age: 30
    },
    {
        name: 'Sara',
        age: 22
    },
    {
        name: 'Bill',
        age: 43
    }
]
app.get('/parse', function(req, res){
    res.json(people);
})

// Working with Template engines - EJS, need to install first: "npm install ejs --save"
// array of users
const users = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@gmail.com',
    },
    {
        id: 1,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@gmail.com',
    },
    {
        id: 1,
        first_name: 'Jill',
        last_name: 'Jack',
        email: 'jjack@gmail.com'
    }
]

// View Engine
app.set('view engine', 'ejs');                    //middleware
app.set('views', path.join(__dirname, 'views'));  // specify folder for our views
// setup view
app.get('/ejs', function(req, res){
    res.render('index', {    // grab /views/index.ejs file, show form 
        title: 'Customers',  // pass a string
        users: users         // pass arrays of users
    });  
});
// Test form in /views/index.ejs
app.post('/users/add', function(req, res){
    //console.log('Form submitted');
    //console.log(req.body.first_name);  // enter first name in form and submit - monitor node express output

    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('last_name', 'Last Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();

    const errors = req.validationErrors();

    if(errors){
        console.log('ERRORS');
    } else {
        const newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
            }
        db.users.insert(newUser, function(err, res) {  // add user from form to MongoDB
            if(err){
                console.log(err);
            }
            res.redirect('/mongo');
        });
    }    
});



app.get('/', function(req, res){
    res.send('Hello World');
})

// Mongo queries - print all records from 'users' collection
app.get('/mongo', function(req, res){
    db.users.find(function (err, docs) {
        res.render('index', {
            title: 'Customers',
            users: docs
        });
    });
})

app.listen(3000, function(){
    console.log("Server started on port 3000...");
})
