-- Seed data for AURIS audiobook platform

-- Insert sample books
INSERT INTO books (title, author, description, cover_url, audio_url, duration, rating, genre)
VALUES
  (
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    'A classic American novel set in the Jazz Age',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560/4671.jpg',
    'https://example.com/audio/great-gatsby.mp3',
    '4h 32m',
    4.5,
    'Classic'
  ),
  (
    'To Kill a Mockingbird',
    'Harper Lee',
    'A gripping tale of racial injustice and childhood innocence',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690/2657.jpg',
    'https://example.com/audio/to-kill-a-mockingbird.mp3',
    '12h 17m',
    4.8,
    'Fiction'
  ),
  (
    '1984',
    'George Orwell',
    'A dystopian social science fiction novel',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506/40961427.jpg',
    'https://example.com/audio/1984.mp3',
    '8h 44m',
    4.6,
    'Dystopian'
  ),
  (
    'Pride and Prejudice',
    'Jane Austen',
    'A romantic novel of manners',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351/1885.jpg',
    'https://example.com/audio/pride-and-prejudice.mp3',
    '11h 5m',
    4.4,
    'Romance'
  ),
  (
    'The Catcher in the Rye',
    'J.D. Salinger',
    'A controversial novel about teenage rebellion',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300/5107.jpg',
    'https://example.com/audio/catcher-in-the-rye.mp3',
    '6h 48m',
    4.2,
    'Coming-of-age'
  ),
  (
    'Harry Potter and the Philosopher''s Stone',
    'J.K. Rowling',
    'The magical beginning of the Harry Potter series',
    'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022/3.jpg',
    'https://example.com/audio/harry-potter.mp3',
    '8h 25m',
    4.9,
    'Fantasy'
  );
