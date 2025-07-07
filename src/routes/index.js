const express = require('express');
const router = express.Router();

// Importar controllers
const { searchVideos } = require('../controllers/searchController');
const { getComments } = require('../controllers/commentsController');
const { getLatestVideo, getVideoInfo } = require('../controllers/videoController');
const { getTranscription } = require('../controllers/transcriptionController');
const { healthCheck } = require('../controllers/healthController');
const { 
    uploadCookies, 
    getCookieInfo, 
    deleteCookies, 
    checkCookies,
    getDefaultCookiesInfo,
    restoreDefaultCookies,
    getCookieStatus,
    forceInitializeCookies
} = require('../controllers/cookieController');

// Rotas da API existentes
router.post('/api/yt_search', searchVideos);
router.post('/api/comments', getComments);
router.post('/api/yt_last_video', getLatestVideo);
router.post('/api/yt_video_info', getVideoInfo);
router.post('/api/transcription', getTranscription);
router.get('/health', healthCheck);

// Rotas para gerenciamento de cookies
router.post('/api/cookies/upload', uploadCookies);
router.get('/api/cookies/info', getCookieInfo);
router.delete('/api/cookies', deleteCookies);
router.get('/api/cookies/check', checkCookies);

// Novas rotas para cookies padrão
router.get('/api/cookies/defaults', getDefaultCookiesInfo);
router.post('/api/cookies/restore', restoreDefaultCookies);
router.get('/api/cookies/status', getCookieStatus);

// Rota de emergência para forçar inicialização
router.post('/api/cookies/force-init', forceInitializeCookies);

module.exports = router; 