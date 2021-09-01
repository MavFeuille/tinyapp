const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "1@1.com", 
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Helper functions to check if email is found from users database
const findUserByEmail = function (email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return false;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Login - GET
app.get("/login", (req, res) => {
  const user = users[req.cookies["userID"]]
  const templateVars = { user, urls: urlDatabase };

  res.render("urls_login", templateVars);
});


//Display the user login status
app.get("/urls", (req, res) => {
  const user = users[req.cookies["userID"]]
  // console.log("user:", user)
  const templateVars = { user, urls: urlDatabase };

  res.render("urls_index", templateVars);
  
});

//Registration - GET
app.get("/register", (req, res) => {
  const user = users[req.cookies["userID"]]
  const templateVars = { user, urls: urlDatabase };


  res.render("urls_registration", templateVars);
});

//Registration - POST
app.post("/register", (req, res) => {
  // console.log("user info: ", req.body);
  const email = req.body.email;
  const password = req.body.password;

  //Check if user already exists in users database
  const userFound = findUserByEmail(email, users);

  if (userFound) {
    return res.status(400).send("This email already exists!")
  }
  if (email.length === 0|| password.length === 0) {
    res.status(400).send("Email or Password is empty. Please fill in both information.");
    
  }

  //Generate new user id
  const userID = uuidv4().substr(0, 8);
  // console.log("uuid: ", uuidv4());
  
  const newUser = {
    id: userID,
    email,
    password,
  };

  
  //Add user info to the users database
  users[userID] = newUser;
  console.log("newUser:", newUser);

  //set cookie to remember the user
  res.cookie('userID', userID);
  

  res.redirect("/urls");
});

//newURL - GET
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["userID"]]
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//Redirect shortURL to longURL - GET
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.sendStatus(404);
  }
  res.redirect(longURL);
});

//shortURL page- GET
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["userID"]]
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//update shortURL - GET
app.get("/urls/:shortURL/Update", (req, res) => {
  const user = users[req.cookies["userID"]]
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});



//Generate shortURL - POST
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  console.log(generateRandomString());
  const longURL = req.body.longURL
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  if (!longURL) {
    res.sendStatus(404);
  }
  res.redirect(`/urls/${shortURL}`);
});
const generateRandomString = function() {
  let randomString = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));

  return randomString;
}

generateRandomString();




//Delete url from database - POST
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(`Delete shortURL request sent:`, req.params.shortURL);
  delete urlDatabase[shortURL];
  
  res.redirect("/urls");
});

//Edit URL - POST
app.post("/urls/:shortURL/Update", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(`start update`);
  urlDatabase[shortURL] = req.body.updatedURL
  console.log(`Update URL request sent: `, shortURL);
  res.redirect("/urls");
});

///Login - POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = findUserByEmail(email, users);


  res.cookie("userID", user.id); //cookie name is set manually
  

  // userDatabase = {"username": res.cookie("username", req.body.username)};

  res.redirect("/urls");
});

// Logout - POST
app.post("/logout", (req,res) => {
    
    res.clearCookie("userID"); //<- this will need to be the cookie we set in res.cookie in post/login
    // console.log("cookie: ", req.body.username);
    res.redirect("/urls");

})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
