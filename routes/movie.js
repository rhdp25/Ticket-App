const router = require("express").Router();

// Render genre page
router.get("/genre", function (req, res) {
  res.render("movie/genre", { title: "Ticket App > Genre", isLogin: true });
});

// Render movie page
router.get("/list", function (req, res) {
  res.render("movie/list", { title: "Ticket App > Movie", isLogin: true });
});

module.exports = router;
