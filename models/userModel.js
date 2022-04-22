const mongoose = require('mongoose')
const Schema = mongoose.Schema

const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const userSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, 'email need to be input'],
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    username: {
        type: String,
        required: [true, 'username should be there']
    },
    password: {
        type: String,
        required: [true, 'password need to be there']
    },
    verified: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        default: 'https://images.unsplash.com/photo-1649869418738-e7ec29ad069c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1964&q=80'
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;


