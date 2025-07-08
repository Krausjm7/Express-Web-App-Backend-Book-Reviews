const express = require('express');
let books = require("./booksdb.js"); // Make sure this path is correct relative to general.js
let isValid = require("./auth_users.js").isValid; // Assuming this is present from skeleton
let users = require("./auth_users.js").users; // Assuming this is present from skeleton
const public_users = express.Router();


// Task 6: Register New user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (username && password) {
      if (isValid(username)) { // Uses the isValid function imported from auth_users.js
        users.push({"username":username,"password":password}); // Uses the users array imported from auth_users.js
        return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    }
    return res.status(404).json({message: "Unable to register user. Username and/or password not provided."});
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.status(200).json(books);
});

// Task 10: Get the book list available in the shop using Async-Await
public_users.get('/books-async', async function (req, res) {
  try {
    // Simulate an asynchronous operation (e.g., fetching from a database)
    // We'll wrap the 'books' object in a Promise that resolves immediately
    // In a real application, this would be an actual database query or API call
    const getBooksPromise = new Promise((resolve, reject) => {
      // Simulate some delay if needed, but for now, resolve immediately
      resolve(books);
    });

    const allBooks = await getBooksPromise; // Wait for the promise to resolve
    return res.status(200).json(allBooks); // Send the books
  } catch (error) {
    // Handle any errors that might occur during the async operation
    return res.status(500).json({ message: "Error fetching books asynchronously.", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Async-Await
public_users.get('/isbn-async/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      // Simulate an asynchronous operation to find the book by ISBN
      const getBookByISBNPromise = new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject(new Error(`Book with ISBN ${isbn} not found.`));
        }
      });
  
      const bookDetails = await getBookByISBNPromise;
      return res.status(200).json(bookDetails);
    } catch (error) {
      return res.status(404).json({ message: error.message }); // Use 404 for not found errors
    }
  });
  
// Task 12: Get book details based on Author using Async-Await
public_users.get('/author-async/:author', async function (req, res) {
    const authorName = req.params.author;
    let booksByAuthor = {}; // Initialize an empty object to store books found by this author
  
    try {
      // Simulate an asynchronous operation to find books by author
      const getBooksByAuthorPromise = new Promise((resolve, reject) => {
        let found = false;
        for (const isbn in books) {
          if (books.hasOwnProperty(isbn)) {
            if (books[isbn].author === authorName) {
              booksByAuthor[isbn] = books[isbn];
              found = true;
            }
          }
        }
        if (found) {
          resolve(booksByAuthor);
        } else {
          reject(new Error(`No books found by author: ${authorName}`));
        }
      });
  
      const foundBooks = await getBooksByAuthorPromise;
      return res.status(200).json(foundBooks);
    } catch (error) {
      return res.status(404).json({ message: error.message }); // Use 404 for not found errors
    }
  });

// Task 13: Get all books based on Title using Async-Await
public_users.get('/title-async/:title', async function (req, res) {
    const titleName = req.params.title;
    let booksByTitle = {}; // Initialize an empty object to store books found with this title
  
    try {
      // Simulate an asynchronous operation to find books by title
      const getBooksByTitlePromise = new Promise((resolve, reject) => {
        let found = false;
        for (const isbn in books) {
          if (books.hasOwnProperty(isbn)) {
            if (books[isbn].title === titleName) { // Check if the title matches
              booksByTitle[isbn] = books[isbn];
              found = true;
            }
          }
        }
        if (found) {
          resolve(booksByTitle);
        } else {
          reject(new Error(`No books found with title: ${titleName}`));
        }
      });
  
      const foundBooks = await getBooksByTitlePromise;
      return res.status(200).json(foundBooks);
    } catch (error) {
      return res.status(404).json({ message: error.message }); // Use 404 for not found errors
    }
  });
  
// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    
    if (books[isbn]) { // Check if the book exists in your 'books' object
      res.status(200).json(books[isbn]); // If found, send the book details
    } else {
      res.status(404).json({message: `Book with ISBN ${isbn} not found.`}); // If not found, send a 404
    }
});

// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorName = req.params.author; // Get the author name from the request parameters
    let booksByAuthor = {}; // Initialize an empty object to store books found by this author
    
    // Iterate through the books object to find matching authors
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) { // Ensure it's an own property
        if (books[isbn].author === authorName) { // Check if the author matches
          booksByAuthor[isbn] = books[isbn]; // Add the book to our results
        }
      }
    }
    
    // Check if any books were found for the author
    if (Object.keys(booksByAuthor).length > 0) {
      res.status(200).json(booksByAuthor); // Send the found books
    } else {
      res.status(404).json({message: `No books found by author: ${authorName}`}); // Send a 404 if no books found
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleName = req.params.title; // Get the title from the request parameters
    let booksByTitle = {}; // Initialize an empty object to store books found with this title
    
    // Iterate through the books object to find matching titles
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) { // Ensure it's an own property
        // For exact match (case-sensitive as per booksdb.js data):
        if (books[isbn].title === titleName) { // Check if the title matches
          booksByTitle[isbn] = books[isbn]; // Add the book to our results
        }
        // Optional: For case-insensitive or partial match, you could use:
        // if (books[isbn].title.toLowerCase().includes(titleName.toLowerCase())) {
        //   booksByTitle[isbn] = books[isbn];
        // }
      }
    }
    
    // Check if any books were found for the title
    if (Object.keys(booksByTitle).length > 0) {
      res.status(200).json(booksByTitle); // Send the found books
    } else {
      res.status(404).json({message: `No books found with title: ${titleName}`}); // Send a 404 if no books found
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    
    // Check if the book exists
    if (books[isbn]) {
      const bookReviews = books[isbn].reviews; // Access the reviews for that book
      // Note: Your booksdb.js currently has empty 'reviews: {}' for all books.
      // So, for any valid ISBN, it will correctly return "No reviews found."
      // You will implement adding reviews in a later task (Task 8).
    
      if (Object.keys(bookReviews).length > 0) {
        res.status(200).json(bookReviews); // Send the reviews if they exist
      } else {
        // If the book exists but has no reviews, send a specific message
        res.status(404).json({message: `No reviews found for ISBN ${isbn}.`});
      }
    } else {
      // If the book itself is not found, send a different message
      res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

module.exports.general = public_users;