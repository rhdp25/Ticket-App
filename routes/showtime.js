const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render showtime page
router.get("/list", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const query1 =
    "SELECT st.id, m.id AS movie_id, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price FROM tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE st.movie_id = m.id AND m.genre_id = g.id ORDER BY st.created_at DESC";
  const query2 = "SELECT * FROM tb_movie ORDER BY title";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query1, (err, showtimes) => {
      conn.query(query2, (err, movies) => {
        if (err) throw err;

        return res.render("showtime/list", { title: "Ticket App > Show Time", isLogin: req.session.isLogin, showtimes, movies });
      });
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
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const { id } = req.params;

  const query1 = "SELECT * FROM tb_showtime WHERE id = ?";
  const query2 = "SELECT * FROM tb_movie ORDER BY title";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query1, [id], (err, showtime) => {
      conn.query(query2, [id], (err, movies) => {
        if (err) throw err;

        const showtimes = { ...showtime[0] };

        res.render("showtime/edit", { title: "Ticket App > Edit Show RIme", isLogin: req.session.isLogin, showtimes, movies });
      });
    });

    conn.release();
  });
});

// Handle update show time
router.post("/edit/:id", function (req, res) {
  const { id, movie_id, date_show, time_show, venue, price } = req.body;

  const query = "UPDATE tb_showtime SET movie_id = ?, date_show = ?, time_show = ?, venue = ?, price = ?  WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [movie_id, date_show, time_show, venue, price, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/admin/showtime/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Show time updated successfull.",
        };

        res.redirect("/admin/showtime/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete show time
router.get("/delete/:id", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

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
        res.redirect("/admin/showtime/list");
      }

      req.session.message = {
        type: "success",
        message: "Show time successfully deleted",
      };
      res.redirect("/admin/showtime/list");
    });

    conn.release();
  });
});

module.exports = router;
