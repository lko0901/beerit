var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var async = require('async');


router.get('/new', isLoggedIn, function(req, res) {
    res.render('sheets/new',{user:req.user});
});
module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
