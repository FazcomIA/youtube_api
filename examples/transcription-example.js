/**
 * Exemplo de uso das funcionalidades de transcrição
 * FCI - API Youtube v1
 */

const fetch = require('node-fetch');

async function exemploTranscricao() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🎬 Exemplo de uso das funcionalidades de transcrição\n');
    
    // URL de exemplo (vídeo público do YouTube)
    const videoUrl = 'https://www.youtube.com/watch?v=qvZeLp3bkd4';
    
    try {
        // 1. Transcrição em texto completo
        console.log('📝 1. Obtendo transcrição em texto completo...');
        const textResponse = await fetch(`${baseUrl}/api/transcription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoUrl: videoUrl,
                languages: ['pt', 'pt-BR', 'en']
            })
        });
        
        const textResult = await textResponse.json();
        
        if (textResult.success) {
            console.log('✅ Transcrição em texto obtida com sucesso!');
            console.log(`📊 Estatísticas: ${textResult.total_words} palavras, ${textResult.total_characters} caracteres`);
            console.log(`📁 Arquivo SRT: ${textResult.srt_file}`);
            console.log(`🌐 Idioma usado: ${textResult.language_used}`);
            console.log(`📋 Primeiros 200 caracteres: ${textResult.transcription.substring(0, 200)}...`);
        } else {
            console.error('❌ Erro na transcrição em texto:', textResult.error);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // 2. Transcrição em formato JSON (SRT)
        console.log('📝 2. Obtendo transcrição em formato JSON...');
        const jsonResponse = await fetch(`${baseUrl}/api/transcription/json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoUrl: videoUrl,
                languages: ['pt', 'pt-BR', 'en']
            })
        });
        
        const jsonResult = await jsonResponse.json();
        
        if (jsonResult.success) {
            console.log('✅ Transcrição em JSON obtida com sucesso!');
            console.log(`📊 Estatísticas: ${jsonResult.total_words} palavras, ${jsonResult.total_characters} caracteres`);
            console.log(`📁 Arquivo SRT: ${jsonResult.srt_file}`);
            console.log(`🌐 Idioma usado: ${jsonResult.language_used}`);
            console.log(`📋 Total de segmentos: ${jsonResult.segments_count}`);
            
            if (jsonResult.transcript && jsonResult.transcript.length > 0) {
                console.log('📋 Primeiros 3 segmentos:');
                jsonResult.transcript.slice(0, 3).forEach((segment, index) => {
                    console.log(`  ${index + 1}. [${segment.start}] (${segment.dur}s) ${segment.text}`);
                });
            }
        } else {
            console.error('❌ Erro na transcrição em JSON:', jsonResult.error);
        }
        
        console.log('\n🎉 Exemplo concluído!');
        console.log('💡 Os arquivos SRT serão deletados automaticamente após 30 segundos.');
        
    } catch (error) {
        console.error('❌ Erro durante o exemplo:', error.message);
    }
}

// Executar exemplo se for chamado diretamente
if (require.main === module) {
    exemploTranscricao();
}

module.exports = { exemploTranscricao }; 