let currentSlide = 0;
let bannerInterval;
let todosJogos = []; // Armazena todos os jogos para o filtro de busca

function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  slides[currentSlide].classList.remove("active");
  currentSlide += direction;

  if (currentSlide >= slides.length) currentSlide = 0;
  else if (currentSlide < 0) currentSlide = slides.length - 1;

  slides[currentSlide].classList.add("active");
}

function startBannerInterval() {
  clearInterval(bannerInterval);
  bannerInterval = setInterval(() => changeSlide(1), 5000);
}

function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  }
}

// ==========================================
// AUTENTICAÇÃO HEADER
// ==========================================
function verificarAutenticacaoNavbar() {
  const userStr = localStorage.getItem("usuarioLogado");
  const authContainer = document.getElementById("auth-container");
  const navPontos = document.getElementById("nav-pontos");

  if (userStr) {
    const usuario = JSON.parse(userStr);
    
    // Atualiza pontuação do topo
    if (navPontos) navPontos.innerText = usuario.pontos || 0;
    
    // Troca botão Entrar por acesso ao Perfil
    if (authContainer) {
      const primeiroNome = usuario.nome.split(" ")[0];
      authContainer.innerHTML = `
        <a href="perfil.html" style="color: white; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>
            <span>${primeiroNome}</span>
        </a>
      `;
    }
  }
}

// ==========================================
// BUSCA E PESQUISA
// ==========================================
function configurarBusca() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const termoDigitado = e.target.value.toLowerCase();
    const jogosFiltrados = todosJogos.filter((game) =>
      game.titulo.toLowerCase().includes(termoDigitado)
    );
    renderGames(jogosFiltrados);
  });
}

// ==========================================
// INTEGRAÇÃO COM API
// ==========================================
const API_URL = "http://localhost:3000/api";

async function fetchGames() {
  try {
    const response = await fetch(`${API_URL}/jogos`);
    if (!response.ok) throw new Error("Falha ao buscar jogos.");

    todosJogos = await response.json();

    renderBanner(todosJogos);
    renderGames(todosJogos);
  } catch (error) {
    console.error("Erro:", error);
    document.getElementById("games-container").innerHTML =
      '<p style="color: white; text-align: center; grid-column: 1/-1;">Erro ao carregar o catálogo de jogos.</p>';
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function renderBanner(jogos) {
  const bannerSlider = document.getElementById("banner-slider");
  if (!bannerSlider) return;

  const existingSlides = bannerSlider.querySelectorAll(".slide");
  existingSlides.forEach((slide) => slide.remove());

  const jogosBanner = jogos.filter((j) => j.cover).slice(0, 3);

  if (jogosBanner.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "slide active";
    placeholder.innerHTML = `<img src="img/site_logo.png" alt="Nenhum jogo disponível">`;
    bannerSlider.insertBefore(placeholder, bannerSlider.querySelector(".prev"));
    return;
  }

  jogosBanner.forEach((game, index) => {
    const slideDiv = document.createElement("div");
    slideDiv.className = index === 0 ? "slide active" : "slide";
    
    // Evita clique no banner caso o jogo exibido lá também seja "Em Breve"
    const isEmBreveBanner = parseFloat(game.preco) === 0 && parseFloat(game.desconto) !== 100;
    
    if (!isEmBreveBanner) {
      slideDiv.style.cursor = "pointer";
      slideDiv.onclick = () => { window.location.href = `jogo.html?id=${game.id}`; };
    }

    slideDiv.innerHTML = `<img src="${game.cover}" alt="${game.titulo}">`;
    bannerSlider.insertBefore(slideDiv, bannerSlider.querySelector(".prev"));
  });

  currentSlide = 0;
  startBannerInterval();
}

function renderGames(jogos) {
  const container = document.getElementById("games-container");
  if (!container) return;
  
  container.innerHTML = "";

  if (jogos.length === 0) {
    container.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Nenhum jogo encontrado.</p>';
    return;
  }

  jogos.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    const preco = parseFloat(game.preco);
    const desconto = game.desconto ? parseFloat(game.desconto) : 0;
    const temDesconto = desconto > 0;
    const precoFinal = temDesconto ? preco * (1 - desconto / 100) : preco;

    // Regra de bloqueio de clique para jogos não lançados
    const isEmBreve = preco === 0 && desconto !== 100;

    if (!isEmBreve) {
      card.style.cursor = "pointer";
      card.onclick = () => { window.location.href = `jogo.html?id=${game.id}`; };
    } else {
      card.style.cursor = "default";
      card.style.opacity = "0.85";
    }

    let badgeHTML = "";
    let precoHTML = "";

    if (preco === 0) {
      if (desconto === 100) {
        badgeHTML = `<span class="promo-badge" style="background:#00ff88; color:#111;">GRÁTIS</span>`;
        precoHTML = `<p class="price" style="color:#00ff88;">Grátis</p>`;
      } else {
        badgeHTML = `<span class="promo-badge" style="background:#ff9500;">EM BREVE</span>`;
        precoHTML = `<p class="price">Em Breve</p>`;
      }
    } else if (temDesconto) {
      badgeHTML = `<span class="promo-badge">-${desconto}%</span>`;
      precoHTML = `
                <span style="text-decoration: line-through; font-size: 0.9em; color: #aaa;">
                    ${formatPrice(preco)}
                </span>
                <p class="price">${formatPrice(precoFinal)}</p>
            `;
    } else {
      precoHTML = `<p class="price">${formatPrice(preco)}</p>`;
    }

    const imgSrc = game.cover || "img/site_logo.png";

    card.innerHTML = `
            ${badgeHTML}
            <img src="${imgSrc}" alt="${game.titulo}" style="width: 100%; border-radius: 8px;">
            <h3>${game.titulo}</h3>
            ${precoHTML}
        `;

    container.appendChild(card);
  });
}

// Inicialização
if (!window.location.pathname.includes("jogo.html")) {
  window.onload = () => {
    verificarAutenticacaoNavbar();
    configurarBusca();
    fetchGames();
  };
}