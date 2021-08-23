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

router.route('/').get( async (req, res) => {
    // let users = Object.values(JSON.parse(await fs.readFile(userJsonPath), 'utf-8'));
    const options = {};
    const limit = {};
    if(req.query.name){
       options.name = req.query.name;
    }
    if(req.query.limit){
        limit.limit = Number(req.query.limit);
    }
    const users = await User.find(options, null, limit);
    res.json({
        success: true,
        data: users
    })
    
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