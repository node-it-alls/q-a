const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 3003;
const questionControllers = require("./controllers/questionControllers.js");
const answerControllers = require("./controllers/answerControllers.js");

app.use(morgan("dev"));
app.use(express.json());

app.get("/qa", (req, res) => {
  res.send("Hello! QA!");
});

app.get("/qa/questions", (req, res) => {
  questionControllers.getQuestions(req, res);
});

app.post("/qa/questions", (req, res) => {
  questionControllers.createQuestion(req, res);
});

app.get("/qa/questions/:question_id/answers", (req, res) => {
  answerControllers.getAnswers(req, res);
});

app.post("/qa/questions/:question_id/answers", (req, res) => {
  answerControllers.createAnswer(req, res);
});

app.put("/qa/questions/:question_id/report", (req, res) => {
  console.log("reported question", req.params);
  questionControllers.reportQuestion(req, res);
});

app.put("/qa/questions/:question_id/helpful", (req, res) => {
  questionControllers.updateQuestionHelpful(req, res);
});

app.put("/qa/answers/:answer_id/report", (req, res) => {
  answerControllers.reportAnswer(req, res);
});

app.put("/qa/answers/:answer_id/helpful", (req, res) => {
  answerControllers.updateAnswerHelpful(req, res);
});

app.listen(PORT, () => {
  console.log(`Data server running on http://localhost:${PORT}`);
});
