var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/User');

var FACEBOOK_APP_ID = "159867974435557" // App ID 입력
var FACEBOOK_APP_SECRET = "fd9540a6bd5bc449bceebfb9cdaf5e8d"; // App Secret 입력

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use('local-login',
    new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            User.findOne({
                'email': email
            }, function(err, user) {
                if (err) {
                    console.log(err);
                    return done(err);
                }

                if (!user) {
                    req.flash("email", req.body.email);
                    console.log('No user found.');
                    return done(null, false, req.flash('loginError', 'No user found.'));
                }
                if(user.from != 'us') {
                    req.flash("email", req.body.email);
                    console.log('facebook user!');
                    return done(null, false, req.flash('loginError', 'facebook user!'));
                }
                if (!user.authenticate(password)) {
                    req.flash("email", req.body.email);
                    console.log('Password does not Match.');
                    return done(null, false, req.flash('loginError', 'Password does not Match.'));
                }
                req.flash('postsMessage', 'Welcome ' + user.nickname + '!');
                return done(null, user);
            });
        }
    )
);

passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3333/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {
            var tuser = {};
            tuser.email = profile._json.email;
            tuser.nickname = profile._json.first_name + " " + profile._json.last_name;
            tuser.type = 'user';
            tuser.from = 'facebook';
            tuser.password = profile._json.id;
            var query = {
                email: tuser.email,
                from: tuser.from
            };
            User.findOneAndUpdate(query, tuser, {upsert: true}, function(err, doc) {
                if (err) {
                    console.log('No user found by facebook');
                    return done(null, false, req.flash('loginError', 'No user found'));
                }
                return done(null, tuser);
            });
        });
    }
));

module.exports = passport;
