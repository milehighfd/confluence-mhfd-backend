import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const BusinessContact = db.businessAssociateContact;
const BusinessAdress = db.businessAdress;
const BusinessAssociates = db.businessAssociates;
const router = express.Router();

router.get('/business-contact/:id', async (req, res) => {
  const id = req.params['id'];
  try {
    const contact = await BusinessContact.findByPk(id, { raw: true });
    if (!contact) {
      res.status(404).send({ error: 'Not Found' });
    }
    res.send(contact);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get('/business-adress', async (req, res) => {
  const id = req.params['id'];
  try {
    const contact = await BusinessAdress.findAll();
    if (!contact) {
      res.status(404).send({ error: 'Not Found' });
    }
    res.send(contact);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

router.get('/business-associates', async (_, res) => {
  try {
    const associates = await BusinessAssociates.findAll({
      include: [
        {
          model: BusinessAdress,
          require: false,
          include: {
            model: BusinessContact,
            require: false
          }
        }

      ]
    });
    res.send(associates);
  } catch(error) {
    res.status(500).send(error);
  }
});


router.get('/', async (req, res) => {
  /*const sa = await ServiceArea.findAll({
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => {
    return {
      ...res,
      Shape:  res.Shape.toString()
    }
  });*/ 
  const [sa] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText()   as bbox FROM CODE_SERVICE_AREA`);
  console.log(sa);
  res.send(sa);
});

export default router;
