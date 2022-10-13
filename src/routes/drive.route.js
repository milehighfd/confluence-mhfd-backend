import express from 'express';

const router = express.Router();

router.get('/get-images-drive', async (req, res) => {
  res
    .status(200)
    .send([
      'Confluence Park25.jpg',
      'Drainageway A25.jpg',
      'Eco Park25.jpg',
      'Low drop25.jpg',
      'Westminster Station25.jpg'
    ]);
});

export default router;
