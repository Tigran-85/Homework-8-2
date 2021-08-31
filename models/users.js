const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: String,
    name: String,
    image: String,
    password: String,
    isActive: {type: Boolean, default: false}
}, {versionKey: false, timestamps: true});

userSchema.set('collaction', 'users');

module.exports = mongoose.model('User', userSchema);