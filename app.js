const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

//CONFIGS
    //SESSION
        app.use(session({
            secret: "cursonode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash());
    //MIDDLEWARE
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash('error_msg');
            next();
        })
    //BODY PARSER
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json());
    //HANDLEBARS
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars'); 
    //MONGOOSE
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("Conectado ao MongoDB")
        }).catch((err) => {
            console.log("Erro ao se conectar: " + err);
        })   
    
    //PUBLIC
        app.use(express.static(path.join(__dirname, 'public')));
        
//ROTAS
    app.use('/admin', admin);

//OUTROS
    const PORT = 8081;
    app.listen(PORT, () => {
        console.log("Servidor rodando na URL: http://localhost:8081");
    })