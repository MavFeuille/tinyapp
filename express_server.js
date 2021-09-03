//Require helper functions
const { findUserByEmail, authenticateUser, urlsForUser, generateRandomString } = require("./helpers");

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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

// const user01Password = bcrypt.hashSync("1@1.com", salt);
// const user02Password = bcrypt.hashSync("2@2.com", salt);

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

// console.log("users: ", users);



//------------------- App functionalities --------------------

// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
//   });
  
//   app.get("/urls.json", (req, res) => {
//     res.json(urlDatabase);
//   });

app.get("/", (req, res) => {
  const user = users[req.session["userID"]]
  if (user) {
   const userID = user.id
   console.log("userID", userID);
   const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };
   res.render("urls_index", templateVars);
  } else {
    return res.redirect("/login");
  }
});


//Display the user login status
app.get("/urls", (req, res) => {

  const user = users[req.session["userID"]]
  if (user) {
   const userID = user.id
   console.log("userID", userID);
   const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };
   res.render("urls_index", templateVars);
  } else {
    return res.status(401).send("Login required");
  }
 
 });

 //Create shortURL - GET
app.get("/urls/new", (req, res) => {
  const user = users[req.session["userID"]]
  const templateVars = { user, urls: urlDatabase };

  if (user) {
    return res.render("urls_new", templateVars);
  } 
  res.redirect("/login");

});

//shortURL page- GET
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { user, shortURL, longURL };
  res.render("urls_show", templateVars);
});


//Login - GET
app.get("/login", (req, res) => {
  const user = users[req.session["userID"]]
  const templateVars = { user, urls: urlDatabase };

  res.render("urls_login", templateVars);
});

///Login - POST
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

  // ----------- old login -------------
  // if(user) {
  //   res.cookie("userID", user.id); //cookie name is set manually
  //   res.redirect("/urls");
  // } else {
  //   res.status(403).send("Unmatch credentials");
  // }
  
});


// Logout - POST
app.post("/logout", (req,res) => {

  req.session["userID"] = null;
  // res.clearCookie("userID"); //<- this will need to be the cookie we set in res.cookie in post/login
  res.redirect("/urls");

})

//Registration - GET
app.get("/register", (req, res) => {
  const user = users[req.session["userID"]]
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
    password: bcrypt.hashSync(password, salt),
  };

  
  //Add user info to the users database
  users[userID] = newUser;
  console.log("newUser:", newUser);

  //set cookie to remember the user
  req.session["userID"] = userID;
  

  res.redirect("/urls");
});





//Create shortURL - POST
app.post("/urls", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  // const templateVars = { user, urls: urlDatabase };

  if (!user) {
    return res.redirect("/login");
  } 
  
 
  console.log(req.body.longURL);
  console.log(generateRandomString());
  const longURL = req.body.longURL
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID }
  // urlDatabase[userID] = user;
  // console.log("urlDatabase: ", urlDatabase);

  if (!longURL) {
    return res.sendStatus(404);
  }
  res.redirect(`/urls/${shortURL}`);
});


//Redirect shortURL to longURL - GET
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];

  if (!urlObj) {
    return res.status(404).send("Invalid URL");
  }
  // const longURL = urlDatabase[req.params.shortURL];
  
 
  res.redirect(urlObj.longURL);
});



//Update shortURL - GET
app.get("/urls/:shortURL/Update", (req, res) => {
  const user = users[req.session["userID"]]
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

//Edit URL - POST
app.post("/urls/:shortURL/Update", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
  // const user = authenticateUser(email, password,users);
  const userID = users[req.session["userID"]];
  const shortURL = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("Authorization required to edit this short URL.");
  } else {
    
    // const userID = user.id
    console.log("userID", userID);
    const urlsUser = urlsForUser(userID, urlDatabase);
    // const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };
    if (urlsUser) {
    console.log(`start update`);
    urlDatabase[shortURL].longURL = req.body.updatedURL
    console.log(`Update URL request sent: `, shortURL);
    
    return res.redirect("/urls");
    } else {
      return res.status(401).send("You have no access to this URL");
    }
    
  }
  

  
  // // console.log(`Updated longURL: `, req.body.updatedURL)
  // res.redirect("/urls");
});


//Delete url from database - POST
app.post("/urls/:shortURL/delete", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
  // const user = authenticateUser(email, password, users);
  const userID = users[req.session["userID"]];
 

  const shortURL = req.params.shortURL;
  

  if (!userID) {
    return res.status(401).send("Authorization required to delete this short URL.");
  } else {
  // const userID = user.id
  console.log("userID", userID);
  const urlsUser = urlsForUser(userID, urlDatabase);
  // const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };
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



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});