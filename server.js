const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// route imports:
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// middlewares and routing logic:

app.use(express.json()); // to be able to process json as responses
app.use(bodyParser.urlencoded({ extended: true })); // to process form data
app.use(cookieParser());

// routing middlewares
app.use(adminRoutes);
app.use(userRoutes);

app.get("/", (req, res, next) => {
  res.json("API up and running");
});

mongoose
  .connect(process.env.DB_URI)
  .then((result) => {
    // console.log(result);
    app.listen(3000);
  })
  .catch((err) => console.log(err));
