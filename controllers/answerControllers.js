const { Answer } = require("../db.js");

exports.getAnswers = (req, res) => {
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const skip = (page - 1) * count;
  Answer.find({ question_id: req.params.question_id, reported: false })
    .skip(skip)
    .limit(count)
    .exec()
    .then((doc) => {
      delete doc.reported;
      res.status(200).send({
        question: req.params.question_id,
        page,
        count,
        results: doc.map((item) => {
          delete item._doc.reported;
          return item;
        }),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createAnswer = (req, res) => {
  const { body, name, email, photos } = req.query;
  if (!body || !name || !email || !photos) {
    res.sendStatus(400);
    return;
  }
  Answer.countDocuments({}).then((count) => {
    const newAnswer = new Answer({
      body,
      answerer_name: name,
      photos: JSON.parse(req.query.photos).map((photo) => ({ url: photo })),
      id: count + 1,
      question_id: req.params.question_id,
    });
    newAnswer
      .save()
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.reportAnswer = (req, res) => {
  Answer.findOneAndUpdate({ id: req.params.answer_id }, { reported: true })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updateAnswerHelpful = (req, res) => {
  Answer.findOneAndUpdate(
    { id: req.params.answer_id },
    { $inc: { helpfulness: 1 } }
  )
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};
