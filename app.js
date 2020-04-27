const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const users = require('./routes/user');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Post');
require('./models/Categoria');
const Post = mongoose.model("posts");
const Categoria = mongoose.model('categorias');
const passport = require('passport');
require('./config/auth')(passport);

//CONFIGS
    //SESSION
        app.use(session({
            secret: "cursonode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());

    //MIDDLEWARE
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
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
    app.use('/users', users);

    app.get('/', (req, res) => {
        Post.find().populate('categoria').sort({data: 'desc'}).then((posts) => {
            res.render("index", {posts: posts.map(post => post.toJSON())});
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/404");
        })
        
    })


    app.get('/404', (req, res) => {
        res.send("Erro 404!");
    })


    app.get('/post/:slug', (req, res) => {
        Post.findOne({slug: req.params.slug}).then((post) => {
            if(post){
                res.render("post/index", {post: post.toJSON()});
            }else{
                req.flash("error_msg", "Esta postagem não existe");
                res.redirect("/");
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar postagem");
            res.redirect("/");
        })
    })


    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias.map(categoria => categoria.toJSON())});
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect('/');
        })
    })


    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Post.find({categoria: categoria._id}).then((posts) => {
                    res.render("categorias/posts", {posts: posts.map(post => post.toJSON()), categoria: categoria.toJSON()});
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar postagens')
                    res.redirect('/categorias');
                })
            }else{
                req.flash('error_msg', 'Esta categoria não existe');
                res.redirect('/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria');
            res.redirect('/categorias');
        })
    })


//OUTROS
    const PORT = 8081;
    app.listen(PORT, () => {
        console.log("Servidor rodando na URL: http://localhost:8081");
    })