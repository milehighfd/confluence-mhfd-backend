const express = require('express');
const router = express.Router();


const NoteService = require('../services/note.service');
const auth = require('../auth/auth');

router.get('/', [auth], async (req, res) => {
  const user = req.user;
  try {
    const notes = await NoteService.getAllNotesByUser(user._id);
    return res.send(notes);
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post('/', [auth], async (req, res) => {
  const user = req.user;
  const note = {content, latitude, longitude, color} = req.body;
  console.log('USER ============================================================== ', user);
  console.log('MY NOTEEEEEEE ', note);
  note['user_id'] = user._id;
  try {
    const savedNote = await NoteService.saveNote(note);
    res.status(200).send(savedNote);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.delete('/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const deleted = await NoteService.deleteNote(id);
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
module.exports = (router);