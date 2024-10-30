const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to the database');
});

const answerSchema = new mongoose.Schema(
  {
    body: String,
    date: String,
    answerer_name: String,
    helpfulness: Number,
    photos: [
      {
        url: String,
      },
    ],
    reported: {
      type: Boolean,
      default: false,
    },
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  },
);

const Answer = mongoose.model("Answer", answerSchema);

const questionSchema = new mongoose.Schema({
  question_body: String,
  question_date: String,
  asker_name: String,
  question_helpfulness: Number,
  reported: {
    type: Boolean,
    default: false,
  },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }]
});

const Question = mongoose.model("Question", questionSchema);


const testQuestion = new Question({
  question_body: "This is a test question",
  question_date: "2021-09-01",
  asker_name: 'test',
  question_helpfulness: 0,
  photos: [
    {
      url: "https://wonderlab.org/wp-content/uploads/2024/07/2024_Axolotl_Feature-Image-2.jpeg",
    },
  ],
})


async function test() {
  try {
    // Save test question
    const savedQuestion = await testQuestion.save();
    console.log('Question saved:', savedQuestion);

    // Create and save test answer
    const testAnswer = new Answer({
      body: "This is a test answer",
      date: "2021-09-01",
      answerer_name: "test",
      helpfulness: 0,
      question_id: savedQuestion._id,
      photos: [{
        url: "https://wonderlab.org/wp-content/uploads/2024/07/2024_Axolotl_Feature-Image-2.jpeg"
      }]
    });

    const savedAnswer = await testAnswer.save();
    console.log('Answer saved:', savedAnswer);

  } catch (error) {
    console.error("Error in test function:", error);
  }
}

// Execute the test
test();

module.exports.QuestionModel = Question;
module.exports.AnswerModel = Answer;