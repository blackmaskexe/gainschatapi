const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSplitsSchema = new Schema({
  userId: Schema.Types.userId,
  splitName: String,
  split: [
    {
      weekday: String,
      exercises: [String],
      muscleGroups: [String],
    },
  ],
  createdDate: String,
});

module.exports = mongoose.model("UserSplits", UserSplitsSchema);
