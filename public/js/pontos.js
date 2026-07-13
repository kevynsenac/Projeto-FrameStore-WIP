const BASE_API_URL = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api";

let usuarioLogado = null;
let idsMeusCupons = [];
let cuponsInterval; // Variável global para armazenar o relógio dos cupons

// ==========================================
// CONFIGURAÇÃO DA ROLETA (CANVAS)
// ==========================================
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// 10 Segmentos intercalados refletindo as probabilidades do Back-end
// 10% (1 fatia 250) | 20% (2 fatias 100) | 30% (3 fatias 50) | 40% (4 fatias 0)
const segments = [
  { points: 250, color: "#feca57", label: "250" },
  { points: 0,   color: "#444466", label: "0" },
  { points: 50,  color: "#2a2aef", label: "50" },
  { points: 100, color: "#00ff88", label: "100" },
  { points: 0,   color: "#444466", label: "0" },
  { points: 50,  color: "#2a2aef", label: "50" },
  { points: 0,   color: "#444466", label: "0" },
  { points: 100, color: "#00ff88", label: "100" },
  { points: 50,  color: "#2a2aef", label: "50" },
  { points: 0,   color: "#444466", label: "0" }
];

let currentRotation = 0;
let isSpinning = false;
let countdownInterval;

function drawWheel(rotation = 0) {
  if (!ctx) return;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140;
  const sliceAngle = (Math.PI * 2) / segments.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentAngle = rotation;

  segments.forEach((segment) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle + sliceAngle / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = segment.points === 0 ? "#fff" : "#111"; 
    ctx.font = "bold 18px Inter"; 
    ctx.fillText(segment.label, radius * 0.72, 0); 
    ctx.restore();

    currentAngle += sliceAngle;
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a2e";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#333355";
  ctx.fill();
}

// ==========================================
// AUTENTICAÇÃO E RELÓGIO DA ROLETA
// ==========================================
async function verificarAutenticacao() {
  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    window.location.href = "login.html";
    return false;
  }
  usuarioLogado = JSON.parse(userStr);
  atualizarUIHeader(usuarioLogado);
  verificarStatusRoleta();

  try {
    const response = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}`);
    if (response.ok) {
      usuarioLogado = await response.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
      atualizarUIHeader(usuarioLogado);
      verificarStatusRoleta(); 
    }
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error);
  }

  atualizarContadorCarrinho();
  return true;
}

function atualizarUIHeader(usuario) {
  const navPontos = document.getElementById("nav-pontos");
  const navSaldo = document.getElementById("nav-saldo");
  const saldoPainel = document.getElementById("saldo-pontos");
  const authContainer = document.getElementById("auth-container");

  if (navPontos) navPontos.innerText = usuario.pontos || 0;
  if (saldoPainel) saldoPainel.innerText = usuario.pontos || 0;
  
  const saldoFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(usuario.saldo || 0);
  if (navSaldo) navSaldo.innerText = saldoFormatado;

  if (authContainer) {
    const primeiroNome = usuario.nome.split(" ")[0];
    authContainer.innerHTML = `<a href="perfil.html" class="profile-badge"><i class="fas fa-user-circle"></i> <span>${primeiroNome}</span></a>`;
  }
}

async function atualizarContadorCarrinho() {
  try {
    const response = await fetch(`${BASE_API_URL}/carrinho/${usuarioLogado.id}`);
    if (response.ok) {
      const itens = await response.json();
      const cartCount = document.getElementById("cart-count");
      if (cartCount) {
        cartCount.innerText = itens.length;
        cartCount.style.display = itens.length > 0 ? "flex" : "none";
      }
    }
  } catch (e) {}
}

function verificarStatusRoleta() {
  if (!usuarioLogado.ultima_roleta) return;

  const dataServidorStr = new Date().toISOString().split('T')[0];
  const ultimaRoletaStr = new Date(usuarioLogado.ultima_roleta).toISOString().split('T')[0];

  if (dataServidorStr === ultimaRoletaStr) {
    iniciarContador();
  }
}

function iniciarContador() {
  const btnGirar = document.getElementById("btn-girar");
  const countdownBox = document.getElementById("countdown-container");
  const timerText = document.getElementById("countdown-timer");

  btnGirar.disabled = true;
  btnGirar.innerText = "VOLTE AMANHÃ";
  countdownBox.style.display = "inline-block";

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const diff = tomorrow - now;

    if (diff <= 0) {
      clearInterval(countdownInterval);
      btnGirar.disabled = false;
      btnGirar.innerText = "GIRAR ROLETA";
      countdownBox.style.display = "none";
    } else {
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      timerText.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
  }, 1000);
}

// ==========================================
// LÓGICA DE GIRO
// ==========================================
async function iniciarGiroRoleta() {
  if (isSpinning) return;
  
  const btnGirar = document.getElementById("btn-girar");
  btnGirar.disabled = true;
  btnGirar.innerText = "GIRANDO...";
  isSpinning = true;

  try {
    const response = await fetch(`${BASE_API_URL}/roleta/girar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuarioLogado.id }),
    });
    
    const result = await response.json();

    if (!response.ok) {
      mostrarModal("Roleta Bloqueada", result.error);
      isSpinning = false;
      iniciarContador(); 
      return;
    }

    const winningIndices = [];
    segments.forEach((s, index) => {
      if (s.points === result.pontosGanhos) winningIndices.push(index);
    });
    
    const winningIndex = winningIndices[Math.floor(Math.random() * winningIndices.length)];
    const sliceAngle = (Math.PI * 2) / segments.length;
    const targetAngle = (winningIndex * sliceAngle) + (sliceAngle / 2);
    
    const extraSpins = 5 * Math.PI * 2;
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.6); 
    const finalRotation = currentRotation + extraSpins + ((3 * Math.PI / 2) - targetAngle) + randomOffset;

    const startTime = Date.now();
    const duration = 4000; 
    const startRotation = currentRotation;

    function animateWheel() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      currentRotation = startRotation + ((finalRotation - startRotation) * easeProgress);
      drawWheel(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animateWheel);
      } else {
        finalizarGiro(result);
      }
    }
    animateWheel();

  } catch (error) {
    mostrarModal("Erro", "Falha de conexão com o servidor. Tente novamente.");
    btnGirar.disabled = false;
    btnGirar.innerText = "GIRAR ROLETA";
    isSpinning = false;
  }
}

function finalizarGiro(result) {
  isSpinning = false;
  usuarioLogado.ultima_roleta = new Date().toISOString(); 
  
  const titulo = result.pontosGanhos > 0 ? "Sorte Grande!" : "Que pena!";
  mostrarModal(titulo, result.message);

  if (result.pontosGanhos > 0) {
    usuarioLogado.pontos += result.pontosGanhos;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    atualizarUIHeader(usuarioLogado);
    carregarCuponsLoja(); 
  }
  
  iniciarContador(); 
}

// ==========================================
// LOJA DE CUPONS COM CONTAGEM REGRESSIVA
// ==========================================
async function carregarCuponsLoja() {
  const spinner = document.getElementById("loading-spinner");
  const content = document.getElementById("loja-content");

  if (spinner) spinner.style.display = "flex";
  if (content) content.style.display = "none";

  try {
    const resMeusCupons = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}/cupons`);
    if(resMeusCupons.ok) {
      const meusCupons = await resMeusCupons.json();
      idsMeusCupons = meusCupons.map((c) => c.id_cupom || c.id);
    }

    const response = await fetch(`${BASE_API_URL}/cupons`);
    const cupons = await response.json();
    const container = document.getElementById("cupons-loja-container");
    container.innerHTML = "";

    const cuponsAtivos = []; // Array que alimentará nosso relógio ao vivo

    cupons.forEach((cupom) => {
      const card = document.createElement("div");
      
      // 1. Tratamento de Datas
      const dataExpiracao = new Date(cupom.data_expiracao);
      const dataAtual = new Date();
      const expirado = dataExpiracao < dataAtual;

      // 2. Aplicamos a classe "expirado" caso tenha passado do prazo
      card.className = expirado ? "coupon-card expirado" : "coupon-card";
      
      const jaPossui = idsMeusCupons.includes(cupom.id);
      const saldoSuficiente = usuarioLogado.pontos >= cupom.custo_pontos;
      
      let btnState = "";
      let btnText = "Resgatar Agora";

      // Lógica de Travar o Botão
      if (expirado) {
        btnState = "disabled";
        btnText = "Expirado";
      } else if (jaPossui) {
        btnState = "disabled";
        btnText = "Já Resgatou";
      } else if (!saldoSuficiente) {
        btnState = "disabled";
        btnText = "Pontos Insuficientes";
      }

      // Formata a data de validade para o layout BR (Ex: 31/12/2026 às 23:59)
      const validadeBR = dataExpiracao.toLocaleDateString("pt-BR", { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });

      const timerId = `timer-cupom-${cupom.id}`;
      if (!expirado) {
        cuponsAtivos.push({ id: timerId, tempoFinal: dataExpiracao.getTime() });
      }

      card.innerHTML = `
          <div>
              <h3>${cupom.nome}</h3>
              <p style="color: #a5b1c2; font-size: 0.9rem; margin-top: 5px;">Válido até: ${validadeBR}</p>
              
              <p class="coupon-timer" id="${timerId}">
                ${expirado ? '<i class="fas fa-times-circle"></i> Encerrado' : '<i class="fas fa-clock"></i> Calculando...'}
              </p>
              
              <div class="discount">- R$ ${parseFloat(cupom.desconto).toFixed(2)}</div>
          </div>
          <div>
              <div class="cost"><i class="fas fa-star"></i> ${cupom.custo_pontos} pontos</div>
              <button class="btn-redeem" ${btnState} onclick="confirmarResgate(${cupom.id}, ${cupom.custo_pontos}, '${cupom.nome}')">${btnText}</button>
          </div>
      `;
      container.appendChild(card);
    });

    // Inicia o contador global da loja de cupons
    iniciarContadoresLoja(cuponsAtivos);

    if (content) content.style.display = "block";
  } catch (error) {
    console.error("Erro na Loja:", error);
  } finally {
    if (spinner) spinner.style.display = "none";
  }
}

// Relógio dinâmico que atualiza todos os cards ativos a cada 1 segundo
function iniciarContadoresLoja(cupons) {
  clearInterval(cuponsInterval);
  
  cuponsInterval = setInterval(() => {
    const agora = new Date().getTime();
    
    cupons.forEach(c => {
      const el = document.getElementById(c.id);
      if (!el) return;

      const tempoRestante = c.tempoFinal - agora;
      
      if (tempoRestante < 0) {
        el.innerHTML = '<i class="fas fa-times-circle"></i> Expirou agora!';
        el.style.color = "#ff4757";
      } else {
        const dias = Math.floor(tempoRestante / (1000 * 60 * 60 * 24));
        const horas = Math.floor((tempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);

        if (dias > 0) {
          el.innerHTML = `<i class="fas fa-clock"></i> Expira em: ${dias}d ${horas}h ${minutos}m`;
          el.style.color = "#00ff88"; // Verde se estiver seguro
        } else {
          el.innerHTML = `<i class="fas fa-stopwatch"></i> Expira em: ${horas}h ${minutos}m ${segundos}s`;
          el.style.color = "#ffaa00"; // Fica amarelo/laranja quando falta menos de 24h
        }
      }
    });
  }, 1000);
}

function confirmarResgate(idCupom, custo, nomeCupom) {
  mostrarModal(
    "Confirmar Resgate",
    `Deseja gastar ${custo} pontos para resgatar o cupom "${nomeCupom}"?`,
    true,
    () => processarResgate(idCupom, custo)
  );
}

async function processarResgate(idCupom, custo) {
  try {
    const response = await fetch(`${BASE_API_URL}/cupons/resgatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuarioLogado.id, id_cupom: idCupom }),
    });
    const result = await response.json();

    if (!response.ok) {
      mostrarModal("Erro no Resgate", result.error);
      return;
    }

    mostrarModal("Sucesso!", "Cupom resgatado! Você pode ativar o cupom quando quiser na hora de comprar seu carrinho.");
    usuarioLogado.pontos -= custo;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    atualizarUIHeader(usuarioLogado);
    carregarCuponsLoja(); 
  } catch (error) {
    mostrarModal("Erro", "Falha de conexão com o servidor.");
  }
}

// ==========================================
// MODAL PERSONALIZADO
// ==========================================
function mostrarModal(titulo, mensagem, isConfirmacao = false, acaoConfirmar = null) {
  document.getElementById("modal-title").innerText = titulo;
  document.getElementById("modal-msg").innerText = mensagem;
  const actionsDiv = document.getElementById("modal-actions");
  actionsDiv.innerHTML = "";

  if (isConfirmacao) {
    const btnCancel = document.createElement("button");
    btnCancel.className = "btn-modal btn-cancel";
    btnCancel.innerText = "Cancelar";
    btnCancel.onclick = fecharModal;

    const btnConfirm = document.createElement("button");
    btnConfirm.className = "btn-modal btn-confirm";
    btnConfirm.innerText = "Confirmar";
    btnConfirm.onclick = () => { fecharModal(); if (acaoConfirmar) acaoConfirmar(); };

    actionsDiv.append(btnCancel, btnConfirm);
  } else {
    const btnOk = document.createElement("button");
    btnOk.className = "btn-modal btn-confirm";
    btnOk.innerText = "Entendi";
    btnOk.onclick = fecharModal;
    actionsDiv.appendChild(btnOk);
  }
  document.getElementById("custom-modal").style.display = "flex";
}
function fecharModal() { document.getElementById("custom-modal").style.display = "none"; }

// Inicialização
window.onload = async () => {
  drawWheel(); 
  if (await verificarAutenticacao()) {
    carregarCuponsLoja();
  }
};