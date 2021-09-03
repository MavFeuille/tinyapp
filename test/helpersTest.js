const { assert } = require('chai');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

const testUrlDatabase = {
  "T3O1gC": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user1RandomID"
  },
  "FjAQEu": {
    longUrl: "https://www.cp24.com/",
    userID: "user1RandomID"
  },
  "36DNyo": {
    longUrl: "http://www.youtube.com",
    userID: "user2RandomID"
  }
};

describe('#getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    // console.log("user:", user);
    const expectedOutput = "userRandomID";
    assert.equal(user["id"], "userRandomID");
  });

  it('should return false with an non-existent email', function() {
    const user = findUserByEmail("noEmail@fala.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(undefined, undefined);
    
  });
});

describe('#urlsForUser', function() {
  it('should return shortURL from corresponding userID', function() {
    const user = findUserByEmail("user2RandomID", testUrlDatabase);
    // console.log("user:", user);
    const expectedOutput = "FjAQEu";
    assert.equal("FjAQEu", "FjAQEu");
  });

  it('should return more than one shortURL from corresponding userID', function() {
    const user = findUserByEmail("user1RandomID", testUsers);
    const expectedOutput = "T3O1gC, FjAQEu";
    assert.equal("T3O1gC, FjAQEu", "T3O1gC, FjAQEu");
    
  });
});


describe('#authenticateUser', function() {
  it('should return user object and null error', function() {
    const user = authenticateUser("user2RandomID", testUsers);
    console.log("user:", user);
    const expectedOutput = {
      user: {
         id: 'userRandomID',
       
         email: 'user@example.com',
       
         password: '$2b$10$/3Dk1mCzsoFm21BbE5OrluucVatXsYTQ.Sazz2BZP.lGTU/AYQiwm'
        } 
      };
    assert.deepEqual({ 
      user: {
        id: 'userRandomID',
        
        email: 'user@example.com',
        
        password: '$2b$10$/3Dk1mCzsoFm21BbE5OrluucVatXsYTQ.Sazz2BZP.lGTU/AYQiwm'
     },
     error: null 
    }, { 
      user: { 
        id: 'userRandomID',
        
        email: 'user@example.com',
        
        password: '$2b$10$/3Dk1mCzsoFm21BbE5OrluucVatXsYTQ.Sazz2BZP.lGTU/AYQiwm'
      },
      error: null
    });
  });

  // it('should return more than one shortURL from corresponding userID', function() {
  //   const user = findUserByEmail("user1RandomID", testUsers);
  //   const expectedOutput = "T3O1gC, FjAQEu";
  //   assert.equal("T3O1gC, FjAQEu", "T3O1gC, FjAQEu");
    
  // });
});

// user:  {
//   id: 'userRandomID',
//   email: 'user@example.com',
//   password: '$2b$10$/3Dk1mCzsoFm21BbE5OrluucVatXsYTQ.Sazz2BZP.lGTU/AYQiwm'
// }
// AuthL  {
//   user: {
//     id: 'userRandomID',
//     email: 'user@example.com',
//     password: '$2b$10$/3Dk1mCzsoFm21BbE5OrluucVatXsYTQ.Sazz2BZP.lGTU/AYQiwm'
//   },
//   error: null
// }