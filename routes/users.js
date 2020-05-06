const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const User = require('../models/users.model');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
//so we have have environment variables in .env file
require('dotenv').config();
var sketch = require('./sketch')
const crypto = require('crypto');

module.exports.startUserRoute = function (routerSketch, gfs) {

    router.get('/', urlencodedParser, function (req, res, next) {
        res.render('login', {
            login_msg_obj: {
                errors: [],
                msg: ""
            }
        })
    });

    router.get('/register', urlencodedParser, function (req, res, next) {
        res.render('login', {
            login_msg_obj: {
                errors: [],
                msg: ""
            }
        })
    });

    router.get('/login', urlencodedParser, function (req, res, next) {
        res.render('login', {
            login_msg_obj: {
                errors: [{ msg: "Invalid username or password!" }],
                msg: '',
            }
        });
    });

    router.post('/login', urlencodedParser,
        passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }),
        function (req, res) {

            gfs.collection(req.user.username + '-images');
            // Create storage engine
            var storage = new GridFsStorage({
                url: process.env.DOODLEDB,
                options: { useUnifiedTopology: true },
                file: (req, file) => {
                    return new Promise((resolve, reject) => {
                        crypto.randomBytes(16, (err, buf) => {
                            if (err) {
                                return reject(err);
                            }
                            const filename = file.originalname;
                            //bucket name must match the collection name
                            const fileInfo = {
                                filename: filename,
                                bucketName: req.user.username + '-images'
                            };
                            resolve(fileInfo);
                        });
                    });
                }
            });

            var upload = multer({ storage });

            //cann sketch routes after so that we can name the db dynamically with username
            sketch(routerSketch, upload, gfs, storage) //initalize the sketch routes and queries only once the db and server are launched
            res.redirect('/home');
        });

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.getUserById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid Password' });
                }
            });
        });
    }));

    router.post('/register', urlencodedParser, function (req, res, next) {
        const email = req.body.email;
        const username = req.body.reg_username;
        const password = req.body.reg_password;
        const confirm_password = req.body.confirm_reg_password;


        // Form Validator, params must be as in form
        req.checkBody('email', 'Email field is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('reg_username', 'Username field is required').notEmpty();
        req.checkBody('reg_password', 'Password field is required').notEmpty();
        req.checkBody('confirm_reg_password', 'Passwords do not match').equals(req.body.reg_password);

        //   // Check Errors
        var errors = req.validationErrors();

        let login_msg_obj = {
            errors,
            msg: '',
        }
        if (errors) {
            login_msg_obj.errors = errors
            login_msg_obj.msg = ''
            res.render('login', { login_msg_obj: login_msg_obj })
        } else {

            var newUser = new User({
                email: email,
                username: username,
                password: password,
            });


            User.createUser(newUser, function (err, user) {
                // if (err) throw err;
                if (err) {
                    login_msg_obj.msg = "Username/Email is already in use!"
                    res.render('login', { login_msg_obj: login_msg_obj })
                } else {
                    login_msg_obj.msg = "Account registered sucessfully!"
                    res.render('login', { login_msg_obj: login_msg_obj })
                }
                // console.log(user);
            });

            // res.location('/');
            // res.redirect('/');
        }
    });

    router.get('/logout', function (req, res) {
        req.logout();
        //   req.flash('success', 'You are now logged out');
        res.render('login', {
            login_msg_obj: {
                errors: [],
                msg: 'You have been logged out!',
            }
        });
    });

}

module.exports.router = router;
