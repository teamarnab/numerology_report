const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));
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

app.post("/submit", async (req, res) => {
  const { fname, lname, date, month, year, gender } = req.body;

  const api_key = process.env.GEMINI_API_KEY;

  const genAI = new GoogleGenerativeAI(api_key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    "my name is arnab gupta, date of birth is 29/07/1993, gender is male, please prepare a numerology report for me with the following details: name number, sun sign, mulank, ruling planet of mulank, bhagyank, the ruling planet of bhagyank, kua number, lucky number, numbers to avoid, success number, lucky colours, lucky dates, lucy years, favourable colours, favourable dates, favourable years, auspicious numbers, auspicious dates, auspicious years, auspicious times. Please generate answer in alist format";

  const result = await model.generateContent(prompt);
  const generated_response = result.response.text();

  // Capitalize the first letter of first name & last name
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  firstname = capitalize(fname);
  lastname = capitalize(lname);

  const name = firstname + " " + lastname;

  res.render("result", {
    name,
    date,
    month,
    year,
    gender,
    generated_response,
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
