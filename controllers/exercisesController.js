const ExerciseModel = require("../models/exercisesModel");

exports.postAddExercise = (req, res, next) => {
  const muscleGroupsArray = req.body.muscleGroups.split(",").map((group) => {
    return group.trim();
  });
  const exerciseData = {
    name: req.body.name,
    muscleGroups: muscleGroupsArray,
  };

  const exercise = new ExerciseModel(exerciseData)
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
