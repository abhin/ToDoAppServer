import bcrypt from "bcrypt";
import isUrl from "is-url";
import User from "../modals/user.js";
import {
  generateAccessToken,
  sendAccountActivationEmail,
  getProfilePicUrl,
} from "../utilities/function.js";

async function login(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error("Invalid login.");
    }

    const user = await User.findOne({ email });
    const match = user && (await bcrypt.compare(password, user?.password));

    if (!match) {
      throw new Error("Invalid login credentials.");
    }

    if (!user?.active) {
      throw new Error("Account is inactive.");
    }

    res.status(200).json({
      success: true,
      message: "Login success",
      user: {
        token: generateAccessToken(user._id),
        name: user.name,
        email: user.email,
        profilePic:
          (isUrl(user.profilePic) && user.profilePic) ||
          getProfilePicUrl(req, user.profilePic),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function googleLoginCallBack(req, res) {
  const { name, picture, email, email_verified } = JSON.parse(
    req?.user?.profile?._raw
  );

  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        profilePic: picture,
        active: email_verified,
      },
      { new: true, upsert: true, sort: { createdAt: -1 } }
    );

    if (!user.active && !(await sendAccountActivationEmail(user))) {
      throw new Error(
        "Failed to send activation email. Please contact support."
      );
    }

    res.redirect(
      `${process.env.CLIENT_HOST_URL}/${generateAccessToken(email, "1d")}`
    );
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

function googleUserVerify(req, res) {
  const { uId } = req.authUser;

  User.findOne({ email: uId })
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Google user verification success",
        user: {
          token: generateAccessToken(data._id),
          name: data.name,
          email: data.email,
          profilePic: data.profilePic,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: "Error/ Timeout Google user verification. Please try again",
        error: err,
      });
    });
}

export { login, googleLoginCallBack, googleUserVerify };
