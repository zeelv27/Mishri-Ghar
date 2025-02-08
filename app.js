const express = require("express"); // Import Express framework
const sqlite3 = require("sqlite3").verbose(); // Import SQLite3 database
const bodyParser = require("body-parser"); // Import Body-Parser for parsing JSON requests

const app = express(); // Initialize Express app
const port = 3000; // Define the port where the server will run

// Middleware
app.use(bodyParser.json()); // Middleware to parse JSON request bodies

// Connect to SQLite Database (Creates a file if it doesn't exist)
const db = new sqlite3.Database(
  "./test.db", // Database file name
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, // Open in create/read/write mode
  (err) => {
    if (err) return console.error(err.message); // Handle connection error
  }
);

// Create "desserts" Table if it doesn't exist
db.run(
  `CREATE TABLE IF NOT EXISTS desserts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    dessert_name TEXT, 
    recipe TEXT
  )`
);

// API Routes

// 1. Get all desserts
app.get("/desserts", (req, res) => {
  db.all(`SELECT * FROM desserts`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); // Handle errors
    res.json(rows); // Send all desserts as JSON response
  });
});

// 2. Add a new dessert
app.post("/desserts", (req, res) => {
  const { dessert_name, recipe } = req.body; // Extract dessert details from request body
  db.run(
    `INSERT INTO desserts (dessert_name, recipe) VALUES (?, ?)`,
    [dessert_name, recipe],
    function (err) {
      if (err) return res.status(500).json({ error: err.message }); // Handle errors
      res.json({ id: this.lastID, message: "Dessert added successfully!" }); // Return success message with new ID
    }
  );
});

// 3. Update a dessert
app.put("/desserts/:id", (req, res) => {
  const { dessert_name } = req.body; // Extract new dessert name from request body
  const { id } = req.params; // Extract ID from URL params
  db.run(
    `UPDATE desserts SET dessert_name = ? WHERE id = ?`,
    [dessert_name, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message }); // Handle errors
      res.json({ message: "Dessert updated successfully!" }); // Return success message
    }
  );
});

// 4. Delete a dessert
app.delete("/desserts/:id", (req, res) => {
  const { id } = req.params; // Extract ID from URL params
  db.run(`DELETE FROM desserts WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message }); // Handle errors
    res.json({ message: "Dessert deleted successfully!" }); // Return success message
  });
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`); // Log server start
});
