const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// Import your controllers
const authController = require('./authController');
const todoController = require('./todoController');

// Middlewares
app.use(cors());  // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

// Authentication routes
app.post('/signup', authController.signup);
app.post('/login', authController.login);

// Middleware to protect routes with JWT token
app.use(authController.verifyToken);

// Todo routes (protected)
app.post('/todos', todoController.createTodo);
app.get('/todos', todoController.getTodos);
app.put('/todos', todoController.updateTodo);
app.delete('/todos', todoController.deleteTodo);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
