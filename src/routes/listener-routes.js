const router = require('express').Router();
const listenerController = require('../controllers/listener-controller');

router.post('/on-column-value-change', listenerController.columnValueChangeListener);
router.post('/on-new-item-create', listenerController.newItemCreateListener);

module.exports = router;