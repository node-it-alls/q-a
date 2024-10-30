const express = require('express');
const morgan = require('morgan');
const db = require('./db.js');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hi from home')
})

app.get('/qa', (req, res) => {
  // console.error('Error:', err.stack);
  res.send('Hello! QA!')
});

app.listen(PORT, () => {
  console.log(`Data server running on http://localhost:${PORT}`);
});
