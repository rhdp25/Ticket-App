const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render booking page
router.get("/list", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const query1 =
    "SELECT t.id, u.id AS user_id, u.name, st.id AS showtime_id, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price, t.seat_number FROM tb_ticket AS t, tb_user AS u, tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE t.user_id = u.id AND t.showtime_id = st.id AND st.movie_id = m.id AND m.genre_id = g.id ORDER BY t.created_at DESC";
  const query2 = "SELECT * FROM tb_user ORDER BY name";
  const query3 = "SELECT st.id, m.id AS movie_id, m.title, st.date_show, st.time_show, st.venue, st.price FROM tb_movie AS m, tb_showtime AS st WHERE st.movie_id = m.id ORDER BY st.created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query1, (err, bookings) => {
      conn.query(query2, (err, users) => {
        conn.query(query3, (err, showtimes) => {
          if (err) throw err;

          return res.render("booking/list", { title: "Ticket App > Booking", isLogin: req.session.isLogin, bookings, users, showtimes });
        });
      });
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
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const { id } = req.params;

  const query1 = "SELECT * FROM tb_ticket WHERE id = ?";
  const query2 = "SELECT * FROM tb_user ORDER BY name";
  const query3 = "SELECT st.id, m.id AS movie_id, m.title, st.date_show, st.time_show, st.venue, st.price FROM tb_movie AS m, tb_showtime AS st WHERE st.movie_id = m.id ORDER BY st.created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query1, [id], (err, booking) => {
      conn.query(query2, [id], (err, users) => {
        conn.query(query3, [id], (err, showtimes) => {
          if (err) throw err;

          const bookings = { ...booking[0] };

          res.render("booking/edit", { title: "Ticket App > Edit Booking", isLogin: req.session.isLogin, bookings, users, showtimes });
        });
      });
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

        res.redirect(`/admin/booking/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Booking updated successfull.",
        };

        res.redirect("/admin/booking/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete booking
router.get("/delete/:id", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const { id } = req.params;

  const query = "DELETE FROM tb_ticket WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/admin/booking/list");
      } else {
        req.session.message = {
          type: "success",
          message: "Booking successfully deleted",
        };
        res.redirect("/admin/booking/list");
      }
    });

    conn.release();
  });
});

module.exports = router;
