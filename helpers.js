const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 8080;

const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


// Helper function to check if email is found from users database
const findUserByEmail = function (email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return false;
};

// Helper function for authentication
const authenticateUser = function (email, password, users) {
  
  let user;
  for (const ID in users) {
    if (users[ID].email === email) {
      user = users[ID];
    }
  }
 
  if (user) {
    
    if (bcrypt.compareSync(password, user.password)) {
      console.log("user: ", user);
      return { user, error: null };
    }
    return { user: null, error: "Bad password" };
  }
  return { user: null, error: "Bad email" };

};

// Helper function returning URLs where userID is equal to the id of currently logged-in user
const urlsForUser = function(userID, urlDatabase) {
  // const user = users[req.cookies["userID"]];
  const userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userUrls[shortURL] = urlDatabase[shortURL];
      // console.log("userUrls[shortURL]", userUrls[shortURL]);
      // console.log("shortURL", urlDatabase[shortURL]);
      // console.log("id: ", userID);
    }
  }
  return userUrls;
};


//Helper function to generate id for shortURL
const generateRandomString = function() {
  let randomString = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randomString;
};
generateRandomString();


//Do not remove
module.exports = {
  findUserByEmail,
  authenticateUser,
  urlsForUser,
  generateRandomString
};