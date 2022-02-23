const db = require('../config/db');
const logger = require('../config/logger');
const NewNotes = db.newnotes;
const GroupNotes = db.groupnotes;

const getAllNotes = () => {
  const notes = NewNotes.findAll({});
  return notes;
}

const getGroups = async (id) => {
  const groups = await GroupNotes.findAll({ userId: id });
  return groups;
}

const createGroup = async (name, user_id) => {
  const group = await NewNotes.create({name: name, user_id: user_id});
  return group;
}


const deleteGroups = async (id) => {
  const group = await GroupNotes.findOne({
    where: {
      _id: id 
    }});
  if (group) {
    logger.info('group destroyed ');
    group.destroy();
    return true;
  } else {
    logger.info('group not found');
    return false;
  }
}

const updateGroup = async (id, name) => {
  logger.info('update group ' + JSON.stringify(name));
  try {
    let updateGroup = await GroupNotes.findOne({
      where: {
        _id: id
      }
    });
    if (updateGroup) {
      updateGroup = await updateGroup.update(name);
    } 
    return updateGroup;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

const getAllNotesByUser = async (userId) => {
  const notes = await NewNotes.findAll({
    where: {
      user_id: userId
    }
  });
  return notes;
}

const deleteNote = async (id) => {
  const note = await NewNotes.findOne({
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
    const newNote = await NewNotes.create(note);
    return newNote;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

const updateNote = async (id, note) => {
  logger.info('update note ' + JSON.stringify(note));
  try {
    let updateNote = await NewNotes.findOne({
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
  updateNote,
  updateGroup,
  getAllNotes,
  getGroups,
  createGroup,
  deleteGroups
};
