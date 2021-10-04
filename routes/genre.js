const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render genre page
router.get("/list", function (req, res) {
  const query = "SELECT * FROM tb_genre ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let genres = [];

      for (let result of results) {
        genres.push(result);
      }

      res.render("genre/list", { title: "Ticket App > Genre", isLogin: req.session.isLogin, genres });
    });

    conn.release();
  });
});

// Handle add genre from client
router.post("/list", function (req, res) {
  const { genre } = req.body;

  const query = "INSERT INTO tb_genre (genre) VALUES (?)";

  if (genre == "") {
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
    conn.query(query, [genre], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect("list");
      } else {
        req.session.message = {
          type: "success",
          message: "Genre added successfull.",
        };

        res.redirect("list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Render edit genre page
router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  const query = "SELECT * FROM tb_genre WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      const genres = { ...results[0] };

      res.render("genre/edit", { title: "Ticket App > Edit Genre", isLogin: req.session.isLogin, genres });
    });

    conn.release();
  });
});

// Handle update genre
router.post("/edit/:id", function (req, res) {
  const { id, genre } = req.body;

  const query = "UPDATE tb_genre SET genre = ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [genre, id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/genre/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Genre updated successfull.",
        };

        res.redirect("/genre/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete genre
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_genre WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/genre/list");
      }

      req.session.message = {
        type: "success",
        message: "Genre successfully deleted",
      };
      res.redirect("/genre/list");
    });

    conn.release();
  });
});

module.exports = router;
