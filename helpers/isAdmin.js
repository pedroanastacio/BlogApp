module.exports = {
    isAdmin(req, res, next) {
        if(req.isAuthenticated() && req.user.isAdmin){
            return next();
        }

        req.flash("error_msg", "Você precisa ser um Administrador");
        res.redirect('/');
    }
}