const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}


//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!isbn || !review) {
        return res.status(400).json({ message: "ISBN and review data are required." });
      }

    // Get the username from the session (since the user is authenticated)
    const username = req.session.authorization.username;

    // Find the book with the provided ISBN in the books object
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book with the provided ISBN not found." });
    }

    // Check if the book already has a review from the current user
    if (book.reviews && book.reviews[username]) {
        // Modify the existing review
        book.reviews[username] = review;
    } else {
        // Add a new review with the user's username
        book.reviews[username] = review;
    }

    // Update the books object with the new or modified review
    books[isbn] = book;
    return res.status(200).json({ message: "Review added/modified successfully." });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Get the username from the session (since the user is authenticated)
    const username = req.session.authorization.username;
  
    // Find the book with the provided ISBN in the books object
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book with the provided ISBN not found." });
    }
  
    // Check if the book has any reviews
    if (!book.reviews || Object.keys(book.reviews).length === 0) {
      return res.status(404).json({ message: "No reviews found for this book." });
    }
  
    // Check if the current user has a review for this book
    if (book.reviews.hasOwnProperty(username)) {
      // Delete the review associated with the current user
      delete book.reviews[username];
  
      // Update the books object with the modified review data
      books[isbn] = book;
  
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      return res.status(404).json({ message: "Review not found for the current user." });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
