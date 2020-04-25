const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    nome:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    senha:{
        type: String,
        required: true
    }
})

mongoose.model('users', User);