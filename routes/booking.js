const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render booking page
router.get("/list", function (req, res) {
  const query =
    "SELECT t.id, u.id AS user_id, u.name, st.id AS showtime_id, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price, t.seat_number FROM tb_ticket AS t, tb_user AS u, tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE t.user_id = u.id AND t.showtime_id = st.id AND st.movie_id = m.id AND m.genre_id = g.id ORDER BY t.created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let bookings = [];

      for (let result of results) {
        bookings.push(result);
      }

      res.render("booking/list", { title: "Ticket App > Booking", isLogin: req.session.isLogin, bookings });
    });

    conn.release();
  });
});

// Handle add booking from client
router.post("/list", function (req, res) {
  const { user_id, showtime_id, seat_number } = req.body;

  const query = "INSERT INTO tb_ticket (user_id, showtime_id, seat_number) VALUES (?,?,?)";

  if (user_id == "" || showtime_id == "" || seat_number == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("list");
    return;
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [user_id, showtime_id, seat_number], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect("list");
      } else {
        req.session.message = {
          type: "success",
          message: "Booking added successfull.",
        };

        res.redirect("list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Render edit booking page
router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  const query = "SELECT * FROM tb_ticket WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      const bookings = { ...results[0] };

      res.render("booking/edit", { title: "Ticket App > Edit Booking", isLogin: req.session.isLogin, bookings });
    });

    conn.release();
  });
});

// Handle update booking
router.post("/edit/:id", function (req, res) {
  const { id, user_id, showtime_id, seat_number } = req.body;

  const query = "UPDATE tb_ticket SET user_id = ?, showtime_id = ?, seat_number = ?  WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [user_id, showtime_id, seat_number, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/booking/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Booking updated successfull.",
        };

        res.redirect("/booking/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete booking
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_booking WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/booking/list");
      }

      req.session.message = {
        type: "success",
        message: "Booking successfully deleted",
      };
      res.redirect("/booking/list");
    });

    conn.release();
  });
});

module.exports = router;
