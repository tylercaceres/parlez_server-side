const express = require("express");
const router = express.Router();

const {
  emailExists,
  // userIdExists,
  validatePassword,
  addUser
} = require("../bin/functions/helpers.js");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("email:", email);
  console.log("password:", password);
  try {
    const userInfo = await validatePassword(email, password);
    if (!userInfo) {
      throw new Error();
    }
    req.session.user_id = userInfo.id;
    return res.json({ user_id: userInfo.id, logged_in: true });
  } catch (err) {
    return res.json({ error: "Error. Credentials are incorrect." });
  }
});

router.get("/logout", (req, res) => {
  req.session.user_id = null;
  return res.json({ msg: "You have been logged out." });
});

router.get("/checkloggedin", async (req, res) => {
  try {
    if (!req.session.user_id) {
      throw new Error();
    }
    return res.json({ user_id: req.session.user_id, logged_in: true });
  } catch (err) {
    return res.json({ error: "Error. You are not logged in." });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (
    username === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    return res.json({ error: "Enter information in all fields." });
  }
  if (password !== confirmPassword) {
    return res.json({ error: "Passwords must match." });
  }
  try {
    const foundUser = await emailExists(email);
    if (foundUser) {
      throw new Error();
    }
    const newUser = await addUser(username, email, password);
    req.session.user_id = newUser.id;
    return res.json({ user_id: newUser.id, logged_in: true });
  } catch (err) {
    return res.json({ error: "Error. Please retry" });
  }
});

module.exports = router;
