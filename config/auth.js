const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//MODEL DE USUÁRIO
require('../models/User');
const user = mongoose.model('users');


module.exports = function(passport) {

    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        user.findOne({email: email}).then((user) => {
            if(!user){
                return done(null, false, {message: 'Esta conta não existe'});
            }

            bcrypt.compare(senha, user.senha, (erro, batem) => {
                if(batem){
                    return done(null, user);
                }

                return done(null, false, {message: "Senha incorreta"});
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser((id, done) => {
        user.findById(id, (err, user) => {
            done(err, user);
        })
    })
}
