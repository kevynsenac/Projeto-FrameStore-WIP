// Substitua o hardcode por isso:
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';
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

// Lógica de Autenticação na API
async function realizarLogin(event) {
  event.preventDefault(); 

  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Credenciais inválidas. Tente novamente.");
      return;
    }

    // Salva a sessão corretamente
    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Erro de conexão:", error);
    alert("Não foi possível conectar ao servidor. Verifique se a API está rodando.");
  }
}

// Função de Cadastro com Login Automático
async function realizarCadastro(event) {
  event.preventDefault();

  const email = document.getElementById("register-email").value;
  const senha = document.getElementById("register-password").value;
  const nome = email.split("@")[0];

  if (senha.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres.");
    return;
  }

  try {
    // 1. Realiza o cadastro do usuário
    const responseRegister = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const dataRegister = await responseRegister.json();

    if (!responseRegister.ok) {
      alert(dataRegister.error || "Erro ao criar conta.");
      return;
    }

    alert("Conta criada com sucesso! Entrando automaticamente...");
    
    // 2. Realiza o login automático com as credenciais recém-criadas
    const responseLogin = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dataLogin = await responseLogin.json();

    if (!responseLogin.ok) {
      // Fallback de segurança: se o login falhar por algum motivo bizarro, manda pra aba de login
      alert("Conta criada, mas ocorreu um erro no login automático. Faça o login manualmente.");
      document.getElementById("register-email").value = "";
      document.getElementById("register-password").value = "";
      showTab("login"); 
      return;
    }

    // 3. Salva a sessão no localStorage e redireciona para a Home
    localStorage.setItem("usuarioLogado", JSON.stringify(dataLogin.user));
    window.location.href = "homepage.html";

  } catch (error) {
    console.error("Erro de conexão:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}
