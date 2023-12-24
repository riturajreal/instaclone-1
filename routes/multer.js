const multer = require('multer');
const {v4 : uuidv4} = require('uuid'); 
const path = require('path'); 


//  MULTER DISK STORAGE --> where you have to store images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads'); // file location
    },
    filename: function (req, file, cb) {
      const unique = uuidv4(); // file name
      cb(null, unique + path.extname(file.originalname) ); // file extension
    }
  })
  
  const upload = multer({ storage: storage }); // this helps to upload files

  module.exports = upload;