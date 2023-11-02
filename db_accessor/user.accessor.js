import Connection from "../db/connection.js";
import User from "../models/user.js";

export default class UserAccessor {
  static async getUser(username) {
    try {
      await Connection.open("NetworkBuilder");
      const user = await User.findOne({ username: username });
      return user;
    } catch (e) {
      throw e;
    }
  }

  static async getAllUsers() {
    try {
      await Connection.open("NetworkBuilder");
      const users = [];
      for await (const doc of User.find()) {
        users.push(doc);
      }
      return users;
    } catch (e) {
      throw e;
    }
  }

  static async createUser(userDoc) {
    try {
      await Connection.open("NetworkBuilder");
      const user = await User.create(userDoc);
      return user;
    } catch (e) {
      throw e;
    }
  }

  static async addFollower(userWhoFollowed, userToFollow) {
    try {
      await Connection.open("NetworkBuilder");
      const follower = await UserAccessor.getUser(userWhoFollowed);
      const followee = await UserAccessor.getUser(userToFollow);

      const followerList = follower.following;
      followerList.push(userToFollow);

      const followeeList = followee.followers;
      followeeList.push(userWhoFollowed);

      await User.findOneAndUpdate(
        { username: userWhoFollower },
        { following: followerList }
      );
      await User.findOneAndUpdate(
        { username: userToFollow },
        { followers: followeeList }
      );
    } catch (e) {
      throw e;
    }
  }
}
