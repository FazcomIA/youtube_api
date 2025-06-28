const axios = require('axios');
const cheerio = require('cheerio');

class YouTubeExtractor {
    constructor() {
        this.baseURL = 'https://www.youtube.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    /**
     * Extrai o ID do canal a partir da URL ou handle
     * @param {string} channelHandle - Handle do canal (ex: @gabrielcmadureira)
     * @returns {Promise<string>} - Channel ID
     */
    async getChannelId(channelHandle) {
        try {
            const channelURL = `${this.baseURL}/${channelHandle}`;
            const response = await axios.get(channelURL, { headers: this.headers });

            // Procura pelo channel ID nos metadados
            const channelIdMatch = response.data.match(/"channelId":"([^"]+)"/);
            if (channelIdMatch) {
                return channelIdMatch[1];
            }

            // Método alternativo através dos links
            const $ = cheerio.load(response.data);
            const canonicalLink = $('link[rel="canonical"]').attr('href');
            if (canonicalLink && canonicalLink.includes('/channel/')) {
                return canonicalLink.split('/channel/')[1];
            }

            throw new Error('Não foi possível extrair o Channel ID');
        } catch (error) {
            console.error('Erro ao obter Channel ID:', error.message);
            throw error;
        }
    }

    /**
     * Obtém informações dos vídeos de um canal
     * @param {string} channelHandle - Handle do canal
     * @returns {Promise<Array>} - Lista de vídeos
     */
    async getChannelVideos(channelHandle) {
        try {
            const channelURL = `${this.baseURL}/${channelHandle}/videos`;
            const response = await axios.get(channelURL, { headers: this.headers });

            // Procura pelos dados dos vídeos no JavaScript da página
            const videoDataMatch = response.data.match(/var ytInitialData = ({.+?});/);
            if (!videoDataMatch) {
                throw new Error('Não foi possível encontrar dados dos vídeos');
            }

            const ytInitialData = JSON.parse(videoDataMatch[1]);
            
            // Navega pela estrutura complexa do JSON do YouTube
            const tabs = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
            if (!tabs) {
                throw new Error('Estrutura de dados não encontrada');
            }

            let videosTab = null;
            for (let tab of tabs) {
                if (tab.tabRenderer?.title === 'Videos' || tab.tabRenderer?.title === 'Vídeos') {
                    videosTab = tab.tabRenderer.content;
                    break;
                }
            }

            if (!videosTab) {
                throw new Error('Aba de vídeos não encontrada');
            }

            const videoItems = videosTab?.richGridRenderer?.contents || videosTab?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.gridRenderer?.items;
            
            if (!videoItems) {
                throw new Error('Lista de vídeos não encontrada');
            }

            const videos = [];
            for (let item of videoItems) {
                const videoRenderer = item.richItemRenderer?.content?.videoRenderer || item.gridVideoRenderer;
                if (videoRenderer) {
                    const videoId = videoRenderer.videoId;
                    const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText;
                    const thumbnail = videoRenderer.thumbnail?.thumbnails?.[0]?.url;
                    const publishedTime = videoRenderer.publishedTimeText?.simpleText;
                    const viewCount = videoRenderer.viewCountText?.simpleText;
                    const duration = videoRenderer.lengthText?.simpleText;

                    if (videoId && title) {
                        videos.push({
                            videoId,
                            title,
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                            thumbnail,
                            publishedTime,
                            viewCount,
                            duration
                        });
                    }
                }
            }

            return videos;
        } catch (error) {
            console.error('Erro ao obter vídeos do canal:', error.message);
            throw error;
        }
    }

    /**
     * Extrai informações detalhadas de um vídeo
     * @param {string} videoUrl - URL do vídeo
     * @returns {Promise<Object>} - Informações do vídeo
     */
    async getVideoDetails(videoUrl) {
        try {
            const response = await axios.get(videoUrl, { headers: this.headers });
            
            // Extrai dados do ytInitialPlayerResponse
            let videoData = {};
            
            const playerResponseMatch = response.data.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
            if (playerResponseMatch) {
                try {
                    const playerData = JSON.parse(playerResponseMatch[1]);
                    const videoDetails = playerData.videoDetails;
                    
                    if (videoDetails) {
                        videoData = {
                            videoId: videoDetails.videoId,
                            titulo: videoDetails.title,
                            descricao: videoDetails.shortDescription,
                            autor: videoDetails.author,
                            channelId: videoDetails.channelId,
                            duracao: parseInt(videoDetails.lengthSeconds),
                            visualizacoes: parseInt(videoDetails.viewCount),
                            tags: videoDetails.keywords || []
                        };
                    }
                } catch (e) {
                    console.log('Erro ao parsear ytInitialPlayerResponse:', e.message);
                }
            }

            // Extrai dados adicionais do ytInitialData
            const initialDataMatch = response.data.match(/ytInitialData\s*=\s*({.+?});/);
            if (initialDataMatch) {
                try {
                    const initialData = JSON.parse(initialDataMatch[1]);
                    const contents = initialData?.contents?.twoColumnWatchNextResultsRenderer?.results?.results?.contents;
                    
                    if (contents) {
                        for (let content of contents) {
                            if (content.videoPrimaryInfoRenderer) {
                                const primaryInfo = content.videoPrimaryInfoRenderer;
                                
                                // Data de publicação
                                const dateText = primaryInfo.dateText?.simpleText;
                                if (dateText) {
                                    videoData.dataPublicacao = dateText;
                                }

                                // Likes (pode estar em diferentes formatos)
                                const videoActions = primaryInfo.videoActions?.menuRenderer?.topLevelButtons;
                                if (videoActions) {
                                    for (let action of videoActions) {
                                        if (action.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label) {
                                            const label = action.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label;
                                            if (label.toLowerCase().includes('like')) {
                                                videoData.likes = this.parseNumber(label);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log('Erro ao parsear ytInitialData:', e.message);
                }
            }

            return videoData;
        } catch (error) {
            console.error('Erro ao extrair detalhes do vídeo:', error.message);
            throw error;
        }
    }

    /**
     * Obtém o vídeo mais recente de um canal
     * @param {string} channelHandle - Handle do canal (ex: @gabrielcmadureira)
     * @returns {Promise<Object>} - Informações do vídeo mais recente
     */
    async getLatestVideo(channelHandle) {
        try {
            console.log(`🔍 Buscando vídeo mais recente do canal: ${channelHandle}`);
            
            // Obtém lista de vídeos do canal
            const videos = await this.getChannelVideos(channelHandle);
            
            if (!videos || videos.length === 0) {
                throw new Error('Nenhum vídeo encontrado no canal');
            }

            const latestVideo = videos[0];
            
            console.log(`📹 Vídeo encontrado: ${latestVideo.title}`);
            console.log(`🔗 Extraindo informações detalhadas...`);

            // Extrai informações detalhadas do vídeo
            const videoDetails = await this.getVideoDetails(latestVideo.url);

            return {
                ...videoDetails,
                url: latestVideo.url,
                thumbnail: latestVideo.thumbnail,
                visualizacoes: videoDetails.visualizacoes || this.parseNumber(latestVideo.viewCount),
                dataPublicacao: videoDetails.dataPublicacao || latestVideo.publishedTime,
                duracao: videoDetails.duracao || this.parseDuration(latestVideo.duration)
            };

        } catch (error) {
            console.error('Erro ao obter vídeo mais recente:', error.message);
            throw error;
        }
    }

    /**
     * Converte string de duração para segundos
     * @param {string} duration - Duração no formato "3:45" ou "1:23:45"
     * @returns {number} - Duração em segundos
     */
    parseDuration(duration) {
        if (!duration) return 0;
        
        const parts = duration.split(':').reverse();
        let seconds = 0;
        
        for (let i = 0; i < parts.length; i++) {
            seconds += parseInt(parts[i]) * Math.pow(60, i);
        }
        
        return seconds;
    }

    /**
     * Converte string de número com formatação para número
     * @param {string} str - String com número (ex: "1,234", "1.2K")
     * @returns {number} - Número convertido
     */
    parseNumber(str) {
        if (!str) return 0;
        
        str = str.toString().toLowerCase().replace(/[,\s]/g, '');
        
        if (str.includes('k')) {
            return Math.round(parseFloat(str.replace('k', '')) * 1000);
        } else if (str.includes('m')) {
            return Math.round(parseFloat(str.replace('m', '')) * 1000000);
        } else if (str.includes('b')) {
            return Math.round(parseFloat(str.replace('b', '')) * 1000000000);
        }
        
        return parseInt(str.replace(/\D/g, '')) || 0;
    }

    /**
     * Formata a saída das informações do vídeo
     * @param {Object} videoInfo - Informações do vídeo
     */
    displayVideoInfo(videoInfo) {
        console.log('\n' + '='.repeat(60));
        console.log('📺 INFORMAÇÕES DO VÍDEO MAIS RECENTE');
        console.log('='.repeat(60));
        console.log(`🎬 Título: ${videoInfo.titulo || 'N/A'}`);
        console.log(`👤 Autor: ${videoInfo.autor || 'N/A'}`);
        console.log(`🆔 Video ID: ${videoInfo.videoId || 'N/A'}`);
        console.log(`🆔 Channel ID: ${videoInfo.channelId || 'N/A'}`);
        console.log(`🔗 URL: ${videoInfo.url || 'N/A'}`);
        console.log(`📅 Data de Publicação: ${videoInfo.dataPublicacao || 'N/A'}`);
        console.log(`👀 Visualizações: ${videoInfo.visualizacoes?.toLocaleString() || 'N/A'}`);
        console.log(`👍 Likes: ${videoInfo.likes?.toLocaleString() || 'N/A'}`);
        console.log(`⏱️ Duração: ${this.formatDuration(videoInfo.duracao)}`);
        console.log(`🏷️ Tags: ${videoInfo.tags?.slice(0, 5).join(', ') || 'N/A'}`);
        console.log(`📝 Descrição: ${videoInfo.descricao?.substring(0, 200)}${videoInfo.descricao?.length > 200 ? '...' : ''}`);
        console.log('='.repeat(60));
    }

    /**
     * Formata duração em segundos para formato legível
     * @param {number} seconds - Duração em segundos
     * @returns {string} - Duração formatada
     */
    formatDuration(seconds) {
        if (!seconds) return 'N/A';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else {
            return `${minutes}m ${secs}s`;
        }
    }
}

// Função principal
async function main() {
    const extractor = new YouTubeExtractor();
    
    // Canal de exemplo (mesmo do seu código Python)
    const channelHandle = '@RedCastOficial';
    
    try {
        console.log('🚀 Iniciando YouTube Extractor JS...\n');
        
        const videoInfo = await extractor.getLatestVideo(channelHandle);
        extractor.displayVideoInfo(videoInfo);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

// Executa apenas se for o arquivo principal
if (require.main === module) {
    main();
}

module.exports = YouTubeExtractor; 