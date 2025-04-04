const AdminUserModel = require("../models/adminUserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const JWT_SECRET_ID = process.env.JWT_SECRET;

exports.generateToken = async (req, res, next) => {
  // finding if a user with that username exists in the database:
  const adminUser = await AdminUserModel.findOne({
    username: req.body.username.toLowerCase(),
  });

  // checking password hash with entered password hash:
  if (adminUser) {
    const passwordsMatch = await bcrypt.compare(
      req.body.password,
      adminUser.password
    );

    if (passwordsMatch) {
      // if the passwords match, we log the user in by sending a cookie containing a jwt token
      const token = jwt.sign(
        {
          userId: adminUser._id,
        },
        JWT_SECRET_ID,
        {
          expiresIn: "1h",
        }
      );

      // sending this token inside a cookie to the user
      res.cookie("authToken", token, {
        httpOnly: true, // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // recommended security option
        maxAge: 3600000, // 1 hour (in milliseconds) - matches token expiration
        // domain: "gainschatapi.prathamsnehi.com", // enable this only when in prod, otherwise it defaults to localhost (ideal for testing)
        path: "/", // access cookie on all routes of this subdomain
      });

      res.render("admin-menu");
    } else {
      res.render("admin-login", {
        error: "Incorrect Password",
      });
    }
  } else {
    // console.alert("User does not exist");
    res.render("admin-login", {
      error: "The admin user does not exist",
    });
  }
};

exports.authenticateUserToken = async (req, res, next) => {
  const token = req.cookies.authToken;
  console.log(
    "in your birthday suit, take all all along, i don't waanna see you",
    req.cookies
  );
  if (!token) {
    return res.render("admin-login", {
      error: "Unauthorized, no token present",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET_ID);
    const user = await AdminUserModel.findById(decoded.userId);

    if (!user) {
      return res.render("admin-login", {
        error: "Invalid Credentials",
      });
    }

    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.render("admin-login", {
      error: "Invalid token",
    });
  }
};
