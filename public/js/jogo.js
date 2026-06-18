let galeria = [];
let imagemAtualIndex = 0;
let jogoAtual = null;

async function carregarDetalhesJogo() {
  const urlParams = new URLSearchParams(window.location.search);
  const jogoId = urlParams.get("id");

  if (!jogoId) {
    document.querySelector(".game-title").innerText = "Jogo não encontrado.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/jogos/${jogoId}`);
    if (!response.ok) throw new Error("Falha ao buscar detalhes do jogo.");

    jogoAtual = await response.json();
    renderizarDetalhes(jogoAtual);
  } catch (error) {
    console.error("Erro:", error);
    document.querySelector(".game-title").innerText = "Erro ao carregar os dados.";
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function renderizarDetalhes(game) {
  document.querySelector(".game-title").innerText = game.titulo;

  let precoFinal = parseFloat(game.preco);
  const temDesconto = game.desconto && parseFloat(game.desconto) > 0;
  const priceSection = document.querySelector(".price-section");

  if (temDesconto) {
    precoFinal -= precoFinal * (parseFloat(game.desconto) / 100);
    priceSection.innerHTML = `
            <span style="text-decoration: line-through; font-size: 0.6em; color: #aaa; display: block;">${formatPrice(game.preco)}</span>
            <span class="value">${formatPrice(precoFinal)}</span>
        `;
  } else {
    priceSection.innerHTML = `<span class="value">${formatPrice(precoFinal)}</span>`;
  }

  if (game.platform) {
    document.getElementById("game-platform").innerText = game.platform;
  }

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

  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    alert("Você precisa fazer login para adicionar jogos ao carrinho.");
    window.location.href = "login.html";
    return;
  }
  const usuarioLogado = JSON.parse(userStr);

  try {
    const response = await fetch(`${API_URL}/carrinho`, {
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
  // Dispara a verificação de sessão do header declarada em homepage.js
  if (typeof verificarAutenticacaoNavbar === "function") {
    verificarAutenticacaoNavbar();
  }
  carregarDetalhesJogo();
};