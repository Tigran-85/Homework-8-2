const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload')
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/users')
const userJsonPath = path.join(__homedir, './users.json');
const {Types} = require('mongoose');
const UsersCtrl = require('../controllers/users.ctrl');
const {body} = require('express-validator');
const responseManager = require('../middlewares/response-handler');
const validationResult = require('../middlewares/validation-result');
const responseHandler = require('../middlewares/response-handler');
const validateToken = require('../middlewares/validate-token');

router.route('/').get(
    responseManager,
    validateToken,
    async (req, res) => {
    try {
        const users = await UsersCtrl.getAll({
            name: req.query.name,
            userId: req.decoded.userId
        });
        res.onSuccess(users)
    } catch (e) {
        res.onError(e)
    }
    
}).post(
    upload.single('image'), 
    body('name').exists().bail().isLength({min: 6}),
    body('password').exists().bail().isLength({min: 6}).custom(value => {
        return new RegExp("^[A-Z0-9.,/ $@()]+$").test(value);
    }),
    responseManager,
    validationResult,
    async (req, res) => {
    try{
        let userdata = await UsersCtrl.add({
            name: req.body.name,
            username: req.body.username,
            file: req.file,
            password: req.body.password
        });
        userdata = userdata.toObject();
        delete userdata.password;
        res.onSuccess(userdata)
    } catch (e) {
        await fs.unlink(path.join(__homedir, req.file.path));
        res.onError(e);
    }
   
});

router.post('/login',
    body('username').exists(),
    body('password').exists(),
    responseManager,
    validationResult,
    
    async (req, res) => {
        try {
            const token = await UsersCtrl.login({
                ...req.body
            });
            res.onSuccess(token);
        } catch (e) {
            res.onError(e);
        }
        
    }
);

router.post('/current',
    responseManager,
    validateToken,
    
    async (req, res) => {
        try {
            const user = await UsersCtrl.getById(req.decoded.userId);
            res.onSuccess(user);
        } catch (e) {
            res.onError(e);
        }
        
    }
);

router.route('/friends').get(
    responseManager,
    validateToken,
    async (req, res) => {
        try {
            const friends = await UsersCtrl.getFriends({
                userId: req.decoded.userId
            })
           res.onSuccess(friends);
        } catch (e) {
            res.onError(e)
        }
    }
)

router.route('/friend-request').post(
    responseManager,
    body('to').exists(),
    validateToken,
    async (req, res) => {
        try {
            await UsersCtrl.friendRequest({
                from: req.decoded.userId,
                to: req.body.to
            });
            res.onSuccess();
        } catch (e) {
            res.onError(e)
        }
    }
).get(
    responseManager,
    validateToken,
    async (req, res) => {
        try {
            
           res.onSuccess(
            await UsersCtrl.getFriendRequests({
                userId: req.decoded.userId
            })
           );
        } catch (e) {
            res.onError(e)
        }
    }
).put(
    responseManager,
    body('to').exists(),
    validateToken,
    async (req, res) => {
        try {
            await UsersCtrl.acceptFriendRequests({
                userId: req.decoded.userId,
                to: req.body.to
            });
            res.onSuccess();
        } catch (e) {
            res.onError(e)
        }
    }
).delete(
    responseManager,
    body('to').exists(),
    validateToken,
    async (req, res) => {
        try {
            await UsersCtrl.declineFriendRequests({
                userId: req.decoded.userId,
                to: req.body.to
            });
            res.onSuccess();
        } catch (e) {
            res.onError(e)
        }
    }
)

router.route('/:id').get(async (req, res) => {
    // Types.ObjectId.isValid(req.params.id);
    const user = await User.findById(req.params.id);

    if(user){
        res.json({
            success: true,
            data: user
        })
    }else {
        res.json({
            success: false,
            data: null,
            message: 'user not found'
        })
    }
}).put(upload.single('image'), async (req, res) => {
    try{
       const user = await User.findById(req.params.id);
    //    await User.findOneAndUpdate({_id: req.params.id}, {
    //        name: req.body.name,
    //        image: req.file.path;
    //    });
        if(user){
            await fs.unlink(path.join(__homedir, user.image));
            user.name = req.body.name;     
            user.image = req.file.path; 
            await user.save();
            
            res.json({
                success: true,
                data: user,
                message: 'user updated'
            })
            
           
        }else{
            throw new Error('User not found')
        }
    } catch (e) {
        await fs.unlink(path.join(__homedir, req.file.path));
        res.json({
            success: false,
            data: null,
            message: e.message
        })
    }
}).delete(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user){
            await fs.unlink(path.join(__homedir, user.image));
            await user.remove();
            res.json({
                success: true,
            })
        }else {
           throw new Error('User Not Found');
        }
    } catch(e) {
        res.json({
            success: false,
            data: null,
            message: e.message
        })
    }
    
})




module.exports = router;