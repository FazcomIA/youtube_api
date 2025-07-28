const YouTubeTranscriptApi = require('../src/YouTubeTranscriptApi');

async function exemploUso() {
    const api = new YouTubeTranscriptApi();
    
    // URL do vídeo de exemplo
    const videoUrl = 'https://www.youtube.com/watch?v=qvZeLp3bkd4';
    
    try {
        // Extrai o ID do vídeo
        const videoId = api.extractVideoId(videoUrl);
        console.log('🎬 ID do vídeo:', videoId);
        
        // Exemplo 1: Transcrição com timestamps (formato igual à API Python)
        console.log('\n📝 Obtendo transcrição com timestamps...\n');
        const transcriptWithTimestamps = await api.getTranscript(videoId, {
            languages: ['pt', 'pt-BR', 'en'],
            includeTimestamps: true
        });
        
        if (transcriptWithTimestamps.success) {
            console.log('✅ Transcrição obtida com sucesso!');
            console.log('🌐 Idioma usado:', transcriptWithTimestamps.language_used);
            console.log('📊 Total de segmentos:', transcriptWithTimestamps.segments_count);
            console.log('🔗 URL do vídeo:', transcriptWithTimestamps.video_url);
            console.log('🌍 Idiomas disponíveis:', transcriptWithTimestamps.available_languages);
            
            // Mostra os primeiros 5 segmentos
            console.log('\n📋 Primeiros 5 segmentos:');
            transcriptWithTimestamps.transcript.slice(0, 5).forEach((segment, index) => {
                console.log(`${index + 1}. [${segment.start}] (${segment.dur}s) ${segment.text}`);
            });
            
            // Estatísticas
            const totalSegments = transcriptWithTimestamps.transcript.length;
            const totalWords = transcriptWithTimestamps.transcript.reduce((count, segment) => {
                return count + segment.text.split(' ').length;
            }, 0);
            
            console.log('\n📈 Estatísticas:');
            console.log(`📊 Total de segmentos: ${totalSegments}`);
            console.log(`📝 Total de palavras: ${totalWords}`);
            console.log(`⏱️ Duração aproximada: ${transcriptWithTimestamps.transcript[totalSegments - 1]?.start || 'N/A'}`);
        } else {
            console.error('❌ Erro:', transcriptWithTimestamps.error);
        }
        
        // Exemplo 2: Apenas texto corrido (sem timestamps)
        console.log('\n\n📄 Obtendo apenas texto corrido...\n');
        const transcriptTextOnly = await api.getTranscript(videoId, {
            languages: ['pt', 'pt-BR', 'en'],
            includeTimestamps: false
        });
        
        if (transcriptTextOnly.success) {
            console.log('✅ Texto corrido obtido com sucesso!');
            console.log('📝 Primeiros 200 caracteres:');
            console.log(transcriptTextOnly.transcript.substring(0, 200) + '...');
        } else {
            console.error('❌ Erro:', transcriptTextOnly.error);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executa o exemplo
exemploUso(); 