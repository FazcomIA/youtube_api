const express = require('express');
const router = express.Router();

// Importar controllers
const { searchVideos } = require('../controllers/searchController');
const { getComments } = require('../controllers/commentsController');
const { getLatestVideo, getVideoInfo } = require('../controllers/videoController');
const { getTranscript } = require('../controllers/transcriptController');
const { healthCheck } = require('../controllers/healthController');

// Rotas da API principais
router.post('/api/yt_search', searchVideos);
router.post('/api/comments', getComments);
router.post('/api/yt_last_video', getLatestVideo);
router.post('/api/yt_video_info', getVideoInfo);
router.post('/api/transcript', getTranscript);
router.get('/health', healthCheck);

module.exports = router; 