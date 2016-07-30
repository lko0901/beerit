var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var async = require('async');

// my listen
router.get('/info', isLoggedIn, function(req, res) {
    console.log(req.user);
    res.render('users/info',{user:req.user});
});
// new
router.get('/new', function(req, res) {
    req.flash('formData', {
        email: 'trpgms@gmail.com',
        nickname: '녹슨곰탱'
    });
    res.render('users/new', {
        formData: req.flash('formData')[0],
        emailError: req.flash('emailError')[0],
        nicknameError: req.flash('nicknameError')[0],
        passwordError: req.flash('passwordError')[0]
    });
});

// create
router.post('/', checkUserRegValidation, function(req, res, next) {
    req.body.user.type = 'user';
    req.body.user.from = 'us';
    User.create(req.body.user, function(err, user) {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: err
            });
        }
        req.flash("email", req.body.user.email);
        req.flash("loginMessage", "Thank you for registration!");
        res.redirect('/signin');
    });
});

// show
router.get('/:id', isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) return res.json({
            success: false,
            message: err
        });
        res.render("users/show", {
            user: user
        });
    });
});

// edit
router.get('/:id/edit', isLoggedIn, function(req, res) {
    if (req.user._id != req.params.id) return res.json({
        success: false,
        message: "Unauthrized Attempt"
    });
    User.findById(req.params.id, function(err, user) {
        if (err) return res.json({
            success: false,
            message: err
        });
        res.render("users/edit", {
            user: user,
            formData: req.flash('formData')[0],
            emailError: req.flash('emailError')[0],
            nicknameError: req.flash('nicknameError')[0],
            passwordError: req.flash('passwordError')[0]
        });
    });
});

// update
router.put('/:id', isLoggedIn, checkUserRegValidation, function(req, res) {
    if (req.user._id != req.params.id) return res.json({
        success: false,
        message: "Unauthrized Attempt"
    });
    User.findById(req.params.id, function(err, user) {
        if (err) return res.json({
            success: "false",
            message: err
        });
        if (user.authenticate(req.body.currentPassword)) {
            if (req.body.user.newPassword) user.password = req.body.user.newPassword;
            user.mapObject(req.body.user);
            user.save(function(err) {
                if (err) return res.json({
                    success: "false",
                    message: err
                });
            });
            res.redirect('/users/' + req.params.id);
        } else {
            req.flash("formData", req.body.user);
            req.flash("passwordError", "- Invalid password");
            res.redirect('/users/' + req.params.id + "/edit");
        }
    });
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function checkUserRegValidation(req, res, next) {
    var isValid = true;
    async.waterfall(
        [function(callback) {
            User.findOne({
                    email: req.body.user.email,
                    _id: {
                        $ne: mongoose.Types.ObjectId(req.params.id)
                    }
                },
                function(err, user) {
                    if (user) {
                        isValid = false;
                        req.flash("emailError", "Already resistered email");
                    }
                    callback(err, isValid);
                }
            );
        }, function(isValid, callback) {
            User.findOne({
                    nickname: req.body.user.nickname,
                    _id: {
                        $ne: mongoose.Types.ObjectId(req.params.id)
                    }
                },
                function(err, user) {
                    if (user) {
                        isValid = false;
                        req.flash("nicknameError", "Already resistered nickname");
                    }
                    callback(err, isValid);
                }
            );
        }],
        function(err, isValid) {
            if (err) {
                return res.json({
                    success: "false",
                    message: err
                });
            }
            if (isValid) {
                return next();
            } else {
                req.flash("formData", req.body.user);
                res.redirect("back");
            }
        }
    );
}