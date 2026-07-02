const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

let adminUser = null;
let todosJogosAdmin = []; // Armazena em cache para facilitar a edição
let todosCuponsAdmin = [];
let todosUsuariosAdmin = []; // Cache para usuários adicionado

// ==========================================
// AUTENTICAÇÃO E PERMISSÃO
// ==========================================
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

// Configura Headers Padrão (incluindo o ID de validação do Middleware)
function getHeaders(isFormData = false) {
  const headers = { "x-user-id": adminUser.id };
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
}

// ==========================================
// CONTROLE DE ABAS
// ==========================================
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
// FUNÇÕES DE LOADING
// ==========================================
function setCarregando(tabName, isLoading) {
  const spinner = document.getElementById(`loading-${tabName}`);
  const container = document.getElementById(`table-${tabName}-container`);

  if (isLoading) {
    if (spinner) spinner.style.display = "flex";
    if (container) container.style.display = "none";
  } else {
    if (spinner) spinner.style.display = "none";
    if (container) container.style.display = "block";
  }
}

// ==========================================
// MÓDULO: JOGOS
// ==========================================
async function carregarJogos() {
  setCarregando("jogos", true);
  try {
    const res = await fetch(`${API_URL}/jogos`);
    todosJogosAdmin = await res.json();

    const tbody = document.getElementById("lista-jogos");
    tbody.innerHTML = "";

    if (todosJogosAdmin.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum jogo cadastrado.</td></tr>`;
      return;
    }

    todosJogosAdmin.forEach((j) => {
      tbody.innerHTML += `
        <tr>
            <td>${j.id}</td>
            <td><strong>${j.titulo}</strong></td>
            <td>${j.platform || "-"}</td>
            <td style="color: #00ff88; font-weight: bold;">R$ ${j.preco}</td>
            <td>${j.desconto ? j.desconto + "%" : "-"}</td>
            <td class="td-actions">
                <button class="btn-small btn-edit" onclick="abrirModalEditJogo(${j.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-small btn-del" onclick="deletarJogo(${j.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
      `;
    });
  } catch (e) {
    console.error(e);
    document.getElementById("lista-jogos").innerHTML =
      `<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar jogos.</td></tr>`;
  } finally {
    setCarregando("jogos", false);
  }
}

async function salvarJogo(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append("titulo", document.getElementById("jogo-titulo").value);
  formData.append("preco", document.getElementById("jogo-preco").value);
  formData.append("desconto", document.getElementById("jogo-desconto").value);
  formData.append("platform", document.getElementById("jogo-platform").value);

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
    if (!res.ok) throw new Error("Erro ao salvar o jogo.");

    alert("Jogo salvo com sucesso!");
    document.getElementById("form-jogo").reset();
    carregarJogos();
  } catch (err) {
    alert(err.message);
  }
}

async function deletarJogo(id) {
  if (!confirm("Tem certeza que deseja deletar este jogo permanentemente?"))
    return;
  try {
    const res = await fetch(`${API_URL}/admin/jogos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao deletar.");
    carregarJogos();
  } catch (err) {
    alert(err.message);
  }
}

// EDIÇÃO DE JOGOS
function abrirModalEditJogo(id) {
  const jogo = todosJogosAdmin.find((j) => j.id === id);
  if (!jogo) return;

  document.getElementById("edit-jogo-id").value = jogo.id;
  document.getElementById("edit-jogo-titulo").value = jogo.titulo;
  document.getElementById("edit-jogo-preco").value = jogo.preco;
  document.getElementById("edit-jogo-desconto").value = jogo.desconto || "";
  document.getElementById("edit-jogo-platform").value = jogo.platform || "";

  document.getElementById("modal-edit-jogo").style.display = "flex";
}

function fecharModalEditJogo() {
  document.getElementById("modal-edit-jogo").style.display = "none";
  document.getElementById("form-edit-jogo").reset();
}

async function submitEditJogo(e) {
  e.preventDefault();
  const id = document.getElementById("edit-jogo-id").value;
  const formData = new FormData();

  formData.append("titulo", document.getElementById("edit-jogo-titulo").value);
  formData.append("preco", document.getElementById("edit-jogo-preco").value);
  formData.append(
    "desconto",
    document.getElementById("edit-jogo-desconto").value,
  );
  formData.append(
    "platform",
    document.getElementById("edit-jogo-platform").value,
  );

  // Apenas anexa imagens se o admin selecionou alguma nova
  if (document.getElementById("edit-jogo-cover").files[0])
    formData.append(
      "cover",
      document.getElementById("edit-jogo-cover").files[0],
    );
  if (document.getElementById("edit-jogo-screen1").files[0])
    formData.append(
      "screenshot1",
      document.getElementById("edit-jogo-screen1").files[0],
    );
  if (document.getElementById("edit-jogo-screen2").files[0])
    formData.append(
      "screenshot2",
      document.getElementById("edit-jogo-screen2").files[0],
    );
  if (document.getElementById("edit-jogo-screen3").files[0])
    formData.append(
      "screenshot3",
      document.getElementById("edit-jogo-screen3").files[0],
    );

  try {
    const res = await fetch(`${API_URL}/admin/jogos/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) throw new Error("Erro ao atualizar o jogo.");

    alert("Jogo atualizado com sucesso!");
    fecharModalEditJogo();
    carregarJogos();
  } catch (err) {
    alert(err.message);
  }
}

// ==========================================
// MÓDULO: USUÁRIOS
// ==========================================
async function carregarUsuarios() {
  setCarregando("usuarios", true);
  try {
    const res = await fetch(`${API_URL}/admin/usuarios`, {
      headers: getHeaders(),
    });
    todosUsuariosAdmin = await res.json();
    
    const tbody = document.getElementById("lista-usuarios");
    tbody.innerHTML = "";

    if (todosUsuariosAdmin.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum usuário cadastrado.</td></tr>`;
      return;
    }

    todosUsuariosAdmin.forEach((u) => {
      tbody.innerHTML += `
        <tr>
            <td>${u.id}</td>
            <td><strong>${u.nome}</strong> ${u.adm ? '<span style="color:#ff4757; font-size: 0.8rem; font-weight: bold; margin-left: 5px;">(Admin)</span>' : ""}</td>
            <td>${u.email}</td>
            <td style="color: #a5b1c2; font-size: 0.9rem;">${u.senha || "Oculta"}</td>
            <td style="color: #00ff88; font-weight: bold;">R$ ${u.saldo}</td>
            <td style="color: #feca57; font-weight: bold;">${u.pontos} Pts</td>
            <td class="td-actions">
              <button class="btn-small btn-edit" onclick="abrirModalEditUsuario(${u.id})"><i class="fas fa-edit"></i></button>
              <button class="btn-small btn-del" onclick="deletarUsuario(${u.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
      `;
    });
  } catch (e) {
    console.error(e);
    document.getElementById("lista-usuarios").innerHTML =
      `<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar usuários.</td></tr>`;
  } finally {
    setCarregando("usuarios", false);
  }
}

// EDIÇÃO DE USUÁRIOS (NOVO)
function abrirModalEditUsuario(id) {
  const usuario = todosUsuariosAdmin.find((u) => u.id === id);
  if (!usuario) return;

  document.getElementById("edit-usuario-id").value = usuario.id;
  document.getElementById("edit-usuario-nome").value = usuario.nome;
  document.getElementById("edit-usuario-email").value = usuario.email;
  document.getElementById("edit-usuario-saldo").value = usuario.saldo;
  document.getElementById("edit-usuario-pontos").value = usuario.pontos;
  
  // Marca o checkbox se for admin (verifica se é 1 ou true)
  document.getElementById("edit-usuario-adm").checked = !!usuario.adm;

  document.getElementById("modal-edit-usuario").style.display = "flex";
}

function fecharModalEditUsuario() {
  document.getElementById("modal-edit-usuario").style.display = "none";
  document.getElementById("form-edit-usuario").reset();
}

async function submitEditUsuario(e) {
  e.preventDefault();
  const id = document.getElementById("edit-usuario-id").value;
  
  const data = {
    nome: document.getElementById("edit-usuario-nome").value,
    email: document.getElementById("edit-usuario-email").value,
    saldo: document.getElementById("edit-usuario-saldo").value,
    pontos: document.getElementById("edit-usuario-pontos").value,
    adm: document.getElementById("edit-usuario-adm").checked ? 1 : 0
  };

  try {
    const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Falha na atualização");
    
    alert("Dados do usuário atualizados com sucesso!");
    fecharModalEditUsuario();
    carregarUsuarios();
  } catch (err) {
    alert("Erro ao atualizar usuário.");
  }
}

async function deletarUsuario(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário? Todos os dados (biblioteca, carrinho, etc) serão apagados permanentemente.")) return;
  try {
    const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao deletar usuário.");
    carregarUsuarios(); // Atualiza a tabela
  } catch (err) {
    alert(err.message);
  }
}

// ==========================================
// MÓDULO: CUPONS
// ==========================================
async function carregarCupons() {
  setCarregando("cupons", true);
  try {
    const res = await fetch(`${API_URL}/cupons`);
    todosCuponsAdmin = await res.json();

    const tbody = document.getElementById("lista-cupons");
    tbody.innerHTML = "";

    if (todosCuponsAdmin.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum cupom cadastrado.</td></tr>`;
      return;
    }

    todosCuponsAdmin.forEach((c) => {
      tbody.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td><strong>${c.nome}</strong></td>
            <td>${c.tipo}</td>
            <td style="color: #00ff88; font-weight: bold;">R$ ${c.desconto}</td>
            <td style="color: #feca57; font-weight: bold;">${c.custo_pontos} Pts</td>
            <td class="td-actions">
                <button class="btn-small btn-edit" onclick="abrirModalEditCupom(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-small btn-del" onclick="deletarCupom(${c.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
      `;
    });
  } catch (e) {
    console.error(e);
    document.getElementById("lista-cupons").innerHTML =
      `<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar cupons.</td></tr>`;
  } finally {
    setCarregando("cupons", false);
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
    const res = await fetch(`${API_URL}/admin/cupons`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao salvar cupom");

    alert("Cupom cadastrado com sucesso!");
    document.getElementById("form-cupom").reset();
    carregarCupons();
  } catch (err) {
    alert(err.message);
  }
}

async function deletarCupom(id) {
  if (!confirm("Tem certeza que deseja deletar este cupom?")) return;
  try {
    const res = await fetch(`${API_URL}/admin/cupons/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao deletar");
    carregarCupons();
  } catch (err) {
    alert(err.message);
  }
}

// EDIÇÃO DE CUPONS
function abrirModalEditCupom(id) {
  const cupom = todosCuponsAdmin.find((c) => c.id === id);
  if (!cupom) return;

  document.getElementById("edit-cupom-id").value = cupom.id;
  document.getElementById("edit-cupom-nome").value = cupom.nome;
  document.getElementById("edit-cupom-tipo").value = cupom.tipo;
  document.getElementById("edit-cupom-desconto").value = cupom.desconto;
  document.getElementById("edit-cupom-custo").value = cupom.custo_pontos;

  document.getElementById("modal-edit-cupom").style.display = "flex";
}

function fecharModalEditCupom() {
  document.getElementById("modal-edit-cupom").style.display = "none";
  document.getElementById("form-edit-cupom").reset();
}

async function submitEditCupom(e) {
  e.preventDefault();
  const id = document.getElementById("edit-cupom-id").value;
  const data = {
    nome: document.getElementById("edit-cupom-nome").value,
    tipo: document.getElementById("edit-cupom-tipo").value,
    desconto: document.getElementById("edit-cupom-desconto").value,
    custo_pontos: document.getElementById("edit-cupom-custo").value,
  };

  try {
    const res = await fetch(`${API_URL}/admin/cupons/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar o cupom.");

    alert("Cupom atualizado com sucesso!");
    fecharModalEditCupom();
    carregarCupons();
  } catch (err) {
    alert(err.message);
  }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.onload = () => {
  if (verificarPermissao()) {
    carregarJogos(); // Inicia pela aba de jogos
  }
};