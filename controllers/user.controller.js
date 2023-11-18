import UserAccessor from "../db_accessor/user.accessor.js";
import Connection from "../db/connection.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth from "../auth/authorization.js";

export default class UserController {
  static async getAllUsers(req, res) {
    const users = await UserAccessor.getAllUsers();
    res.render("index", { users: users, token: req.cookies.token });
  }

  static async createUser(userDoc) {
    try {
      await Connection.open("Users");
      const user = await User.create(userDoc);
      return user;
    } catch (e) {
      throw e;
    }
  }

  static getLoginPage(req, res) {
    if (req.cookies.token) {
      res.redirect("/profile");
    } else {
      res.render("login_page", { error: req.cookies.error });
    }
  }

  static getSignUpPage(req, res) {
    if (req.cookies.token) {
      res.redirect("/logout");
    } else {
      res.render("sign_up");
    }
  }

  static async getProfile(req, res, next) {
    if (!req.error) {
      var user = Auth.getUserInfo(req);
      const username = user.username;
      user = await UserAccessor.getUser(username);
      res.render("profile", {
        name: user.username,
        email: user.email,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
      });
    } else {
      return next();
    }
  }

  static async getChat(req, res, next) {
    if (!req.error) {
      const toChatUsername = req.query.chat;
      var toChat = await UserAccessor.getUser(toChatUsername);

      var user = Auth.getUserInfo(req);
      const username = user.username;
      user = await UserAccessor.getUser(username);
      res.render("chat", {
        fromName: user.username,
        toName: toChat.username,
        messages: user.directMessages,
      });
    } else {
      return next();
    }
  }

  static getLogout(req, res) {
    res.clearCookie("token");
    res.redirect("/");
  }

  static async postSignUp(req, res, next) {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      await UserAccessor.createUser(req.body);
      res.redirect("/login-page");
    } catch (e) {
      req.error = 999;
      next();
    }
  }

  static async postLogin(req, res, next) {
    try {
      if (!req.cookies.token) {
        const user = await UserAccessor.getUser(req.body.username);
        if (user) {
          const result = await bcrypt.compare(req.body.password, user.password);
          if (result) {
            const token = jwt.sign(
              {
                username: user.username,
                email: user.email,
                bio: user.bio,
                followers: user.followers,
                following: user.following,
              },
              process.env.TOKEN_KEY
            );
            res.cookie("token", token, {
              httpOnly: true,
              maxAge: 60 * 60 * 1000,
            });
            res.redirect("/profile");
          } else {
            req.error = 400;
            next();
          }
        } else {
          req.error = 400;
          next();
        }
      } else {
        res.redirect("/profile");
      }
    } catch (e) {
      req.error = 400;
      next();
    }
  }

  static async followUser(req, res, next) {
    if (!req.error) {
      const toFollow = req.body.follow;
      var user = Auth.getUserInfo(req);
      const username = user.username;
      user = await UserAccessor.getUser(username);
      const following = user.following;

      if (!following.includes(toFollow) && toFollow != username) {
        await UserAccessor.addFollower(username, toFollow);
      }
      res.redirect("/");
    } else {
      return next();
    }
  }

  static async sendMessage(req, res, next) {
    if (!req.error) {

      const recipient = req.body.recipient;
      var user = Auth.getUserInfo(req);
      const username = user.username;

      const message = {
        sender: username,
        recipient: recipient,
        content: req.body.messageContent,
        timestamp: new Date(),
      };

      await UserAccessor.addMessage(username, recipient, message);
      res.redirect(`/chat?chat=${recipient}`);
    } else {
      return next();
    }
  }
}
