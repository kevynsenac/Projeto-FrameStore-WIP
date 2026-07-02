let currentSlide = 0;
let bannerInterval;
let todosJogos = [];

function protegerPagina() {
  const userStr = localStorage.getItem("usuarioLogado");
  // Se não houver nada no localStorage, redireciona para o login
  if (!userStr) {
    window.location.href = "login.html";
  }
}

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
// INTEGRAÇÃO COM API
// ==========================================
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// ==========================================
// AUTENTICAÇÃO HEADER, CARRINHO E DADOS FRESCOS
// ==========================================
async function verificarAutenticacaoNavbar() {
  const userStr = localStorage.getItem("usuarioLogado");

  if (userStr) {
    let usuario = JSON.parse(userStr);
    
    // Atualiza a UI imediatamente com o cache local para evitar "pulos" visuais
    atualizarUIHeader(usuario);

    // Busca os dados reais e atualizados do Banco de Dados
    try {
      const response = await fetch(`${API_URL}/usuarios/${usuario.id}`);
      if (response.ok) {
        const usuarioAtualizado = await response.json();
        
        // Sobrescreve o localStorage com os dados corretos (pontos/saldo novos)
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
        
        // Atualiza a interface com os pontos reais
        atualizarUIHeader(usuarioAtualizado);
      }
    } catch (error) {
      console.error("Erro ao sincronizar dados atualizados do usuário:", error);
    }

    // Busca a quantidade de itens no carrinho (sempre atualizado do DB)
    atualizarContadorCarrinho(usuario.id);
  }
}

// Função auxiliar para renderizar os dados do usuário no header
function atualizarUIHeader(usuario) {
  const authContainer = document.getElementById("auth-container");
  const navPontos = document.getElementById("nav-pontos");

  if (navPontos) navPontos.innerText = usuario.pontos || 0;

  if (authContainer) {
    const primeiroNome = usuario.nome.split(" ")[0];
    authContainer.innerHTML = `
      <a href="perfil.html" class="profile-badge">
          <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
          <span>${primeiroNome}</span>
      </a>
    `;
  }
}

async function atualizarContadorCarrinho(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/carrinho/${id_usuario}`);
    if (response.ok) {
      const itens = await response.json();
      const cartCount = document.getElementById("cart-count");
      
      if (cartCount) {
        if (itens.length > 0) {
          cartCount.innerText = itens.length;
          cartCount.style.display = "flex";
        } else {
          cartCount.style.display = "none";
        }
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar contador do carrinho:", error);
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
// RENDERIZAÇÃO DE JOGOS E BANNER COM LOADING
// ==========================================
async function fetchGames() {
  const spinner = document.getElementById("loading-spinner");
  const container = document.getElementById("games-container");

  // Inicia o estado de Loading
  if (spinner) spinner.style.display = "flex";
  if (container) container.innerHTML = "";

  try {
    const response = await fetch(`${API_URL}/jogos`);
    if (!response.ok) throw new Error("Falha ao buscar jogos.");

    todosJogos = await response.json();

    renderBanner(todosJogos);
    renderGames(todosJogos);
  } catch (error) {
    console.error("Erro:", error);
    if (container) {
      container.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Erro ao carregar o catálogo de jogos.</p>';
    }
  } finally {
    // Finaliza o estado de Loading (ocorre dando erro ou sucesso)
    if (spinner) spinner.style.display = "none";
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

  const jogosBanner = jogos.filter((j) => j.cover && j.desconto !== null);

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
    
    const isEmBreveBanner = parseFloat(game.preco) === 0 && parseFloat(game.desconto) !== 100;
    
    if (!isEmBreveBanner) {
      slideDiv.style.cursor = "pointer";
      slideDiv.onclick = () => { window.location.href = `jogo.html?id=${game.id}`; };
    }

    const desconto = parseFloat(game.desconto);
    let descontoTag = "";
    
    if (desconto === 100) {
      descontoTag = `<div class="banner-discount-tag" style="background: linear-gradient(135deg, #00ff88, #00aa55);">GRÁTIS</div>`;
    } else if (desconto > 0) {
      descontoTag = `<div class="banner-discount-tag">-${desconto}%</div>`;
    }

    slideDiv.innerHTML = `
      <img src="${game.cover}" alt="${game.titulo}">
      <div class="banner-title">${game.titulo}</div>
      ${descontoTag}
    `;
    
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
        badgeHTML = `<span class="promo-badge" style="background: linear-gradient(135deg, #00ff88, #00aa55); color:#111;">GRÁTIS</span>`;
        precoHTML = `<p class="price" style="color:#00ff88;">Grátis</p>`;
      } else {
        badgeHTML = `<span class="promo-badge" style="background: linear-gradient(135deg, #ffaa00, #ff5500);">EM BREVE</span>`;
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
    protegerPagina(); // Verifica a autenticação primeiro
    verificarAutenticacaoNavbar();
    configurarBusca();
    fetchGames();
  };
}