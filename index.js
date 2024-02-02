import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
const { Pool } = pg;

const app = express();
const port = 3000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "BooksLibrary",
  password: "885522",
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM books_reviews ORDER BY date_read DESC"
    );
    res.render("index", { books: rows });
  } catch (error) {
    console.error(error);
  }
});

app.post("/add", async (req, res) => {
  try {
    const { isbn, date_read, notes, rating } = req.body;

    // Check if a book with the same ISBN already exists
    const existingBookRes = await pool.query(
      "SELECT * FROM books_reviews WHERE isbn = $1",
      [isbn]
    );
    if (existingBookRes.rows.length > 0) {
      return res.send("This book has already been added.");
    }

    // Fetch book details from Open Library
    const bookDetailsResponse = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const bookDetails = bookDetailsResponse.data[`ISBN:${isbn}`];

    const title = bookDetails?.title || "Unknown Title";
    const author = bookDetails.authors?.[0]?.name || "Unknown Author";
    const coverUrl =
      bookDetails.cover?.medium ||
      "https://cdn.pixabay.com/photo/2015/06/09/16/12/error-803716_1280.png";

    const validatedRating =
      rating && !isNaN(rating) && rating >= 1 && rating <= 10
        ? parseInt(rating, 10)
        : 5;
    const validatedDateRead = Date.parse(date_read)
      ? new Date(date_read).toISOString()
      : new Date().toISOString();

    await pool.query(
      "INSERT INTO books_reviews (isbn, title, author, url, rating, date_read, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        isbn,
        title,
        author,
        coverUrl,
        validatedRating,
        validatedDateRead,
        notes || "No notes provided",
      ]
    );

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.post("/update/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { rating, date_read, notes } = req.body;

  try {
    await pool.query(
      "UPDATE books_reviews SET rating = $1, date_read = $2, notes = $3 WHERE isbn = $4",
      [rating, date_read, notes, isbn]
    );
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.send("Error updating book review");
  }
});

app.get("/delete/:isbn", async (req, res) => {
  const { isbn } = req.params;
  try {
    await pool.query("DELETE FROM books_reviews WHERE isbn = $1", [isbn]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.send("Error deleting book review");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
