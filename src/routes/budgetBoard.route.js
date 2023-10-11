import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import moment from 'moment';

const router = express.Router();
const BudgetBoardTable = db.budgetBoardTable;

const getBudgetBoardEntries = async (req, res) => {
  try {
    let entries = await BudgetBoardTable.findAll();
    res.send(entries);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const addBudgetBoardEntry = async (req, res) => {
  try {
    let newEntry = await BudgetBoardTable.create(req.body);
    res.status(201).send(newEntry);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const updateBudgetBoardEntry = async (req, res) => {
  const id = req.params.id;
  try {
    await BudgetBoardTable.update(req.body, { where: { id: id } });
    return res.status(200).send({ message: 'SUCCESS' });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const addOrUpdateBudgetBoardEntry = async (req, res) => {
  const { boards_id, locality } = req.body;
  try {
    const existingEntry = await BudgetBoardTable.findOne({ where: { boards_id, locality } });
    if (existingEntry) {
      const body = req.body;
      body.modified_date = moment().format('YYYY-MM-DD HH:mm:ss'),
      body.last_modified_by = req.user.email;
      await existingEntry.update(body);
      res.status(200).send(existingEntry);
    } else {
      const body = req.body;
      body.created_date = moment().format('YYYY-MM-DD HH:mm:ss'),
      body.created_by = req.user.email;
      body.modified_date = moment().format('YYYY-MM-DD HH:mm:ss'),
      body.last_modified_by = req.user.email;
      const newEntry = await BudgetBoardTable.create(body);
      res.status(201).send(newEntry);
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

const getBudgetBoardEntry = async (req, res) => {
  const { boards_id, locality } = req.body;
  try {
    const entry = await BudgetBoardTable.findOne({ where: { boards_id, locality } });
    if (entry) {
      res.status(200).send({entry: entry});
    } else {
      res.status(200).send({entry: null});
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
}

router.post('/entry', auth, getBudgetBoardEntry);
router.post('/add-or-update', auth, addOrUpdateBudgetBoardEntry);
router.get('/', auth, getBudgetBoardEntries);
router.post('/', auth, addBudgetBoardEntry);
router.put('/:id', auth, updateBudgetBoardEntry);

export default router;