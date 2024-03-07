const router = require('express').Router();
const mondayRoutes = require('./monday');
const listenerRoutes = require('./listener-routes');

router.use(mondayRoutes);
router.use(listenerRoutes);

router.get('/', function (req, res) {
  res.json(getHealth());
});

router.get('/health', function (req, res) {
  res.json(getHealth());
  res.end();
});

function getHealth() {
  return {
    ok: true,
    message: 'Healthy',
  };
}

module.exports = router;
