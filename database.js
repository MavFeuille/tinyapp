const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);



// *----------------- Databases ----------------*
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user01"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user02"
  }
  
};

const users = {
  "user01": {
    id: "user01",
    email: "1@1.com",
    password: bcrypt.hashSync("1", salt)
  },
  "user02": {
    id: "user02",
    email: "2@2.com",
    password: bcrypt.hashSync("2", salt)
  }
};


module.exports = { urlDatabase, users };