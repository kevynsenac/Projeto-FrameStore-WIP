const API_URL = "http://localhost:3000/api";
let adminUser = null;

// Verifica se tem permissão administrativa
function verificarPermissao() {
  const userStr = localStorage.getItem("usuarioLogado");
  if (!userStr) {
    window.location.href = "login.html";
    return false;
  }

  adminUser = JSON.parse(userStr);
  if (!adminUser.adm) {
    alert("Acesso negado. Privilégios insuficientes.");
    window.location.href = "perfil.html";
    return false;
  }
  return true;
}

// Configura Headers Padrão incluindo o ID de validação do Middleware
function getHeaders(isFormData = false) {
  // Envia o ID do usuário diretamente para o backend validar
  const headers = { 'x-user-id': adminUser.id };

  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
}

function switchAdminTab(tabName) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => pane.classList.remove("active"));

  event.currentTarget.classList.add("active");
  document.getElementById(`tab-${tabName}`).classList.add("active");

  if (tabName === "jogos") carregarJogos();
  if (tabName === "usuarios") carregarUsuarios();
  if (tabName === "cupons") carregarCupons();
}

// ==========================================
// MÓDULO: JOGOS
// ==========================================
async function carregarJogos() {
  try {
    const res = await fetch(`${API_URL}/jogos`);
    const jogos = await res.json();
    const tbody = document.getElementById("lista-jogos");
    tbody.innerHTML = "";

    jogos.forEach((j) => {
      tbody.innerHTML += `
                <tr>
                    <td>${j.id}</td>
                    <td>${j.titulo}</td>
                    <td>R$ ${j.preco}</td>
                    <td>${j.desconto ? j.desconto + "%" : "-"}</td>
                    <td><button class="btn-action btn-red" onclick="deletarJogo(${j.id})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
    });
  } catch (e) {
    console.error(e);
  }
}

async function salvarJogo(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append("titulo", document.getElementById("jogo-titulo").value);
  formData.append("preco", document.getElementById("jogo-preco").value);
  formData.append("desconto", document.getElementById("jogo-desconto").value);
  formData.append("platform", document.getElementById("jogo-platform").value);

  // Anexa as imagens LONGBLOB
  formData.append("cover", document.getElementById("jogo-cover").files[0]);
  if (document.getElementById("jogo-screen1").files[0])
    formData.append(
      "screenshot1",
      document.getElementById("jogo-screen1").files[0],
    );
  if (document.getElementById("jogo-screen2").files[0])
    formData.append(
      "screenshot2",
      document.getElementById("jogo-screen2").files[0],
    );
  if (document.getElementById("jogo-screen3").files[0])
    formData.append(
      "screenshot3",
      document.getElementById("jogo-screen3").files[0],
    );

  try {
    const res = await fetch(`${API_URL}/admin/jogos`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) throw new Error("Erro ao salvar");
    alert("Jogo salvo com sucesso!");
    document.getElementById("form-jogo").reset();
    carregarJogos();
  } catch (err) {
    alert(err.message);
  }
}

async function deletarJogo(id) {
  if (!confirm("Deletar este jogo permanentemente?")) return;
  try {
    await fetch(`${API_URL}/admin/jogos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    carregarJogos();
  } catch (err) {
    alert("Erro ao deletar");
  }
}

// ==========================================
// MÓDULO: USUÁRIOS
// ==========================================
async function carregarUsuarios() {
  try {
    const res = await fetch(`${API_URL}/admin/usuarios`, {
      headers: getHeaders(),
    });
    const usuarios = await res.json();
    const tbody = document.getElementById("lista-usuarios");
    tbody.innerHTML = "";

    usuarios.forEach((u) => {
      tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.nome} ${u.adm ? '<span style="color:red; font-size: 0.8rem; font-weight: bold; margin-left: 5px;">(Admin)</span>' : ""}</td>
                    <td>${u.email}</td>
                    <td><input type="number" id="saldo-${u.id}" value="${u.saldo}"></td>
                    <td><input type="number" id="pontos-${u.id}" value="${u.pontos}"></td>
                    <td><button class="btn-action btn-yellow" onclick="atualizarUsuario(${u.id})"><i class="fas fa-save"></i> Salvar</button></td>
                </tr>
            `;
    });
  } catch (e) {
    console.error(e);
  }
}

async function atualizarUsuario(id) {
  const saldo = document.getElementById(`saldo-${id}`).value;
  const pontos = document.getElementById(`pontos-${id}`).value;
  try {
    await fetch(`${API_URL}/admin/usuarios/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ saldo, pontos }),
    });
    alert("Dados do usuário atualizados.");
  } catch (err) {
    alert("Erro ao atualizar usuário.");
  }
}

// ==========================================
// MÓDULO: CUPONS
// ==========================================
async function carregarCupons() {
  try {
    const res = await fetch(`${API_URL}/cupons`);
    const cupons = await res.json();
    const tbody = document.getElementById("lista-cupons");
    tbody.innerHTML = "";

    cupons.forEach((c) => {
      tbody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.nome}</td>
                    <td>R$ ${c.desconto}</td>
                    <td>${c.custo_pontos}</td>
                    <td><button class="btn-action btn-red" onclick="deletarCupom(${c.id})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
    });
  } catch (e) {
    console.error(e);
  }
}

async function salvarCupom(e) {
  e.preventDefault();
  const data = {
    nome: document.getElementById("cupom-nome").value,
    tipo: document.getElementById("cupom-tipo").value,
    desconto: document.getElementById("cupom-desconto").value,
    custo_pontos: document.getElementById("cupom-custo").value,
  };
  try {
    await fetch(`${API_URL}/admin/cupons`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    alert("Cupom cadastrado!");
    document.getElementById("form-cupom").reset();
    carregarCupons();
  } catch (err) {
    alert("Erro ao cadastrar cupom.");
  }
}

async function deletarCupom(id) {
  if (!confirm("Deletar este cupom?")) return;
  try {
    await fetch(`${API_URL}/admin/cupons/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    carregarCupons();
  } catch (err) {
    alert("Erro ao deletar.");
  }
}

window.onload = () => {
  if (verificarPermissao()) carregarJogos();
};
