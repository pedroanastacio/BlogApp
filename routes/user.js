const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/User');
const User = mongoose.model('users');
const bcrypt = require('bcryptjs');


router.get('/registro', (req, res) => {
    res.render('users/registro');
})


router.post('/registro', (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome imválido'});
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email imválido'});
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha imválida'});
    }

    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha muito curta'});
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'As senhas são diferentes'});
    }

    if(erros.length > 0){
        res.render("users/registro", {erros: erros});
    }else{
        User.findOne({email: req.body.email}).then((user) => {
            if(user){
                req.flash('error_msg', "Já existe uma conta com este email");
                res.redirect('/users/registro');
            }else{
                const newUser = new User({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.senha, salt, (err, hash) => {
                        if(err){
                            req.flash('error_msg', 'Houve um erro ao criar conta');
                            res.redirect('/');
                        }else{
                            newUser.senha = hash;

                            newUser.save().then(() => {
                                req.flash('success_msg', 'Conta criada com sucesso');
                                res.redirect('/');
                            }).catch((err) => {
                                req.flash('error_msg', "Houve um erro ao criar conta, tente novamente");
                                res.redirect('/users/registro');
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/');
        })
    }
})

module.exports = router;