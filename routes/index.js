var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const upload = require('./multer');
const postModel = require('./post');

// add local Strategy --> allow to make account 
// and log in  using username and password
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed', isLoggedIn, async function(req, res) {

  // without populate --> only id ,,, with populate --> inner data
  const posts = await postModel.find().populate("user");

  res.render('feed', {footer: true, posts});
});

router.get('/profile', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('profile', {footer: true, user});
});

router.get('/search', isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('edit', {footer: true, user});
});

router.get('/upload', isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

// register route
router.post("/register", function(req,res,next) {

  const userData =  new userModel ({
      username : req.body.username,
      name : req.body.name,
  });

  // return a promise
  userModel.register(userData, req.body.password)
  .then(function() {
      passport.authenticate("local")(req,res, function () {
        res.redirect('/profile');
      })
  });
});

// login route
router.post("/login", passport.authenticate("local", {
  successRedirect :  "/profile",
  failureRedirect : '/login'
}), function(req,res) {
  
});


// logout route 
router.get("/logout", function(req,res,next) {
  req.logout(function(err) {
    if(err) return next(err);

    res.redirect('/');

    })
});



// update route 
router.post('/update', upload.single('image'), async function(req, res) {
  try {
    // get logged-in user
    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      {
        username: req.body.username,
        name: req.body.name,
        bio: req.body.bio,
      },
      { new: true }
    );

    // updating user profile image if a file is uploaded
    if (req.file) {
      user.profileImage = req.file.filename;
      await user.save();
    }

    // now redirect
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});


// upload route
router.post('/upload', isLoggedIn, upload.single('image'), async function(req,res) {

   const user = await userModel.findOne({username : req.session.passport.user});

   const post = await postModel.create({
     picture : req.file.filename,
     user : user._id,
     caption : req.body.caption,
   });

   // user ke post array ke liye 
   user.posts.push(post._id);
   await user.save();

   res.redirect("/feed");

});


// is Logged in function
function isLoggedIn(req,res, next) {
    if(req.isAuthenticated()) return next(); // -->  allow to visited authorized routes
    res.redirect("/login"); // else you have to login to explore
};



module.exports = router;
