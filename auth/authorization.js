import dotenv from "dotenv";
import jwt from "jsonwebtoken";

export default class Auth {
  static authorize(req, res, next) {
    dotenv.config();
    if (req.cookies.token) {
      const payload = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
      if (payload) {
        next();
      } else {
        //Forbidden - tampered token
        req.error = 403;
        next();
      }
    } else {
      //Unauthorized - not logged in
      req.error = 401;
      next();
    }
  }

  static getUserInfo() {
    dotenv.config();
    return jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
  }
}
