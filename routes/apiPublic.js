const express = require('express');
const router = express.Router();

router.get('/auth', function(req, res){
   res.send('Implement the auth.');
});

module.exports = router;
