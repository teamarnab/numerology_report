const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure Express knows where to find EJS files
app.set("views", path.join(__dirname, "/views"));

//ROUTES

// Define a route for rendering index.ejs
app.get("/", (req, res) => {
  res.render("index"); // No need to add .ejs, Express handles it
});

app.post("/submit", (req, res) => {
  const { name, number } = req.body;
  res.json({ Name: name, Number: number });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
