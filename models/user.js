import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    bio: { type: String, required: false },
    followers: [{ type: String }],
    following: [{ type: String }],
    directMessages: [
      {
        sender: {type: String}, // username of the sender
        recipient: {type: String}, // username of the recipient
        content: {type: String},
        timestamp: {type: Date, default: Date.now}
      }
    ]
  },
  {
    collection: "Users",
  }
);

const db = mongoose.connection.useDb("NetworkBuilder");
const User = db.model("User", UserSchema);

export default User;
