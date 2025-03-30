const express = require('express');
const {initiatePayment, confirmPayment, getPayment} = require('../controllers/paymentController');
const { verifyHMACSignature, verifyMerchant } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/initiate', verifyMerchant, verifyHMACSignature, initiatePayment);
router.post('/confirm', verifyMerchant, verifyHMACSignature, confirmPayment);
router.get('/:id', verifyMerchant, getPayment);

module.exports = router;