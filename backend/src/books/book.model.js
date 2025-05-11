const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    trending: {
      type: Boolean,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    author: {
      type: String,
      default: "admin",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        stars: { type: Number, min: 1, max: 5 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookSchema.methods.getAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const totalStars = this.ratings.reduce((sum, r) => sum + r.stars, 0);
  return Math.round((totalStars / this.ratings.length) * 10) / 10;
};

bookSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.stars, 0);
  return sum / this.ratings.length;
});

// bookSchema.set("toObject", { virtuals: true });
// bookSchema.set("toJSON", { virtuals: true });

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
