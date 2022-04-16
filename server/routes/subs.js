const express = require('express');
const passport = require('passport');
const { auth } = require('../middlewares/auth');

const router = express.Router();
const {
  prices,
  createSubscription,
  subscriptionStatus,
  subscriptions,
  customerPortal,
  getSubscriptions,
  getActiveUsers,
} = require('../controllers/subs');


router.get('/api/prices', prices);
router.post('/api/create-subscription', auth(), createSubscription);
router.get('/api/subscription-status', auth(), subscriptionStatus);
router.get('/api/subscriptions', auth(), subscriptions);
router.get('/api/customer-portal', auth(), customerPortal);
router.post('/api/getsubscriptions', auth(), getSubscriptions);
router.get('/api/active-users', getActiveUsers);
module.exports = router;
