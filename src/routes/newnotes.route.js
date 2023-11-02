import express from 'express';
import NoteService from 'bc/services/newnotes.service.js';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';

const router = express.Router();

router.get('/note', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/note with params ${JSON.stringify(req.params, null, 2)}`);
  const user = req.user;
  try {
    const { color_id, hasNull } = req.query;
    let notes = null;
    if (!color_id && hasNull === undefined) {
      logger.info(`Starting function getAllNotes for newnotes.route/note`);
      notes = await NoteService.getAllNotes(user.user_id);
      logger.info(`Finished function getAllNotes for newnotes.route/note`);
    } else {
      logger.info(`Starting function getNotesByColor for newnotes.route/note`);
      notes = await NoteService.getNotesByColor(user.user_id, (color_id || '').split(','), hasNull);
      logger.info(`Finished function getNotesByColor for newnotes.route/note`);
    }
    return res.send(notes);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/group', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/group with params ${JSON.stringify(req.params, null, 2)}`);
  const user = req.user;
  try {
    logger.info(`Starting function getGroups for newnotes.route/group`);
    const groups = await NoteService.getGroups(user.user_id);
    logger.info(`Finished function getGroups for newnotes.route/group`);
    return res.send(groups);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/color-list', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/color-list with params ${JSON.stringify(req.params, null, 2)}`);
  const user = req.user;
  try {
    logger.info(`Starting function getColors for newnotes.route/group`);
    const colors = await NoteService.getColors(user.user_id);
    logger.info(`Finished function getColors for newnotes.route/group`);
    return res.send(colors);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/get-available-colors', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/get-available-colors with params ${JSON.stringify(req.params, null, 2)}`);
  try {
    logger.info(`Starting function getStaticColors for newnotes.route/get-available-colors`);
    const colors = await NoteService.getStaticColors();
    logger.info(`Finished function getStaticColors for newnotes.route/get-available-colors`);
    return res.send(colors);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/group', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/group with params ${JSON.stringify(req.params, null, 2)}`);
  const { group_notes_name } = req.body;
  const user = req.user;
  try {
    logger.info(`Starting function saveGroup for newnotes.route/group`);
    const group = await NoteService.saveGroup(group_notes_name, user);
    logger.info(`Finished function saveGroup for newnotes.route/group`);
    return res.send(group);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/note', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/note with params ${JSON.stringify(req.params, null, 2)}`);
  const user = req.user;  
  const {note_text, latitude, longitude, color_id} = req.body; 
  const note = {note_text, latitude, longitude, color_id, last_modified_by: user.email, created_by : user.email};
  note['user_id'] = user.user_id;
  try {
    logger.info(`Starting function saveNote for newnotes.route/note`);
    const savedNote = await NoteService.saveNote(note);
    logger.info(`Finished function saveNote for newnotes.route/note`);
    res.status(200).send(savedNote);
  } catch(error) {
    res.status(500).send(error);
  }
});

router.post('/color', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/color with params ${JSON.stringify(req.params, null, 2)}`);
  const user = req.user;
  const { label, color, opacity } = req.body;
  try {
    logger.info(`Starting function saveColor for newnotes.route/note`);
    const savedColor = await NoteService.saveColor(label, color, opacity, user.user_id);
    logger.info(`Finished function saveColor for newnotes.route/note`);
    res.status(200).send(savedColor);
  } catch(error) {
    res.status(500).send(error);
  }
})

router.delete('/note/:id', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/note with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  logger.info(`Starting function deleteNote for newnotes.route/note`);
  const deleted = await NoteService.deleteNote(id);
  logger.info(`Finished function deleteNote for newnotes.route/note`);
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
  logger.info(`Starting endpoint newnotes/group/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  logger.info(`Starting function deletegroups for newnotes.route/note`);
  const deleted = await NoteService.deleteGroups(id);
  logger.info(`Finished function deleteGroups for newnotes.route/note`);
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
  logger.info(`Starting endpoint newnotes/color/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  logger.info(`Starting function deleteColor for newnotes.route/color/:id`);
  const deleted = await NoteService.deleteColor(id);
  logger.info(`Finished function deleteColor for newnotes.route/color/:id`);
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
  logger.info(`Starting endpoint newnotes/note/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  const user = req.user;
  const {note_text, latitude, longitude, color_id, groupnotes_id, position} = req.body;
  const note = {};
  if (note_text) {
    note['note_text'] = note_text;
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
  note['groupnotes_id'] = groupnotes_id;
  note['last_modified_by'] = user.email;
  note['user_id'] = user.user_id;
  try {
    logger.info(`Starting function updateNote for newnotes.route/note/:id`);
    const savedNote = await NoteService.updateNote(id, note);
    logger.info(`Finished function updateNote for newnotes.route/note/:id`);
    if (savedNote) {
      return res.status(200).send(savedNote);
    } else {
      res.status(404).send('Note not found');
    }
  } catch(error) {
    res.status(205).send(error);
  }
});

router.put('/group/:id', [auth], async (req, res) => {  
  logger.info(`Starting endpoint newnotes/group/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  const { group_notes_name, position } = req.body;
  try {
    logger.info(`Starting function updateGroup for newnotes.route/group/:id`);
    const group = await NoteService.updateGroup(id, group_notes_name, position);
    logger.info(`Finished function updateGroup for newnotes.route/group/:id`);
    return res.send(group);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put('/color/:id', [auth], async (req, res) => {
  logger.info(`Starting endpoint newnotes/color/:id with params ${JSON.stringify(req.params, null, 2)}`);
  const id = req.params.id;
  const { label, color, opacity } = req.body;
  try {
    logger.info(`Starting function updateColor for newnotes.route/color/:id`);
    const updatedColor = await NoteService.updateColor(id, label, color, opacity);
    logger.info(`Finished function updateColor for newnotes.route/color/:id`);
    if (updatedColor.error){ 
      return res.status(200).send(updatedColor);
    }
    return res.send(updatedColor);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
