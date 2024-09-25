const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const secretKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvZUJpZGVuIiwiaWF0IjoxNjc4MTcxOTQ0fQ.eqIdfNhWx6KAnIzMUPHse_kTwDlYiwbFQcrdponkrtc"

// Signup
exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const userId = uuidv4();

  // Insert user into the database
  db.run(
    `INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`,
    [userId, name, email, hashedPassword],
    function (err) {
      if (err) {
        console.error('Error registering user:', err.message);
        return res.status(500).send("Error registering user");
      }

      // Create and return the JWT token
      const token = jwt.sign({ id: userId }, secretKey, { expiresIn: 86400 });
      res.status(200).send({ auth: true, token });
    }
  );
};

// Login
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Check if fields are provided
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  // Retrieve user from the database
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return res.status(500).send("Error querying database");
    }

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Compare the hashed password
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null, message: 'Invalid password' });
    }

    // Create and return the JWT token
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
  });
};

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Failed to authenticate token:', err.message);
      return res.status(500).send({ auth: false, message: "Failed to authenticate token" });
    }

    req.userId = decoded.id;
    next();
  });
};
