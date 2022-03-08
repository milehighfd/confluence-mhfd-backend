const db = require('../config/db');
const logger = require('../config/logger');
const NewNotes = db.newnotes;
const GroupNotes = db.groupnotes;
const ColorNotes = db.color;

const getAllNotes = () => {
  const notes = NewNotes.findAll({});
  return notes;
}

const getGroups = async (id) => {
  console.log(id);
  const groups = await GroupNotes.findAll({ user_id: id });
  return groups;
}

const getColors = async (userId) => {
  const colors = await ColorNotes.findAll({
    where: {
      user_id: userId
    }
  });
  return colors;
}

const createGroup = async (name, user_id) => {
  console.log(name, user_id);
  const group = await GroupNotes.create({name: name, user_id: user_id});
  return group;
}

const saveColor = async (label, color, opacity, userId) => {
  try {
    const newColor = await ColorNotes.create({label: label, color: color, opacity: opacity, user_id: userId});
    return newColor;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}


const deleteGroups = async (id) => {
  const group = await GroupNotes.findOne({
    where: {
      _id: id 
    }});
  if (group) {
    NewNotes.destroy({ where: { group_id: id } });
    group.destroy();
    return true;
  } else {
    logger.info('group not found');
    return false;
  }
}

const deleteColor = async (id) => {
  const color = await ColorNotes.findOne({
    where: {
      _id: id 
    }});
  if (color) {
    logger.info('color destroyed ');
    color.destroy();
    return true;
  } else {
    logger.info('color not found');
    return false;
  }
}

const updateGroup = async (id, name) => {
  logger.info('update group ' + JSON.stringify(name));
  try {
    let toUpdate = await GroupNotes.findOne({
      where: {
        _id: id
      }
    });
    if (toUpdate) {
      console.log('update group ', toUpdate, name);
      toUpdate = await toUpdate.update({name: name});
    } 
    return toUpdate;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

const updateColor = async (id, label, color, opacity) => {
  logger.info('update color ', + color);
  try {
    let toUpdate = await ColorNotes.findOne({
      where: {
        _id: id
      }
    });
    if (toUpdate) {
      toUpdate = await toUpdate.update({label: label, color: color, opacity: opacity});
    } 
    return toUpdate;
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
    console.log(id, note);
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
    let toUpdate = await NewNotes.findOne({
      where: {
        _id: id
      }
    });
    if (toUpdate) {
      // console.log({...note});
      toUpdate = await toUpdate.update({...note});
      // console.log(toUpdate);
    } 
    return toUpdate;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}

module.exports = {
  getAllNotesByUser,
  getAllNotes,
  getGroups,
  getColors,
  saveNote,
  createGroup,
  saveColor,
  updateNote,
  updateGroup,
  updateColor,
  deleteGroups,
  deleteNote,
  deleteColor
};
