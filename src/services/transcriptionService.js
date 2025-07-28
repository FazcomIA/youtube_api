const fs = require('fs').promises;
const path = require('path');
const YouTubeTranscriptApi = require('../../youtube_transcript_node/src/YouTubeTranscriptApi');

class TranscriptionService {
    constructor() {
        this.transcriptApi = new YouTubeTranscriptApi();
        this.srtDirectory = path.join(process.cwd(), 'data', 'transcripts');
        this.ensureDirectoryExists();
    }

    /**
     * Garante que o diretório de transcrições existe
     */
    async ensureDirectoryExists() {
        try {
            await fs.mkdir(this.srtDirectory, { recursive: true });
        } catch (error) {
            console.error('Erro ao criar diretório de transcrições:', error);
        }
    }

    /**
     * Gera nome único para arquivo SRT
     * @param {string} videoId - ID do vídeo
     * @returns {string} Nome do arquivo
     */
    generateSrtFileName(videoId) {
        const timestamp = Date.now();
        return `${videoId}_${timestamp}.srt`;
    }

    /**
     * Salva transcrição em arquivo SRT
     * @param {string} videoId - ID do vídeo
     * @param {Array} transcript - Array de segmentos da transcrição
     * @returns {Promise<string>} Caminho do arquivo SRT
     */
    async saveSrtFile(videoId, transcript) {
        const fileName = this.generateSrtFileName(videoId);
        const filePath = path.join(this.srtDirectory, fileName);
        
        let srtContent = '';
        transcript.forEach((segment, index) => {
            const startTime = this.formatSrtTime(segment.start);
            const endTime = this.formatSrtTime(this.addTime(segment.start, segment.dur));
            
            srtContent += `${index + 1}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${segment.text}\n\n`;
        });

        await fs.writeFile(filePath, srtContent, 'utf8');
        console.log(`📁 Arquivo SRT salvo: ${filePath}`);
        
        return filePath;
    }

    /**
     * Formata tempo para formato SRT (HH:MM:SS,mmm)
     * @param {string} time - Tempo no formato HH:MM:SS
     * @returns {string} Tempo formatado para SRT
     */
    formatSrtTime(time) {
        // Converte HH:MM:SS para HH:MM:SS,000
        return time.replace(/(\d{2}:\d{2}:\d{2})$/, '$1,000');
    }

    /**
     * Adiciona duração ao tempo
     * @param {string} time - Tempo inicial (HH:MM:SS)
     * @param {string} duration - Duração em segundos
     * @returns {string} Tempo final
     */
    addTime(time, duration) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds + parseFloat(duration);
        
        const newHours = Math.floor(totalSeconds / 3600);
        const newMinutes = Math.floor((totalSeconds % 3600) / 60);
        const newSeconds = Math.floor(totalSeconds % 60);
        
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Agenda exclusão do arquivo SRT após 30 segundos
     * @param {string} filePath - Caminho do arquivo
     */
    scheduleFileDeletion(filePath) {
        setTimeout(async () => {
            try {
                await fs.unlink(filePath);
                console.log(`🗑️ Arquivo SRT deletado: ${filePath}`);
            } catch (error) {
                console.error('Erro ao deletar arquivo SRT:', error);
            }
        }, 30000); // 30 segundos
    }

    /**
     * Obtém transcrição completa em texto
     * @param {string} videoUrl - URL do vídeo
     * @param {Object} options - Opções de configuração
     * @returns {Promise<Object>} Resultado da transcrição
     */
    async getTranscriptionText(videoUrl, options = {}) {
        try {
            const { languages = ['pt', 'pt-BR', 'en'] } = options;
            
            console.log(`🔍 Obtendo transcrição em texto para: ${videoUrl}`);
            
            // Extrai ID do vídeo
            const videoId = this.transcriptApi.extractVideoId(videoUrl);
            
            // Obtém transcrição com timestamps
            const result = await this.transcriptApi.getTranscript(videoId, {
                languages,
                includeTimestamps: true
            });

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    videoId,
                    videoUrl
                };
            }

            // Salva arquivo SRT
            const srtFilePath = await this.saveSrtFile(videoId, result.transcript);
            
            // Agenda exclusão do arquivo
            this.scheduleFileDeletion(srtFilePath);

            // Concatena todo o texto
            const fullText = result.transcript.map(segment => segment.text).join(' ');

            return {
                success: true,
                videoId,
                videoUrl,
                language_used: result.language_used,
                available_languages: result.available_languages,
                segments_count: result.segments_count,
                srt_file: path.basename(srtFilePath),
                transcription: fullText,
                total_words: fullText.split(' ').length,
                total_characters: fullText.length
            };

        } catch (error) {
            console.error('Erro ao obter transcrição em texto:', error);
            return {
                success: false,
                error: error.message,
                videoUrl
            };
        }
    }

    /**
     * Obtém transcrição em formato JSON (SRT)
     * @param {string} videoUrl - URL do vídeo
     * @param {Object} options - Opções de configuração
     * @returns {Promise<Object>} Resultado da transcrição
     */
    async getTranscriptionJson(videoUrl, options = {}) {
        try {
            const { languages = ['pt', 'pt-BR', 'en'] } = options;
            
            console.log(`🔍 Obtendo transcrição em JSON para: ${videoUrl}`);
            
            // Extrai ID do vídeo
            const videoId = this.transcriptApi.extractVideoId(videoUrl);
            
            // Obtém transcrição com timestamps
            const result = await this.transcriptApi.getTranscript(videoId, {
                languages,
                includeTimestamps: true
            });

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    videoId,
                    videoUrl
                };
            }

            // Salva arquivo SRT
            const srtFilePath = await this.saveSrtFile(videoId, result.transcript);
            
            // Agenda exclusão do arquivo
            this.scheduleFileDeletion(srtFilePath);

            return {
                success: true,
                videoId,
                videoUrl,
                language_used: result.language_used,
                available_languages: result.available_languages,
                segments_count: result.segments_count,
                srt_file: path.basename(srtFilePath),
                transcript: result.transcript,
                total_words: result.transcript.reduce((count, segment) => {
                    return count + segment.text.split(' ').length;
                }, 0),
                total_characters: result.transcript.reduce((count, segment) => {
                    return count + segment.text.length;
                }, 0)
            };

        } catch (error) {
            console.error('Erro ao obter transcrição em JSON:', error);
            return {
                success: false,
                error: error.message,
                videoUrl
            };
        }
    }
}

module.exports = TranscriptionService; 