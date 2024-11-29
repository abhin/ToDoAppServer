import { login, googleLoginCallBack, googleUserVerify } from "../controllers/auth.js";
import express from "express";
import { getValidationResult } from "../middlewares/validator.js";
import { body } from "express-validator";
import passport from "passport";
import { isLoggedIn } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/login",
  body("email").exists().trim().isEmail().withMessage("Invalid Credentials"),
  body("password")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Invalid Credentials"),
  getValidationResult,
  login
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleLoginCallBack
);

router.post("/google/verify", isLoggedIn, googleUserVerify);

export default router;
