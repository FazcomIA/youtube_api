const axios = require('axios');
const cheerio = require('cheerio');
const { Innertube } = require('youtubei');

class ChannelService {
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
     * Extrai todos os vídeos de um canal usando o handle (@canal)
     * @param {string} channelHandle - Handle do canal (ex: @FazcomIA)
     * @param {number} maxVideos - Número máximo de vídeos a extrair (padrão: 100)
     * @returns {Promise<Array>} - Lista de vídeos com informações
     */
    async getChannelVideos(channelHandle, maxVideos = 100) {
        try {
            console.log(`🔍 Extraindo vídeos do canal: ${channelHandle} (máx: ${maxVideos})`);
            
            // Remove o @ se presente
            const cleanHandle = channelHandle.startsWith('@') ? channelHandle.substring(1) : channelHandle;
            
            // Constrói a URL do canal
            const channelUrl = `${this.baseURL}/@${cleanHandle}/videos`;
            
            console.log(`📡 Acessando: ${channelUrl}`);
            
            // Faz a requisição para a página do canal
            const response = await axios.get(channelUrl, { headers: this.headers });
            
            // Procura pelos dados dos vídeos no JavaScript da página
            const videoDataMatch = response.data.match(/var ytInitialData = ({.+?});/);
            if (!videoDataMatch) {
                throw new Error('Não foi possível encontrar dados dos vídeos na página');
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

            const videoItems = videosTab?.richGridRenderer?.contents || 
                             videosTab?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.gridRenderer?.items;
            
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
                            id: videoId,
                            title: title,
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                            thumbnail: thumbnail,
                            duration: duration,
                            viewCount: viewCount,
                            publishedTime: publishedTime,
                            channel: cleanHandle,
                            channelUrl: channelUrl
                        });
                    }
                }
            }
            
            console.log(`✅ Encontrados ${videos.length} vídeos no canal @${cleanHandle}`);
            console.log(`📝 Nota: O YouTube limita a exibição a ~30 vídeos por página. Para mais vídeos, use paginação ou acesse diretamente o canal.`);
            
            return {
                success: true,
                channelHandle: cleanHandle,
                totalVideos: videos.length,
                videos: videos.slice(0, maxVideos),
                note: "O YouTube limita a exibição a ~30 vídeos por página. Para mais vídeos, acesse diretamente o canal."
            };
            
        } catch (error) {
            console.error('❌ Erro ao extrair vídeos do canal:', error.message);
            throw new Error(`Erro ao extrair vídeos do canal: ${error.message}`);
        }
    }



    /**
     * Extrai apenas os links dos vídeos (similar ao Python)
     * @param {string} channelHandle - Handle do canal
     * @returns {Promise<Array>} - Lista de URLs dos vídeos
     */
    async getChannelVideoUrls(channelHandle) {
        try {
            const result = await this.getChannelVideos(channelHandle);
            return result.videos.map(video => video.url);
        } catch (error) {
            throw error;
        }
    }


}

module.exports = ChannelService; 