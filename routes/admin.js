const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render admin dashboard page
router.get("/dashboard", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  res.render("admin/dashboard", { title: "Ticket App | Admin Dashboard", isLogin: req.session.isLogin });
});

module.exports = router;
