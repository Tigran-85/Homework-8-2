const multer  = require('multer');
const mymTypes = require('mime-types');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.' + mymTypes.extension(file.mimetype))
    }
  })
   
  module.exports = multer({ storage: storage });