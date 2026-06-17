const { Router } = require('express');
const upload = require('../middleware/upload');
const { handleBuild } = require('../controllers/buildController');

const router = Router();

router.post('/build', upload.single('icon'), handleBuild);

module.exports = router;
