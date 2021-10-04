const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render showtime page
router.get("/list", function (req, res) {
  const query =
    "SELECT st.id, m.id AS movie_id, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price FROM tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE st.movie_id = m.id AND m.genre_id = g.id ORDER BY st.created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let showtimes = [];

      for (let result of results) {
        showtimes.push(result);
      }

      res.render("showtime/list", { title: "Ticket App > Show Time", isLogin: req.session.isLogin, showtimes });
    });

    conn.release();
  });
});

// Handle add showtime from client
router.post("/list", function (req, res) {
  const { movie_id, date_show, time_show, venue, price } = req.body;

  const query = "INSERT INTO tb_showtime (movie_id, date_show, time_show, venue, price) VALUES (?,?,?,?,?)";

  if (movie_id == "" || date_show == "" || time_show == "" || venue == "" || price == "") {
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
    conn.query(query, [movie_id, date_show, time_show, venue, price], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect("showtime");
      } else {
        req.session.message = {
          type: "success",
          message: "Showtime added successfull.",
        };

        res.redirect("list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Render edit show time page
router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  const query = "SELECT * FROM tb_showtime WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      const showtimes = { ...results[0] };

      res.render("showtime/edit", { title: "Ticket App > Edit Show RIme", isLogin: req.session.isLogin, showtimes });
    });

    conn.release();
  });
});

// Handle update show time
router.post("/edit/:id", function (req, res) {
  const { id, movie_id, date_show, time_show, venue, price } = req.body;

  const query = "UPDATE tb_showtime SET movie_id = ?, data_show = ?, time_show = ? venue = ?, price = ?  WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [movie_id, date_show, time_show, venue, price, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/showtime/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Show time updated successfull.",
        };

        res.redirect("/showtime/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete show time
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_showtime WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/showtime/list");
      }

      req.session.message = {
        type: "success",
        message: "Show time successfully deleted",
      };
      res.redirect("/showtime/list");
    });

    conn.release();
  });
});

module.exports = router;
