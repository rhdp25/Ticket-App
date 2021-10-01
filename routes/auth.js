const router = require("express").Router();

// Render login page
router.get("/login", function (req, res) {
  res.render("auth/login", { title: "Ticket App > Login", isLogin: true });
});

// Render register page
router.get("/register", function (req, res) {
  res.render("auth/register", { title: "Ticket App > Register", isLogin: true });
});

module.exports = router;
