const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

// Function to get the list of books using Axios with async-await
const getBooksUsingAxiosAsync = async (isbn) => {
    try {
        if(isbn){
            return  (JSON.stringify(books[isbn],null,4));
        }else{
            return  (JSON.stringify({books},null,4));
        }
    } catch (error) {
        throw new Error(error.message);
    }
};
  
// Function to get books by author
const getBooksByAuthor = async (author) => {
    try {
        const matches = [];
        for (const bookId in books) {
            if (books[bookId].author === author) {
                matches.push(books[bookId]);
            }
        }
        return matches;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Function to get books by title
const getBooksByTitle = async (title) => {
    try {
        const matches = [];
        for (const bookId in books) {
            if (books[bookId].title === title) {
                matches.push(books[bookId]);
            }
        }
        return matches;
    } catch (error) {
        throw new Error(error.message);
    }
};

  // Route to get the book list available in the shop using async-await with Axios
  public_users.get('/', async (req, res) => {
    try {
      const booksData = await getBooksUsingAxiosAsync();
      res.send(booksData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books.', error: error.message });
    }
  });

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
      const bookDetails = await getBooksUsingAxiosAsync(isbn);
      res.send(bookDetails);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book details.', error: error.message });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author',async (req, res) => {
    const author = req.params.author;
    const bookDetails = await getBooksByAuthor(author);
    res.send(bookDetails);
    return res.status(404).json({message: "Not found"});
});

// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
    const title = req.params.title;
    const bookDetails = await getBooksByTitle(title);
    res.send(bookDetails);
    
    return res.status(404).json({message: "Not found"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    res.send(books[isbn].reviews || null)
});

module.exports.general = public_users;
