import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  videos: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  ],
  updated: { type: Boolean, default: false },
});

userSchema.pre("save", async function () {
  // console.log("this.password:", this.password);
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
  // console.log("hashed password:", this.password);
}); //this = User

const User = mongoose.model("User", userSchema);

export default User;
