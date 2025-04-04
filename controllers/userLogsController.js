const UserLogsModel = require("../models/userLogsModel");
const ExercisesModel = require("../models/exercisesModel");
const mongodb = require("mongodb");
const genAIPrompt = require("../utils/genAIPrompt");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ai.models // returning a promise so that the user can get the response using a then chain
//   .generateContent({
//     model: "gemini-2.0-flash-lite",
//     contents: genAIPrompt(
//       "yo bro i spammed hella out of bicep curls today, like it was cray cray. I'm talking 45 pounds for 8"
//     ), // takes the user's message, tries to interpret the exercise
//   })
//   .then((response) => {
//     // since the AI is not able to return a properly formatted javascript array, we need to do some formatting before we can access the array
//     // hopefully using the same model means that the AI will not change how it tends to respond
//     const arrayString = response.text
//       .replace("```json", "")
//       .replace("```", "")
//       .trim();
//     console.log(arrayString);
//     console.log("Parsed version works??", JSON.parse(arrayString));
//   });

// Helper Functions:
function findUniqueExerciseLogs(result) {
  const uniqueExercisesLogs = result.filter((logItem, index) => {
    for (let i = 0; i < index; i++) {
      if (result[i].exercise.exerciseId.equals(logItem.exercise.exerciseId)) {
        // loops through the array, if finds a unique exercise, adds it; if finds a duplicate one, doesn't add it
        return false;
      }
    }
    return true;
  });
  // console.log(uniqueExercisesLogs);
  return uniqueExercisesLogs;
}

function getExerciseNameFromId(exerciseId) {
  ExercisesModel.findById(exerciseId)
    .then((exerciseEntry) => {
      if (exerciseEntry) {
        return exerciseEntry.name;
      } else {
        return "Null Exercise";
      }
    })
    .catch((err) => console.log(err));
}

function interpretUserLog(userMessage, oldChatHistory) {
  return ExercisesModel.find().then((allExercises) => {
    // returning a promise so that the user can get the response using a then chain
    if (allExercises) {
      return ai.models
        .generateContent({
          model: "gemini-2.0-flash",
          contents: genAIPrompt(
            JSON.stringify(allExercises),
            userMessage,
            oldChatHistory
          ), // takes the user's message, tries to interpret the exercise
        })
        .then((response) => {
          // since the AI is not able to return a properly formatted javascript array, we need to do some formatting before we can access the array
          // hopefully using the same model means that the AI will not change how it tends to respond
          const arrayString = response.text
            .replace("```json", "")
            .replace("```", "")
            .trim();
          console.log(arrayString);
          console.log("Parsed version works??", JSON.parse(arrayString));
          return JSON.parse(arrayString);
        });
    }
  });
}
exports.getAllUserLogs = async (req, res) => {
  try {
    const allUserLogs = await UserLogsModel.find({
      userId: new mongodb.ObjectId(req.body.userId), // Filtering by the current user
    });
    if (allUserLogs) {
      return allUserLogs;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
  }
};
exports.getUniqueExercises = async (req, res, next) => {
  // getching all logs from a particular user:
  try {
    const allUserLogs = await this.getAllUserLogs(req, res);
    console.log("crew back in town", allUserLogs);

    const uniqueExerciseLogs = findUniqueExerciseLogs(allUserLogs); // filter logs to return an array with unique exercises' logs

    const uniqueExercisesArray = uniqueExerciseLogs.map((exerciseLog) => {
      return exerciseLog.exercise;
    }); // converting the logs for the differnt exercises to just their names

    if (uniqueExercisesArray) {
      res.send(uniqueExercisesArray);
    } else {
      res.send([]);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getExerciseLogs = async (req, res, next) => {
  // gets logs for a particular exercise:
  try {
    const exerciseIdentifier = new mongodb.ObjectId(req.params.exerciseId);

    const allUserLogs = await this.getAllUserLogs(req, res);
    console.log("nike this a hulululu braaand", allUserLogs);

    const relevantExerciseLogs = allUserLogs.filter((individualExerciseLog) => {
      // filters by the relevant exercise using exerciseIdentifier
      return individualExerciseLog.exercise.exerciseId.equals(
        exerciseIdentifier
      );
    });
    if (relevantExerciseLogs) {
      res.json(relevantExerciseLogs);
    }
  } catch (err) {
    console.log(err);
  }

  // gets logs for a particular exercise
  // console.log("This is the request damn body", req.body);
  // const exerciseIdentifier = new mongodb.ObjectId(req.params.exerciseId);
  // UserLogsModel.find({
  //   userId: new mongodb.ObjectId(req.body.userId), // Filtering by the current user
  // })
  //   .then((result) => {
  //     console.log(
  //       "this is the result of the result of the result of the result of the log of the user exercise damn",
  //       result
  //     );
  //     // result of logs from the user
  //     // filtering the result based on the exerciseIdentifier:
  //     const relevantExerciseLogs = result.filter((individualExerciseLog) => {
  //       return individualExerciseLog.exercise.exerciseId.equals(
  //         exerciseIdentifier
  //       );
  //     });
  //     return relevantExerciseLogs;
  //   })
  //   .then((relevantExerciseLogs) => {
  //     console.log("monday, with ever have no week", relevantExerciseLogs);
  //     res.json(relevantExerciseLogs);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.postUserLog = (req, res, next) => {
  // how to send a payload to the postUserLog middleware:
  // {
  //   logMessage: "message of the log",
  //   userId: ...,
  // }
  console.log(
    "This request is being sent by the user in the chat-like interface",
    req.body,
    typeof req.body
  );
  interpretUserLog(req.body.logMessage, req.body.oldChatHistory) // sending both the currentmessage as well as old log messages to the AI
    .then((interpretedArray) => {
      // console.log(req.body.logMessage, req.body.oldChatHistory);
      // the following array is in the form: [exerciseName, exerciseId(String), exerciseWeight, exerciseReps, botMessage]
      if (interpretedArray && interpretedArray.length == 5) {
        // if the AI gave a valid array
        console.log(
          "TAREEK PE TAREEK, TAREEK PE TAREEK",
          new Date(),
          new Date().toISOString().split("T")[0]
        );
        const logData = {
          userId: req.body.userId, // uses session here to get userId
          workoutId: new Date().toISOString().split("T")[0], // workoutId is stored based on the day the workout was being done
          exercise: {
            exerciseId: new mongodb.ObjectId(interpretedArray[1]),
            exerciseName: interpretedArray[0],
          },
          exerciseWeight: interpretedArray[2],
          exerciseReps: interpretedArray[3],
          date: new Date(),
        };

        const userLog = new UserLogsModel(logData)
          .save()
          .then((result) => {
            console.log("The data was added to the database", result);
            res.json({
              success: true,
              botMessage: interpretedArray[4],
            });
          })
          .catch((err) => console.log(err));
      } else {
        if (interpretedArray.length == 1) {
          console.log(
            "User's message cannot be parsed, either did not give the right information or the exercise does not exist in the database"
          );
          res.json({
            success: false,
            botMessage: interpretedArray[0],
          });
        }
      }
    })
    .catch((err) => console.log(err));
};
