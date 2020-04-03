const express = require('express');
const router = express.Router();
const Problem = require('../models/problem.model');

router.post('/', async (req, res) => {
   try {
      const problem = new Problem(req.body);
      await problem.save();
   } catch(error) {
      res.status(500).send({error: error} );
   }
});