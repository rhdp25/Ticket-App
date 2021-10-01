// Import package
const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const hbs = require("hbs");

const authRoute = require("./routes/auth");
const movieRoute = require("./routes/movie");
const ticketRoute = require("./routes/ticket");
const { Cookie } = require("express-session");

// app.use(express.static("express"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));

// Set views location to app
app.set("views", path.join(__dirname, "views"));

// Set template / view engine
app.set("view engine", "hbs");

// Register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

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

// Render home page
app.get("/", function (req, res) {
  res.render("index", { title: "Ticket App", isLogin: req.session.isLogin });
});

// Use route
app.use("/auth", authRoute);
app.use("/movie", movieRoute);
app.use("/ticket", ticketRoute);

const server = http.createServer(app);
const port = 4000;
server.listen(port, () => {
  console.log("server running on port: ", port);
});
