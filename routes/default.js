const db = require('../db/connection/db.js');
const express = require('express');
const router = express.Router();
const {
	generateHashedPassword,
	usernameExists,
	emailExists,
	validatePassword,
	generateCookie,
	addUser
} = require('../bin/functions/helpers.js');

router.get('/', (req, res) => {
	res.render('index');
});

// router.post('/login', (req, res) => {});
// router.post('/logout', (req, res) => {});
router.post('/register', (req, res) => {
	const {username, email, password, confirmPassword} = req.body;

	if (username === '' || email === '' || password === '' || confirmPassword === '') {
		req.flash('error', 'cannot leave anything blank you little shit');
		return res.redirect('/');
	}
	if (password !== confirmPassword) {
		req.flash('error', 'passwords are not the same');
		return res.redirect('/');
	}

	emailExists(email)
		.then(() => {
			console.log('enters username exists promise');
			usernameExists(username);
		})
		.then(() => {
			console.log('enters final promise');
			addUser(username, email, password);
			console.log('something was created');
			req.flash('success', 'created new user in DB');
			return res.redirect('/');
		})
		.catch(() => {
			console.log('caught here1');
			req.flash('error', 'username/email aleady exists');
			console.log('caught here 2');
			return res.redirect('/');
		});
});

module.exports = router;
