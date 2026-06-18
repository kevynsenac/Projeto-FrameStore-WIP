# 🎮 Projeto FrameStore - Planejamento e Roadmap

Este documento serve como o guia oficial de planejamento para o desenvolvimento das funcionalidades do projeto **FrameStore**.

**Aviso Importante:** Este é um projeto escolar de cunho demonstrativo. Todas as transações financeiras (compras, saldo, resgate de cupons) serão **100% simuladas**. O saldo dos usuários será injetado e gerenciado diretamente via Banco de Dados (DB) para demonstrar a lógica de e-commerce sem envolver gateways de pagamento reais.

---

## 🏗️ 1. Arquitetura e Tecnologias (A Implementar)

- **Frontend:** HTML, CSS, JavaScript (Já iniciado).
- **Backend:** Node.js (com Express).
- **Banco de Dados:** SQL (MySQL ou PostgreSQL) para garantir relacionamento consistente entre usuários, jogos e transações.

---

## 🗄️ 2. Modelagem do Banco de Dados (Estrutura Sugerida)

Para aplicar boas práticas de SQL e evitar colunas com múltiplos dados (arrays), a estrutura será dividida em Tabelas Principais e Tabelas Relacionais.

### Tabelas Principais

- **`USUARIOS` (Antiga PERFIL):**
  - `id`: (PK) Identificador único.
  - `nome`: Nome para display no perfil e homepage.
  - `email`: Credencial de login.
  - `senha`: Credencial de login (idealmente criptografada).
  - `saldo`: (Decimal) Dinheiro virtual para simular compras. Inserido manualmente via DB.
  - `pontos`: (Inteiro) Moeda secundária para trocar por cupons.

- **`JOGOS`:**
  - `id`: (PK) Identificador único.
  - `titulo`: Nome do jogo.
  - `preco`: (Decimal) Preço cheio do jogo.
  - `desconto`: (Decimal/Null) Porcentagem de desconto (Ex: 0.10 para 10%). Se nulo, sem desconto.
  - `platform`: Steam, PlayStation, Xbox, Mobile, etc.
  - `capa`: Caminho/URL da imagem principal.
  - `gallery`: Caminho/URLs das imagens da galeria (Pode ser uma tabela separada `JOGOS_IMAGENS` se houver muitas).

- **`CUPONS`:**
  - `id`: (PK) Identificador único.
  - `nome`: Código ou nome do cupom (Ex: "10OFF").
  - `tipo`: Tipo de benefício (Por enquanto, apenas desconto).
  - `desconto`: (Decimal) Valor ou porcentagem abatida na compra.
  - `custo_pontos`: (Inteiro) Quantidade de pontos necessários para resgatar.

### Tabelas Relacionais (Associações)

- **`CARRINHO`:** (`id_usuario`, `id_jogo`) -> Representa os itens no carrinho antes da compra.
- **`BIBLIOTECA`:** (`id_usuario`, `id_jogo`, `data_compra`) -> Representa os jogos adquiridos com sucesso.
- **`USUARIO_CUPONS`:** (`id_usuario`, `id_cupom`, `usado`) -> Representa os cupons que o usuário resgatou com pontos e se já foram utilizados.

---

## ⚙️ 3. Lógica de Negócio e Funcionalidades (Simulação)

Abaixo estão os fluxos de lógica que o backend em Node.js precisará resolver:

### A. Autenticação e Perfil

1. O usuário fará login usando `email` e `senha` do DB.
2. Ao acessar a `homepage` ou `perfil.html`, o sistema puxa do DB o `nome`, `saldo` e `pontos`.
3. A aba "Biblioteca" fará um SELECT na tabela `BIBLIOTECA` para renderizar os jogos comprados.

### B. Sistema de Compras (A grande simulação)

1. O usuário adiciona itens na tabela `CARRINHO`.
2. Ao clicar em **Finalizar Compra**:
   - O sistema soma o preço dos itens (aplicando descontos de jogos em promoção ou cupons ativos).
   - O sistema verifica na tabela `USUARIOS` se o `saldo` é maior ou igual ao total.
   - **Se houver saldo:** - Subtrai o valor do `saldo` do usuário.
     - Insere os jogos na tabela `BIBLIOTECA`.
     - Remove os jogos da tabela `CARRINHO`.
     - Adiciona `pontos` de recompensa ao usuário pela compra.
   - **Se não houver saldo:** Exibe mensagem de erro (Lembrando: para testar, o saldo deverá ser aumentado manualmente com um script SQL no DB).

### C. Sistema de Pontos e Cupons

1. O usuário acessa a página de pontos.
2. O sistema verifica os `pontos` totais do usuário e a tabela `CUPONS` disponíveis.
3. Ao resgatar um cupom:
   - Verifica se tem pontos suficientes.
   - Subtrai os pontos do usuário.
   - Associa o cupom na tabela `USUARIO_CUPONS` marcando como `usado = false`.
4. Na tela de checkout, o usuário pode aplicar o cupom para reduzir o preço final.

---

## 🚀 4. Etapas de Execução (Roadmap)

- [ ] **Passo 1:** Configurar o servidor Node.js (Express, Cors, Dotenv).
- [ ] **Passo 2:** Criar o script SQL de criação das tabelas e injeção de dados falsos (Jogos iniciais, 1 usuário com saldo alto para testes).
- [ ] **Passo 3:** Criar as rotas da API REST (GET /jogos, POST /login, GET /perfil).
- [ ] **Passo 4:** Conectar o Frontend atual na API. Trocar os dados estáticos (jsons no JS) por chamadas `fetch()`.
- [ ] **Passo 5:** Implementar a lógica de Carrinho e Checkout (simulação de subtração de saldo).
- [ ] **Passo 6:** Implementar a página de resgate e aplicação de Cupons/Pontos.
- [ ] **Passo 7:** Refinamento final da interface (Feedback visual de "Compra aprovada", "Saldo insuficiente").