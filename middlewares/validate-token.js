const AppError = require("../managers/app.error");
const TokenManager = require("../managers/token-manager");

module.exports = async (req, res, next) => {
    const token = req.headers['token'] || req.query.token || req.query.body;
    if(token) {
        try {
            const decoded = await TokenManager.decode(token);
            if (decoded.userId) {
                req.decoded = decoded;
                next();
            }else {
                res.onError(new AppError('Auth error', 401));
            }
        } catch (e) {
            res.onError(new AppError('Token not provided', 401));
        }
        
    }else {
        res.onError(new AppError('Token not provided', 401));
    }

   
}
