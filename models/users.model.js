var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        validate: async (value) => {
            try {
                const result = await User.findOne({ email: value })
                if (result) throw new Error(`Account with email ${value} already exists.`);
            } catch (error) {
                // console.log(error.message)
            }
        }
    },
    username: {
        type: String,
        index: true,
        unique: true,
        validate: async (value) => {
            try {
                const result = await User.findOne({ username: value })
                if (result) throw new Error("Username Already Exists: " + value);
            } catch (error) {
                // console.log(error.message)
            }
        }
    },
    password: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function (username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        callback(null, isMatch);
    });
}

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}