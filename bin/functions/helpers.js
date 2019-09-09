const bcrypt = require("bcrypt");
const {
  getUserByEmailDB,
  // getUserByUserIdDB,
  addUserDB
} = require("../db/helpers/subQueries/authQueries");

const generateHashedPassword = password => {
  return bcrypt.hashSync(password, 10);
};

const emailExists = email => {
  return getUserByEmailDB(email).then(result => {
    if (result) {
      return result.email;
    }
    return false;
  });
};

// const userIdExists = userId => {
//   return getUserByUserIdDB(userId).then(result => {
//     if (result) {
//       return result;
//     }
//     return false;
//   });
// };

const validatePassword = (email, password) => {
  return getUserByEmailDB(email).then(user => {
    if (bcrypt.compare(password, user.password)) {
      return user;
    }
    return false;
  });
};

const addUser = (username, email, password) => {
  return addUserDB(username, email, generateHashedPassword(password)).then(
    newUser => {
      console.log("HERE BLURGGGG OASOASNOASMOASMAOS");
      if (newUser) {
        console.log("HERE ********", newUser);
        return newUser;
      }
      throw new Error();
    }
  );
};

module.exports = { addUser, validatePassword, emailExists };
