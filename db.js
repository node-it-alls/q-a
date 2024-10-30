const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to the database');
});

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
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  },
);

const Answer = mongoose.model("Answer", answerSchema);

const testQuestion = new Question({
  question_body: "This is a test question",
  question_date: "2021-09-01",
  asker_name: 'test-asker',
  question_helpfulness: 0,
})

async function test() {
  try {
    // Save test question
    await testQuestion.save();
    console.log('Question saved:', testQuestion._id);

    // Create and save test answer
    const testAnswer = new Answer({
      body: "This is a test answer",
      date: "2021-09-01",
      answerer_name: "test",
      helpfulness: 0,
      question: testQuestion._id,
      photos: [{
        url: "https://wonderlab.org/wp-content/uploads/2024/07/2024_Axolotl_Feature-Image-2.jpeg"
      }]
    });
    const testAnswer2 = new Answer({
      body: "This is a test answer",
      date: "2021-09-01",
      answerer_name: "test",
      helpfulness: 0,
      question: testQuestion._id,
      photos: [{
        url: "https://wonderlab.org/wp-content/uploads/2024/07/2024_Axolotl_Feature-Image-2.jpeg"
      }]
     });

    const savedAnswer = await testAnswer.save();
    await Question.updateOne({ _id: testQuestion._id }, { $push: { answers: { $each: [testAnswer._id, testAnswer2._id] } } });
    // const savedAnswer2 = await testAnswer2.save();
    const question = await Question.findById(testQuestion._id).populate('answers').exec();
    console.log('Question with populate', question);

  } catch (error) {
    console.error("Error in test function:", error);
  }
}

module.exports.AnswerModel = Answer;
module.exports.QuestionModel = Question;
