const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-mail => GET
router.get('/send', adminController.getAddMail);

// /admin/mails => GET
router.get('/mails', adminController.getMails);

// /admin/add-mail => POST
router.post('/send', adminController.postAddMail);

router.get('/edit-mail/:mailId', adminController.getEditMail);

router.get('/executePriority/:priority', adminController.getExecutePriority);

router.get('/execute/', adminController.getExecute);

router.get('/retry/:mailId', adminController.getRetry);

router.get('/retryAll/', adminController.getRetryAll);

router.post('/edit-mail', adminController.postEditMail);

router.post('/delete-mail', adminController.postDeleteMail);

router.post('/uploadAttachments', adminController.postUploadAttacments);

module.exports = router;
