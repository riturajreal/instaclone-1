const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/instaclone");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: { type: String, unique: true },
  profileImage: String,
  bio: {
    type : String,
    default : "hello",
  },

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
});

userSchema.pre('remove', async function (next) {
  try {
    await this.model('post').deleteMany({ _id: { $in: this.posts } });
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);