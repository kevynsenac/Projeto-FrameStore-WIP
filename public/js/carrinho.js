// Usamos BASE_API_URL para evitar conflito de declaração com outros scripts
const BASE_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let usuarioLogado = null;
let itensCarrinho = [];
let cuponsDisponiveis = [];
let bibliotecaUsuario = []; // Armazena IDs dos jogos que o usuário já tem
let temJogoPossuido = false; // Flag de segurança para bloquear checkout

// ==========================================
// AUTENTICAÇÃO E ATUALIZAÇÃO DO HEADER
// ==========================================
async function verificarAutenticacao() {
  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    window.location.href = "login.html";
    return false;
  }
  usuarioLogado = JSON.parse(userStr);
  
  // Atualiza a UI imediatamente com o cache
  atualizarUIHeader(usuarioLogado);

  // Busca os dados reais e atualizados do Banco de Dados (Saldo/Pontos frescos)
  try {
    const response = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}`);
    if (response.ok) {
      const usuarioAtualizado = await response.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
      usuarioLogado = usuarioAtualizado;
      atualizarUIHeader(usuarioAtualizado);
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados do usuário:", error);
  }

  return true;
}

function atualizarUIHeader(usuario) {
  const navPontos = document.getElementById("nav-pontos");
  const navSaldo = document.getElementById("nav-saldo");
  const authContainer = document.getElementById("auth-container");

  if (navPontos) navPontos.innerText = usuario.pontos || 0;
  if (navSaldo) navSaldo.innerText = formatPrice(usuario.saldo || 0);

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

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ==========================================
// CARREGAMENTO DE DADOS (CARRINHO, BIBLIOTECA E CUPONS)
// ==========================================
async function carregarDadosCarrinho() {
  const spinner = document.getElementById("loading-spinner");
  const content = document.getElementById("cart-content");

  // Inicia o Loading
  if (spinner) spinner.style.display = "flex";
  if (content) content.style.display = "none";

  try {
    // 1. Busca os itens no carrinho
    const resCart = await fetch(`${BASE_API_URL}/carrinho/${usuarioLogado.id}`);
    if (!resCart.ok) throw new Error("Falha ao buscar itens do carrinho.");
    itensCarrinho = await resCart.json();

    // 2. Busca a biblioteca para checar se já possui o jogo
    const resLib = await fetch(`${BASE_API_URL}/biblioteca/${usuarioLogado.id}`);
    if (resLib.ok) {
      const libData = await resLib.json();
      // Mapeia para um array simples de IDs (ajuste 'id_jogo' conforme o retorno da sua API)
      bibliotecaUsuario = libData.map(item => item.id_jogo || item.id); 
    }

    // 3. Busca os cupons do usuário
    await carregarCupons();

    renderizarCarrinho();
    calcularTotal();

    // Exibe o conteúdo (usando 'grid' pois o .cart-container no CSS é grid)
    if (content) content.style.display = "grid";

  } catch (error) {
    console.error("Erro:", error);
    const wrapper = document.querySelector(".cart-wrapper");
    if (wrapper) {
      wrapper.innerHTML = "<p style='color: white; text-align: center; font-size: 1.2rem; margin-top: 50px;'>Erro ao carregar o carrinho.</p>";
    }
  } finally {
    // Finaliza o Loading independentemente de sucesso ou erro
    if (spinner) spinner.style.display = "none";
  }
}

async function carregarCupons() {
  try {
    const response = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}/cupons`);
    if (!response.ok) throw new Error("Falha ao carregar cupons.");

    const todosCupons = await response.json();
    cuponsDisponiveis = todosCupons.filter((c) => !c.usado);

    const select = document.getElementById("coupon-select");
    select.innerHTML = '<option value="">Nenhum cupom selecionado</option>'; // Reseta opções

    cuponsDisponiveis.forEach((cupom) => {
      const option = document.createElement("option");
      option.value = cupom.id;
      option.text = `${cupom.nome} (- R$ ${parseFloat(cupom.desconto).toFixed(2)})`;
      option.dataset.desconto = cupom.desconto; // Salva o valor para os cálculos
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar cupons:", error);
  }
}

// ==========================================
// RENDERIZAÇÃO E CÁLCULOS
// ==========================================
function renderizarCarrinho() {
  const container = document.getElementById("cart-list");
  container.innerHTML = "";
  temJogoPossuido = false; // Reseta a flag a cada renderização

  if (itensCarrinho.length === 0) {
    container.innerHTML = "<p style='color: #a5b1c2; font-size: 1.1rem;'>Seu carrinho está vazio.</p>";
    return;
  }

  itensCarrinho.forEach((jogo) => {
    // Verifica se o ID do jogo está na lista da biblioteca do usuário
    const isOwned = bibliotecaUsuario.includes(jogo.id);
    if (isOwned) temJogoPossuido = true;

    const div = document.createElement("div");
    // Se possuir o jogo, aplica a classe visual de erro
    div.className = isOwned ? "cart-item owned-item" : "cart-item";

    const imgSrc = jogo.cover || "img/site_logo.png";

    let precoFinal = parseFloat(jogo.preco);
    const temDesconto = jogo.desconto && parseFloat(jogo.desconto) > 0;

    let precoHTML = "";
    if (temDesconto) {
      precoFinal -= precoFinal * (parseFloat(jogo.desconto) / 100);
      precoHTML = `
                <span style="text-decoration: line-through; font-size: 0.9em; color: #aaa;">${formatPrice(jogo.preco)}</span>
                <br>
                <span class="cart-item-price">${formatPrice(precoFinal)}</span>
            `;
    } else {
      precoHTML = `<span class="cart-item-price">${formatPrice(precoFinal)}</span>`;
    }

    // Alerta visual inserido sob o preço
    const warningHTML = isOwned 
        ? `<div class="owned-warning"><i class="fas fa-exclamation-triangle"></i> Você já possui este jogo na biblioteca.</div>` 
        : "";

    div.innerHTML = `
            <img src="${imgSrc}" alt="${jogo.titulo}">
            <div class="cart-item-info">
                <h3>${jogo.titulo}</h3>
                ${precoHTML}
                ${warningHTML}
            </div>
            <button class="btn-remove" onclick="removerDoCarrinho(${jogo.id})"><i class="fas fa-trash"></i> Remover</button>
        `;
    container.appendChild(div);
  });
}

function calcularTotal() {
  let subtotal = 0;

  itensCarrinho.forEach((jogo) => {
    let precoFinal = parseFloat(jogo.preco);
    if (jogo.desconto && parseFloat(jogo.desconto) > 0) {
      precoFinal -= precoFinal * (parseFloat(jogo.desconto) / 100);
    }
    subtotal += precoFinal;
  });

  document.getElementById("cart-subtotal").innerText = formatPrice(subtotal);

  const select = document.getElementById("coupon-select");
  const rowDesconto = document.getElementById("discount-row");
  const elDesconto = document.getElementById("cart-discount");

  let desconto = 0;
  if (select.selectedIndex > 0) {
    const option = select.options[select.selectedIndex];
    desconto = parseFloat(option.dataset.desconto);
    rowDesconto.style.display = "flex";
    elDesconto.innerText = `- ${formatPrice(desconto)}`;
  } else {
    rowDesconto.style.display = "none";
  }

  let totalFinal = Math.max(0, subtotal - desconto);
  document.getElementById("cart-total").innerText = formatPrice(totalFinal);

  // Lógica para bloquear ou liberar o botão de finalizar
  const btnFinalizar = document.getElementById("btn-finalizar");
  if (btnFinalizar) {
    if (itensCarrinho.length === 0 || temJogoPossuido) {
      btnFinalizar.disabled = true;
      if (temJogoPossuido) {
        btnFinalizar.innerText = "Remova Itens Duplicados";
      } else {
        btnFinalizar.innerText = "Carrinho Vazio";
      }
    } else {
      btnFinalizar.disabled = false;
      btnFinalizar.innerText = "Finalizar Compra";
    }
  }
}

// ==========================================
// AÇÕES DO USUÁRIO
// ==========================================
async function removerDoCarrinho(idJogo) {
  try {
    const response = await fetch(`${BASE_API_URL}/carrinho`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuarioLogado.id, id_jogo: idJogo }),
    });

    if (!response.ok) throw new Error("Falha ao remover item.");

    // Recarrega os dados sem piscar a tela inteira
    await carregarDadosCarrinho();
  } catch (error) {
    console.error(error);
    alert("Erro ao remover o jogo do carrinho.");
  }
}

async function finalizarCompra() {
  if (itensCarrinho.length === 0 || temJogoPossuido) return;

  const select = document.getElementById("coupon-select");
  const idCupom = select.value ? parseInt(select.value) : null;

  // Feedback visual para evitar múltiplos cliques
  const btnFinalizar = document.getElementById("btn-finalizar");
  const originalText = btnFinalizar.innerText;
  btnFinalizar.innerText = "Processando...";
  btnFinalizar.disabled = true;

  try {
    const response = await fetch(`${BASE_API_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: usuarioLogado.id,
        id_cupom: idCupom,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Erro ao finalizar a compra.");
      btnFinalizar.innerText = originalText;
      btnFinalizar.disabled = false;
      return;
    }

    // Atualiza a sessão local com os novos valores de saldo e pontos provenientes do DB
    if (result.saldoRestante !== undefined) usuarioLogado.saldo = result.saldoRestante;
    if (result.pontosAtuais !== undefined) usuarioLogado.pontos = result.pontosAtuais;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    alert("Compra realizada com sucesso! Os jogos foram adicionados à sua biblioteca.");
    window.location.href = "perfil.html";
  } catch (error) {
    console.error("Erro no checkout:", error);
    alert("Erro interno ao processar a compra.");
    btnFinalizar.innerText = originalText;
    btnFinalizar.disabled = false;
  }
}

// Inicialização
window.onload = async () => {
  const autenticado = await verificarAutenticacao();
  if (autenticado) {
    carregarDadosCarrinho();
  }
};