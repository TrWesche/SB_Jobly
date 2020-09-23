/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const authenticationToken = (req.cookies.uvert) ? req.cookies.uvert : req.body.token;
    const payload = jwt.verify(authenticationToken, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  try {
    if (req.user) {
      return next();
    }
    return next({ status: 401, message: "Unauthorized" });
  } catch (error) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    }

    return next({ status: 401, message: "Unauthorized" });
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

function ensureIsAdmin(req, res, next) {
  try {
    if (req.user.is_admin) {
      return next();
    }

    return next({ status: 401, message: "Unauthorized" });
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureIsAdmin
};
