````markdown
# 🎮 Projeto FrameStore

Este documento detalha o funcionamento, a arquitetura e o planejamento do projeto **FrameStore**, uma loja virtual de jogos digitais.

**Aviso Importante:** Este é um projeto escolar de cunho demonstrativo. Todas as transações financeiras (compras, saldo, resgate de cupons) são **100% simuladas**. O saldo dos usuários é injetado e gerenciado diretamente via Banco de Dados (DB) para demonstrar a lógica de e-commerce sem envolver gateways de pagamento reais.

---

## 🌟 Sobre o Projeto

A FrameStore é uma plataforma simulada de e-commerce voltada para a comercialização de jogos digitais. O sistema permite que usuários se cadastrem, explorem um catálogo de jogos, gerenciem um carrinho de compras, finalizem transações usando saldo virtual e resgatem códigos de ativação para os jogos adquiridos. O projeto conta também com um painel administrativo completo para a gestão do catálogo, usuários e promoções.

## 🏆 Por que comprar na FrameStore?

Nosso sistema foi desenhado para recompensar o usuário continuamente através de um ecossistema integrado:

- **Cashback Automático (Sistema de Pontos):** A cada compra finalizada, 10% do valor gasto é convertido automaticamente em pontos na sua conta.
- **Loja de Cupons:** Os pontos acumulados podem ser trocados na aba "Pontos" por cupons de desconto fixo, que podem ser aplicados diretamente no carrinho para baratear compras futuras.
- **Biblioteca Digital Permanente:** Todos os jogos adquiridos ficam salvos na sua aba "Biblioteca" dentro do Perfil.
- **Resgate Imediato:** Ao acessar sua biblioteca, é possível gerar instantaneamente a chave de ativação única do jogo para instalação.

---

## 💻 Tutorial: Como rodar o projeto localmente

Para testar ou desenvolver na FrameStore, siga os passos abaixo:

1. **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) e um servidor de banco de dados SQL (MySQL) instalados.
2. **Instalação das dependências:** Abra o terminal na pasta raiz do projeto e execute:
   ```bash
   npm install
   ```
````

3. **Configuração do Ambiente:** - Crie um arquivo `.env` na raiz do projeto.

- Configure as variáveis de conexão com o banco de dados (ex: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `PORT`).

4. **Banco de Dados:** Execute o script SQL de criação das tabelas no seu banco de dados para estruturar o sistema (detalhes na seção de Modelagem abaixo).
5. **Carga Inicial (Seed):** Para popular o banco de dados com o catálogo de jogos iniciais, execute o script de seed na raiz do projeto:

```bash
node src/seed.js

```

6. **Iniciando o Servidor:**

```bash
node src/server.js

```

7. **Acesso:** Abra o navegador e acesse `http://localhost:3000` (ou a porta configurada no seu `.env`). O sistema redirecionará para a tela de Login/Cadastro.

---

## 🏗️ 1. Arquitetura e Tecnologias

- **Frontend:** HTML, CSS, JavaScript.
- **Backend:** Node.js (com Express).
- **Banco de Dados:** SQL (MySQL) para garantir relacionamento consistente.
- **Configuração:** Todas as variáveis sensíveis (dados de conexão com DB, segredos de autenticação, portas) são gerenciadas via arquivo `.env`, garantindo segurança e separação de ambientes.

---

## 🗄️ 2. Modelagem do Banco de Dados

Para evitar dependências externas de armazenamento, as imagens são armazenadas diretamente no banco de dados.

### Tabelas Principais

- **`USUARIOS`:**
- `id`: (PK) Identificador único.
- `nome`: Nome para display no perfil.
- `email`: Credencial de login.
- `senha`: Hash da senha (criptografada).
- `saldo`: (Decimal) Dinheiro virtual.
- `pontos`: (Inteiro) Moeda secundária.
- `adm`: (Boolean) Define privilégios de acesso ao Painel Administrativo.

- **`JOGOS`:**
- `id`: (PK) Identificador único.
- `titulo`: Nome do jogo.
- `preco`: (Decimal) Preço cheio.
- `desconto`: (Decimal/Null) Porcentagem de desconto.
- `platform`: Steam, PlayStation, Xbox, etc.
- `cover`: (LONGBLOB) Imagem principal convertida em binário.
- `screenshot1`: (LONGBLOB) Imagem da galeria 1.
- `screenshot2`: (LONGBLOB) Imagem da galeria 2.
- `screenshot3`: (LONGBLOB) Imagem da galeria 3.

- **`CUPONS`:**
- `id`: (PK) Identificador único.
- `nome`: Código do cupom.
- `tipo`: Tipo de benefício.
- `desconto`: (Decimal) Valor abatido.
- `custo_pontos`: (Inteiro) Custo em pontos.

### Tabelas Relacionais

- **`CARRINHO`:** (`id_usuario`, `id_jogo`)
- **`BIBLIOTECA`:** (`id_usuario`, `id_jogo`, `data_compra`)
- **`USUARIO_CUPONS`:** (`id_usuario`, `id_cupom`, `usado`)

---

## ⚙️ 3. Lógica de Negócio e Funcionalidades

### A. Autenticação e Perfil

1. Login via `email` e `senha`.
2. No `perfil.html`, se a coluna `adm` do usuário for `true`, o frontend renderiza o botão "Painel Administrativo".
3. A aba "Biblioteca" renderiza os jogos adquiridos com modal interativo para exibição da chave de ativação.

### B. Sistema de Compras

1. Adição de itens na tabela `CARRINHO` de forma dinâmica.
2. **Checkout:** Validação de saldo (via `USUARIOS`), atualização de saldo com subtração do total, inserção em `BIBLIOTECA`, remoção de `CARRINHO` e incremento de `pontos` baseados em 10% do valor da transação.

### C. Sistema de Pontos e Cupons

1. Resgate de cupons deduz o valor na tabela de `pontos` do usuário e salva o cupom na carteira.
2. Aplicação do cupom reduz o preço total no momento do checkout, atualizando seu status para "Usado".

### D. Painel Administrativo (Área Restrita)

1. **Segurança:** As rotas administrativas são protegidas por um middleware no Express, que verifica no banco de dados se o usuário logado possui a flag `adm = true` antes de processar qualquer requisição.
2. **Gestão de Jogos:**

- Adicionar novos jogos (incluindo upload das imagens via `Multer` direto como `LONGBLOB`).
- Editar informações e imagens de jogos existentes.
- Deletar jogos do catálogo.

3. **Gestão de Usuários:**

- Listagem de usuários cadastrados.
- Edição direta de `saldo` e `pontos` de qualquer usuário (útil para injeção de saldo nas simulações).

4. **Gestão de Cupons:**

- Adicionar novos cupons para a loja de recompensas.
- Editar cupons existentes.
- Remover cupons do sistema.

---

> **Desenvolvido para fins didáticos e apresentativos de conclusão de curso.**

```

```
