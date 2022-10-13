import express from 'express';
import NoteService from 'bc/services/newnotes.service.js';
import auth from 'bc/auth/auth.js';

const router = express.Router();

router.get('/note', [auth], async (req, res) => {
  const user = req.user;
  try {
    const { color_id, hasNull } = req.query;
    let notes = null;
    if (!color_id && hasNull === undefined) {
      notes = await NoteService.getAllNotes(user._id);
    } else {
      notes = await NoteService.getNotesByColor(user._id, (color_id || '').split(','), hasNull);
    }
    return res.send(notes);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/group', [auth], async (req, res) => {
  const user = req.user;
  try {
    const groups = await NoteService.getGroups(user._id);
    return res.send(groups);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/color-list', [auth], async (req, res) => {
  const user = req.user;
  try {
    const colors = await NoteService.getColors(user._id);
    return res.send(colors);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/get-available-colors', [auth], async (req, res) => {
  const user = req.user;
  try {
    const colors = await NoteService.getColorsByNote(user._id);
    return res.send(colors);
  } catch(error) {
    res.status(500).send(error);
  }
})

router.post('/group', [auth], async (req, res) => {
  const { name } = req.body;
  const user = req.user;
  try {
    const group = await NoteService.saveGroup(name, user._id);
    return res.send(group);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/note', [auth], async (req, res) => {
  const user = req.user;
  const note = {content, latitude, longitude, color_id} = req.body;
  note['user_id'] = user._id;
  try {
    const savedNote = await NoteService.saveNote(note);
    res.status(200).send(savedNote);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.post('/color', [auth], async (req, res) => {
  const user = req.user;
  const { label, color, opacity } = req.body;
  try {
    const savedColor = await NoteService.saveColor(label, color, opacity, user._id);
    res.status(200).send(savedColor);
  } catch(error) {
    res.status(500).send(error);
  }
})

router.delete('/note/:id', [auth], async (req, res) => {
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

router.delete('/group/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const deleted = await NoteService.deleteGroups(id);
  if (deleted) {
    return res.status(200).send({
      status: 'deleted'
    });
  } else {
    return res.status(404).send({
      status: 'Group not found'
    });
  }
});

router.delete('/color/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const deleted = await NoteService.deleteColor(id);
  if (deleted) {
    return res.status(200).send({
      status: 'deleted'
    });
  } else {
    return res.status(404).send({
      status: 'Color not found'
    });
  }
});

router.put('/note/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const {content, latitude, longitude, color_id, group_id, position} = req.body;
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
  if (color_id) {
    note['color_id'] = color_id;
  }
  if (position) {
    note['position'] = position;
  }
  note['group_id'] = group_id;
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

router.put('/group/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const { name, position } = req.body;
  try {
    const group = await NoteService.updateGroup(id, name, position);
    return res.send(group);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put('/color/:id', [auth], async (req, res) => {
  const id = req.params.id;
  const { label, color, opacity } = req.body;
  try {
    const updatedColor = await NoteService.updateColor(id, label, color, opacity);
    return res.send(updatedColor);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
