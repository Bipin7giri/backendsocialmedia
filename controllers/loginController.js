const mongoose = require('mongoose');
const cloudinary = require('cloudinary');

const loginModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const generateAccessToken = require('../generateAccessToken');
const register = async (req, res) => {
  try{
    const body = req.body;
    const emailFromDb = await loginModel.findOne({
      gmail: body.gmail,
    });
    if (body.gmail === emailFromDb?.gmail) {
      return res.json({
        status: 'Already Exist',
      });
    }
    await cloudinary.uploader
      .upload(req.file.path, (result) => {
        // This will return the output after the code is exercuted both in the terminal and web browser
        // When successful, the output will consist of the metadata of the uploaded file one after the other. These include the name, type, size and many more.
        console.log(result);
      })
      .then(async (result) => {
        const user = new loginModel(body);
        user.image = result.secure_url;
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        res.json({
          status: 201,
        });
      });
  
  }catch(err){
    res.send(err?.message)
  }
  
  // res.send('success');
};
const getAllUsers = async (req, res) => {
  const authEmail = req.params.email;

  const getAuthUser = await loginModel
    .find({
      gmail: authEmail.replaceAll('"', ''),
    })
    .populate('posts');
  res.send(getAuthUser);
  // console.log(getAuthUser);
  // return;
  // if (req.params.email) {
  //   const withoutQuotesEmail = req.params.email.replaceAll('"', '');
  //   const allUsers = await loginModel.find({
  //     gmail: { $ne: withoutQuotesEmail },
  //   });
  //   console.log(allUsers);
  //   res.send({
  //     allUsers,
  //   });
  // } else {
  //   const allUsers = await loginModel.find({});
  //   res.send({
  //     allUsers,
  //   });
  // }
};
const isLogin = async (req, res) => {
  const token = generateAccessToken({ username: req.body.gmail });
  const userEmail = await req.body.gmail;
  const userPassword = await req.body.password;
  const emailDb = await loginModel.findOne({
    gmail: userEmail,
  });

  if (emailDb) {
    bcrypt.compare(userPassword, emailDb.password, function (err, status) {
      if (status === true) {
        res.json({
          status: 'matched',
          token: token,
        });
        // res.send('matched');
      } else {
        res.json({
          status: 'not matched',
        });
      }
    });
  } else {
    res.json({
      status: 'not registered',
    });
  }
};
// adding follower
const addFollower = async (req, res) => {
  const withoutQuotesEmail = req.body.authEmail.replaceAll('"', '');

  const followed = await loginModel.updateOne(
    { gmail: withoutQuotesEmail },
    { $push: { Following: req.body.followID } }
  );
  const follower = await loginModel.updateOne(
    { gmail: req.body.followID },
    { $push: { Followers: withoutQuotesEmail } }
  );
  if (followed && follower) {
    res.send('followed');
  }
};
const getFollowing = async (req, res) => {
  const withoutQuotesEmail = req.params.email.replaceAll('"', '');
  // console.log(withoutQuotesEmail);

  const allUsers = await loginModel.find({
    gmail: { $ne: withoutQuotesEmail },
  });

  if (allUsers) {
    res.send(allUsers);
  }
};
const showIfNotFollowed = async (req, res) => {
  const withoutQuotesEmail = req.params.email.replaceAll('"', '');

  const { Following } = await loginModel.findOne({
    gmail: withoutQuotesEmail,
  });
  if ({ Following }) {
    res.json({
      following: Following,
    });
  }
};

// module.exports = { register };
module.exports = {
  register,
  getAllUsers,
  isLogin,
  addFollower,
  getFollowing,
  showIfNotFollowed,
};
