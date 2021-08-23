const Bcrypt = require('../managers/bcrypt');
const User = require('../models/users');
const AppError = require('../managers/app.error');
const TokenManager = require('../managers/token-manager');

class UsersCtrl {
    getById () {

    }

    getAll () {
        
    }

    async login(data) {
       const {username, password} = data;
        const user = await User.findOne({username});
       if (!user) {
           throw new AppError('Username or password is wrong', 403);
       }

       if(await Bcrypt.compare(password, user.password)){
           return TokenManager.encode({
               userId: user._id
           })     
       }

       throw new AppError('Username or password is wrong', 403);
    }

    async add (data) {
        if(await User.exists({username: data.username})){
            throw new Error('User exists')
        }
            const user = new User({
                name: data.name,
                image: data.file.path,
                password: await Bcrypt.hash(data.password)
            });
            user.username = data.username;

            return user.save();
        
    }

    update () {
        
    }

    delete () {
        
    }
}

module.exports = new UsersCtrl();