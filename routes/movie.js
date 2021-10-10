const dbConnection = require("../connection/db");
const router = require("express").Router();
const uploadFile = require("../middlewares/uploadFile");
const pathFile = "http://localhost:4000/uploads/";

// Render movie page
router.get("/list", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const query1 = "SELECT m.id, m.title, g.id AS genre_id, g.genre, m.rating, m.duration_min, m.cover, m.synopsis, m.trailer_link FROM tb_movie AS m, tb_genre AS g WHERE m.genre_id = g.id ORDER BY m.created_at DESC";
  const query2 = "SELECT * FROM tb_genre ORDER BY genre";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query1, (err, movies) => {
      conn.query(query2, (err, genres) => {
        if (err) throw err;

        return res.render("movie/list", { title: "Ticket App > Movie", isLogin: req.session.isLogin, movies, genres });
      });
    });

    conn.release();
  });
});

// Handle add movie from client
router.post("/list", uploadFile("cover"), function (req, res) {
  const { title, genre_id, rating, duration_min, synopsis, trailer_link } = req.body;
  let cover = req.file.filename;

  const query = "INSERT INTO tb_movie (title, genre_id, rating, duration_min, cover, synopsis, trailer_link) VALUES (?,?,?,?,?,?,?)";

  if (title == "" || genre_id == "" || rating == "" || duration_min == "" || cover == "" || synopsis == "" || trailer_link == "") {
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
    conn.query(query, [title, genre_id, rating, duration_min, cover, synopsis, trailer_link], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect("list");
      } else {
        req.session.message = {
          type: "success",
          message: "Movie added successfull.",
        };

        res.redirect("list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Render edit movie page
router.get("/edit/:id", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const { id } = req.params;

  const query1 = "SELECT * FROM tb_movie WHERE id = ?";
  const query2 = "SELECT * FROM tb_genre ORDER BY genre";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query1, [id], (err, movie) => {
      conn.query(query2, [id], (err, genres) => {
        if (err) throw err;

        const movies = {
          ...movie[0],
          cover: pathFile + movie[0].cover,
        };

        res.render("movie/edit", { title: "Ticket App > Edit Movie", isLogin: req.session.isLogin, movies, genres });
      });
    });

    conn.release();
  });
});

// Handle update movie
router.post("/edit/:id", uploadFile("cover"), function (req, res) {
  const { id, title, genre_id, rating, duration_min, synopsis, trailer_link, oldImage } = req.body;

  let cover = oldImage.replace(pathFile, "");

  if (req.file) {
    cover = req.file.filename;
  }

  const query = "UPDATE tb_movie SET title = ?, genre_id = ?, rating = ?, duration_min = ?, cover = ?, synopsis = ?, trailer_link = ?  WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [title, genre_id, rating, duration_min, cover, synopsis, trailer_link, id], (err, results) => {
      if (err) {
        console.log(err);

        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/admin/movie/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Movie updated successfull.",
        };

        res.redirect("/admin/movie/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete movie
router.get("/delete/:id", function (req, res) {
  if (req.session.user.status !== "admin") {
    req.session.message = {
      type: "danger",
      message: "You're not the admin of this website",
    };
    return res.redirect("/");
  }

  const { id } = req.params;

  const query = "DELETE FROM tb_movie WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/admin/movie/list");
      }

      req.session.message = {
        type: "success",
        message: "Movie successfully deleted",
      };
      res.redirect("/admin/movie/list");
    });

    conn.release();
  });
});

module.exports = router;
