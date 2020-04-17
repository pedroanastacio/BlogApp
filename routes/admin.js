const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Post');
const Categoria = mongoose.model("categorias");
const Post = mongoose.model("posts");

router.get('/', (req, res) => {
    res.render("admin/index")
})


router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias.map(categoria => categoria.toJSON())});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
})


router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
})


router.post('/categorias/nova', (req ,res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }
   
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"});
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = { nome, slug } = req.body;

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar categoria, tente novamente")
            res.redirect("/admin");
        })
    }
})


router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria.toJSON()});
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
    })
})


router.post('/categorias/edit', (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }
   
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"});
    }

    if(erros.length > 0){
        const categoria = {
            _id: req.body.id,
            nome: req.body.nome,
            slug: req.body.slug
        }
        res.render('admin/editcategorias', {erros: erros, categoria: categoria})
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar categoria");
                res.redirect("/admin/categorias");
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria");
            res.redirect('/admin/categorias');
        })
    }
})


router.post('/categorias/remove', (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria removida com sucesso");
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao remover a categoria");
        res.redirect('/admin/categorias');
    })
})


router.get('/posts', (req, res) => {
    Post.find().populate('categoria').sort('desc').then((posts) => {
        res.render("admin/posts", {posts: posts.map(post => post.toJSON())});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar postagens");
        res.redirect("/admin");
    })
})


router.get('/posts/add', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpost', {categorias: categorias.map(categoria => categoria.toJSON())});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect('/admin')        
    })
})


router.post('/posts/novo', (req, res) => {
    const post = { titulo, slug, descricao, conteudo, categoria } = req.body;

    new Post(post).save().then(() => {
        req.flash("success_msg", "Post criado com sucesso");
        res.redirect('/admin/posts');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao criar postagem, tente novamente");
        res.redirect('/admin');
    })
})


router.get('/posts/edit/:id', (req, res) => {
    const { id }= req.params;
    Post.findById(id).populate('categoria').then((post) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpost', {post: post.toJSON(), categorias: categorias.map(categoria => categoria.toJSON())})
        }).catch((err) => {
            req.flash('error_msg', "Erro ao carregar formulário")
            res.redirect('/admin/posts')
        })        
    }).catch((err) => {
        req.flash('error_msg', "Esta postagem não existe");
        res.redirect('/admin/posts');
    })
})


router.post('/posts/edit', (req, res) => {
     Post.findById(req.body.id).then((post) => {
        post.titulo = req.body.titulo;
        post.slug = req.body.slug;
        post.descricao = req.body.descricao;
        post.conteudo = req.body.conteudo;
        post.categoria = req.body.categoria;

        post.save().then(() => {
            req.flash('success_msg', 'Post editado com sucesso');
            res.redirect('/admin/posts');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar o post');
            res.redirect('/admin/posts');
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar o post');
        res.redirect('/admin/posts');
    })
})


module.exports = router;