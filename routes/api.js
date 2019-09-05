const express = require('express');
const router = express.Router();
const db = require('../db/connection/db.js');

router.get('/', (req, res) => {
  db.query(`SELECT * FROM users;`)
    .then((data) => {
      const users = data.rows;
      res.json({users});
    })
    .catch((err) => {
      res.status(500).json({error: err.message});
    });
});

module.exports = router;
