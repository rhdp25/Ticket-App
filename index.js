// Import package
const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const hbs = require("hbs");

// Import routes
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const bookingRoute = require("./routes/booking");
const genreRoute = require("./routes/genre");
const movieRoute = require("./routes/movie");
const paymentRoute = require("./routes/payment");
const showtimeRoute = require("./routes/showtime");

// Import db connection
// const dbConnection = require("./connection/db");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// HTML form parser
app.use(express.urlencoded({ extended: false }));

// Set views location to app
app.set("views", path.join(__dirname, "views"));

// Set template / view engine
app.set("view engine", "hbs");

// Register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// User cookie
app.use(
  session({
    cookie: {
      maxAge: 3 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue",
  })
);

// Use flash for sending message
app.use(flash());

// Setup flash message
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Render home page
app.get("/", function (req, res) {
  res.render("index", { title: "Ticket App", isLogin: req.session.isLogin });
});

// Mount routes
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/admin/booking", bookingRoute);
app.use("/admin/genre", genreRoute);
app.use("/admin/movie", movieRoute);
app.use("/admin/payment", paymentRoute);
app.use("/admin/showtime", showtimeRoute);

// Create HTTP server
const server = http.createServer(app);
const port = 4000;
server.listen(port, () => {
  console.log("server running on port: ", port);
});
