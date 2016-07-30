var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('../config/passport.js');

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/signin', function(req, res) {
    res.render('signin', {
        email: req.flash("email"),
        loginError: req.flash('loginError'),
        loginMessage: req.flash('loginMessage')
    });

});

router.post('/signin',
    passport.authenticate('local-login', {
        successRedirect: '/users/info',
        failureRedirect: '/signin',
        failureFlash: true
    }));

router.get('/signout', function(req, res) {
    req.logout();
    req.flash("postsMessage", "Good-bye, have a nice day!");
    res.redirect('/');
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
router.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/users/info',
        failureRedirect: '/signin'
    }),
    function(req, res) {
        res.redirect('/');
    });

module.exports = router;
