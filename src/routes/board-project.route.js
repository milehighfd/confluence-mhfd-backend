import express from 'express';
import { LexoRank } from 'lexorank';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
const BoardProject = db.boardProject;

const router = express.Router();

router.get('/:board_project_id/cost', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  try {
    const boardProject = await BoardProject.findOne({
      attributes: [
        'req1',
        'req2',
        'req3',
        'req4',
        'req5',
        'year1',
        'year2'
      ],
      where: {
        board_project_id
      }
    });
    console.log(boardProject);
    return res.status(200).send(boardProject);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/:board_project_id/update-rank', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  const {
    before,
    after,
    columnNumber,
    beforeIndex,
    afterIndex,
    targetPosition,
    otherFields
  } = req.body;
  if (before === undefined) before = null;
  if (after === undefined) after = null;
  const rankColumnName = `rank${columnNumber}`;
  if (before === null && after === null) {
    const boardProject = await BoardProject.findOne({
      attributes: [
        'board_id',
      ],
      where: {
        board_project_id
      }
    });
    const board_id = boardProject.board_id;

    const where = { board_id };
    if (`${columnNumber}` !== '0') {
      where[`req${columnNumber}`] = { [Op.ne]: null };
    } else {
      where[`rank${columnNumber}`] = { [Op.ne]: null }
    }
    /* This should fix all the projects in the column to have a rank */
    const projects = await BoardProject.findAll({
      where,
      order: [[`rank${position}`, 'ASC']],
    });
    let lastLexo = null;
    const proms = projects.map(async (project, index) => {
      if (lastLexo === null) {
        lastLexo = LexoRank.middle().toString();
      } else {
        lastLexo = LexoRank.parse(lastLexo).genNext().toString();
      }
      if (index === targetPosition) {
        lastLexo = LexoRank.parse(lastLexo).genNext().toString();
        await BoardProject.update(
          { ...otherFields, [rankColumnName]: lastLexo },
          { where: { board_project_id: board_project_id } }
        );
      }
      return await BoardProject.update(
        { [rankColumnName]: lastLexo },
        { where: { board_project_id: project.board_project_id } }
      );
    });
    const results = await Promise.all(proms);
    return res.status(200).send(results);
  }
  if (before === null && beforeIndex !== -1) {
    logger.error('before is null but beforeIndex is not -1');
  } else if (after === null && afterIndex !== -1) {
    logger.error('after is null but afterIndex is not -1');
  }
  let lexo;
  if (before === null) {
    lexo = LexoRank.parse(after).genPrev().toString();
  } else if (after === null) {
    lexo = LexoRank.parse(before).genNext().toString();
  } else {
    if (before === after) {
      lexo = before; //TODO: change as this should not happen
    } else {
      lexo = LexoRank.parse(before).between(LexoRank.parse(after)).toString();
    }
  }
  try {
    const x = await BoardProject.update(
      { [rankColumnName]: lexo, ...otherFields },
      { where: { board_project_id } }
    );
    return res.status(200).send(x);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

router.put('/:board_project_id/cost', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;

  const { req1, req2, req3, req4, req5, year1, year2 } = req.body;
  let updateFields = {};
  const beforeUpdate = await BoardProject.findOne({
    where: { board_project_id }
  });
  for (let pos = 1; pos <= 5; pos++) {
    const reqColumnName = `req${pos}`;
    const rankColumnName = `rank${pos}`;
    if (beforeUpdate[reqColumnName] === null && req.body[reqColumnName] !== null) {
      updateFields[rankColumnName] = LexoRank.middle().toString();
      /* TODO: improve this based on the columns
      // rank: LexoRank.middle() cuando esta vacio
      // sacar el primero de esa columna LexoRank.parse(firstProject.rank0)
      //.genPrev()
      //.toString();
      */
    } else if (beforeUpdate[reqColumnName] !== null && req.body[reqColumnName] === null) {
      updateFields[rankColumnName] = null;
    }
  }

  try {
    let x = await BoardProject.update(
      {
        req1, req2, req3, req4, req5, year1, year2, ...updateFields
      },
      { where: { board_project_id } }
    );
    return res.status(200).send(x);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

export default router;
