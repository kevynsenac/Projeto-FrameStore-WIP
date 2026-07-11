require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Importação das rotas (Mapeamento declarativo que associa padrões de URL e métodos HTTP aos respectivos controladores responsáveis pela execução)
const authRoutes = require("./routes/authRoutes");
const jogosRoutes = require("./routes/jogosRoutes");
const carrinhoRoutes = require("./routes/carrinhoRoutes");
const cuponsRoutes = require("./routes/cuponsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const port = process.env.PORT || 3000; // Se desejar usar outra porta, adicione a várivavel de ambiente "PORT" no arquivo .env

// Middlewares Globais (Função de intercepção que processa, valida ou modifica a requisição antes que ela chegue ao manipulador final da rota)
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Rota Front-end
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "homepage.html"));
});

// Registro dos Endpoints (O ponto de interface específico dentro de um serviço de rede, definido por uma URL e método, 
// onde a lógica final de processamento de um recurso é exposta para o cliente)
app.use("/api", authRoutes);
app.use("/api", jogosRoutes);
app.use("/api", carrinhoRoutes);
app.use("/api", cuponsRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});