const mongoose = require("mongoose");
const { Schema } = mongoose;
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');


if (!process.env.DB_NAME) {
  console.error('Please set the DB_NAME environment variable');
  process.exit(1);
}

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to the database');
});

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
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
    id: {
      type: Number,
      unique: true
    },
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


const convertDate = (timestamp) => {
  const parsedTimestamp = parseInt(timestamp);
  if (isNaN(parsedTimestamp)) {
    console.error(`Invalid timestamp: ${timestamp}`);
    return new Date();
  }
  return String(new Date(parsedTimestamp));
};


const seedQuestions = () => {
  fs.createReadStream(path.join(__dirname, `./data/questions.csv`))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async (data) => {
      console.log(data)
      try {
        await Question.findOneAndUpdate({ id: data.id }, {
          id: data.id,
          question_body: data.body,
          question_date: data.date_written,
          asker_name: data.asker_name,
          question_helpfulness: data.helpfulness,
        }, { upsert: true }); // change this to create on final seed
      } catch (err) {
        console.log(err)
      }
    })
    .on('end', () => {
      console.log('success @ seedQuestions')
      seedAnswers();
    });
}

const seedAnswers = () => {
  fs.createReadStream(path.join(__dirname, './data/answers.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error('CSV Parsing Error:', error))
    .on('data', async (data) => {
      try {
        const question = await Question.findOne({ id: data.question_id });
        if (question) {
          const ans = await Answer.findOneAndUpdate({ id: data.id }, {
            id: question.id,
            body: data.body,
            date: data.date_written,
            answerer_name: data.answerer_name,
            photos: [],
            question: question._id,
            helpfulness: data.helpful,

          }, { upsert: true });
          if (ans) {
            await Question.updateOne({ _id: question._id }, { $push: { answers: ans._id } });
          }
        }
      } catch (err) {
        console.error('Error in processing data row:', err);
      }
    })
    .on('end', () => {
      console.log('success @ seedAnswers');
    });
};

const seedPhotos = () => {
  fs.createReadStream(path.join(__dirname, `./data/answers_photos.csv`))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async (data) => {
      try {
        const res = await Answer.updateOne({ id: data.answer_id }, { $push: { photos: { $each: [{ url: data.url }] } } });
      } catch (err) {
        console.log('err @ seedPhotos', err)
      }
    })
    .on('end', () => {
      console.log('success @ seedPhotos')
    });
}

seedQuestions();
// seedAnswers();
module.exports.Answer = Answer;
module.exports.Question = Question;
