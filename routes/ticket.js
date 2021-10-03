const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render showtime page
router.get("/showtime", function (req, res) {
  const query = "SELECT * FROM tb_showtime ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let showtimes = [];

      for (let result of results) {
        showtimes.push(result);
      }

      res.render("ticket/showtime", { title: "Ticket App > Show Time", isLogin: req.session.isLogin, showtimes });
    });

    conn.release();
  });
});

// Render booking page
router.get("/booking", function (req, res) {
  const query = "SELECT * FROM tb_ticket ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let bookings = [];

      for (let result of results) {
        bookings.push(result);
      }

      res.render("ticket/booking", { title: "Ticket App > Booking", isLogin: req.session.isLogin, bookings });
    });

    conn.release();
  });
});

// Render payment page
router.get("/payment", function (req, res) {
  const query = "SELECT * FROM tb_payment ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let payments = [];

      for (let result of results) {
        payments.push(result);
      }

      res.render("ticket/payment", { title: "Ticket App > Payments", isLogin: req.session.isLogin, payments });
    });

    conn.release();
  });
});

module.exports = router;
