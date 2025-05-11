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
    const book = await Book.findById(id).lean({ virtuals: true });
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

const addBookToFav = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const uid = req.headers["x-user-uid"];
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favBooks = user.favouriteBooks || [];

    const bookIndex = favBooks.indexOf(bookId);

    if (bookIndex !== -1) {
      favBooks.splice(bookIndex, 1);
    } else {
      favBooks.push(bookId);
    }
    const bookHistory = user.bookHistory || [];
    const isRec = bookHistory.indexOf(bookId);
    if (isRec !== -1) {
      // return false;
    } else {
      user.bookHistory.push(bookId);
    }
    user.favouriteBooks = favBooks;
    await user.save();

    return res.status(200).json({
      message:
        bookIndex !== -1
          ? "Book removed from favourites"
          : "Book added to favourites",
      favouriteBooks: user.favouriteBooks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getBookToFav = async (req, res, next) => {
  try {
    const uid = req.headers["x-user-uid"];
    const user = await User.findOne({ uid }).populate({
      path: "favouriteBooks",
    });
    const favBooks = user.favouriteBooks || [];
    return res.status(200).json(favBooks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const rateBook = async (req, res) => {
  const { stars } = req.body;
  const uid = req.headers["x-user-uid"];
  if (!uid)
    return res.status(400).json({ message: "يجب ان تتوفر بيانات المستخدم" });
  const { bookId } = req.params;
  const userId = await User.findOne({ uid })._id;
  if (stars < 1 || stars > 5) {
    return res.status(400).json({ message: "التقييم يجب أن يكون من 1 إلى 5." });
  }

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: "الكتاب غير موجود." });

  const existingRating = book.ratings.find(
    (r) => r.userId.toString() === userId.toString()
  );

  if (existingRating) {
    existingRating.stars = stars;
  } else {
    book.ratings.push({ userId, stars });
  }

  await book.save();

  const averageRating = book.getAverageRating();
  res.json({ message: "تم التقييم", averageRating });
};

const searchBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter = {
        $or: [
          { title: { $regex: regex } },
          { category: { $regex: regex } },
          { author: { $regex: regex } },
        ],
      };
    }
    const books = await Book.find(filter).sort({ createdAt: -1 }).limit(8);

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
  recommendedBooks,
  addBookToFav,
  getBookToFav,
  rateBook,
  searchBooks,
};
