const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";
let usuarioLogado = null;

// ==========================================
// SISTEMA DE NOTIFICAÇÕES (TOASTS)
// ==========================================
function mostrarNotificacao(mensagem, tipo = "sucesso") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  const icone =
    tipo === "sucesso" ? "fas fa-check-circle" : "fas fa-exclamation-circle";
  toast.innerHTML = `<i class="${icone}"></i> <span>${mensagem}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// INTERFACE E MENUS
// ==========================================
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("closed");
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-profile").forEach((btn) => {
    btn.classList.remove("active");
    btn.classList.add("inactive");
  });
  event.target.classList.add("active");
  event.target.classList.remove("inactive");
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));
  document.getElementById(`tab-${tabId}`).classList.add("active");
}

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

// ==========================================
// CORES E PERSONALIZAÇÃO
// ==========================================
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "42, 42, 239";
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Listener para exibir qual arquivo de FOTO foi selecionado
document.getElementById("edit-foto").addEventListener("change", function (e) {
  const label = document.getElementById("label-foto");
  const text = document.getElementById("text-foto");
  if (e.target.files.length > 0) {
    text.innerText = e.target.files[0].name;
    label.style.borderColor = "#00ff88"; // Feedback de sucesso visual
    label.style.color = "#00ff88";
  } else {
    text.innerText = "Nova Foto";
    label.style.borderColor = "var(--cor-tema)";
    label.style.color = "#fff";
  }
});

// Listener para exibir qual arquivo de BANNER foi selecionado
document.getElementById("edit-fundo").addEventListener("change", function (e) {
  const label = document.getElementById("label-fundo");
  const text = document.getElementById("text-fundo");
  if (e.target.files.length > 0) {
    text.innerText = e.target.files[0].name;
    label.style.borderColor = "#00ff88"; // Feedback de sucesso visual
    label.style.color = "#00ff88";
  } else {
    text.innerText = "Novo Banner";
    label.style.borderColor = "var(--cor-tema)";
    label.style.color = "#fff";
  }
});

// Listener para o input HEX mudar a cor da bolinha ao vivo
document.getElementById("edit-cor").addEventListener("input", (e) => {
  let val = e.target.value;
  if (val.length === 7 && val.startsWith("#")) {
    document.getElementById("color-preview").style.backgroundColor = val;
  }
});

// ==========================================
// CARREGAMENTO DE DADOS
// ==========================================
async function carregarDadosUsuario() {
  try {
    const response = await fetch(`${API_URL}/usuarios/${usuarioLogado.id}`);
    if (response.ok) {
      usuarioLogado = await response.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados:", error);
  }

  atualizarUIHeader(usuarioLogado);
  atualizarBadgeCarrinho();

  const corTema = usuarioLogado.cor_tema || getRandomColor();
  document.documentElement.style.setProperty("--cor-tema", corTema);
  document.documentElement.style.setProperty(
    "--cor-tema-rgb",
    hexToRgb(corTema),
  );

  const bannerElement = document.querySelector(".profile-header");
  const pageBackground = document.getElementById("page-background");

  if (usuarioLogado.fundo_perfil) {
    if (bannerElement)
      bannerElement.style.backgroundImage = `url('${usuarioLogado.fundo_perfil}')`;
    if (pageBackground)
      pageBackground.style.backgroundImage = `url('${usuarioLogado.fundo_perfil}')`;
  } else {
    if (bannerElement)
      bannerElement.style.background = `linear-gradient(135deg, #1a1a2e 0%, ${corTema}40 100%)`;
    if (pageBackground) pageBackground.style.backgroundImage = "none";
  }

  document.querySelectorAll(".profile-avatar").forEach((img) => {
    img.src = usuarioLogado.foto_perfil || "img/site_logo.png";
    img.style.borderColor = corTema;
  });

  document.getElementById("nome-usuario").innerText = usuarioLogado.nome;
  document.getElementById("email-usuario").innerHTML =
    `<i class="fas fa-envelope"></i> ${usuarioLogado.email}`;

  const bioEl = document.getElementById("bio-usuario");
  if (bioEl)
    bioEl.innerText =
      usuarioLogado.bio ||
      "Perfil sem bio. Vá em 'Minha Conta' para alterar!";

  document.getElementById("saldo-usuario").innerText = formatPrice(
    usuarioLogado.saldo,
  );
  document.getElementById("pontos-usuario").innerHTML =
    `${usuarioLogado.pontos} <i class="fas fa-star" style="font-size: 1.2rem;"></i>`;

  preencherFormularioEdicao();
}

function preencherFormularioEdicao() {
  document.getElementById("edit-nome").value = usuarioLogado.nome;
  document.getElementById("edit-email").value = usuarioLogado.email;
  document.getElementById("edit-bio").value = usuarioLogado.bio || "";

  const corVal = usuarioLogado.cor_tema || "#2a2aef";
  document.getElementById("edit-cor").value = corVal;
  document.getElementById("color-preview").style.backgroundColor = corVal;
}

// ==========================================
// SALVAMENTO E SEGURANÇA
// ==========================================
function confirmarSalvamento(event) {
  event.preventDefault();
  document.getElementById("password-confirm-modal").style.display = "flex";
}

function fecharModalSenha() {
  document.getElementById("password-confirm-modal").style.display = "none";
  document.getElementById("confirm-password-input").value = "";
}

async function validarEProcessarSalvamento() {
  const senhaAtual = document.getElementById("confirm-password-input").value;
  if (!senhaAtual)
    return mostrarNotificacao("Por favor, insira sua senha atual.", "erro");

  fecharModalSenha();
  await salvarEdicaoPerfil(senhaAtual);
}

async function salvarEdicaoPerfil(senhaAtual) {
  const btnSalvar = document.getElementById("btn-salvar-perfil");
  const originalText = btnSalvar.innerHTML;
  btnSalvar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Salvando...`;
  btnSalvar.disabled = true;

  const formData = new FormData();
  formData.append("nome", document.getElementById("edit-nome").value);
  formData.append("email", document.getElementById("edit-email").value);
  formData.append("senha", document.getElementById("edit-senha").value);
  formData.append("bio", document.getElementById("edit-bio").value);
  formData.append("cor_tema", document.getElementById("edit-cor").value);
  formData.append("senhaAtual", senhaAtual);

  const novaFoto = document.getElementById("edit-foto").files[0];
  const novoFundo = document.getElementById("edit-fundo").files[0];
  if (novaFoto) formData.append("foto_perfil", novaFoto);
  if (novoFundo) formData.append("fundo_perfil", novoFundo);

  try {
    const res = await fetch(`${API_URL}/usuarios/${usuarioLogado.id}/perfil`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar o perfil.");

    mostrarNotificacao("Perfil atualizado com sucesso!", "sucesso");
    document.getElementById("edit-senha").value = "";

    // Reseta o visual dos botões de arquivo
    document.getElementById("text-foto").innerText = "Nova Foto";
    document.getElementById("label-foto").style.borderColor = "var(--cor-tema)";
    document.getElementById("label-foto").style.color = "#fff";
    document.getElementById("edit-foto").value = "";

    document.getElementById("text-fundo").innerText = "Novo Banner";
    document.getElementById("label-fundo").style.borderColor =
      "var(--cor-tema)";
    document.getElementById("label-fundo").style.color = "#fff";
    document.getElementById("edit-fundo").value = "";

    await carregarDadosUsuario();
  } catch (error) {
    mostrarNotificacao(error.message, "erro");
  } finally {
    btnSalvar.innerHTML = originalText;
    btnSalvar.disabled = false;
  }
}

// ==========================================
// BIBLIOTECA E CUPONS
// ==========================================
async function carregarBiblioteca() {
  try {
    const response = await fetch(
      `${API_URL}/usuarios/${usuarioLogado.id}/biblioteca`,
    );
    if (!response.ok) throw new Error("Falha");
    const jogos = await response.json();
    const container = document.getElementById("biblioteca-container");
    container.innerHTML = "";
    if (jogos.length === 0) {
      container.innerHTML = "<p>Você não possui jogos.</p>";
      return;
    }

    jogos.forEach((game) => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.style.cursor = "pointer";
      card.onclick = () => abrirModalJogo(game);
      card.innerHTML = `
        <img src="${game.cover || "img/site_logo.png"}" style="width: 100%; border-radius: 8px;">
        <h3>${game.titulo}</h3>
        <p style="font-size: 0.8rem; color: #a5b1c2;">Adquirido em: ${new Date(game.data_compra).toLocaleDateString("pt-BR")}</p>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    document.getElementById("biblioteca-container").innerHTML =
      "<p>Erro ao carregar jogos.</p>";
  }
}

async function carregarCupons() {
  try {
    const response = await fetch(
      `${API_URL}/usuarios/${usuarioLogado.id}/cupons`,
    );
    if (!response.ok) throw new Error("Falha");
    const cupons = await response.json();
    const container = document.getElementById("cupons-container");
    container.innerHTML = "";
    if (cupons.length === 0) {
      container.innerHTML = "<p>Você não possui cupons.</p>";
      return;
    }

    cupons.forEach((cupom) => {
      const li = document.createElement("li");
      li.className = `coupon-item ${cupom.usado ? "usado" : ""}`;
      li.innerHTML = `
        <div><strong>${cupom.nome}</strong><p style="font-size: 0.9rem; color: #ccc;">Desconto</p></div>
        <div style="text-align: right;">
            <span style="display: block; font-size: 1.2rem; color: #fff; font-weight: bold;">- R$ ${cupom.desconto}</span>
            <span style="font-size: 0.8rem;">Status: ${cupom.usado ? "Usado" : "Disponível"}</span>
        </div>`;
      container.appendChild(li);
    });
  } catch (e) {
    document.getElementById("cupons-container").innerHTML =
      "<p>Erro ao carregar cupons.</p>";
  }
}

function fazerLogout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

function abrirModalJogo(game) {
  document.getElementById("modal-game-title").innerText = game.titulo;
  document.getElementById("modal-game-cover").src =
    game.cover || "img/site_logo.png";
  document.getElementById("modal-game-date").innerText = new Date(
    game.data_compra,
  ).toLocaleDateString("pt-BR");
  document.getElementById("modal-game-code").innerText =
    game.codigo_resgate || "Erro no código.";
  document.getElementById("library-modal").style.display = "flex";
}

// ==========================================
// FUNÇÃO PARA COPIAR CHAVE DE ATIVAÇÃO
// ==========================================
function copiarChaveAtivacao(btnElement) {
  const codigo = document.getElementById("modal-game-code").innerText;

  // Impede de copiar se o código não estiver renderizado corretamente
  if (!codigo || codigo.includes("Carregando") || codigo.includes("Erro")) {
    return mostrarNotificacao("Nenhum código válido para copiar.", "erro");
  }

  // API do navegador para copiar para a área de transferência
  navigator.clipboard
    .writeText(codigo)
    .then(() => {
      mostrarNotificacao(
        "Chave copiada para a área de transferência!",
        "sucesso",
      );

      // Feedback visual temporário no próprio botão
      const originalText = btnElement.innerHTML;
      const originalBg = btnElement.style.backgroundColor;

      btnElement.innerHTML = `<i class="fas fa-check-double"></i> Copiada!`;
      btnElement.style.backgroundColor = "#00ff88";
      btnElement.style.color = "#111";

      // Retorna o botão ao estado normal após 2 segundos
      setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.style.backgroundColor = originalBg;
        btnElement.style.color = "#fff";
      }, 2000);
    })
    .catch((err) => {
      console.error("Erro ao copiar: ", err);
      mostrarNotificacao("Erro ao tentar copiar a chave.", "erro");
    });
}

// Insira esta função em qualquer parte livre do seu perfil.js
function atualizarUIHeader(usuario) {
  const authContainer = document.getElementById("auth-container");
  if (!authContainer) return;

  const primeiroNome = usuario.nome.split(" ")[0];
  const fotoPerfil = usuario.foto_perfil || "img/site_logo.png";

  authContainer.innerHTML = `
    <div class="header-user-info">
      <a href="carrinho.html" class="header-cart-btn" title="Ver Carrinho">
        <div class="cart-icon-wrapper">
          <i class="fas fa-shopping-cart"></i>
          <span id="cart-badge" class="cart-badge hidden">0</span>
        </div>
        <span>Carrinho</span>
      </a>
      
      <a href="perfil.html" class="header-profile-badge">
        <img src="${fotoPerfil}" alt="Avatar" class="header-avatar" />
        <span>${primeiroNome}</span>
      </a>
      
      <button class="header-logout-btn" onclick="fazerLogout()" title="Sair da Conta">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  `;
}

// Função para buscar a quantidade de itens no carrinho e atualizar o indicador
async function atualizarBadgeCarrinho() {
  const badge = document.getElementById("cart-badge");
  if (!badge || !usuarioLogado) return;

  try {
    const response = await fetch(`${API_URL}/carrinho/${usuarioLogado.id}`);
    if (response.ok) {
      const itens = await response.json();
      if (itens.length > 0) {
        badge.innerText = itens.length;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar o badge do carrinho:", error);
  }
}

function fecharModalJogo() {
  document.getElementById("library-modal").style.display = "none";
}

window.onload = () => {
  if (verificarAutenticacao()) {
    carregarDadosUsuario();
    carregarBiblioteca();
    carregarCupons();
  }
};
