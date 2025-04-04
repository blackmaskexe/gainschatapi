const express = require("express");
const usersController = require("../controllers/usersController");
const userLogsController = require("../controllers/userLogsController");
const exercisesController = require("../controllers/exercisesController");
const adminLoginController = require("../controllers/adminLoginController");

const router = express.Router();

router.get(
  "/admin",
  adminLoginController.authenticateUserToken,
  (req, res, next) => {
    res.render("admin-menu");
  }
);

router.get("/admin/login", (req, res, next) => {
  res.render("admin-login");
});

router.post("/admin/login", adminLoginController.generateToken);

router.get(
  "/admin/add-user",
  adminLoginController.authenticateUserToken,
  (req, res, next) => {
    // admin version of creating a user
    res.render("user-create-form");
  }
);
router.post(
  "/admin/add-user",
  adminLoginController.authenticateUserToken,
  usersController.postAddUser
); // tied to the above admin add user middleware

router.get(
  "/admin/add-exercise",
  adminLoginController.authenticateUserToken,
  (req, res, next) => {
    res.render("exercise-add-form");
  }
);

router.post(
  "/admin/add-exercise",
  adminLoginController.authenticateUserToken,
  exercisesController.postAddExercise
);

module.exports = router;
