#!/usr/bin/env node

/**
 * Script de teste para funcionalidade de transcrição
 * FCI - API Youtube v1
 */

const TranscriptionService = require('../src/services/transcriptionService');

async function testTranscription() {
    console.log('🧪 Testando funcionalidade de transcrição...\n');
    
    const transcriptionService = new TranscriptionService();
    
    // URL de teste (vídeo público do YouTube)
    const testVideoUrl = 'https://www.youtube.com/watch?v=qvZeLp3bkd4';
    
    try {
        console.log('📝 Testando transcrição em texto completo...');
        const textResult = await transcriptionService.getTranscriptionText(testVideoUrl, {
            languages: ['pt', 'pt-BR', 'en']
        });
        
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
        
        console.log('📝 Testando transcrição em formato JSON...');
        const jsonResult = await transcriptionService.getTranscriptionJson(testVideoUrl, {
            languages: ['pt', 'pt-BR', 'en']
        });
        
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
        
        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        process.exit(1);
    }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
    testTranscription();
}

module.exports = { testTranscription }; 