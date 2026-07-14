let currentSlide = 0;
let bannerInterval;
let todosJogos = [];
let jogosNaBiblioteca = []; // Variável global para armazenar os IDs dos jogos comprados

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

// ==========================================
// INTEGRAÇÃO COM API
// ==========================================
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// ==========================================
// AUTENTICAÇÃO HEADER, CARRINHO, BIBLIOTECA
// ==========================================
async function verificarAutenticacaoNavbar() {
  const userStr = localStorage.getItem("usuarioLogado");

  if (userStr) {
    let usuario = JSON.parse(userStr);
    
    // Atualiza a UI imediatamente com o cache local para evitar "pulos" visuais
    atualizarUIHeader(usuario);

    // Busca a biblioteca de jogos do usuário
    fetchBiblioteca(usuario.id);

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

// Substitua a atualizarUIHeader atual por esta:
function atualizarUIHeader(usuario) {
  // 1. Atualiza Avatar, Banner no botão e Logout no auth-container
  const authContainer = document.getElementById("auth-container");
  if (authContainer) {
    const primeiroNome = usuario.nome ? usuario.nome.split(" ")[0] : "Usuário";
    const fotoPerfil = usuario.foto_perfil || "img/site_logo.png";
    
    // Aplica o banner como background inline apenas no botão
    let badgeStyle = "";
    if (usuario.fundo_perfil) {
      badgeStyle = `background-image: linear-gradient(to right, rgba(15, 15, 30, 0.95), rgba(15, 15, 30, 0.2)), url('${usuario.fundo_perfil}'); background-size: cover; background-position: center;`;
    }

    authContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <a href="perfil.html" class="header-profile-badge" style="${badgeStyle}">
          <img src="${fotoPerfil}" alt="Avatar" class="header-avatar" />
          <span>${primeiroNome}</span>
        </a>
        <button class="header-logout-btn" onclick="fazerLogout()" title="Sair da Conta">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    `;
  }

  // 2. Atualiza Pontos e Saldo
  const navPontos = document.getElementById("nav-pontos");
  const navSaldo = document.getElementById("nav-saldo");
  const saldoPainel = document.getElementById("saldo-pontos");
  
  if (navPontos) navPontos.innerText = usuario.pontos || 0;
  if (saldoPainel) saldoPainel.innerText = usuario.pontos || 0;
  if (navSaldo) {
    navSaldo.innerText = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(usuario.saldo || 0);
  }

  // 3. Aplica apenas a Cor do Tema globalmente
  if (usuario.cor_tema) {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "42, 42, 239";
    };
    document.documentElement.style.setProperty("--cor-tema", usuario.cor_tema);
    document.documentElement.style.setProperty("--cor-tema-rgb", hexToRgb(usuario.cor_tema));
  }
}

// Adicione a função de logout no final do homepage.js para funcionar globalmente
function fazerLogout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
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

async function fetchBiblioteca(id_usuario) {
  try {
    const response = await fetch(`${API_URL}/usuarios/${id_usuario}/biblioteca`);
    if (response.ok) {
      const bibliotecaData = await response.json();
      // Mapeia o array de objetos para salvar apenas os IDs dos jogos na memória
      jogosNaBiblioteca = bibliotecaData.map(jogo => jogo.id); 
      
      // Se os jogos do catálogo já carregaram, re-renderiza para aplicar os estilos de "Na Biblioteca"
      if (todosJogos.length > 0) {
        renderGames(todosJogos);
      }
    }
  } catch (error) {
    console.error("Erro ao buscar biblioteca:", error);
  }
}

// ==========================================
// BUSCA, PESQUISA E FILTROS DE PLATAFORMA
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

// Controle de abertura do Dropdown interno
function toggleDropdown(event) {
  if (event) event.stopPropagation(); // Impede o clique de propagar para o document
  const display = document.getElementById("active-filter-display");
  if (display) {
    display.classList.toggle("open");
  }
}

// Fecha o dropdown automaticamente se o usuário clicar em qualquer outro lugar da tela
document.addEventListener("click", () => {
  const display = document.getElementById("active-filter-display");
  if (display) {
    display.classList.remove("open");
  }
});

function filtrarPlataforma(plataforma) {
  // 1. Atualiza o tema visual
  if (plataforma === 'todos' || plataforma === 'ofertas') {
    document.body.removeAttribute('data-theme');
  } else {
    document.body.setAttribute('data-theme', plataforma);
  }

  // 2. Limpa o input de busca
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  // 3. Atualiza os textos do gatilho do Dropdown
  const filterName = document.getElementById("filter-name");
  const filterIcon = document.getElementById("filter-icon");
  
  const configFiltros = {
    todos: { nome: "Todos", icone: "fas fa-home" }, // Nome encurtado para caber perfeitamente
    ofertas: { nome: "Ofertas", icone: "fas fa-tag" },
    steam: { nome: "Steam / PC", icone: "fab fa-steam" },
    playstation: { nome: "PlayStation", icone: "fab fa-playstation" },
    xbox: { nome: "Xbox", icone: "fab fa-xbox" },
    nintendo: { nome: "Nintendo", icone: "fas fa-gamepad" }
  };

  if (filterName && filterIcon && configFiltros[plataforma]) {
    filterName.innerText = configFiltros[plataforma].nome;
    filterIcon.className = configFiltros[plataforma].icone;
  }

  // 4. Atualiza a classe ativa dentro da lista do dropdown
  const dropdownLinks = document.querySelectorAll("#filter-dropdown li");
  dropdownLinks.forEach(li => {
    li.classList.remove("active-filter");
    const link = li.querySelector("a");
    const onclickAttr = link ? link.getAttribute("onclick") : null;
    if (onclickAttr && onclickAttr.includes(`'${plataforma}'`)) {
      li.classList.add("active-filter");
    }
  });

  // 5. Lógica de Filtragem de Dados
  let jogosFiltrados = [];

  if (plataforma === 'todos') {
    jogosFiltrados = todosJogos;
  } else if (plataforma === 'ofertas') {
    jogosFiltrados = todosJogos.filter(game => {
      const desconto = parseFloat(game.desconto);
      return desconto > 0 && desconto < 100;
    });
  } else {
    jogosFiltrados = todosJogos.filter((game) => {
      if (!game.platform) return false;
      const platStr = game.platform.toLowerCase();
      
      if (plataforma === 'steam') {
        return platStr.includes('steam') || platStr.includes('pc');
      }
      return platStr.includes(plataforma.toLowerCase());
    });
  }

  renderGames(jogosFiltrados);
}

// ==========================================
// RENDERIZAÇÃO DE JOGOS E BANNER COM LOADING
// ==========================================
async function fetchGames() {
  const spinner = document.getElementById("loading-spinner");
  const container = document.getElementById("games-container");

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
    container.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Nenhum jogo encontrado para esta plataforma.</p>';
    return;
  }

  jogos.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    // 1. CHECAGEM DE BIBLIOTECA
    const usuarioTemJogo = jogosNaBiblioteca.includes(game.id);
    if (usuarioTemJogo) {
      card.classList.add("na-biblioteca");
    }

    // 2. FAIXA DA PLATAFORMA
    const plataformaStr = game.platform ? game.platform.toLowerCase() : '';
    let classePlataforma = "platform-default";
    let nomePlataforma = game.platform || "Outros";

    if (plataformaStr.includes("pc") || plataformaStr.includes("steam")) classePlataforma = "platform-pc";
    else if (plataformaStr.includes("playstation")) classePlataforma = "platform-playstation";
    else if (plataformaStr.includes("xbox")) classePlataforma = "platform-xbox";
    else if (plataformaStr.includes("nintendo")) classePlataforma = "platform-nintendo";

    const faixaPlataformaHTML = `<div class="platform-banner ${classePlataforma}">${nomePlataforma}</div>`;

    // 3. CÁLCULO DE PREÇO
    const preco = parseFloat(game.preco);
    const desconto = game.desconto ? parseFloat(game.desconto) : 0;
    const temDesconto = desconto > 0;
    const precoFinal = temDesconto ? preco * (1 - desconto / 100) : preco;

    const isEmBreve = preco === 0 && desconto !== 100;

    // Configuração do clique no card
    if (!isEmBreve) {
      card.style.cursor = "pointer";
      card.onclick = () => { window.location.href = `jogo.html?id=${game.id}`; };
    } else {
      card.style.cursor = "default";
      card.style.opacity = "0.85";
    }

    let badgeHTML = "";
    let precoHTML = "";

    // 4. LÓGICA DO TEXTO (Muda se tiver na biblioteca)
    if (usuarioTemJogo) {
       precoHTML = `<p class="price"><i class="fas fa-check-circle"></i> Na Biblioteca</p>`;
    } else if (preco === 0) {
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

    // 5. MONTAGEM FINAL DO CARD
    // Atualizei o border-radius da imagem para ficar plano no topo, juntando com a faixa da plataforma
    card.innerHTML = `
            ${faixaPlataformaHTML}
            ${badgeHTML}
            <img src="${imgSrc}" alt="${game.titulo}" style="width: 100%; border-radius: 0 0 8px 8px;">
            <h3>${game.titulo}</h3>
            ${precoHTML}
        `;

    container.appendChild(card);
  });
}

// Inicialização
if (!window.location.pathname.includes("jogo.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    protegerPagina(); // Verifica a autenticação primeiro
    verificarAutenticacaoNavbar();
    configurarBusca();
    fetchGames();
  });
} 

// O evento "pageshow" garante que o header será atualizado mesmo 
// se o utilizador clicar no botão "Voltar" do navegador.
window.addEventListener("pageshow", (event) => {
  // event.persisted é true se a página foi recuperada do cache do navegador
  if (event.persisted) {
    if (typeof verificarAutenticacaoNavbar === "function") {
      verificarAutenticacaoNavbar();
    }
  }
});