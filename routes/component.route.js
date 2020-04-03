const express = require('express');
const Component = require('../models/component.model');
const router = express.Router();
const auth = require('../auth/auth');

router.get('/', async (req, res, next) => {
   try {
      const component = new Component(req.body);
      await component.save();
      res.status(201).send(component);
   } catch(error) {
      res.status(500).send({error: error});
   }
})