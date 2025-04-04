const UsersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");

exports.postAddUser = (req, res, next) => {
  console.log("not my boss, ", req.body);
  // checking if there is already someone with that username in the database:
  UsersModel.findOne({
    email: req.body.email.toLowerCase(),
  }).then((foundUser) => {
    if (foundUser) {
      res.send({
        success: false,
        message: "This email/username already exists in the database",
      });
    } else {
      bcrypt.hash(req.body.password, 12, function (err, hash) {
        const userData = {
          name: req.body.name,
          email: req.body.email.toLowerCase(),
          password: hash,
        };
        const user = new UsersModel(userData)
          .save()
          .then((result) => {
            res.send({
              success: true,
            });
          })
          .catch((err) => console.log(err));
      });
    }
  });
};

exports.postAuthenticateUser = (req, res, next) => {
  // main purpose: 1. validate credentials 2. respond back with response.data.success: true depending on the auth
  UsersModel.findOne({
    email: req.body.email.toLowerCase(),
  })
    .then((foundUser) => {
      if (foundUser) {
        bcrypt
          .compare(req.body.password, foundUser.password)
          .then((passwordsMatch) => {
            if (passwordsMatch) {
              return res.status(200).json({
                // when authenticated,
                success: true,
                isAuthenticated: true,
                userId: foundUser._id,
                name: foundUser.name,
                // the above resopnse will be stored in the expo encrypted storage
                // after doing JSON.stringify() on the above response
              });
            } else {
              return res.status(401).json({
                // when incorrect password
                success: false,
                message: "Incorrect Password",
              });
            }
          });
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        // for any other errors that might occur during this process
        success: false,
        message: "server error" + err,
      });
    });
};

exports.logout = (req, res, next) => {};
