const db = require('../config/db');
const logger = require('../config/logger');
const Note = db.note;

const getAllNotesByUser = (userId) => {
  const notes = Note.findAll({
    where: {
      user_id: userId
    }
  });
  return notes;
}

const deleteNote = async (id) => {
  const note = await Note.findOne({
    where: {
      _id: id 
    }});
  if (note) {
    logger.info('note destroyed ');
    note.destroy();
    return true;
  } else {
    logger.info('note not found');
    return false;
  }
}

const saveNote = async (note) => {
  logger.info('create note ' + JSON.stringify(note));
  try {
    const newNote = await Note.create(note);
    return newNote;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

const updateNote = async (id, note) => {
  logger.info('update note ' + JSON.stringify(note));
  try {
    let updateNote = await Note.findOne({
      where: {
        _id: id
      }
    });
    if (updateNote) {
      updateNote = await updateNote.update(note);
    } 
    return updateNote;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

module.exports = {
  getAllNotesByUser,
  deleteNote,
  saveNote,
  updateNote
};
