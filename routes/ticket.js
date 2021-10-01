const router = require("express").Router();

// Render showtime page
router.get("/showtime", function (req, res) {
  res.render("ticket/showtime", { title: "Ticket App > Showtime", isLogin: true });
});

// Render booking page
router.get("/booking", function (req, res) {
  res.render("ticket/booking", { title: "Ticket App > Booking", isLogin: true });
});

// Render payment page
router.get("/payment", function (req, res) {
  res.render("ticket/payment", { title: "Ticket App > Payment", isLogin: true });
});

module.exports = router;
