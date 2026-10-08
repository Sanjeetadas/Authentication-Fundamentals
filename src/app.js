// require('dotenv').config();
// const express = require('express');
// const authRoutes = require('./routes/authRoutes');

// const app = express();
// app.use(express.json());
// app.use('/auth', authRoutes);
// app.use((error, req, res, next) => {
//   console.error(error.message);
//   res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
// });

// const port = Number(process.env.PORT || 3000);
// app.listen(port, () => console.log(`API listening on ${port}`));





require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  if (error.status && error.code) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  console.error('Internal server error');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});