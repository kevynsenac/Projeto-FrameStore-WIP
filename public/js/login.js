const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

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

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// UI E NAVEGAÇÃO
// ==========================================
function showTab(tabName) {
  const loginForm = document.getElementById("form-login");
  const registerForm = document.getElementById("form-register");
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");

  if (tabName === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    btnLogin.classList.replace("inactive", "active");
    btnRegister.classList.replace("active", "inactive");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    btnLogin.classList.replace("active", "inactive");
    btnRegister.classList.replace("inactive", "active");
  }
}

function togglePassword(inputId, eyeId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeId);

  if (input.type === "password") {
    input.type = "text";
    eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// ==========================================
// AUTENTICAÇÃO
// ==========================================
async function realizarLogin(event) {
  event.preventDefault(); 

  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarNotificacao(data.error || "Credenciais inválidas. Tente novamente.", "erro");
      return;
    }

    mostrarNotificacao("Login efetuado com sucesso!", "sucesso");
    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
    
    // Aguarda 1.5s para o utilizador ver o toast antes de redirecionar
    setTimeout(() => {
      window.location.href = "homepage.html";
    }, 1500);

  } catch (error) {
    console.error("Erro de conexão:", error);
    mostrarNotificacao("Não foi possível conectar ao servidor. Verifique se a API está a correr.", "erro");
  }
}

async function realizarCadastro(event) {
  event.preventDefault();

  // Captura correta de todos os campos do HTML atualizado
  const nome = document.getElementById("register-nome").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const senha = document.getElementById("register-password").value;
  const confirmacaoSenha = document.getElementById("register-confirm-password").value;

  // Validações
  if (!nome) {
    mostrarNotificacao("O nome de usuário é obrigatório.", "erro");
    return;
  }

  if (senha.length < 6) {
    mostrarNotificacao("A senha deve ter no mínimo 6 caracteres.", "erro");
    return;
  }

  if (senha !== confirmacaoSenha) {
    mostrarNotificacao("As senhas não coincidem. Verifique e tente novamente.", "erro");
    return;
  }

  try {
    // 1. Cadastro
    const responseRegister = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const dataRegister = await responseRegister.json();

    if (!responseRegister.ok) {
      mostrarNotificacao(dataRegister.error || "Erro ao criar conta.", "erro");
      return;
    }

    mostrarNotificacao("Conta criada! A entrar automaticamente...", "sucesso");
    
    // 2. Login Automático
    const responseLogin = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dataLogin = await responseLogin.json();

    if (!responseLogin.ok) {
      mostrarNotificacao("Conta criada, mas ocorreu um erro no login automático. Faça o login manualmente.", "erro");
      document.getElementById("form-register").reset();
      showTab("login"); 
      return;
    }

    // 3. Salva sessão e redireciona
    localStorage.setItem("usuarioLogado", JSON.stringify(dataLogin.user));
    
    setTimeout(() => {
      window.location.href = "homepage.html";
    }, 2000);

  } catch (error) {
    console.error("Erro de conexão:", error);
    mostrarNotificacao("Não foi possível conectar ao servidor.", "erro");
  }
}