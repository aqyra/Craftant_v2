import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    isAdmin: { type: Boolean, default: true, required: true},
    userRole: { type: String, required: true, default: 'buyer' },
    shop: { type: String, unique: true},
    handmade: { type: Boolean, default: false },
    logo: {type: String, default: "/images/icon.jpg"},
    description: { type: String },
    money: { type: Number, default: 2000},
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);
export default User;
