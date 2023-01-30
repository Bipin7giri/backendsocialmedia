const express = require('express');
const router = express.Router();

router.get('/message', (res, req) => {
  res.send({ response: 'i am alive' }).status(200);
});

module.exports = router;
