const { Answer, Question } = require("../db.js");

exports.getQuestions = (req, res) => {
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const skip = (page - 1) * count;
  Question.find({ product_id: req.query.product_id, reported: false })
    .skip(skip)
    .limit(count)
    .exec()
    .then((doc) => {
      const results = Promise.all(
        doc.map(async (question) => {
          const answers = await Answer.find({ question_id: question.id });
          const mappedAnswers = {};
          if (answers) {
            answers.forEach((answer) => {
              const result = {
                ...answer._doc,
                answer_id: answer.id,
              };
              delete result.reported;
              mappedAnswers[String(answer.id)] = result;
            });
          }
          delete question._doc.reported;
          return { ...question._doc, answers: mappedAnswers };
        })
      );
      return results;
    })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.sendStatus(400);
      console.log(err);
    });
};

exports.createQuestion = (req, res) => {
  const { body, name, email, product_id } = req.query;
  if (!body || !name || !email || !product_id) {
    res.sendStatus(400);
    return;
  }
  Question.countDocuments({}).then((count) => {
    const newQuestion = new Question({
      question_body: body,
      asker_name: name,
      question_helpfulness: 0,
      product_id,
      id: count + 1,
    });
    newQuestion
      .save()
      .then((doc) => {
        res.status(201).send(doc);
      })
      .catch((err) => {
        res.sendStatus(400);
        console.log(err);
      });
  });
};

exports.reportQuestion = (req, res) => {
  Question.findOneAndUpdate({ id: req.params.question_id }, { reported: true })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.sendStatus(400);
      console.log(err);
    });
};

exports.updateQuestionHelpful = (req, res) => {
  Question.findOneAndUpdate(
    { id: req.params.question_id },
    { $inc: { question_helpfulness: 1 } }
  )
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};
