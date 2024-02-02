CREATE TABLE books_reviews (
    isbn VARCHAR(255) UNIQUE NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Unknown Title',
    author VARCHAR(255) NOT NULL DEFAULT 'Unknown Author',
    url VARCHAR(255) DEFAULT 'https://cdn.pixabay.com/photo/2015/06/09/16/12/error-803716_1280.png', 
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    date_read TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
