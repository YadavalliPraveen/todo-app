const { v4: uuidv4 } = require('uuid');
const db = require('./db');

// Create a Todo
exports.createTodo = (req, res) => {
  const { title, description, status } = req.body;
  const todoId = uuidv4();
  db.run(`INSERT INTO todos (id, user_id, title, description, status) VALUES (?, ?, ?, ?, ?)`, 
    [todoId, req.userId, title, description, status], function(err) {
    if (err) return res.status(500).send("Error creating task");
    res.status(200).send({ id: todoId, title, description, status });
  });
};

// Get all Todos
exports.getTodos = (req, res) => {
  db.all(`SELECT * FROM todos WHERE user_id = ?`, [req.userId], (err, rows) => {
    if (err) return res.status(500).send("Error fetching tasks");
    res.status(200).send(rows);
  });
};

// Update Todo
exports.updateTodo = (req, res) => {
  const { id, title, description, status } = req.body;
  db.run(`UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?`, 
    [title, description, status, id, req.userId], function(err) {
    if (err) return res.status(500).send("Error updating task");
    res.status(200).send("Task updated");
  });
};

// Delete Todo
exports.deleteTodo = (req, res) => {
  const { id } = req.body;
  db.run(`DELETE FROM todos WHERE id = ? AND user_id = ?`, [id, req.userId], function(err) {
    if (err) return res.status(500).send("Error deleting task");
    res.status(200).send("Task deleted");
  });
};
