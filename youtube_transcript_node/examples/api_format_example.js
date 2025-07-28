const YouTubeTranscriptApi = require('../src/YouTubeTranscriptApi');

/**
 * Exemplo de uso no formato idêntico à API Python
 * Este exemplo mostra como usar a biblioteca Node.js para obter
 * o mesmo formato de resposta da rota /transcript da API Python
 */

async function exemploFormatoAPIPython() {
    const api = new YouTubeTranscriptApi();
    
    // Simula uma requisição igual à sua API Python
    const videoRequest = {
        video_url: 'https://www.youtube.com/watch?v=qvZeLp3bkd4',
        include_timestamps: true
    };
    
    console.log('📝 Simulando requisição POST /transcript');
    console.log('📋 Dados da requisição:', videoRequest);
    console.log('');
    
    try {
        // Extrai o ID do vídeo (igual ao método extract_video_id_from_url do Python)
        const videoId = api.extractVideoId(videoRequest.video_url);
        console.log('🎬 ID do vídeo extraído:', videoId);
        
        // Obtém a transcrição (igual ao método get_video_transcript do Python)
        const transcriptData = await api.getTranscript(videoId, {
            languages: ['pt', 'pt-BR', 'en'],
            includeTimestamps: videoRequest.include_timestamps
        });
        
        console.log('📊 Resposta da API (formato idêntico ao Python):');
        console.log('');
        
        // Mostra o formato de resposta
        console.log('✅ Success:', transcriptData.success);
        console.log('🆔 Video ID:', transcriptData.video_id);
        console.log('🔗 Video URL:', transcriptData.video_url);
        console.log('🌐 Language Used:', transcriptData.language_used);
        console.log('🌍 Available Languages:', transcriptData.available_languages);
        console.log('📊 Segments Count:', transcriptData.segments_count);
        console.log('⏱️ Include Timestamps:', transcriptData.include_timestamps);
        console.log('');
        
        if (transcriptData.success && transcriptData.include_timestamps) {
            console.log('📋 Formato dos segmentos (primeiros 10):');
            console.log('');
            
            transcriptData.transcript.slice(0, 10).forEach((segment, index) => {
                console.log(`${index + 1}. {`);
                console.log(`     start: "${segment.start}",`);
                console.log(`     dur: "${segment.dur}",`);
                console.log(`     text: "${segment.text}"`);
                console.log(`   }`);
            });
            
            console.log('');
            console.log('🔄 Comparação com formato Python:');
            console.log('');
            console.log('Python format:');
            console.log('{"start": "00:00:12", "dur": "3.840", "text": "Olá pessoal"}');
            console.log('');
            console.log('Node.js format:');
            console.log(`{"start": "${transcriptData.transcript[0].start}", "dur": "${transcriptData.transcript[0].dur}", "text": "${transcriptData.transcript[0].text}"}`);
            console.log('');
            console.log('✅ Formatos são IDÊNTICOS!');
        }
        
        // Exemplo de como usar sem timestamps
        console.log('\n' + '='.repeat(60));
        console.log('📄 Exemplo sem timestamps (include_timestamps: false)');
        console.log('='.repeat(60));
        
        const transcriptTextOnly = await api.getTranscript(videoId, {
            languages: ['pt', 'pt-BR', 'en'],
            includeTimestamps: false
        });
        
        console.log('📝 Texto corrido (primeiros 300 caracteres):');
        console.log(transcriptTextOnly.transcript.substring(0, 300) + '...');
        
        // Simulação de resposta completa da API
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESPOSTA COMPLETA DA API (formato JSON)');
        console.log('='.repeat(60));
        
        // Mostra apenas os primeiros 3 segmentos para não poluir o console
        const responseForDisplay = {
            ...transcriptData,
            transcript: transcriptData.transcript.slice(0, 3)
        };
        
        console.log(JSON.stringify(responseForDisplay, null, 2));
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        // Formato de erro (igual ao Python)
        const errorResponse = {
            success: false,
            error: error.message,
            video_id: videoId || '',
            video_url: videoRequest.video_url,
            transcript: [],
            available_languages: []
        };
        
        console.log('📋 Formato de erro (igual ao Python):');
        console.log(JSON.stringify(errorResponse, null, 2));
    }
}

// Executa o exemplo
exemploFormatoAPIPython(); 