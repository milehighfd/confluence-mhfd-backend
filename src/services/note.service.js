import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Note = db.note;

export const getAllNotesByUser = (userId) => {
  try {
    const notes = Note.findAll({
      where: {
        user_id: userId
      }
    });
    return notes;
  } catch(error) {
    console.log('the error GET NOTES BY USER', error);
    throw error;
  }
}

export const deleteNote = async (id) => {
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

export const saveNote = async (note) => {
  logger.info('create note ' + JSON.stringify(note));
  try {
    const newNote = await Note.create(note);
    return newNote;
  } catch(error) {
    console.log('the error SAVE NOTE', error);
    throw error;
  }
}

export const updateNote = async (id, note) => {
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
    console.log('the error at update error', error);
    throw error;
  }
}

export default {
  getAllNotesByUser,
  deleteNote,
  saveNote,
  updateNote
};
