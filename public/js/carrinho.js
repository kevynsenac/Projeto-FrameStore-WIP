const BASE_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let usuarioLogado = null;
let itensCarrinho = [];
let cuponsDisponiveis = [];
let bibliotecaUsuario = [];
let temJogoPossuido = false; 

// ==========================================
// SISTEMA DE NOTIFICAÇÕES (TOASTS)
// ==========================================
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  
  const icone = tipo === 'sucesso' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  toast.innerHTML = `<i class="${icone}"></i> <span>${mensagem}</span>`;
  
  container.appendChild(toast);

  // Remove a notificação após 3.5 segundos
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300); // Tempo da animação CSS
  }, 3500);
}

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
  atualizarUIHeader(usuarioLogado);

  try {
    const response = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}`);
    if (response.ok) {
      const usuarioAtualizado = await response.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
      usuarioLogado = usuarioAtualizado;
      atualizarUIHeader(usuarioAtualizado);
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados:", error);
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

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ==========================================
// CARREGAMENTO DE DADOS
// ==========================================
async function carregarDadosCarrinho() {
  const spinner = document.getElementById("loading-spinner");
  const content = document.getElementById("cart-content");

  if (spinner) spinner.style.display = "flex";
  if (content) content.style.display = "none";

  try {
    const resCart = await fetch(`${BASE_API_URL}/carrinho/${usuarioLogado.id}`);
    if (!resCart.ok) throw new Error("Falha ao buscar itens.");
    itensCarrinho = await resCart.json();

    const resLib = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}/biblioteca`);
    if (resLib.ok) {
      const libData = await resLib.json();
      bibliotecaUsuario = libData.map(item => item.id_jogo || item.id); 
    }

    await carregarCupons();
    renderizarCarrinho();
    calcularTotal();

    if (content) content.style.display = "grid";

  } catch (error) {
    console.error(error);
    const wrapper = document.querySelector(".cart-wrapper");
    if (wrapper) wrapper.innerHTML = "<p style='color: white; text-align: center; margin-top: 50px;'>Erro ao carregar o carrinho.</p>";
  } finally {
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
    select.innerHTML = '<option value="">Não utilizar nenhum cupom</option>'; 

    cuponsDisponiveis.forEach((cupom) => {
      const option = document.createElement("option");
      option.value = cupom.id;
      option.text = `${cupom.nome} (- R$ ${parseFloat(cupom.desconto).toFixed(2)})`;
      option.dataset.desconto = cupom.desconto; 
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

// ==========================================
// RENDERIZAÇÃO E CÁLCULOS
// ==========================================
function renderizarCarrinho() {
  const container = document.getElementById("cart-list");
  container.innerHTML = "";
  temJogoPossuido = false;

  if (itensCarrinho.length === 0) {
    container.innerHTML = "<p style='color: #a5b1c2; font-size: 1.1rem; padding: 20px 0;'>O teu carrinho encontra-se vazio.</p>";
    return;
  }

  itensCarrinho.forEach((jogo) => {
    const isOwned = bibliotecaUsuario.includes(jogo.id);
    if (isOwned) temJogoPossuido = true;

    // Definição visual por plataforma
    let platStr = (jogo.platform || '').toLowerCase();
    let classPlat = 'plat-default';
    let iconPlat = 'fas fa-gamepad';
    
    if (platStr.includes('steam') || platStr.includes('pc')) { classPlat = 'plat-steam'; iconPlat = 'fab fa-steam'; }
    else if (platStr.includes('playstation')) { classPlat = 'plat-playstation'; iconPlat = 'fab fa-playstation'; }
    else if (platStr.includes('xbox')) { classPlat = 'plat-xbox'; iconPlat = 'fab fa-xbox'; }
    else if (platStr.includes('nintendo')) { classPlat = 'plat-nintendo'; iconPlat = 'fas fa-gamepad'; }

    const div = document.createElement("div");
    // Combina a classe da plataforma com a classe do item
    div.className = isOwned ? `cart-item owned-item ${classPlat}` : `cart-item ${classPlat}`;

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

    const warningHTML = isOwned 
        ? `<div class="owned-warning"><i class="fas fa-exclamation-triangle"></i> Já possuis este jogo.</div>` 
        : "";

    div.innerHTML = `
            <img src="${imgSrc}" alt="${jogo.titulo}">
            <div class="cart-item-info">
                <div class="plat-badge ${classPlat}"><i class="${iconPlat}"></i> ${jogo.platform || 'Outros'}</div>
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

  const btnFinalizar = document.getElementById("btn-finalizar");
  if (btnFinalizar) {
    if (itensCarrinho.length === 0 || temJogoPossuido) {
      btnFinalizar.disabled = true;
      if (temJogoPossuido) {
        btnFinalizar.innerText = "Remove Itens Duplicados";
      } else {
        btnFinalizar.innerText = "O Carrinho está Vazio";
      }
    } else {
      btnFinalizar.disabled = false;
      btnFinalizar.innerText = "Finalizar Compra";
    }
  }
}

// ==========================================
// AÇÕES DO UTILIZADOR
// ==========================================
async function removerDoCarrinho(idJogo) {
  try {
    const response = await fetch(`${BASE_API_URL}/carrinho`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuarioLogado.id, id_jogo: idJogo }),
    });

    if (!response.ok) throw new Error("Falha ao remover item.");

    mostrarNotificacao("Jogo removido do carrinho.", "sucesso");
    await carregarDadosCarrinho();
  } catch (error) {
    mostrarNotificacao("Erro ao remover o jogo.", "erro");
  }
}

async function finalizarCompra() {
  if (itensCarrinho.length === 0 || temJogoPossuido) return;

  const select = document.getElementById("coupon-select");
  const idCupom = select.value ? parseInt(select.value) : null;

  const btnFinalizar = document.getElementById("btn-finalizar");
  const originalText = btnFinalizar.innerText;
  btnFinalizar.innerText = "A Processar...";
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
      mostrarNotificacao(result.error || "Erro ao finalizar a compra.", "erro");
      btnFinalizar.innerText = originalText;
      btnFinalizar.disabled = false;
      return;
    }

    if (result.saldoRestante !== undefined) usuarioLogado.saldo = result.saldoRestante;
    if (result.pontosAtuais !== undefined) usuarioLogado.pontos = result.pontosAtuais;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    mostrarNotificacao("Compra efetuada com sucesso! Redirecionando para a sua biblioteca...", "sucesso");
    
    // Aguarda 2 segundos para o utilizador conseguir ler a notificação de sucesso e redireciona
    setTimeout(() => {
      window.location.href = "perfil.html";
    }, 2000);

  } catch (error) {
    mostrarNotificacao("Erro interno ao processar a compra.", "erro");
    btnFinalizar.innerText = originalText;
    btnFinalizar.disabled = false;
  }
}

window.onload = async () => {
  const autenticado = await verificarAutenticacao();
  if (autenticado) {
    carregarDadosCarrinho();
  }
};