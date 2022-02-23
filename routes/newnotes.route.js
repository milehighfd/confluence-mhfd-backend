const express = require('express');
const router = express.Router();

const NoteService = require('../services/newnotes.service');
const auth = require('../auth/auth');

router.get('/get-notes', [auth], async (req, res) => {
  const user = req.user;
  try {
    const notes = await NoteService.getAllNotesByUser(user._id);
    return res.send(notes);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/create-group', [auth], async (req, res) => {
  const { name } = req.body;
  try {
    const group = await NoteService.createGroup(name);
    return res.send(group);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/create-note', [auth], async (req, res) => {
  const user = req.user;
  const note = {content, latitude, longitude, color} = req.body;
  note['user_id'] = user._id;
  try {
    const savedNote = await NoteService.saveNote(note);
    res.status(200).send(savedNote);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.delete('/delete-note/:id', [auth], async (req, res) => {
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

router.put('/edit-note/:id', [auth], async (req, res) => {
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
  note['user_id'] = user._id;
  try {
    const savedNote = await NoteService.updateNote(id, note);
    if (savedNote) {
      return res.status(200).send(savedNote);
    } else {
      res.status(404).send('Note not found');
    }
  } catch(error) {
    res.status(500).send(error);
  }
});

router.put('/edit-group:id', [auth], async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  try {
    const group = await NoteService.updateGroup(id, name);
    return res.send(group);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;