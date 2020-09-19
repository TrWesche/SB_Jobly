/** Express app for jobly. */

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const ExpressError = require("./helpers/expressError");
const app = express();

const { authenticateJWT } = require("./middleware/auth")

app.use(express.json());
app.use(cookieParser());
app.use(authenticateJWT);

// add logging system
app.use(morgan("tiny"));

/** Routes */
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  // console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
