import jwt from "jsonwebtoken";
import { Strategy } from "passport-google-oauth20";

export function isLoggedIn(req, res, next) {
  const token = req.headers.authorization;

  try {
    if (!token) throw new Error("Invalid access token");

    const data = jwt.verify(token, process?.env?.JWT_KEY);
    req.authUser = data;
    next();
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}

export const googleStrategy = () => {
  return new Strategy(
    {
      clientID: process?.env?.GOOGLE_CLIENT_ID,
      clientSecret: process?.env?.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_HOST_URL}/api/v1/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, cb) {
      try {
        return cb(null, { profile });
      } catch (error) {
        return cb(error);
      }
    }
  );
};
