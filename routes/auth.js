const dbConnection = require("../connection/db");
const router = require("express").Router();

// Import bcrypt for password hashing
const bcrypt = require("bcrypt");

// Render login page
router.get("/login", function (req, res) {
  res.render("auth/login", { title: "Ticket App > Login", isLogin: req.session.isLogin });
});

// Render register page
router.get("/register", function (req, res) {
  res.render("auth/register", { title: "Ticket App > Register", isLogin: req.session.isLogin });
});

// Logout
router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

// Login handler
router.post("/login", function (req, res) {
  const { email, password } = req.body;
  const query = "SELECT id, name, email, password FROM tb_user WHERE email=?";

  if (email == "" || password == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("/auth/login");
    return;
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [email, password], (err, results) => {
      if (err) throw err;

      const isMatch = bcrypt.compareSync(password, results[0].password);
      if (!isMatch) {
        req.session.message = {
          type: "danger",
          message: "Email or password are incorrect. Please try again!",
        };
        return res.redirect("/auth/login");
      } else {
        req.session.message = {
          type: "success",
          message: "Login successfull. Welcome back!",
        };

        req.session.isLogin = true;
        req.session.user = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
        };

        return res.redirect("/");
      }
    });

    conn.release();
  });
});

// Handle register from client
router.post("/register", function (req, res) {
  const { name, email, password } = req.body;

  const query = "INSERT INTO tb_user(name, email, password) VALUES (?,?,?)";

  if (name == "" || email == "" || password == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("/auth/register");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // Execute query
    conn.query(query, [name, email, hashedPassword], (err, results) => {
      if (err) throw err;

      req.session.message = {
        type: "success",
        message: "Register successfull. You can login.",
      };
      res.redirect("/auth/register");
      return;
    });

    // Release connection back to pool
    conn.release();
  });
});

module.exports = router;
