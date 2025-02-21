const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

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
  const { fname, lname, date, month, year, gender } = req.body;

  // Capitalize the first letter of first name & last name
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  firstname = capitalize(fname);
  lastname = capitalize(lname);

  res.render("result", {
    firstname,
    lastname,
    date,
    month,
    year,
    gender,
  });
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
