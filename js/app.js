// ==========================================
// APP.JS - XTUDE (Versão Completa e Corrigida)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let allVideos = [];

async function initApp() {
    await loadVideosData();
    setupEventListeners();
}

// 1. Função para carregar os vídeos do ficheiro videos.json local
async function loadVideosData() {
    try {
        const response = await fetch('js/videos.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        allVideos = await response.json();
        renderVideos(allVideos);
    } catch (error) {
        console.error("Erro ao carregar os vídeos:", error);
        showEmptyState("Não foi possível carregar os vídeos. Executa o gerador no teu PC.");
    }
}

// 2. Renderizar os vídeos no ecra
function renderVideos(videos) {
    const container = document.getElementById('videos-container');
    if (!container) return;

    if (!videos || videos.length === 0) {
        container.innerHTML = `<p class="no-videos">Nenhum vídeo encontrado.</p>`;
        return;
    }

    container.innerHTML = videos.map(video => `
        <div class="video-card" data-id="${video.id}">
            <div class="video-thumb">
                <img src="${video.thumb}" alt="${video.title}" loading="lazy">
                <span class="video-duration">${video.desc || ''}</span>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span class="video-date">${video.date || ''}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar evento de clique para abrir o vídeo (se aplicável)
    document.querySelectorAll('.video-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const video = videos[index];
            if (video && video.url) {
                window.open(video.url, '_blank');
            }
        });
    });
}

// 3. Configurar ouvintes de eventos globais
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allVideos.filter(v => 
                v.title.toLowerCase().includes(query)
            );
            renderVideos(filtered);
        });
    }
}

// Exemplo da função de edição corrigida (incluindo a correção da linha 301)
function handleVideoEdit(videoIndex) {
    if (allVideos[videoIndex]) {
        // Linha 301 corrigida com parênteses curvos corretos:
        allVideos[videoIndex].title = document.getElementById('editVTitle').value;
        renderVideos(allVideos);
    }
}

function showEmptyState(message) {
    const container = document.getElementById('videos-container');
    if (container) {
        container.innerHTML = `<p class="no-videos">${message}</p>`;
    }
}