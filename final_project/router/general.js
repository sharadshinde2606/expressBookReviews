const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Promise wrapper used by the routes
const getBooksPromise = () => new Promise((resolve) => resolve(books));

// ---------- Register ----------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// ---------- Get all books ----------
public_users.get('/', async (req, res) => {
  const allBooks = await getBooksPromise();
  return res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// ---------- By ISBN ----------
public_users.get('/isbn/:isbn', async (req, res) => {
  const allBooks = await getBooksPromise();
  const book = allBooks[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// ---------- By author ----------
public_users.get('/author/:author', async (req, res) => {
  const allBooks = await getBooksPromise();
  const result = Object.keys(allBooks)
    .filter((k) => allBooks[k].author.toLowerCase() === req.params.author.toLowerCase())
    .map((k) => ({ isbn: k, title: allBooks[k].title, reviews: allBooks[k].reviews }));
  if (result.length === 0) return res.status(404).json({ message: "No books found for this author" });
  return res.status(200).json({ booksbyauthor: result });
});

// ---------- By title ----------
public_users.get('/title/:title', async (req, res) => {
  const allBooks = await getBooksPromise();
  const result = Object.keys(allBooks)
    .filter((k) => allBooks[k].title.toLowerCase() === req.params.title.toLowerCase())
    .map((k) => ({ isbn: k, author: allBooks[k].author, reviews: allBooks[k].reviews }));
  if (result.length === 0) return res.status(404).json({ message: "No books found with this title" });
  return res.status(200).json({ booksbytitle: result });
});

// ---------- Reviews ----------
public_users.get('/review/:isbn', async (req, res) => {
  const allBooks = await getBooksPromise();
  const book = allBooks[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

// ---------- Axios client functions (async/await and promise callbacks) ----------
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
  }
};

const getBookByISBN = (isbn) =>
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => console.error("Error fetching book by ISBN:", error.message));

const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
  }
};

const getBooksByTitle = (title) =>
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => console.error("Error fetching books by title:", error.message));

module.exports.general = public_users;
module.exports.client = { getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle };
