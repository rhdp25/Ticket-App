const http = require("http");
const express = require("express");
const path = require("path");

const app = express();
const hbs = require("hbs");

// app.use(express.static("express"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));

// Set views location to app
app.set("views", path.join(__dirname, "views"));

// Set template / view engine
app.set("view engine", "hbs");

// Register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// Render home page
app.get("/", function (req, res) {
  res.render("index", { title: "Ticket App", isLogin: false });
});

const server = http.createServer(app);
const port = 4000;
server.listen(port, () => {
  console.log("server running on port: ", port);
});
