const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const responseManager = require('../middlewares/response-handler');



router.get('/uploads/:image', responseManager, (req, res) => {
    if(req.params.image){
        const stream = fs.createReadStream(path.join(__homedir, 'uploads/', req.params.image)).pipe(res);
        
    }
});
  
router.get('/', (req, res) => {
    res.end('home page')
});

module.exports = router;