const dbConnection = require("../connection/db");
const router = require("express").Router();
const uploadFile = require("../middlewares/uploadFile");
const pathFile = "http://localhost:5000/uploads/";

// Render movie page
router.get("/list", function (req, res) {
  const query = "SELECT m.id, m.title, g.id AS genre_id, g.genre, m.rating, m.duration_min, m.cover FROM tb_genre AS g, tb_movie AS m WHERE m.genre_id = g.id ORDER BY m.created_at DESC";

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

// Handle add movie from client
router.post("/list", uploadFile("cover"), function (req, res) {
  const { title, genre_id, rating, duration_min } = req.body;
  let cover = req.file.filename;
  const query = "INSERT INTO tb_movie (title, genre_id, rating, duration_min, cover) VALUES (?,?,?,?,?)";

  if (title == "" || genre_id == "" || rating == "" || duration_min == "" || cover == "") {
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
    conn.query(query, [title, genre_id, rating, duration_min, cover], (err, results) => {
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
  const { id } = req.params;

  const query = "SELECT * FROM tb_movie WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      const movies = {
        ...results[0],
        cover: pathFile + results[0].cover,
        title: results[0].title,
        genre_id: results[0].genre_id,
        duration_min: results[0].duration_min,
      };

      res.render("movie/edit", { title: "Ticket App > Edit Movie", isLogin: req.session.isLogin, movies });
    });

    conn.release();
  });
});

// Handle update movie
router.post("/edit/:id", uploadFile("cover"), function (req, res) {
  const { id, title, genre_id, rating, duration_min } = req.body;

  // let cover = oldImage.replace(pathFile, "");

  // if (req.file) {
  //   cover = req.file.filename;
  // }

  let cover = req.file.filename;

  const query = "UPDATE tb_movie SET title = ?, genre_id = ?, rating = ? duration_min = ?, cover = ?  WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [title, genre_id, rating, duration_min, cover, id], (err, results) => {
      if (err) {
        console.log(err);

        req.session.message = {
          type: "danger",
          message: "Server error!",
        };

        res.redirect(`/movie/edit/${id}}`);
      } else {
        req.session.message = {
          type: "success",
          message: "Movie updated successfull.",
        };

        res.redirect("/movie/list");
      }
    });

    // Release connection back to pool
    conn.release();
  });
});

// Handle delete movie
router.get("/delete/:id", function (req, res) {
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
        res.redirect("/movie/list");
      }

      req.session.message = {
        type: "success",
        message: "Movie successfully deleted",
      };
      res.redirect("/movie/list");
    });

    conn.release();
  });
});

module.exports = router;
