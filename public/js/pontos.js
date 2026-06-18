const API_URL = "http://localhost:3000/api";
let usuarioLogado = null;

function verificarAutenticacao() {
  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    window.location.href = "login.html";
    return false;
  }
  usuarioLogado = JSON.parse(userStr);
  return true;
}

function atualizarDisplayPontos() {
  document.getElementById("saldo-pontos").innerText = usuarioLogado.pontos;
  document.getElementById("nav-pontos").innerText = usuarioLogado.pontos;
}

async function carregarCuponsLoja() {
  try {
    const response = await fetch(`${API_URL}/cupons`);
    if (!response.ok) throw new Error("Falha ao buscar cupons da loja.");

    const cupons = await response.json();
    const container = document.getElementById("cupons-loja-container");
    container.innerHTML = "";

    if (cupons.length === 0) {
      container.innerHTML =
        "<p>Nenhum cupom disponível na loja no momento.</p>";
      return;
    }

    cupons.forEach((cupom) => {
      const card = document.createElement("div");
      card.className = "coupon-card";

      const podeResgatar = usuarioLogado.pontos >= cupom.custo_pontos;
      const btnState = podeResgatar ? "" : "disabled";
      const btnText = podeResgatar ? "Resgatar" : "Pontos Insuficientes";

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
  } catch (error) {
    console.error("Erro:", error);
    document.getElementById("cupons-loja-container").innerHTML =
      "<p>Erro ao carregar os cupons.</p>";
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
    const response = await fetch(`${API_URL}/cupons/resgatar`, {
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

    // Deduz os pontos localmente para evitar recarga de página/nova query
    usuarioLogado.pontos -= custo;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    atualizarDisplayPontos();
    carregarCuponsLoja(); // Recarrega para atualizar os botões (estado disabled)
  } catch (error) {
    console.error("Erro no resgate:", error);
    alert("Erro interno ao processar o resgate.");
  }
}

window.onload = () => {
  if (verificarAutenticacao()) {
    atualizarDisplayPontos();
    carregarCuponsLoja();
  }
};
