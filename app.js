const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("express-async-errors");
require("dotenv").config();

const auth = require("./middlewares/auth.mdw");
const handlerError = require("./middlewares/error-response.mdw");
const AppError = require("./utils/appError");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", function (req, res) {
  res.json({
    message: "Hello world!",
  });
});

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/user", require("./routes/user.route"));
app.use("/api/academy", require("./routes/academy.route"));
app.use("/api/category", require("./routes/academy-category.route"));

// Routes For admin
app.use(
  "/api/admin/academy-category",
  auth,
  require("./routes/admin/academy-category.route")
);
app.use("/api/admin/academy", auth, require("./routes/admin/academy.route"));
app.use("/api/admin/user", auth, require("./routes/admin/user.route"));

// Routes For user

// app.use(function (req, res, next) {
//   res.status(404).json({
//     error: "Endpoint not found",
//   });
// });

// app.use(function (err, req, res, next) {
//   console.error(err.stack);
//   res.status(500).json({
//     error: "something broke!",
//   });
// });

// handle undefined Routes
app.use("*", (req, res, next) => {
  const err = new AppError(404, "undefined route");
  next(err);
});

app.use(handlerError);

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Back-end api is running at http://localhost:${PORT}`);
});
