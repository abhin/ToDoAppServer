import bcrypt from "bcrypt";
import User from "../modals/user.js";
import {
  sendAccountActivationEmail,
  sendEmail,
} from "../utilities/function.js";
import jwt from "jsonwebtoken";

async function create(req, res) {
  const { name, email, password, profilePic, active } = req.body;

  try {
    if (!name || !email || !password) {
      throw new Error(
        "Failed to create User name, email, password are required."
      );
    }

    const existingUser = await User.exists({ email });

    if (existingUser != null) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hashSync(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      profilePic,
      active,
    });

    if (!user) {
      throw new Error("Error found during User creation");
    }

    const status = await sendAccountActivationEmail(user);

    if (!status) {
      throw new Error(
        "Failed to send activation email. Please contact support."
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Account is created successfully. Please check your email for the account activation email.",
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

function getAllUsers(req, res) {
  User.find()
    .then((data) => {
      res.status(200).json({
        success: true,
        user: data,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: "Error found during User creation",
        error: err,
      });
    });
}

async function update(req, res) {
  const { name, email, password, active } = req.body;
  const profilePic = req?.file?.path;
  const token = req.headers.authorization;
  const id = req?.authUser?.uId;

  const existingUser = await User.exists({ email, _id: { $ne: id } });

  if (existingUser != null) {
    res.status(400).json({
      success: false,
      message: "This email is already used. ",
    });
  } else {
    const statusChange = (email != existingUser?.email && false) || active;
    User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        password,
        active: statusChange,
        profilePic,
      },
      { new: true }
    )
      .then((data) => {
        res.status(200).json({
          success: true,
          message: "User is Updated",
          user: {
            token: token,
            name: data.name,
            email: data.email,
            profilePic: data.profilePic || data.googleProfilePic,
          },
        });
      })
      .catch((err) => {
        res.status(400).json({
          success: false,
          message: "Error found during User creation",
          error: err,
        });
      });
  }
}

async function deleteUser(req, res) {
  const { _id } = req?.params;
  const existingUser = await User.exists({ _id });

  if (existingUser == null) {
    res.status(400).json({
      success: false,
      message: "User does not exist",
    });
  } else {
    User.findByIdAndDelete(_id)
      .then((data) => {
        res.status(200).json({
          success: true,
          message: `User is deleted Id: ${_id}`,
        });
      })
      .catch((err) => {
        res.status(400).json({
          success: false,
          message: "Error found during User creation",
          error: err,
        });
      });
  }
}

async function activate(req, res) {
  const { token } = req.params;
  let data;

  try {
    if (!token) throw new Error("Unauthorization access");

    await jwt.verify(token, process?.env?.JWT_KEY, function (err, decoded) {
      if (err) throw new Error("Invalid url.");
      data = decoded;
    });

    const activated = await User.findById(data?.uId);

    if (activated?.active) {
      return res.status(400).json({
        success: false,
        message: "Invalid url",
      });
    }

    const user = await User.findByIdAndUpdate(data?.uId, { active: true });

    if (!user)
      throw new Error("Activation failed. Please check the URL is valid.");

    const status = await sendEmail({
      to: user?.email,
      subject: "Your ToDo Account is activated",
      text: `
                  Thank you ${user?.name}!
                  Your account is activated successfully. Now you can use the todo account.
              `,
    });

    if (!status)
      throw new Error("Account activation succes. Failed to send email.");

    return res.status(200).json({
      success: true,
      message: "Account is activated",
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export { create, getAllUsers, update, deleteUser, activate };
