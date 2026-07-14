const BASE_API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
let usuarioLogado = null;
let cartoesUsuario = [];
let idCartaoEditando = null;

window.onload = async () => {
  switchPagamentoTab('cartao');
  
  if (await verificarAutenticacao()) {
    carregarCartoes();
  }
};

async function verificarAutenticacao() {
  const userStr = localStorage.getItem("usuarioLogado");
  
  if (!userStr) {
    window.location.href = "login.html";
    return false;
  }
  
  usuarioLogado = JSON.parse(userStr);
  atualizarUIHeaderLocal();
  return true;
}

function atualizarUIHeaderLocal() {
  const navSaldo = document.getElementById("nav-saldo");
  const displaySaldoAtual = document.getElementById("display-saldo-atual");
  
  if (navSaldo) {
    navSaldo.innerText = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(usuarioLogado.saldo || 0);
  }
  
  if (displaySaldoAtual) {
    displaySaldoAtual.innerText = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(usuarioLogado.saldo || 0);
  }
}

function switchPagamentoTab(metodo) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  const tabAtiva = document.getElementById(`tab-${metodo}`);
  if (tabAtiva) tabAtiva.style.display = 'block';
  
  const btnAtivo = document.querySelector(`.tab-btn[onclick="switchPagamentoTab('${metodo}')"]`);
  if (btnAtivo) btnAtivo.classList.add('active');
}

function abrirModalCartao() {
  document.getElementById("modal-novo-cartao").style.display = "flex";
}

function fecharModalCartao() {
  document.getElementById("modal-novo-cartao").style.display = "none";
  document.getElementById("form-novo-cartao").reset();
  
  idCartaoEditando = null;
  
  document.getElementById("novo-cartao-numero").disabled = false;
  document.getElementById("novo-cartao-cvv").disabled = false;
  document.getElementById("novo-cartao-bandeira").disabled = false;
  
  const dica = document.getElementById("label-bloqueado");
  if (dica) dica.style.display = "none";

  document.querySelector(".modal-content h2").innerText = "Cadastrar Novo Cartão";
}

function formatarVencimento(input) {
  let value = input.value.replace(/\D/g, "");
  
  if (value.length > 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  
  input.value = value;
}

async function carregarCartoes() {
  try {
    const response = await fetch(`${BASE_API_URL}/usuarios/${usuarioLogado.id}/cartoes`);
    
    if (response.ok) {
      cartoesUsuario = await response.json();
      renderizarCartoes();
    }
  } catch (error) {
    console.error("Erro ao carregar cartões.");
  }
}

function renderizarCartoes() {
  const container = document.getElementById("lista-cartoes");
  container.innerHTML = "";

  const selectCartao = document.getElementById("select-cartao");
  selectCartao.innerHTML = '<option value="">Selecione um cartão</option>';

  if (cartoesUsuario.length === 0) {
    container.innerHTML = "<p>Nenhum cartão cadastrado.</p>";
    return;
  }

  cartoesUsuario.forEach(cartao => {
    let icon = (cartao.bandeira === "visa") ? "fa-brands fa-cc-visa" : 
               (cartao.bandeira === "mastercard") ? "fa-brands fa-cc-mastercard" : "fas fa-credit-card";

    const div = document.createElement("div");
    div.className = "card-item";
    
    div.innerHTML = `
      <div class="card-icon"><i class="${icon}"></i></div>
      <div class="card-info">
        <strong>${cartao.numero_mascarado}</strong>
        <p>${cartao.nome_titular} • Válido: ${cartao.vencimento}</p>
        <small style="color:#00ff88;">Limite: R$ ${cartao.saldo_cartao}</small>
      </div>
      <div class="card-actions">
        <button class="btn-icon" onclick="prepararEdicao(${cartao.id})" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn-icon delete" onclick="removerCartao(${cartao.id})" title="Remover"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    
    container.appendChild(div);

    const option = document.createElement("option");
    option.value = cartao.id;
    option.textContent = `${cartao.numero_mascarado} (Saldo: R$ ${cartao.saldo_cartao})`;
    selectCartao.appendChild(option);
  });
}

function prepararEdicao(idCartao) {
  const cartao = cartoesUsuario.find(c => c.id === idCartao);
  if (!cartao) return;

  idCartaoEditando = idCartao;
  
  document.getElementById("novo-cartao-nome").value = cartao.nome_titular;
  document.getElementById("novo-cartao-vencimento").value = cartao.vencimento;
  
  const camposBloqueados = ["novo-cartao-numero", "novo-cartao-cvv", "novo-cartao-bandeira"];
  camposBloqueados.forEach(id => {
    document.getElementById(id).disabled = true;
  });

  const dica = document.getElementById("label-bloqueado");
  if (dica) dica.style.display = "inline";

  document.querySelector(".modal-content h2").innerText = "Editar Cartão";
  abrirModalCartao();
}

async function cadastrarCartao(event) {
  event.preventDefault();

  const numero = document.getElementById("novo-cartao-numero").value.replace(/\s/g, '');
  const nome = document.getElementById("novo-cartao-nome").value;
  const vencimento = document.getElementById("novo-cartao-vencimento").value;
  const cvv = document.getElementById("novo-cartao-cvv").value;
  const bandeira = document.getElementById("novo-cartao-bandeira").value;

  const btn = document.getElementById("btn-salvar-cartao");
  btn.disabled = true;
  btn.innerText = idCartaoEditando ? "Atualizando..." : "Salvando...";

  try {
    let response;
    
    if (idCartaoEditando) {
      response = await fetch(`${BASE_API_URL}/cartoes/${idCartaoEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_titular: nome, vencimento })
      });
    } else {
      if (numero.length < 13) throw new Error("Número de cartão inválido.");
      if (vencimento.length < 5) throw new Error("Vencimento inválido.");
      if (cvv.length < 3) throw new Error("CVV inválido.");
      if (!bandeira) throw new Error("Selecione uma bandeira.");

      response = await fetch(`${BASE_API_URL}/cartoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuarioLogado.id, numero, nome_titular: nome, vencimento, cvv, bandeira })
      });
    }

    if (!response.ok) throw new Error("Erro na comunicação com o servidor.");

    mostrarNotificacao(idCartaoEditando ? "Cartão atualizado!" : "Cartão adicionado!", "sucesso");
    
    fecharModalCartao();
    await carregarCartoes();
  } catch (error) {
    mostrarNotificacao(error.message || "Erro ao salvar cartão.", "erro");
  } finally {
    btn.disabled = false;
    btn.innerText = "Confirmar e Salvar";
    idCartaoEditando = null;
    
    document.getElementById("novo-cartao-numero").disabled = false;
    document.getElementById("novo-cartao-cvv").disabled = false;
    document.getElementById("novo-cartao-bandeira").disabled = false;
  }
}

async function removerCartao(idCartao) {
  if (!confirm("Tem certeza que deseja remover este cartão?")) return;

  try {
    const res = await fetch(`${BASE_API_URL}/cartoes/${idCartao}`, { method: 'DELETE' });
    
    if (res.ok) {
      mostrarNotificacao("Cartão removido!", "sucesso");
      await carregarCartoes();
    } else {
      mostrarNotificacao("Erro ao remover.", "erro");
    }
  } catch (error) {
    mostrarNotificacao("Erro de conexão.", "erro");
  }
}

function gerarPix() {
  const valorInput = document.getElementById("valor-pix").value;
  
  if (!valorInput || valorInput <= 0) {
    return mostrarNotificacao("Insira um valor válido.", "erro");
  }

  const qrcodeContainer = document.getElementById("pix-qrcode-container");
  qrcodeContainer.style.display = "block";

  const pixCode = "00020126580014br.gov.bcb.pix0136pagamento-didatico-" + Math.floor(Math.random() * 1000000);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}&color=00ff88&bgcolor=0f0f1e`;

  qrcodeContainer.innerHTML = `
    <img src="${qrUrl}" alt="PIX QR Code" style="width: 200px; border-radius: 10px; border: 2px solid #00ff88;">
    <p style="margin-top: 15px; color: #a5b1c2;">Código PIX Copia e Cola:</p>
    <code id="pix-code-text" style="background: #080811; padding: 12px; display: block; border-radius: 6px; word-break: break-all; color: #00ff88; margin-bottom: 15px;">${pixCode}</code>
    <button class="btn-action btn-secondary" onclick="copiarTexto('pix-code-text')">
      <i class="fas fa-copy"></i> Copiar Código PIX
    </button>
  `;
}

function gerarBoleto() {
  const valorInput = document.getElementById("valor-boleto").value;
  
  if (!valorInput || valorInput <= 0) {
    return mostrarNotificacao("Insira um valor válido.", "erro");
  }

  const boletoContainer = document.getElementById("boleto-container");
  boletoContainer.style.display = "block";
  
  const numBoleto = Array.from({length: 47}, () => Math.floor(Math.random() * 10)).join('');
  const numFormatado = `${numBoleto.slice(0,5)}.${numBoleto.slice(5,10)} ${numBoleto.slice(10,15)}.${numBoleto.slice(15,21)} ${numBoleto.slice(21,26)}.${numBoleto.slice(26,32)} ${numBoleto.slice(32,33)} ${numBoleto.slice(33)}`;
  
  boletoContainer.innerHTML = `
    <div style="background: #fff; color: #000; padding: 20px; border-radius: 5px; font-family: monospace; font-size: 1.2rem; margin-bottom: 15px;">
      <p style="margin-bottom: 10px;"><strong>BANCO DIDÁTICO</strong></p>
      <p id="boleto-code-text">${numFormatado}</p>
    </div>
    <button class="btn-action btn-secondary" onclick="copiarTexto('boleto-code-text')">
      <i class="fas fa-copy"></i> Copiar Código de Barras
    </button>
  `;
}

function pagarComCartao() {
  const valor = document.getElementById("valor-cartao").value;
  const idCartao = document.getElementById("select-cartao").value;
  const cvv = document.getElementById("cvv-confirmacao").value;

  if (!valor || valor <= 0) return mostrarNotificacao("Insira um valor válido.", "erro");
  if (!idCartao) return mostrarNotificacao("Selecione um cartão.", "erro");
  if (cvv.length < 3) return mostrarNotificacao("Insira um CVV válido para confirmar a compra.", "erro");

  processarAdicaoSaldo('cartao', valor, idCartao);
}

async function processarAdicaoSaldo(metodo, valor, idCartao = null) {
  try {
    const res = await fetch(`${BASE_API_URL}/usuarios/adicionar-saldo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: usuarioLogado.id,
        valor: parseFloat(valor),
        metodo: metodo,
        id_cartao: idCartao
      })
    });

    const data = await res.json();

    if (res.ok) {
      mostrarNotificacao(data.message, "sucesso");
      usuarioLogado.saldo = data.novoSaldo;
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
      atualizarUIHeaderLocal();
      
      if (metodo === 'cartao') {
        await carregarCartoes();
        document.getElementById("cvv-confirmacao").value = "";
      }
      
      document.getElementById("valor-cartao").value = "";
    } else {
      mostrarNotificacao(data.error || "Erro ao processar saldo.", "erro");
    }
  } catch (error) {
    mostrarNotificacao("Erro de conexão.", "erro");
  }
}

function copiarTexto(elementId) {
  const texto = document.getElementById(elementId).innerText;
  
  navigator.clipboard.writeText(texto).then(() => {
    mostrarNotificacao("Código copiado com sucesso!", "sucesso");
  }).catch(() => {
    mostrarNotificacao("Erro ao tentar copiar.", "erro");
  });
}

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
  
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}