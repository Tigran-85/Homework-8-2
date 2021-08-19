const express = require('express');
const router = express.Router();
const Posts = require('../models/posts');
const Users = require('../models/users');
const {body, query, param, check, validationResult} = require('express-validator');
const {ObjectId} = require('mongoose').Types;

router.route('/').get(async (req, res) => {
   const posts = await Posts.find().populate('author');
    res.json(posts);

}).post(
    check('userId').custom((value, {req, res}) => {
        return ObjectId.isValid(value);
    }),
    check('title', 'title not exists').exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.mapped() });
        }
    const post = await new Posts({
        title: req.body.title,
        desc: req.body.desc,
        author: req.body.userId
    }).save();
    res.json(post)
});

module.exports = router;