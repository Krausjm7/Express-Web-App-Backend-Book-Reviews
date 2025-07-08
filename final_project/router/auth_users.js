const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // This array will store your registered users

const isValid = (username)=>{ //function to check if the username is valid (i.e., not already taken)
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return false; // Username already exists, so it's NOT valid for a new registration
  } else {
    return true; // Username is unique and valid for registration
  }
}

const authenticatedUser = (username,password)=>{ //function to check if username and password match the one we have in records.
  let matchingUsers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(matchingUsers.length > 0){
    return true; // A user with matching username and password was found
  } else {
    return false; // No matching user found
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in: Username and/or password not provided"});
  }

  if (authenticatedUser(username,password)) { // Use the authenticatedUser function
    let accessToken = jwt.sign({
      data: username // You can include more data here if needed
    }, 'access', { expiresIn: 60 * 60 }); // Sign the token with a secret key and set expiry

    req.session.authorization = { // Store authorization in session
      accessToken: accessToken,
      username: username
    }
    return res.status(200).send("User successfully logged in"); // Send simple success message
    // You might want to return the token as JSON:
    // return res.status(200).json({message: "User successfully logged in", accessToken: accessToken});
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"}); // 208 Already Reported (or 401 Unauthorized)
  }
});

// Add or modify a book review (should be under /auth/ to be protected)
regd_users.put("/auth/review/:isbn", (req, res) => { // <--- CHANGE THIS LINE
  const isbn = req.params.isbn;
  const review = req.query.review; // Get review from query parameter
  const username = req.session.authorization.username; // Get username from session

  if (!username) {
      return res.status(403).json({message: "User not logged in or session expired."});
  }

  if (!review) {
      return res.status(400).json({message: "Review content not provided."});
  }

  if (books[isbn]) { // Check if the book exists
    if (!books[isbn].reviews) {
      books[isbn].reviews = {}; // Initialize reviews object if it doesn't exist
    }

    // Check if the user already has a review for this book
    if (books[isbn].reviews[username]) {
      // Modify existing review
      books[isbn].reviews[username] = review;
      return res.status(200).json({message: `Review for ISBN ${isbn} by ${username} modified successfully.`});
    } else {
      // Add new review
      books[isbn].reviews[username] = review;
      return res.status(200).json({message: `Review for ISBN ${isbn} by ${username} added successfully.`});
    }
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Get username from session

  if (!username) {
      return res.status(403).json({message: "User not logged in or session expired."});
  }

  if (books[isbn]) { // Check if the book exists
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // If the book has reviews and this user has a review, delete it
      delete books[isbn].reviews[username];
      return res.status(200).json({message: `Review for ISBN ${isbn} by ${username} deleted successfully.`});
    } else {
      // If the book exists but the user has no review for it, or review object is empty
      return res.status(404).json({message: `No review found for ISBN ${isbn} by ${username}.`});
    }
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; // Export the users array so general.js can use it for registration