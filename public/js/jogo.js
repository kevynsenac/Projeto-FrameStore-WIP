let galeria = [];
let imagemAtualIndex = 0;
let jogoAtual = null;

// Usamos um nome de constante diferente (BASE_API_URL) para evitar o erro de SyntaxError 
// de conflito com o "const API_URL" que já existe no homepage.js carregado no mesmo HTML
const BASE_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

async function carregarDetalhesJogo() {
  const urlParams = new URLSearchParams(window.location.search);
  const jogoId = urlParams.get("id");

  const spinner = document.getElementById("loading-spinner");
  const content = document.getElementById("game-content");

  // Se não houver ID na URL
  if (!jogoId) {
    document.querySelector(".game-title").innerText = "Jogo não encontrado.";
    if (spinner) spinner.style.display = "none";
    if (content) content.style.display = "block";
    return;
  }

  // Inicia o estado de Loading
  if (spinner) spinner.style.display = "flex";
  if (content) content.style.display = "none";

  try {
    const response = await fetch(`${BASE_API_URL}/jogos/${jogoId}`);
    if (!response.ok) throw new Error("Falha ao buscar detalhes do jogo.");

    jogoAtual = await response.json();
    await renderizarDetalhes(jogoAtual);
    
    // Mostra o conteúdo do jogo em caso de sucesso
    if (content) content.style.display = "block";
  } catch (error) {
    console.error("Erro:", error);
    document.querySelector(".game-title").innerText = "Erro ao carregar os dados.";
    // Mostra o conteúdo para exibir a mensagem de erro no título
    if (content) content.style.display = "block";
  } finally {
    // Finaliza o estado de Loading
    if (spinner) spinner.style.display = "none";
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

async function renderizarDetalhes(game) {
  document.querySelector(".game-title").innerText = game.titulo;

  const precoOriginal = parseFloat(game.preco);
  const desconto = game.desconto ? parseFloat(game.desconto) : 0;
  let precoFinal = precoOriginal;
  
  const temDesconto = desconto > 0;
  const isEmBreve = precoOriginal === 0 && desconto !== 100;
  const isGratis = precoOriginal === 0 && desconto === 100;

  const priceSection = document.querySelector(".price-section");
  const btnPurchase = document.querySelector(".btn-purchase-green");

  const descElement = document.getElementById("game-desc-text");
  const reqElement = document.getElementById("game-req-text");

  // Injeta a descrição
  if (descElement) {
    descElement.innerText = game.descricao || "Descrição não disponível para este jogo.";
  }

  // Injeta os requisitos formatando as vírgulas como quebras de linha
  if (reqElement) {
    if (game.requisitos) {
      // Divide o texto onde tem vírgula, remove os espaços sobrando (trim) e monta uma lista HTML
      reqElement.innerHTML = game.requisitos
        .split(',')
        .map(requisito => `<p><i class="fas fa-microchip"></i> ${requisito.trim()}</p>`)
        .join('');
    } else {
      reqElement.innerHTML = "<p>Requisitos não especificados.</p>";
    }
  }

  // 1. CHECAGEM SE O USUÁRIO JÁ POSSUI O JOGO
  let usuarioTemJogo = false;
  const userStr = localStorage.getItem("usuarioLogado");
  if (userStr) {
    const usuarioLogado = JSON.parse(userStr);
    try {
      const response = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}/biblioteca`);
      if (response.ok) {
        const bib = await response.json();
        usuarioTemJogo = bib.some(j => j.id === game.id);
      }
    } catch (e) {
      console.error("Erro ao checar biblioteca:", e);
    }
  }

  // 2. LÓGICA DO BOTÃO E PREÇOS
  if (usuarioTemJogo) {
    priceSection.innerHTML = `<span class="value" style="color: #aaa; font-size: 2rem;">Na Biblioteca</span>`;
    if (btnPurchase) {
        btnPurchase.disabled = true;
        btnPurchase.style.background = "#444";
        btnPurchase.style.color = "#aaa";
        btnPurchase.style.cursor = "not-allowed";
        btnPurchase.innerHTML = `<i class="fas fa-check-circle"></i> Já Adquirido`;
    }
  } else if (isEmBreve) {
    priceSection.innerHTML = `<span class="value" style="color: #ffaa00; font-size: 2rem;">Em Breve</span>`;
    if (btnPurchase) {
        btnPurchase.disabled = true;
        btnPurchase.style.opacity = "0.5";
        btnPurchase.style.cursor = "not-allowed";
        btnPurchase.innerHTML = `<i class="fas fa-clock"></i> Indisponível`;
    }
  } else if (isGratis) {
    priceSection.innerHTML = `<span class="value" style="color: #00ff88;">Grátis</span>`;
    if (btnPurchase) {
        btnPurchase.innerHTML = `<i class="fas fa-cart-plus"></i> Adicionar à Conta`;
    }
  } else if (temDesconto) {
    precoFinal -= precoFinal * (desconto / 100);
    priceSection.innerHTML = `
            <span style="text-decoration: line-through; font-size: 0.6em; color: #aaa; display: block;">${formatPrice(precoOriginal)}</span>
            <span class="value">${formatPrice(precoFinal)}</span>
        `;
  } else {
    priceSection.innerHTML = `<span class="value">${formatPrice(precoFinal)}</span>`;
  }

  // 3. LÓGICA DO CARD DA PLATAFORMA E TEMA DA PÁGINA
  const platformCard = document.getElementById("platform-card");
  const platformIcon = document.getElementById("platform-icon");
  const platformName = document.getElementById("game-platform");

  if (platformCard && platformIcon && platformName) {
    const platformStr = game.platform ? game.platform.toLowerCase() : '';
    platformCard.className = "platform-info-card"; // Reseta as classes

    if (platformStr.includes("pc") || platformStr.includes("steam")) {
        document.body.setAttribute('data-theme', 'steam');
        platformCard.classList.add("bg-steam");
        platformIcon.className = "fab fa-steam";
        platformName.innerText = game.platform || "Steam / PC";
    } else if (platformStr.includes("playstation")) {
        document.body.setAttribute('data-theme', 'playstation');
        platformCard.classList.add("bg-playstation");
        platformIcon.className = "fab fa-playstation";
        platformName.innerText = game.platform || "PlayStation";
    } else if (platformStr.includes("xbox")) {
        document.body.setAttribute('data-theme', 'xbox');
        platformCard.classList.add("bg-xbox");
        platformIcon.className = "fab fa-xbox";
        platformName.innerText = game.platform || "Xbox";
    } else if (platformStr.includes("nintendo")) {
        document.body.setAttribute('data-theme', 'nintendo');
        platformCard.classList.add("bg-nintendo");
        platformIcon.className = "fas fa-gamepad";
        platformName.innerText = game.platform || "Nintendo";
    } else {
        document.body.removeAttribute('data-theme');
        platformCard.classList.add("bg-default");
        platformIcon.className = "fas fa-gamepad";
        platformName.innerText = game.platform || "Outros";
    }
  }

  // 4. GALERIA
  galeria = [
    game.cover,
    game.screenshot1,
    game.screenshot2,
    game.screenshot3,
  ].filter((img) => img != null && img !== "");

  if (galeria.length === 0) {
    galeria = ["img/site_logo.png"]; 
  }

  const thumbContainer = document.querySelector(".thumb-list");
  thumbContainer.innerHTML = "";

  galeria.forEach((imgSrc, index) => {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.className = index === 0 ? "thumb active" : "thumb";
    img.onclick = () => selectImg(imgSrc, index);
    thumbContainer.appendChild(img);
  });

  selectImg(galeria[0], 0);
}

function selectImg(src, index) {
  const mainImg = document.getElementById("current-img");
  if (mainImg) {
    mainImg.src = src;
    imagemAtualIndex = index;

    const thumbs = document.querySelectorAll(".thumb");
    thumbs.forEach((t) => t.classList.remove("active"));
    if (thumbs[index]) thumbs[index].classList.add("active");
  }
}

function moveGallery(step) {
  if (galeria.length === 0) return;

  imagemAtualIndex += step;
  if (imagemAtualIndex >= galeria.length) imagemAtualIndex = 0;
  if (imagemAtualIndex < 0) imagemAtualIndex = galeria.length - 1;

  selectImg(galeria[imagemAtualIndex], imagemAtualIndex);
}

async function adicionarAoCarrinho() {
  if (!jogoAtual) return;

  // Bloqueio extra: Impede a compra de jogos que não lançaram se tentarem burlar o HTML
  const precoOriginal = parseFloat(jogoAtual.preco);
  const desconto = jogoAtual.desconto ? parseFloat(jogoAtual.desconto) : 0;
  if (precoOriginal === 0 && desconto !== 100) {
      alert("Este jogo ainda está 'Em Breve' e não pode ser adicionado.");
      return;
  }

  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    alert("Você precisa fazer login para adicionar jogos ao carrinho.");
    window.location.href = "login.html";
    return;
  }
  const usuarioLogado = JSON.parse(userStr);

  try {
    const response = await fetch(`${BASE_API_URL}/carrinho`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: usuarioLogado.id,
        id_jogo: jogoAtual.id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Erro ao adicionar jogo ao carrinho.");
      return;
    }

    atualizarModalCarrinhoVisual();

    // Atualiza o contador de itens no header (função que vem do homepage.js)
    if (typeof atualizarContadorCarrinho === "function") {
      atualizarContadorCarrinho(usuarioLogado.id);
    }

  } catch (error) {
    console.error("Erro no fetch do carrinho:", error);
    alert("Erro interno ao processar a requisição.");
  }
}

function atualizarModalCarrinhoVisual() {
  const titulo = jogoAtual.titulo;
  const precoText = document.querySelector(".price-section .value").innerText;
  const imagem = galeria[0];
  const listaItens = document.getElementById("cart-items-list");

  // Limpa o conteúdo e exibe apenas o jogo que acabou de ser adicionado
  listaItens.innerHTML = `
      <div class="cart-item" style="display: flex; align-items: center; gap: 15px; padding: 15px 0;">
          <img src="${imagem}" alt="${titulo}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">
          <div>
              <p style="margin: 0; font-size: 1.2rem;"><strong>${titulo}</strong></p>
              <p style="color: #00ff00; margin: 5px 0 0 0; font-weight: bold;">${precoText}</p>
          </div>
      </div>
  `;

  document.getElementById("cart-modal").style.display = "block";
}

function fecharCarrinho() {
  document.getElementById("cart-modal").style.display = "none";
}

window.onload = () => {
  // Dispara a verificação de sessão do header declarada em homepage.js e atualiza dados do DB
  if (typeof verificarAutenticacaoNavbar === "function") {
    verificarAutenticacaoNavbar();
  }
  carregarDetalhesJogo();
};