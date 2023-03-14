import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';

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

router.post('/business-address-and-contact/:id', [auth], async (req, res) => {
  const id = req.params['id'];
  const user = req.user;
  const { body } = req;
  try {
    const businessAdress = {
      business_associate_id: id,
      business_address_line_1: body.business_address_line_1,
      business_address_line_2: body.business_address_line_2,
      full_address: body.business_address_line_1,
      state: body.state,
      city: body.city,
      zip: body.zip
    };
    const newBusinessAddress = await BusinessAdress.create(businessAdress);
    const businessContact = {
      business_address_id: newBusinessAddress.business_address_id,
      contact_name: user.name,
      contact_email: user.email,
      contact_phone_number: user.phone || 'No number provided'
    };
    const newBusinessContact = await BusinessContact.create(businessContact);
    res.status(201).send({
      businessAdress: newBusinessAddress,
      businessContact: newBusinessContact
    })
  } catch (error) {
    logger.error(error);
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
