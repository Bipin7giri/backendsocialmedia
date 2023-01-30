const bcrypt = require('bcrypt');
const express = require('express');
const {
  register,
  getAllUsers,
  isLogin,
  addFollower,
  getFollowing,
  showIfNotFollowed,
} = require('../controllers/loginController');
const User = require('../models/UserModel');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
let upload = multer({ storage, fileFilter });
// signup route
router.post('/register', upload.single('image'), register);

router.get('/users/:email', getAllUsers);
router.post('/login', isLogin);

// followers route
router.post('/followers', addFollower);
router.get('/followers/:email', getFollowing);
router.get('/ifnotfollowed/:email', showIfNotFollowed);
module.exports = router;
