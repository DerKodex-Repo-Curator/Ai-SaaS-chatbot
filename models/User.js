import bcrypt from "bcrypt";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

UserSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
