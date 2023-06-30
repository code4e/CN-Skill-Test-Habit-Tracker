const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controller');

router.get('/', homeController.home);

router.post('/add', homeController.add);

router.delete('/delete/:id', homeController.delete);

router.patch('/update', homeController.update);

router.get('/show-daily', homeController.homeDaily);

router.patch('/edit-habit/:id', homeController.editHabit);

router.get('/get-best-streak/:id', homeController.getBestStreak);

module.exports = router;