const BASE_API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

let usuarioLogado = null;

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

  // Atualiza UI com o cache primeiro para evitar "pulos"
  atualizarUIHeader(usuarioLogado);

  // Busca do DB para ter certeza de que pontos e saldo estão corretos
  try {
    const response = await fetch(
      `${BASE_API_URL}/usuarios/${usuarioLogado.id}`,
    );
    if (response.ok) {
      const usuarioAtualizado = await response.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
      usuarioLogado = usuarioAtualizado;
      atualizarUIHeader(usuarioAtualizado);
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados do usuário:", error);
  }

  // Atualiza também o contador do carrinho visualmente no header
  atualizarContadorCarrinho();

  return true;
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function atualizarUIHeader(usuario) {
  // Atualiza pontos do Banner e da Navbar
  document.getElementById("saldo-pontos").innerText = usuario.pontos || 0;

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

async function atualizarContadorCarrinho() {
  try {
    const response = await fetch(
      `${BASE_API_URL}/carrinho/${usuarioLogado.id}`,
    );
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
// RENDERIZAÇÃO DA LOJA E RESGATE
// ==========================================
async function carregarCuponsLoja() {
  const spinner = document.getElementById("loading-spinner");
  const content = document.getElementById("loja-content");

  // Ativa Loading
  if (spinner) spinner.style.display = "flex";
  if (content) content.style.display = "none";

  try {
    const response = await fetch(`${BASE_API_URL}/cupons`);
    if (!response.ok) throw new Error("Falha ao buscar cupons da loja.");

    const cupons = await response.json();
    const container = document.getElementById("cupons-loja-container");
    container.innerHTML = "";

    if (cupons.length === 0) {
      container.innerHTML =
        "<p style='grid-column: 1/-1; text-align: center;'>Nenhum cupom disponível na loja no momento.</p>";
    } else {
      cupons.forEach((cupom) => {
        const card = document.createElement("div");
        card.className = "coupon-card";

        const podeResgatar = usuarioLogado.pontos >= cupom.custo_pontos;
        const btnState = podeResgatar ? "" : "disabled";
        const btnText = podeResgatar
          ? "Resgatar Agora"
          : "Pontos Insuficientes";

        card.innerHTML = `
                  <div>
                      <h3>${cupom.nome}</h3>
                      <p style="color: #aaa;">${cupom.tipo}</p>
                      <div class="discount">- R$ ${parseFloat(cupom.desconto).toFixed(2)}</div>
                  </div>
                  <div>
                      <div class="cost"><i class="fas fa-star"></i> ${cupom.custo_pontos} pontos</div>
                      <button class="btn-redeem" ${btnState} onclick="resgatarCupom(${cupom.id}, ${cupom.custo_pontos})">${btnText}</button>
                  </div>
              `;
        container.appendChild(card);
      });
    }

    // Exibe Conteúdo após carregar
    if (content) content.style.display = "block";
  } catch (error) {
    console.error("Erro:", error);
    const container = document.getElementById("loja-content");
    if (container) {
      container.innerHTML =
        "<p style='text-align: center; color: white;'>Erro ao carregar os cupons da loja.</p>";
      container.style.display = "block";
    }
  } finally {
    // Desativa Loading
    if (spinner) spinner.style.display = "none";
  }
}

async function resgatarCupom(idCupom, custo) {
  if (usuarioLogado.pontos < custo) {
    alert("Você não tem pontos suficientes para este resgate.");
    return;
  }

  const confirmar = confirm(`Deseja resgatar este cupom por ${custo} pontos?`);
  if (!confirmar) return;

  try {
    const response = await fetch(`${BASE_API_URL}/cupons/resgatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: usuarioLogado.id,
        id_cupom: idCupom,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Erro ao resgatar o cupom.");
      return;
    }

    alert("Cupom resgatado com sucesso! Verifique sua carteira no Perfil.");

    // Atualiza apenas localmente para ser mais rápido (e já bate de frente no DB no próximo F5)
    usuarioLogado.pontos -= custo;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    atualizarUIHeader(usuarioLogado);
    carregarCuponsLoja(); // Recarrega para bloquear botões que o usuário não pode mais pagar
  } catch (error) {
    console.error("Erro no resgate:", error);
    alert("Erro interno ao processar o resgate.");
  }
}

window.onload = async () => {
  const autenticado = await verificarAutenticacao();
  if (autenticado) {
    carregarCuponsLoja();
  }
};
