const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ExercisesSchema = new Schema({
  name: String,
  muscleGroups: [String],
});

module.exports = mongoose.model("Exercises", ExercisesSchema);
