const express = require("express");
const morgan = require("morgan");
require("express-async-errors");
const cors = require("cors");

const auth = require("./middlewares/auth.mdw");

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

// For admin
app.use("/api/admin/academy-category", auth, require("./routes/admin/academy-category.route"));
app.use("/api/admin/academy", auth, require("./routes/admin/academy.route"));
app.use("/api/admin/teacher", auth, require("./routes/admin/teacher.route"));


// For user

app.use(function (req, res, next) {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error: "something broke!",
  });
});

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Back-end api is running at http://localhost:${PORT}`);
});
