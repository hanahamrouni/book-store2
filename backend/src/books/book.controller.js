const User = require("../users/user.model");
const Book = require("./book.model");

const postABook = async (req, res) => {
  try {
    const newBook = await Book({ ...req.body });
    await newBook.save();
    res
      .status(200)
      .send({ message: "Book posted successfully", book: newBook });
  } catch (error) {
    console.error("Error creating book", error);
    res.status(500).send({ message: "Failed to create book" });
  }
};

// get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).send(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).send({ message: "Failed to fetch books" });
  }
};

const getSingleBook = async (req, res) => {
  const uid = req.headers["x-user-uid"];

  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    const addBookToHistory = await User.findOneAndUpdate(
      { uid },
      { $addToSet: { bookHistory: book._id } },
      { new: true }
    );

    if (!book) {
      res.status(404).send({ message: "Book not Found!" });
    }
    res.status(200).send(book);
  } catch (error) {
    console.error("Error fetching book", error);
    res.status(500).send({ message: "Failed to fetch book" });
  }
};

// update book data
const UpdateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBook) {
      res.status(404).send({ message: "Book is not Found!" });
    }
    res.status(200).send({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error updating a book", error);
    res.status(500).send({ message: "Failed to update a book" });
  }
};

const deleteABook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      res.status(404).send({ message: "Book is not Found!" });
    }
    res.status(200).send({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    console.error("Error deleting a book", error);
    res.status(500).send({ message: "Failed to delete a book" });
  }
};

const recommendedBooks = async (req, res) => {
  try {
    const uid = req.headers["x-user-uid"];
    const user = await User.findOne({ uid }).populate("bookHistory");

    if (!user || user.bookHistory.length === 0) {
      const randomBooks = await Book.aggregate([{ $sample: { size: 10 } }]);
      return res.json({ books: randomBooks });
    }

    const categories = user.bookHistory
      .map((book) => book.category)
      .filter(Boolean);
    const authors = user.bookHistory
      .map((book) => book.authors)
      .filter(Boolean);

    let recommendedBooks = [];

    if (categories.length > 0 || authors.length > 0) {
      recommendedBooks = await Book.aggregate([
        {
          $match: {
            $or: [
              { category: { $in: categories } },
              { authors: { $in: authors } },
            ],
          },
        },
        { $sample: { size: 10 } },
      ]);
    }

    if (recommendedBooks.length < 10) {
      const additionalBooks = await Book.aggregate([
        { $match: { _id: { $nin: recommendedBooks.map((b) => b._id) } } },
        { $sample: { size: 10 - recommendedBooks.length } },
      ]);
      recommendedBooks = [...recommendedBooks, ...additionalBooks];
    }

    res.json({ books: recommendedBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching recommended books" });
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
  recommendedBooks,
};
