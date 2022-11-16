import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const ServiceArea = db.projectServiceArea;

router.get('/', async (req, res) => {
  const sa = await ServiceArea.findAll({
    include: { all: true, nested: true }
  }).map(result => result.dataValues);
  // console.log(sa);
  res.send(sa);
});

// router.post('/', async (req, res) => {
  
// });

router.delete('/:id', async (req, res) => {
  const deleted = await ServiceArea.destroy({
    where: {
      project_service_area_id: req.params.id
    }
  });
  
  res.send({
    project_service_area_id: req.params.id,
    deleted: deleted ? 'deleted': 'no deleted'
  });
})
export default router;
