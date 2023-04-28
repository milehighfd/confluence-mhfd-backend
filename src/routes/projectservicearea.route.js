import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const ServiceArea = db.projectServiceArea;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint projectservicearea.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function findAll for projectservicearea.route/`);
  const sa = await ServiceArea.findAll({
    include: { all: true, nested: true }
  });
  logger.info(`Finished function findAll for projectservicearea.route/`);
  // console.log(sa);
  res.send(sa);
});

// router.post('/', async (req, res) => {
  
// });

router.delete('/:id', async (req, res) => {
  logger.info(`Starting endpoint projectservicearea.route/:id with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function destroy for projectservicearea.route/:id`);
  const deleted = await ServiceArea.destroy({
    where: {
      project_service_area_id: req.params.id
    }
  });
  logger.info(`Finished function destroy for projectservicearea.route/:id`);
  
  res.send({
    project_service_area_id: req.params.id,
    deleted: deleted ? 'deleted': 'no deleted'
  });
})
export default router;
