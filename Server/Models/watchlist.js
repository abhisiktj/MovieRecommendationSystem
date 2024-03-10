const mongoose = require("mongoose");

const entrySchema = mongoose.Schema(
  {
    movie_id: {
      type: String,
      required: [true, "Movie Id is required"],
    },
    rating: {
      type: Number
    },
    status: {
      type: String,
      enum: ["watched", "watching", "dropped", "plan to watch"],
    },
  },
  { timestamps: true }
);

//watchlist is an array of entries
const watchlistSchema = mongoose.Schema(
  {
    entries: [entrySchema],
    private: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Watchlist", watchlistSchema);
