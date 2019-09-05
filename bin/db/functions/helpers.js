const bcrypt = require('bcrypt');
const {getUserByEmailDB, getUserByUsernameDB} = require('../db/helpers.js');

//generate hashed password
const generateHashedPassword = (password) => {
	return bcrypt.hash(password, 10);
};

//check if email already exists
const emailExists = (email) => {
	return new Promise((res, rej) => {
		getUserByEmailDB(email).then((result) => {
			if (result) {
				console.log('email exists 1');
				return rej(false);
			}
			console.log('email exists 2');
			return res(true);
		});
	});
};

const usernameExists = (username) => {
	return new Promise((res, rej) => {
		getUserByUsernameDB(username).then((result) => {
			if (result) {
				console.log('email exists 1');
				return rej(false);
			}
			console.log('email exists 2');
			return res(true);
		});
	});
};

//verify if password entered is correct
const validatePassword = (email, password) => {
	return getUserByEmailDB(email)
		.then((res) => bcrypt.compare(password, res.password))
		.then((res) => res)
		.catch((err) => err);
};

//generate cookie session
const generateCookie = (email) => {
	req.session.user_id = email;
};

const addUser = (username, email, password) => {
	console.log('enteres here before addUserDB');
	return addUserDB(username, email, generateHashedPassword(password))
		.then((res) => {
			console.log(res);
			return true;
		})
		.catch((res) => {
			console.log(res);
			return false;
		});
};
module.exports = {
	generateHashedPassword,
	usernameExists,
	emailExists,
	validatePassword,
	generateCookie,
	addUser
};
