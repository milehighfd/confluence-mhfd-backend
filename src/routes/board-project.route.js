import express from 'express';
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

router.put('/:board_project_id/cost', async (req, res) => {
  logger.info('get board project cost by id');
  const { board_project_id } = req.params;
  const { req1, req2, req3, req4, req5, year1, year2 } = req.body;
  try {
    let x = await BoardProject.update(
      { req1, req2, req3, req4, req5, year1, year2 },
      { where: { board_project_id } }
    );
    console.log(x);
    return res.status(200).send(x);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ error: error });
  }
});

export default router;
