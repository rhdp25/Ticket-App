const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render payment page
router.get("/list", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const query1 =
    "SELECT p.id, t.id AS ticket_id, u.name, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price, t.seat_number, p.amount, p.sub_total FROM tb_payment AS p, tb_ticket AS t, tb_user AS u, tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE p.ticket_id = t.id AND t.user_id = u.id AND t.showtime_id = st.id AND st.movie_id = m.id AND m.genre_id = g.id ORDER BY p.created_at DESC";
  const query2 =
    "SELECT t.id, u.id AS user_id, u.name, st.id AS showtime_id, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price AS price, t.seat_number FROM tb_ticket AS t, tb_user AS u, tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE t.user_id = u.id AND t.showtime_id = st.id AND st.movie_id = m.id AND m.genre_id = g.id ORDER BY t.created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query1, (err, payments) => {
      conn.query(query2, (err, bookings) => {
        if (err) throw err;

        return res.render("payment/list", { title: "Ticket App > Payments", isLogin: req.session.isLogin, payments, bookings });
      });
    });

    conn.release();
  });
});

// Handle add payment from client
router.post("/list", function (req, res) {
  const { ticket_id, amount, sub_total } = req.body;

  const query = "INSERT INTO tb_payment (ticket_id, amount, sub_total) VALUES (?,?,?)";

  if (ticket_id == "" || amount == "" || sub_total == "") {
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
    conn.query(query, [ticket_id, amount, sub_total], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect("list");
      } else {
        req.session.message = {
          type: "success",
          message: "Payment added successfull.",
        };

        res.redirect("list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Render edit payment page
router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  const query1 = "SELECT * FROM tb_payment WHERE id = ?";
  const query2 =
    "SELECT t.id, u.id AS user_id, u.name, st.id AS showtime_id, m.title, g.genre, m.rating, m.duration_min, m.cover, st.date_show, st.time_show, st.venue, st.price AS price, t.seat_number FROM tb_ticket AS t, tb_user AS u, tb_genre AS g, tb_movie AS m, tb_showtime AS st WHERE t.user_id = u.id AND t.showtime_id = st.id AND st.movie_id = m.id AND m.genre_id = g.id ORDER BY t.created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query1, [id], (err, payment) => {
      conn.query(query2, [id], (err, bookings) => {
        if (err) throw err;

        const payments = { ...payment[0] };

        res.render("payment/edit", { title: "Ticket App > Edit Payment", isLogin: req.session.isLogin, payments, bookings });
      });
    });

    conn.release();
  });
});

// Handle update payment
router.post("/edit/:id", function (req, res) {
  const { id, ticket_id, amount, sub_total } = req.body;

  const query = "UPDATE tb_payment SET ticket_id = ?, amount = ?, sub_total = ?  WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [ticket_id, amount, sub_total, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/admin/payment/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Payment updated successfull.",
        };

        res.redirect("/admin/payment/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete payment
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_payment WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/admin/payment/list");
      }

      req.session.message = {
        type: "success",
        message: "Payment successfully deleted",
      };
      res.redirect("/admin/payment/list");
    });

    conn.release();
  });
});

module.exports = router;
