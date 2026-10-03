// Senha padrão do Painel de Admin
const ADMIN_PASS = "admin123";

// Link do seu afiliado / anunciante
const LINK_AFILIADO = "https://seu-link-de-afiliado.com";

// Configuração da RapidAPI (JSON Porn)
const RAPIDAPI_KEY = "debd55a99emsh1e701cfe669bf09p16f03cjsn7f0cb107582d"; 
const RAPIDAPI_HOST = "json-porn.p.rapidapi.com";

// Rastreador de cliques por ID de vídeo
const videoClickTracker = {};

// Vídeos de Exemplo (Plano de fundo para garantir exibição)
const defaultVideos = [
  {
    id: "demo_1",
    title: "Vídeo de Exemplo 1 - Conteúdo em Destaque",
    url: "https://www.google.com",
    thumb: "https://picsum.photos/400/225?random=1",
    categories: ["destaque", "geral"],
    desc: "Vídeo demonstrativo",
    date: new Date().toLocaleDateString('pt-BR')
  },
  {
    id: "demo_2",
    title: "Vídeo de Exemplo 2 - Lançamentos",
    url: "https://www.google.com",
    thumb: "https://picsum.photos/400/225?random=2",
    categories: ["lançamentos"],
    desc: "Vídeo demonstrativo 2",
    date: new Date().toLocaleDateString('pt-BR')
  }
];

function getVideos() {
  return JSON.parse(localStorage.getItem('xtude_videos')) || defaultVideos;
}

function getAds() {
  return JSON.parse(localStorage.getItem('xtude_ads')) || { top: '', bottom: '', video: '' };
}

// ---- Modal de Idade (+18) ----
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById('ageModal')) {
    const isAdult = localStorage.getItem('xtude_is_adult');
    if (!isAdult) {
      const ageModal = new bootstrap.Modal(document.getElementById('ageModal'));
      ageModal.show();
    } else {
      initHomePage();
    }
  }

  if (document.getElementById('adminVideoList')) {
    renderAdminVideos();
    loadAdsInAdmin();
  }
});

function confirmAge(isAdult) {
  if (isAdult) {
    localStorage.setItem('xtude_is_adult', 'true');
    const ageModalEl = document.getElementById('ageModal');
    const modal = bootstrap.Modal.getInstance(ageModalEl);
    modal.hide();
    initHomePage();
  } else {
    window.location.href = "https://www.google.com";
  }
}

// ---- Home Page ----
async function initHomePage() {
  renderAds();
  
  const localVideos = getVideos();
  const apiVideos = await fetchVideosFromApi();

  const allVideos = [...localVideos, ...apiVideos];

  renderCategories(allVideos);
  renderVideos(allVideos);
}

// ---- Busca de Conteúdo na RapidAPI ----
async function fetchVideosFromApi() {
  if (!RAPIDAPI_KEY) return [];

  try {
    // Adicionado parâmetro timestamp (&_t=...) para evitar cache antigo no navegador
    const response = await fetch(`https://${RAPIDAPI_HOST}/Search?query=all&count=20&_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      console.error("Erro na API:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log("Dados recebidos da API:", data);

    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      items = data.results || data.videos || data.data || [];
    }

    return items.map((item, index) => ({
      id: `api_${item.id || index}_${Date.now()}`,
      title: item.title || item.name || "Conteúdo Especial",
      url: item.url || item.link || item.website || "https://www.google.com",
      thumb: item.poster || item.image || item.thumb || "https://picsum.photos/400/225",
      categories: Array.isArray(item.tags) ? item.tags : [item.category || "geral"],
      desc: item.description || "",
      date: new Date().toLocaleDateString('pt-BR')
    }));
  } catch (error) {
    console.error("Erro na requisição da API:", error);
    return [];
  }
}

function renderCategories(videoList) {
  const catSet = new Set();
  videoList.forEach(v => {
    if (Array.isArray(v.categories)) {
      v.categories.forEach(c => {
        if (c) catSet.add(String(c).trim().toLowerCase());
      });
    }
  });

  const container = document.getElementById('categoryButtons');
  if (!container) return;

  container.innerHTML = `<button class="btn btn-danger btn-sm" onclick="filterCategory('all')">Todos</button>`;
  catSet.forEach(cat => {
    if (cat) {
      container.innerHTML += `<button class="btn btn-outline-secondary btn-sm ms-1" onclick="filterCategory('${cat}')">${cat.toUpperCase()}</button>`;
    }
  });
}

function renderVideos(videoList) {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (videoList.length === 0) {
    grid.innerHTML = `<div class="col-12"><p class="text-muted">Nenhum vídeo encontrado.</p></div>`;
    return;
  }

  videoList.forEach(v => {
    if (videoClickTracker[v.id] === undefined) {
      videoClickTracker[v.id] = 0;
    }

    const categoriesArray = Array.isArray(v.categories) ? v.categories : [v.categories];
    const badgeCategories = categoriesArray.map(c => `<span class="badge bg-secondary me-1">${c}</span>`).join('');
    
    grid.innerHTML += `
      <div class="col">
        <div class="card h-100 bg-dark border-secondary">
          <img src="${v.thumb}" class="card-img-top" alt="${v.title}" style="height:180px; object-fit:cover;" onerror="this.src='https://picsum.photos/400/225'">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title text-truncate">${v.title}</h6>
            <div class="mb-2">${badgeCategories}</div>
            
            <button class="btn btn-danger btn-sm mt-auto" onclick="handleVideoClick('${v.id}')">
              <i class="bi bi-play-fill"></i> Assistir
            </button>

          </div>
        </div>
      </div>
    `;
  });
}

// ---- Lógica de Cliques ----
function handleVideoClick(videoId) {
  videoClickTracker[videoId] = (videoClickTracker[videoId] || 0) + 1;

  if (videoClickTracker[videoId] === 1) {
    window.open(LINK_AFILIADO, '_blank');
  } else {
    const localVideos = getVideos();
    let video = localVideos.find(v => String(v.id) === String(videoId));
    
    if (video) {
      window.open(video.url, '_blank');
    } else {
      window.open("https://www.google.com", '_blank');
    }
  }
}

// ---- Busca e Filtros ----
function filterCategory(cat) {
  const localVideos = getVideos();
  document.getElementById('sectionTitle').innerText = cat === 'all' ? 'Vídeos Recentes' : `Categoria: ${cat.toUpperCase()}`;
  
  if (cat === 'all') {
    initHomePage();
  } else {
    const filtered = localVideos.filter(v => v.categories.map(c => String(c).toLowerCase().trim()).includes(cat.toLowerCase()));
    renderVideos(filtered);
  }
}

function searchVideos(event) {
  event.preventDefault();
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const videos = getVideos();

  const filtered = videos.filter(v => 
    v.title.toLowerCase().includes(query) ||
    v.categories.some(c => String(c).toLowerCase().includes(query))
  );

  document.getElementById('sectionTitle').innerText = `Resultados para: "${query}"`;
  renderVideos(filtered);
}

// ---- Anúncios ----
function renderAds() {
  const ads = getAds();
  if (ads.top && document.getElementById('adContainerTop')) {
    document.getElementById('adContainerTop').innerHTML = ads.top;
  }
  if (ads.bottom && document.getElementById('adContainerBottom')) {
    document.getElementById('adContainerBottom').innerHTML = ads.bottom;
  }
  if (ads.video && document.getElementById('adContainerVideo')) {
    document.getElementById('adContainerVideo').innerHTML = ads.video;
  }
}

// ---- Admin ----
function loginAdmin() {
  const pass = document.getElementById('adminPassword').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('loginArea').classList.add('d-none');
    document.getElementById('adminContent').classList.remove('d-none');
  } else {
    alert("Senha incorreta!");
  }
}

function addVideo(event) {
  event.preventDefault();
  const title = document.getElementById('vTitle').value;
  const url = document.getElementById('vUrl').value;
  const thumb = document.getElementById('vThumb').value;
  const categories = document.getElementById('vCategories').value.split(',').map(c => c.trim());
  const desc = document.getElementById('vDesc').value;

  const videos = getVideos();
  const newVideo = {
    id: Date.now(),
    title,
    url,
    thumb,
    categories,
    desc,
    date: new Date().toLocaleDateString('pt-BR')
  };

  videos.unshift(newVideo);
  localStorage.setItem('xtude_videos', JSON.stringify(videos));

  document.getElementById('videoForm').reset();
  renderAdminVideos();
  alert('Vídeo adicionado com sucesso!');
}

function openEditModal(id) {
  const videos = getVideos();
  const video = videos.find(v => String(v.id) === String(id));
  if (!video) return;

  document.getElementById('editVId').value = video.id;
  document.getElementById('editVTitle').value = video.title;
  document.getElementById('editVUrl').value = video.url;
  document.getElementById('editVThumb').value = video.thumb;
  document.getElementById('editVCategories').value = video.categories.join(', ');
  document.getElementById('editVDesc').value = video.desc || '';

  const modal = new bootstrap.Modal(document.getElementById('editVideoModal'));
  modal.show();
}

function updateVideo(event) {
  event.preventDefault();
  const id = document.getElementById('editVId').value;
  const videos = getVideos();

  const videoIndex = videos.findIndex(v => String(v.id) === String(id));
  if (videoIndex === -1) return;

  videos[videoIndex].title = document.getElementById('editVTitle').value;
  videos[videoIndex].url = document.getElementById('editVUrl').value;
  videos[videoIndex].thumb = document.getElementById('editVThumb').value;
  videos[videoIndex].categories = document.getElementById('editVCategories').value.split(',').map(c => c.trim());
  videos[videoIndex].desc = document.getElementById('editVDesc').value;

  localStorage.setItem('xtude_videos', JSON.stringify(videos));

  const modalEl = document.getElementById('editVideoModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();

  renderAdminVideos();
  alert('Vídeo atualizado com sucesso!');
}

function deleteVideo(id) {
  if (confirm("Deseja realmente remover este vídeo?")) {
    let videos = getVideos();
    videos = videos.filter(v => String(v.id) !== String(id));
    localStorage.setItem('xtude_videos', JSON.stringify(videos));
    renderAdminVideos();
  }
}

function renderAdminVideos() {
  const list = document.getElementById('adminVideoList');
  if (!list) return;
  const videos = getVideos();
  list.innerHTML = '';

  videos.forEach(v => {
    list.innerHTML += `
      <tr>
        <td><img src="${v.thumb}" width="50" height="30" style="object-fit:cover;"></td>
        <td>${v.title}</td>
        <td><small>${Array.isArray(v.categories) ? v.categories.join(', ') : v.categories}</small></td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="openEditModal('${v.id}')" title="Editar"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteVideo('${v.id}')" title="Excluir"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

function saveAds(event) {
  event.preventDefault();
  const ads = {
    top: document.getElementById('adTopCode').value,
    bottom: document.getElementById('adBottomCode').value,
    video: document.getElementById('adVideoCode').value
  };
  localStorage.setItem('xtude_ads', JSON.stringify(ads));
  alert('Anúncios salvos com sucesso!');
}

function loadAdsInAdmin() {
  const ads = getAds();
  if(document.getElementById('adTopCode')) {
    document.getElementById('adTopCode').value = ads.top || '';
    document.getElementById('adBottomCode').value = ads.bottom || '';
    document.getElementById('adVideoCode').value = ads.video || '';
  }
}