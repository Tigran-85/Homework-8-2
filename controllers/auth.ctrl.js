const AppError = require('../managers/app.error');
const Bcrypt = require('../managers/bcrypt');
const TokenManager = require('../managers/token-manager');
const UsersCtrl = require('../controllers/users.ctrl');
// const email = require('../configs/email');
const mail = require('../managers/email-manager');

class AuthCtrl {
    
    async login(data) {
        const {username, password} = data;
        const user = await UsersCtrl.findOne({username});
        if (!user) {
            throw new AppError('Username or password is wrong', 403);
        }
 
        if(await Bcrypt.compare(password, user.password)){
            if (!user.isActive) {
                throw new AppError('User profile is not active', 403);
            } 
            return TokenManager.encode({
                userId: user._id
            });     
        }
 
        throw new AppError('Username or password is wrong', 403);
     }

     async register(data){
        const user = await UsersCtrl.add(data);
        // const token = TokenManager.encode({
        //     email: user.email,
        //     action: 'register'
        // }, 3600);
        // await mail(user.email, 'Node js register', `<a href="http://127.0.0.1:5500/activate.html?activation-code=${token}">Activate Profile</a>`);
        return user;
     }

     async forgotPassword(data){
        const user = await UsersCtrl.findOne({email: data.email});
        if (!user) {
            throw new AppError('User not found', 404)
        }
        const token = TokenManager.encode({
            email: user.email,
            action: 'forgot'
        }, 3600);
        await mail(user.email, 'Node js reset password', `<a href="http://127.0.0.1:5500/reset-password.html?activation-code=${token}">Reset Password</a>`);
        
     }

     async activate(token){
        const decoded = await TokenManager.decode(token);
        if (decoded.email && decoded.action === 'register') {
            const user = await UsersCtrl.findOne({email:decoded.email});
            if (!user || user.isActive) {
                throw new AppError('Invalid code', 403);
            }
            user.isActive = true;
            return user.save();
        }
        throw new AppError('Invalid code', 403);
     }

     async resetPassword(data) {
        const decoded = await TokenManager.decode(data.code);
        if (decoded.email && decoded.action === 'forgot') {
            const user = await UsersCtrl.findOne({email:decoded.email});
            if (!user) {
                throw new AppError('Invalid code', 403);
            }
            user.password = await Bcrypt.hash(data.password);
            return user.save();
        }
        throw new AppError('Invalid code', 403);
     }

};

module.exports = new AuthCtrl();
