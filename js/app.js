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
        const response = await fetch('./js/videos.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        allVideos = await response.json();
        renderVideos(allVideos);
    } catch (error) {
        console.error("Erro ao carregar os vídeos:", error);
        showEmptyState("Não foi possível carregar os vídeos. Executa o gerador no teu PC e envia para o GitHub.");
    }
}

// 2. Renderizar os vídeos no ecrã (utilizando o id 'videoGrid' do teu HTML)
function renderVideos(videos) {
    const container = document.getElementById('videoGrid');
    if (!container) return;

    if (!videos || videos.length === 0) {
        container.innerHTML = `<p class="no-videos text-center text-muted w-100">Nenhum vídeo encontrado.</p>`;
        return;
    }

    container.innerHTML = videos.map(video => `
        <div class="col">
            <div class="card h-100 bg-dark text-white video-card shadow-sm" style="cursor: pointer;" data-url="${video.url}">
                <img src="${video.thumb}" class="card-img-top" alt="${video.title}" loading="lazy" style="height: 160px; object-fit: cover;">
                <div class="card-body p-2 d-flex flex-column">
                    <h6 class="card-title text-truncate fs-6 mb-1">${video.title}</h6>
                    <div class="mt-auto d-flex justify-content-between align-items-center pt-2">
                        <small class="text-danger">${video.desc || ''}</small>
                        <small class="text-muted">${video.date || ''}</small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar evento de clique para abrir o link do vídeo
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank');
            }
        });
    });
}

// 3. Configurar ouvintes de eventos globais (Pesquisa)
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
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

function searchVideos(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const query = searchInput.value.toLowerCase();
        const filtered = allVideos.filter(v => 
            v.title.toLowerCase().includes(query)
        );
        renderVideos(filtered);
    }
}

function filterCategory(category) {
    if (category === 'all') {
        renderVideos(allVideos);
    } else {
        const filtered = allVideos.filter(v => {
            if (!v.categories) return false;
            // Se categories for um array, verifica se algum item bate (ignorando maiúsculas/minúsculas)
            if (Array.isArray(v.categories)) {
                return v.categories.some(cat => 
                    cat.toLowerCase().trim() === category.toLowerCase().trim()
                );
            }
            // Se por acaso no JSON for uma string única separada por vírgula ou texto
            return String(v.categories).toLowerCase().includes(category.toLowerCase());
        });
        renderVideos(filtered);
    }
}

// Exemplo da função de edição corrigida (linha 301)
function handleVideoEdit(videoIndex) {
    if (allVideos[videoIndex]) {
        allVideos[videoIndex].title = document.getElementById('editVTitle').value;
        renderVideos(allVideos);
    }
}

function showEmptyState(message) {
    const container = document.getElementById('videoGrid');
    if (container) {
        container.innerHTML = `<p class="text-center text-muted w-100">${message}</p>`;
    }
}