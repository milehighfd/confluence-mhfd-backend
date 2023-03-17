import sequelize from 'sequelize';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const NewNotes = db.newnotes;
const GroupNotes = db.groupnotes;
const ColorNotes = db.color;
const DEFAULT_COLOR = '#FFE121';
const Op = sequelize.Op;
const SIZE_OF_BUCKET = 15000;

const getAllNotes = async(userId) => {
  try {
    const notes = NewNotes.findAll({
      where: {
        user_id: +userId
      }, include: {
        model: ColorNotes,
        as: 'color'
      }
    });
    return notes;
  } catch (error) {
    console.log('the error GET ALL NOTES', error);
    throw error;
  }
}

const getNotesByColor = async (userId, colorIds, hasNull) => {
  try{
    let where = {
      user_id: +userId,
      color_id: colorIds
    };
    if (hasNull) {
      where = {
        user_id: +userId,
        [Op.or]: [
          {
            color_id: {
              [Op.is]: null
            }
          }, 
          {color_id: colorIds}
        ]
      };
    } 
    const notes = NewNotes.findAll({
      where: {...where },
      include: {
        model: ColorNotes,
        as: 'color'
      }
    });
    return notes;
  } catch(error) {
    console.log('the error  NOTES BY COLOR', error);
    throw error;
  }
}

const getColorsByNote = async (userId) => {
  try {
    const colors = await NewNotes.findAll({
      attributes: ['color_id'],
      where: {
        user_id: +userId
      }
    });
    return colors;
  } catch(error) {
    console.log(`the error GET COLORS BY NOTE ${error}`);
    throw error;
  }
}

const getGroups = async (id) => {
  console.log(id);
  const groups = await GroupNotes.findAll({ 
    where: {
      user_id: +id ,
      is_deleted: 0
    }
  });
  return groups;
}

const getColors = async (userId) => {
  const colors = await ColorNotes.findAll({
    where: {
      user_id: +userId,
      is_deleted: 0
    },
    order: [
      ['label', 'ASC']
    ]
  });
  colors.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
  return colors;
}


const deleteGroups = async (id) => {
  const group = await GroupNotes.findOne({
    where: {
      groupnotes_id: id 
    }});
  if (group) {
    NewNotes.destroy({ where: { groupnotes_id: id } });
    group.update({is_deleted: 1});
    return true;
  } else {
    logger.info('group not found');
    return false;
  }
}

const deleteColor = async (id) => {
  const color = await ColorNotes.findOne({
    where: {
      color_id: id 
    }});
  await NewNotes.update(
    {
      color_id: null,
      is_deleted: 1
    },
    {
    where: {
      color_id: id
    }
  });

  if (color) {
    logger.info('color destroyed ');
    color.update({is_deleted: 1});
    return true;
  } else {
    logger.info('color not found');
    return false;
  }
}

const updateGroup = async (id, group_notes_name, position) => {
  logger.info('update group ' + JSON.stringify(group_notes_name));
  try {
    let toUpdate = await GroupNotes.findOne({
      where: {
        groupnotes_id: id
      }
    });
    if (toUpdate) {
      console.log('update group ', toUpdate, group_notes_name);
      toUpdate = await toUpdate.update({group_notes_name: group_notes_name, position: position});
    } 
    return toUpdate;
  } catch(error) {
    console.log('the error UPDATE GROUP', error);
    throw error;
  }
}

const updateColor = async (id, label, color, opacity) => {
  logger.info('update color ', + color);
  try {
    let toUpdate = await ColorNotes.findOne({
      where: {
        color_id: id
      }
    });
    if (toUpdate) {
      toUpdate = await toUpdate.update({label: label, color: color, opacity: opacity});
    } 
    return toUpdate;
  } catch(error) {
    console.log('the error UPDATE COLOR', error);
    return {error};
  }
}

const getAllNotesByUser = async (userId) => {
  const notes = await NewNotes.findAll({
    where: {
      user_id: +userId
    }
  });
  return notes;
}

const deleteNote = async (id) => {
  const note = await NewNotes.findOne({
    where: {
      newnotes_id: id 
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

const getNextBucket = async (userId) => {
  const noteWithMaxPosition = await NewNotes.findAll({
    where: {
      user_id: +userId
    },
    order: [[
      'position', 'ASC'
    ]],
    limit: 1
  });
  const groupWithMaxPosition = await GroupNotes.findAll({
    where: {
      user_id: +userId,
      is_deleted: 0
    },
    order: [[
      'position', 'ASC'
    ]],
    limit: 1
  });
  if (!noteWithMaxPosition.length) {
    noteWithMaxPosition.push({position: SIZE_OF_BUCKET});
  }
  if (!groupWithMaxPosition.length) {
    groupWithMaxPosition.push({position: noteWithMaxPosition[0].position});
  }
  const newBucket = Math.min(noteWithMaxPosition[0].position, groupWithMaxPosition[0].position) - SIZE_OF_BUCKET;
  return newBucket;
}
const saveNote = async (note) => {
  logger.info('create note ' + JSON.stringify(note));
  try {
    note.position = await getNextBucket(note.user_id);
    const newNote = await NewNotes.create(note);
    return newNote;
  } catch(error) {
    console.log('the error SAVE NOTE', error);
    throw error;
  }
}
const saveGroup = async (name, user_id) => {
  console.log(name, user_id);
  const myGroup = {group_notes_name: name, user_id: user_id};
  myGroup.position = await getNextBucket(user_id);
  const group = await GroupNotes.create(myGroup);
  return group;
}

const saveColor = async (label, color, opacity, userId) => {
  try {
    const newColor = await ColorNotes.create({label: label, color: color, opacity: opacity, user_id: userId});
    return newColor;
  } catch(error) {
    console.log('the error SAVE COLOR', error);
    throw error;
  }
}

const updateNote = async (id, note) => {
  logger.info('update note ' + JSON.stringify(note));
  try {
    let toUpdate = await NewNotes.findOne({
      where: {
        newnotes_id: id
      }
    });
    if (toUpdate) {
      // console.log({...note});
      toUpdate = await toUpdate.update({...note});
      // console.log(toUpdate);
    } 
    return toUpdate;
  } catch(error) {
    console.log('the error for update ', error);
    return {object: 'Error at' + error};
  }
}

export default {
  getAllNotesByUser,
  getAllNotes,
  getGroups,
  getColors,
  getNotesByColor,
  getColorsByNote,
  saveNote,
  saveGroup,
  saveColor,
  updateNote,
  updateGroup,
  updateColor,
  deleteGroups,
  deleteNote,
  deleteColor
};
