const mongoose = require("mongoose");
const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");

if (!process.env.DB_NAME) {
  console.error("Please set the DB_NAME environment variable");
  process.exit(1);
}

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  product_id: Number,
  question_body: String,
  question_date: String,
  asker_name: String,
  question_helpfulness: {
    type: Number,
    default: 0,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  answers: {},
});

questionSchema.index({ product_id: 1 });
questionSchema.index({ id: 1 });

const Question = mongoose.model("Question", questionSchema);

const answerSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  body: String,
  date: String,
  answerer_name: String,
  photos: [
    {
      url: String,
    },
  ],
  reported: {
    type: Boolean,
    default: false,
  },
  question_id: Number,
  helpfulness: {
    type: Number,
    default: 0,
  },
});

answerSchema.index({ question_id: 1 });
answerSchema.index({ id: 1 });

const Answer = mongoose.model("Answer", answerSchema);

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
    .on("error", (error) => {
      console.error(error);
      reject(error);
    })
    .on("data", async (data) => {
      console.log(data.id);
      try {
        await Question.findOneAndUpdate(
          { id: data.id },
          {
            id: data.id,
            question_body: data.body,
            question_date: data.date_written,
            product_id: data.product_id,
            asker_name: data.asker_name,
            question_helpfulness: data.helpfulness,
            reported: data.reported === 1 ? true : false,
          },
          { upsert: true }
        );
      } catch (err) {
        console.log(err);
      }
    })
    .on("end", () => {
      console.log("success @ seedQuestions");
    });
};

const batchSize = 1000;
let batch = [];
let count = 0;

const insertBatch = (batch) => {
  count++;
  Answer.insertMany(batch)
    .then(() => {
      console.log(count);
    })
    .catch((err) => console.error(err), "error inserting data");
};

const seedAnswers = () => {
  fs.createReadStream(path.join(__dirname, "./data/answers.csv"))
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      console.error("CSV Parsing Error:", error);
      reject(error);
    })
    .on("data", async (data) => {
      try {
        const question = await Question.findOne({ id: data.question_id });
        if (question) {
          const ans = {
            id: data.id,
            body: data.body,
            date: data.date_written,
            answerer_name: data.answerer_name,
            photos: [],
            helpfulness: data.helpful,
            question_id: question.id,
            question: question._id,
            reported: data.reported === 1 ? true : false,
          };
          batch.push(ans);
          if (batch.length >= batchSize) {
            insertBatch(batch);
            batch = [];
          }
        }
      } catch (err) {
        console.error("Error in processing data row:", err);
      }
    })
    .on("end", () => {
      if (batch.length > 0) {
        insertBatch(batch);
      }
      console.log("success @ seedAnswers");
    });
};

const seedPhotos = () => {
  fs.createReadStream(path.join(__dirname, `./data/answers_photos.csv`))
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      console.error(error);
      reject(error);
    })
    .on("data", async (data) => {
      try {
        await Answer.updateOne(
          { id: data.answer_id },
          { $push: { photos: { url: data.url } } }
        );
      } catch (err) {
        console.log("err @ seedPhotos", err);
      }
    })
    .on("end", () => {
      console.log("success @ seedPhotos");
    });
};

// seedQuestions();
// seedAnswers();
// createQuestionAnswerConnection();
// seedPhotos();

module.exports.Answer = Answer;
module.exports.Question = Question;
