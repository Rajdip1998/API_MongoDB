const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect("mongodb://127.0.0.1:27017/task-manager");

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be Postive')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email does not exists');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length <= 6 || value.toLowerCase() === "password") {
                throw new Error('Set Password something else')
            }
        }
    }
});

const me = new User({
    name: "Rajdip Banerjee",
    email: 'rajDip@gmail.com',
    age:24,
    password:"1234567"
});

me.save().then(() => {
    console.log(me);
}).catch((error) => {
    console.log(error);
})