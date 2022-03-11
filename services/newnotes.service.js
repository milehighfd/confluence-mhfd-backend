const db = require('../config/db');
const logger = require('../config/logger');
const NewNotes = db.newnotes;
const GroupNotes = db.groupnotes;
const ColorNotes = db.color;


const SIZE_OF_BUCKET = 15000;

const getAllNotes = async(userId) => {
  try {
    const notes = NewNotes.findAll({
      where: {
        user_id: userId
      }, include: {
        model: ColorNotes,
        as: 'color'
      }
    });
    return notes;
  } catch (error) {
    console.log('the error ', error);
    throw error;
  }
}

const getNotesByColor = async (userId, colorIds) => {
  try{
    console.log(colorIds);  
    const notes = NewNotes.findAll({
      where: {
        user_id: userId,
        color_id: colorIds
      },
      include: {
        model: ColorNotes,
        as: 'color'
      }
    });
    return notes;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
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
    },
    order: [
      ['createdAt', 'DESC']
    ]
  });
  colors.sort((a, b) => {
    if (a.label === 'Map Note' && a.label === b.label) {
      return a.createdAt - b.createdAt;
    }
    if (a.label === 'Map Note') {
      return -1;
    }
    if (b.label === 'Map Note') {
      return 1;
    }
    return a.label.localeCompare(b.label);
  });
  return colors;
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
  await NewNotes.update(
    {
      color_id: null
    },
    {
    where: {
      color_id: id
    }
  });

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

const getNextBucket = async (userId) => {
  const noteWithMaxPosition = await NewNotes.findAll({
    where: {
      user_id: userId
    },
    order: [[
      'position', 'DESC'
    ]],
    limit: 1
  });
  const groupWithMaxPosition = await GroupNotes.findAll({
    where: {
      user_id: userId
    },
    order: [[
      'position', 'DESC'
    ]],
    limit: 1
  });
  if (!noteWithMaxPosition.length) {
    noteWithMaxPosition.push({position: SIZE_OF_BUCKET});
  }
  if (!groupWithMaxPosition.length) {
    groupWithMaxPosition.push({position: noteWithMaxPosition[0].position});
  }
  const newBucket = Math.max(noteWithMaxPosition[0].position, groupWithMaxPosition[0].position) + SIZE_OF_BUCKET;
  return newBucket;
}
const saveNote = async (note) => {
  logger.info('create note ' + JSON.stringify(note));
  try {
    note.position = await getNextBucket(note.user_id);
    const newNote = await NewNotes.create(note);
    return newNote;
  } catch(error) {
    console.log('the error ', error);
    throw error;
  }
}
const saveGroup = async (name, user_id) => {
  console.log(name, user_id);
  const myGroup = {name: name, user_id: user_id};
  myGroup.position = await getNextBucket(user_id);
  const group = await GroupNotes.create(myGroup);
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
  getNotesByColor,
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
