const express = require('express');
const mysql = require('mysql2');
const multer = require('multer'); // Import multer
const path = require('path');   // Import path module
const app = express();

app.use(express.json());

// การตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
// Middleware for parsing JSON bodies
app.use(express.json());
 
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 
 
const upload = multer({ storage: storage });
 
// MySQL database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'kittipobdatabase'
});
 
// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Cannot connect to the database:', err);
    return;
  }
  console.log('Database connected successfully!');
});
 
// Handle POST request for adding houses
app.post('/add/houses', upload.single('HouseImage'), (req, res) => {
  // Destructure form fields
  const { AreaSize, Bedrooms, Bathrooms, Price, HouseCondition, HouseType, YearBuilt, ParkingSpaces, Address } = req.body;
  const HouseImage = req.file ? req.file.filename : null;
  console.log(HouseImage);
 
 
  // Log received data
  console.log(req.body);
  console.log(req.file);
 
  // Validate required fields
  if (!AreaSize || !Bedrooms || !Bathrooms || !Price || !HouseCondition || !HouseType || !YearBuilt || !ParkingSpaces || !Address || !HouseImage) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
 
  // Corrected SQL query
  const sql = 'INSERT INTO Houses (AreaSize, Bedrooms, Bathrooms, Price, `HouseCondition`, HouseType, YearBuilt, ParkingSpaces, Address, HouseImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
 
  const values = [AreaSize, Bedrooms, Bathrooms, Price, HouseCondition, HouseType, YearBuilt, ParkingSpaces, Address, HouseImage];
 
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Data added successfully!', id: result.insertId });
  });
});
 
// Handle GET request to show houses
app.get('/show/houses', (req, res) => {
  // Define the SQL query
  const sql = 'SELECT * FROM Houses';
 
  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'An error occurred while querying the database.' });
    }
   
    // Send the query results as a JSON response
    res.json(results);
  });
});
 
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
