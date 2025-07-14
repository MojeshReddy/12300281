const express = require('express');
const app = express();
const logger = require('./middlewares/logger');
const shorturlRoutes = require('./routes/shorturl');

app.use(express.json());
app.use(logger);
app.use('/', shorturlRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
