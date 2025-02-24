const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");

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
  const { fname, lname, date, month, year, gender, p_o_b } = req.body;

  const api_key = process.env.GEMINI_API_KEY;

  const genAI = new GoogleGenerativeAI(api_key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `my name is ${fname} ${lname}, date of birth is ${date}-${month}-${year}, gender is ${gender}, place of birth is ${p_o_b}. with these details, please prepare a brief numerology report for me based on Chaldean system and generate the following (just the answer not the process to calculate) in this format (question: answer) and no other text apart from the answer. also please put || symbol after each question answer pair: name number, sun sign, mulank, ruling planet of mulank, bhagyank, the ruling planet of bhagyank, kua number, lucky number, numbers to avoid, success number, lucky colours, lucky dates, lucy years, favourable colours, favourable dates, favourable years, auspicious numbers, auspicious dates, auspicious years, auspicious times.`;

  const result = await model.generateContent(prompt);
  const generated_response = result.response.text();

  // Capitalize the first letter of first name & last name
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const firstname = capitalize(fname);
  const lastname = capitalize(lname);
  const sex = capitalize(gender);
  const pob = capitalize(p_o_b);

  const name = firstname + " " + lastname;

  res.render("result", {
    name,
    date,
    month,
    year,
    sex,
    pob,
    generated_response,
  });
});

// Download PDF functionality
app.post("/download-pdf", async (req, res) => {
  const { name, date, month, year, gender, pob, generated_response } = req.body;

  try {
    // Render EJS to HTML string
    const htmlContent = await new Promise((resolve, reject) => {
      res.render(
        "report-template",
        { name, date, month, year, gender, pob, generated_response },
        (err, html) => {
          if (err) reject(err);
          resolve(html);
        }
      );
    });

    // Launch Puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the content of the page
    await page.setContent(htmlContent, { waitUntil: "load" });

    // Generate PDF
    const pdfPath = path.join(__dirname, "public", "report.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Send the PDF for download
    res.download(pdfPath, `${name}-numerology-report.pdf`, (err) => {
      if (err) console.error("Download Error:", err);
      fs.unlinkSync(pdfPath); // Delete the file after download
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).send("Error generating PDF");
  }
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
