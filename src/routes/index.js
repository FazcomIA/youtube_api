const express = require('express');
const router = express.Router();

// Importar controllers
const { searchVideos } = require('../controllers/searchController');
const { getComments } = require('../controllers/commentsController');
const { getLatestVideo, getVideoInfo } = require('../controllers/videoController');
const { getTranscription } = require('../controllers/transcriptionController');
const { healthCheck } = require('../controllers/healthController');

// Rotas da API
router.post('/api/yt_search', searchVideos);
router.post('/api/comments', getComments);
router.post('/api/yt_last_video', getLatestVideo);
router.post('/api/yt_video_info', getVideoInfo);
router.post('/api/transcription', getTranscription);
router.get('/health', healthCheck);

module.exports = router; 