const db = require('../db/connection/db.js');

const express = require('express');
const router = express.Router();

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
