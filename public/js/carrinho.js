const API_URL = "http://localhost:3000/api";
let usuarioLogado = null;
let itensCarrinho = [];
let cuponsDisponiveis = [];

function verificarAutenticacao() {
  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    window.location.href = "login.html";
    return false;
  }
  usuarioLogado = JSON.parse(userStr);
  return true;
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Carrega os itens salvos no banco de dados
async function carregarCarrinho() {
  try {
    const response = await fetch(`${API_URL}/carrinho/${usuarioLogado.id}`);
    if (!response.ok) throw new Error("Falha ao buscar itens do carrinho.");

    itensCarrinho = await response.json();
    renderizarCarrinho();
    calcularTotal();
  } catch (error) {
    console.error("Erro:", error);
    document.getElementById("cart-list").innerHTML =
      "<p>Erro ao carregar o carrinho.</p>";
  }
}

function renderizarCarrinho() {
  const container = document.getElementById("cart-list");
  container.innerHTML = "";

  if (itensCarrinho.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio.</p>";
    return;
  }

  itensCarrinho.forEach((jogo) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    const imgSrc = jogo.cover
      ? jogo.cover
      : "../templates/assets/cover/site_logo.png";

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

    div.innerHTML = `
            <img src="${imgSrc}" alt="${jogo.titulo}">
            <div class="cart-item-info">
                <h3>${jogo.titulo}</h3>
                ${precoHTML}
            </div>
            <button class="btn-remove" onclick="removerDoCarrinho(${jogo.id})"><i class="fas fa-trash"></i> Remover</button>
        `;
    container.appendChild(div);
  });
}

// Remove o jogo do carrinho do banco de dados e atualiza a tela
async function removerDoCarrinho(idJogo) {
  try {
    const response = await fetch(`${API_URL}/carrinho`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuarioLogado.id, id_jogo: idJogo }),
    });

    if (!response.ok) throw new Error("Falha ao remover item.");

    await carregarCarrinho();
  } catch (error) {
    console.error(error);
    alert("Erro ao remover o jogo do carrinho.");
  }
}

// Busca a carteira de cupons do usuário e exibe apenas os não utilizados
async function carregarCupons() {
  try {
    const response = await fetch(
      `${API_URL}/usuarios/${usuarioLogado.id}/cupons`,
    );
    if (!response.ok) throw new Error("Falha ao carregar cupons.");

    const todosCupons = await response.json();
    cuponsDisponiveis = todosCupons.filter((c) => !c.usado);

    const select = document.getElementById("coupon-select");
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

// Calcula o valor final considerando os descontos percentuais individuais de cada jogo e os fixos do cupom
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
}

// Realiza a transação, subtrai do saldo e distribui jogos
async function finalizarCompra() {
  if (itensCarrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const select = document.getElementById("coupon-select");
  const idCupom = select.value ? parseInt(select.value) : null;

  try {
    const response = await fetch(`${API_URL}/checkout`, {
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
      return;
    }

    // Atualiza a sessão local com os novos valores de saldo e pontos provenientes do DB
    usuarioLogado.saldo = result.saldoRestante;
    usuarioLogado.pontos = result.pontosAtuais;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    alert(
      "Compra realizada com sucesso! Os jogos foram adicionados à sua biblioteca.",
    );
    window.location.href = "perfil.html";
  } catch (error) {
    console.error("Erro no checkout:", error);
    alert("Erro interno ao processar a compra.");
  }
}

window.onload = () => {
  if (verificarAutenticacao()) {
    carregarCarrinho();
    carregarCupons();
  }
};
