const express = require("express");
const morgan = require("morgan");
const db = require("./db.js");
const app = express();
const PORT = process.env.PORT || 3003;
const controllers = require("./controllers.js");

app.use(morgan("dev"));
app.use(express.json());

app.get("/qa/questions", (req, res) => {
  controllers.getQuestions(req, res);
});

app.get("/qa", (req, res) => {
  res.send("Hello! QA!");
});

app.post("/qa/questions", (req, res) => {
  controllers.createQuestion(req, res);
});

app.get("/qa/questions/:question_id/answers", (req, res) => {
  controllers.getAnswers(req, res);
});

app.post("/qa/questions/:question_id/answers", (req, res) => {
  controllers.createAnswer(req, res);
});

app.put("/qa/questions/:question_id/report", (req, res) => {
  console.log("reported question", req.params);
  controllers.reportQuestion(req, res);
});

app.put("/qa/questions/:question_id/helpful", (req, res) => {
  controllers.updateQuestionHelpful(req, res);
});

app.put("/qa/answers/:answer_id/report", (req, res) => {
  controllers.reportAnswer(req, res);
});

app.put("/qa/answers/:answer_id/helpful", (req, res) => {
  controllers.updateAnswerHelpful(req, res);
});

app.listen(PORT, () => {
  console.log(`Data server running on http://localhost:${PORT}`);
});
