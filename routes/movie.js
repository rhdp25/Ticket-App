const dbConnection = require("../connection/db");
const router = require("express").Router();

// Render genre page
router.get("/genre", function (req, res) {
  const query = "SELECT * FROM tb_genre ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let genres = [];

      for (let result of results) {
        genres.push(result);
      }

      res.render("movie/genre", { title: "Ticket App > Genre", isLogin: req.session.isLogin, genres });
    });

    conn.release();
  });
});

// Render movie page
router.get("/list", function (req, res) {
  const query = "SELECT * FROM tb_movie ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let movies = [];

      for (let result of results) {
        movies.push(result);
      }

      res.render("movie/list", { title: "Ticket App > Movie", isLogin: req.session.isLogin, movies });
    });

    conn.release();
  });
});

// Handle add genre from client
router.post("/genre", function (req, res) {
  const { genre } = req.body;

  const query = "INSERT INTO tb_genre (genre) VALUES (?)";

  if (genre == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("movie/genre");
    return;
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    req.session.message = {
      type: "success",
      message: "Genre added successfull.",
    };
    res.redirect("movie/genre");
    return;
  });

  // Release connection back to pool
  conn.release();
});

// Handle add movie from client
router.post("/list", function (req, res) {
  const { title, genre_id, rating, duration_min, cover } = req.body;

  const query = "INSERT INTO tb_movie (title, genre_id, rating, duration_min, cover) VALUES (?,?,?,?,?)";

  if (title == "" || genre_id == "" || rating == "" || duration_min == "" || cover == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("movie/list");
    return;
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    req.session.message = {
      type: "success",
      message: "Movie added successfull.",
    };
    res.redirect("movie/list");
    return;
  });

  // Release connection back to pool
  conn.release();
});

module.exports = router;
