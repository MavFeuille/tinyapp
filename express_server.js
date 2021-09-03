//Require helper functions
const { findUserByEmail, authenticateUser, urlsForUser, generateRandomString } = require("./helpers");
const { urlDatabase, users } = require("./database");
const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 8080;

const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["eSgVkYp3s6v9y$B&E)H@McQfTjWmZq4t", "z$C&F)J@NcRfUjWnZr4u7x!A%D*G-KaP" ]
}));


//------------------- App functionalities --------------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// GET /
app.get("/", (req, res) => {
  const user = users[req.session["userID"]];
  if (user) {
    const userID = user.id;
    console.log("userID", userID);
    const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };
    res.render("urls_index", templateVars);
  } else {
    return res.redirect("/login");
  }
});


// GET /urls - Display the user login status
app.get("/urls", (req, res) => {

  const user = users[req.session["userID"]];

  if (user) {
    
    const userID = user.id;
    console.log("userID", userID);
    const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };

    res.render("urls_index", templateVars);

  } else {

    return res.status(401).send("Login required");
  }
 
});

// GET /urls/new - Create shortURL
app.get("/urls/new", (req, res) => {

  const user = users[req.session["userID"]];
  const templateVars = { user, urls: urlDatabase };

  if (user) {

    return res.render("urls_new", templateVars);
  }

  res.redirect("/login");

});

// GET /urls/:id - shortURL page
app.get("/urls/:shortURL", (req, res) => {

  const userID = req.session["userID"];
  const user = users[userID];
  const shortURL = req.params.shortURL;

  console.log("userID", userID);

  if (!user) {
    return res.status(401).send("Login required");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("This short URL does not exist");
  }

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You have no access to this URL");
  }


  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { user, shortURL, longURL };

  res.render("urls_show", templateVars);
});

// GET /u/:id - Redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];

  if (!urlObj) {
    return res.status(404).send("Invalid URL");
  }
  
  res.redirect(urlObj.longURL);
});

// GET /urls/:id/Update - edit URL
app.get("/urls/:shortURL/Update", (req, res) => {

  const user = users[req.session["userID"]];
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};

  res.render("urls_show", templateVars);
});

//GET /urls/:id/delete - Delete URL
app.get("/urls/:shortURL/delete", (req, res) => {

  const userID = req.session["userID"];
  const user = users[userID];
  const shortURL = req.params.shortURL;

  if (!user) {
    return res.status(404).send("Login required");
  }

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You have no access to this URL");
  }
});


// POST /urls - Create shortURL
app.post("/urls", (req, res) => {

  const userID = req.session["userID"];
  const user = users[userID];
  
  if (!user) {
    return res.redirect("/login");
  }
  
  console.log(req.body.longURL);
  console.log(generateRandomString());
  
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };


  if (!longURL) {
    return res.sendStatus(404);
  }
  res.redirect(`/urls/${shortURL}`);
});


// POST /urls/:id - For URL edit
app.post("/urls/:shortURL/Update", (req, res) => {
 
  const userID = users[req.session["userID"]];
  const shortURL = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("Authorization required to edit this short URL.");
  } else {
    
    
    console.log("userID", userID);
    const urlsUser = urlsForUser(userID, urlDatabase);
    
    if (urlsUser) {

      console.log(`start update`);
      urlDatabase[shortURL].longURL = req.body.updatedURL;
      console.log(`Update URL request sent: `, shortURL);
    
      return res.redirect("/urls");

    } else {

      return res.status(401).send("You have no access to this URL");
    }
  }
});



// POST /urls/:id/delete - Delete url from database
app.post("/urls/:shortURL/delete", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  const userID = users[req.session["userID"]];
  const shortURL = req.params.shortURL;
  
  if (!user) {

    return res.status(401).send("Login required");

  }

  if (!userID) {

    return res.status(401).send("Authorization required to delete this short URL.");

  } else {
  
    console.log("userID", userID);
    const urlsUser = urlsForUser(userID, urlDatabase);
   
    console.log("urlsUser: ", urlsUser);

    if (urlsUser) {

      console.log(`Delete shortURL request sent:`, req.params.shortURL);
      delete urlDatabase[shortURL];
     
      return res.redirect("/urls");

    } else {

      return res.status(401).send("You do not have access to this URL");

    }
  }
});


// GET /login
app.get("/login", (req, res) => {

  const user = users[req.session["userID"]];
  const templateVars = { user, urls: urlDatabase };

  res.render("urls_login", templateVars);
});


// GET / register
app.get("/register", (req, res) => {

  const user = users[req.session["userID"]];
  const templateVars = { user, urls: urlDatabase };

  res.render("urls_registration", templateVars);
});

// POST /login
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const userResult = authenticateUser(email, password,users);

  console.log("users.pw: ", users.password);

  if (userResult.error) {

    console.log(userResult.error);
    return res.status(401).send("Invalid credentials");

  }
  req.session["userID"] = userResult.user.id;
  return res.redirect("/urls");

});


// POST - register
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  //Check if user already exists in users database
  const userFound = findUserByEmail(email, users);

  if (userFound) {
    return res.status(400).send("This email already exists!");
  }
  if (email.length === 0 || password.length === 0) {
    res.status(400).send("Email or Password is empty. Please fill in both information.");
  }


  //Generate new user id
  const userID = uuidv4().substr(0, 8);
  
  const newUser = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, salt),
  };

  //Add user info to the users database
  users[userID] = newUser;
  console.log("newUser:", newUser);

  //set cookie to remember the user
  req.session["userID"] = userID;
  
  res.redirect("/urls");
});

// POST /logout
app.post("/logout", (req,res) => {

  req.session["userID"] = null;
  res.redirect("/urls");

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});