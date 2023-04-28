import express from 'express';
import NoteService from 'bc/services/note.service.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';

const router = express.Router();

router.get('/', [auth], async (req, res) => {
  const user = req.user;
  try {
    logger.info(`Starting function getAllNotesByUser for note.route/`);
    const notes = await NoteService.getAllNotesByUser(user.user_id);
    logger.info(`Finished function getAllNotesByUser for note.route/`);
    return res.send(notes);
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post('/', [auth], async (req, res) => {
  const user = req.user;
  const note = {content, latitude, longitude, color} = req.body;
  note['user_id'] = user.user_id;
  try {
    logger.info(`Starting function saveNote for note.route/`);
    const savedNote = await NoteService.saveNote(note);
    logger.info(`Finished function saveNote for note.route/`);
    res.status(200).send(savedNote);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.delete('/:id', [auth], async (req, res) => {
  const id = req.params.id;
  logger.info(`Starting function deleteNote for note.route/`);
  const deleted = await NoteService.deleteNote(id);
  logger.info(`Finished function deleteNote for note.route/`);
  if (deleted) {
    return res.status(200).send({
      status: 'deleted'
    });
  } else {
    return res.status(404).send({
      status: 'Note not found'
    });
  }
});

router.put('/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const {content, latitude, longitude, color} = req.body;
  const note = {};
  if (content) {
    note['content'] = content;
  }
  if (latitude) {
    note['latitude'] = latitude;
  }
  if (longitude) {
    note['longitude'] = longitude;
  }
  if (color) {
    note['color'] = color;
  }
  note['user_id'] = user.user_id;
  try {
    logger.info(`Starting function updateNote for note.route/`);
    const savedNote = await NoteService.updateNote(id, note);
    logger.info(`Finished function updateNote for note.route/`);
    if (savedNote) {
      return res.status(200).send(savedNote);
    } else {
      res.status(404).send('Note not found');
    }
  } catch(error) {
    res.status(500).send(error);
  }
});

export default router;
