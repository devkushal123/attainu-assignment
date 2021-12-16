var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    firstname: {
        type: String,
        required: [true, 'Firstname is required']
    },
    lastname: {
        type: String,
        required: [true, 'Lastname is required']
    },
    username: {
        type: String,
        minLength: [6, "Username can't be less than 6 characters"],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        maxLength: [128, "Email can't be greater than 128 characters"],
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, "Username can't be less than 6 characters"]
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

/**
 * Validates unique email
 */
UserSchema.path('email').validate(async (email) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
}, 'Email already exists');

UserSchema.path('username').validate(async (username) => {
    const userCount = await mongoose.models.User.countDocuments({ username });
    return !userCount;
}, 'Username already exists');


/**
 * Encrypts password if value is changed
 */
UserSchema.pre('save', function (next) {
    var user = this;

    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
