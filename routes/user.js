const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render detail movie page
router.get("/movieDetail/:id", function (req, res) {
  const { id } = req.params;

  const query = "SELECT * FROM tb_movie WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, movies) => {
      if (err) throw err;

      const movie = { ...movies[0] };

      return res.render(`user/movieDetail`, { title: "Ticket App > Movie Detail", isLogin: req.session.isLogin, movie });
    });

    conn.release();
  });
});

// Render booking page
router.get("/movieTicket", function (req, res) {
  if (!req.session.isLogin) {
    req.session.message = {
      type: "danger",
      message: "Please login before access this page",
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

          return res.render("user/movieTicket", { title: "Ticket App > Booking", isLogin: req.session.isLogin, bookings, users, showtimes });
        });
      });
    });

    conn.release();
  });
});

// Handle add booking from client
router.post("/movieTicket", function (req, res) {
  const { showtime_id, seat_number } = req.body;
  const user_id = req.session.user.id;

  const query = "INSERT INTO tb_ticket (user_id, showtime_id, seat_number) VALUES (?,?,?)";

  if (showtime_id == "" || seat_number == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("user/movieTicket");
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

        res.redirect("movieTicket");
      } else {
        req.session.message = {
          type: "success",
          message: "Ticket booking successfull. Please bring your ID card to our counter for redeem.",
        };

        res.redirect("movieTicket");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

module.exports = router;
