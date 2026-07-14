# 🎮 Projeto FrameStore

Este documento detalha o funcionamento, a arquitetura e o planejamento do projeto **FrameStore**, uma loja virtual de jogos digitais.

**Aviso Importante:** Este é um projeto escolar de cunho demonstrativo. Todas as transações financeiras (compras, adição de saldo, resgate de cupons) são **100% simuladas**. O saldo dos usuários é gerido diretamente via Banco de Dados (DB) para demonstrar a lógica de e-commerce sem envolver gateways de pagamento reais.

---

## 🌟 Sobre o Projeto

A FrameStore é uma plataforma simulada de e-commerce voltada para a comercialização de jogos digitais. O sistema permite que os usuários se cadastrem, explorem um catálogo detalhado de jogos, gerenciem um carrinho de compras, adicionem fundos à carteira e finalizem transações.

## 🏆 Ecossistema e Recompensas

Nosso sistema recompensa o utilizador continuamente através de um ecossistema integrado:

*   **Cashback Automático:** A cada compra finalizada, 100% do valor gasto é convertido em pontos na conta do utilizador.
*   **Roleta Diária:** Um sistema de sorteio que permite ao utilizador ganhar até 250 pontos diariamente.
*   **Loja de Cupons:** Os pontos podem ser trocados por cupons de desconto para aplicar no carrinho.
*   **Simulação de Pagamentos:** Adição de saldo através de simulações de Cartão de Crédito (com gestão de cartões salvos), PIX e Boleto Bancário (OBS: Somente a opção de cartão realmente adiciona saldo a conta do usuário, as outras opções são apenas demonstrativas).
*   **Biblioteca Digital:** Jogos adquiridos ficam salvos no perfil, permitindo o resgate imediato da chave de ativação única (OBS: Chaves também simuladas).

---

## 🏗️ Arquitetura e Tecnologias

O projeto adota uma arquitetura clássica com separação clara entre cliente e servidor.

*   **Frontend:** HTML5, CSS3, JavaScript Vanilla.
*   **Backend:** Node.js com o framework Express.
*   **Banco de Dados:** MySQL para garantir a integridade relacional.
*   **Uploads de Arquivos:** Utilização do `multer` para gestão e armazenamento de imagens diretamente como binários (`LONGBLOB`) no banco de dados.
*   **Configuração:** Variáveis sensíveis gerenciadas via arquivo `.env`.

---

## 🗄️ Modelagem do Banco de Dados

As imagens são armazenadas diretamente no banco de dados para evitar dependências externas de armazenamento.

### Tabelas Principais

*   **`USUARIOS`**: Armazena as credenciais, saldo financeiro (`DECIMAL`), pontos acumulados, personalização de perfil (cor de tema, avatar) e privilégios administrativos (`adm`) que podem ser utilizados posteriormente caso um "painel administrativo" seja desenvolvido.
*   **`JOGOS`**: Catálogo contendo `titulo`, `preco`, `desconto`, `platform`, `descricao`, `requisitos` e arquivos binários de imagens (`cover` e screenshots).
*   **`CUPONS`**: Define os cupons disponíveis na loja de pontos, com seus descontos e custos.

### Tabelas Relacionais e Auxiliares

*   **`CARRINHO`**: Relaciona `id_usuario` e `id_jogo`.
*   **`BIBLIOTECA`**: Armazena os jogos adquiridos pelo utilizador e o respectivo `codigo_resgate` gerado.
*   **`USUARIO_CUPONS`**: Regista os cupons resgatados e se já foram ou não utilizados (`usado`).
*   **`CARTOES`**: Guarda os cartões de crédito simulados cadastrados pelos utilizadores para adição de saldo.

---

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para preparar o ambiente de desenvolvimento.

**1. Instalação de Dependências**
Execute o comando na raiz do projeto para instalar pacotes como `express`, `mysql2`, `bcrypt` e `multer`:
```bash
npm install

```

**2. Configuração do Banco de Dados**
Crie um arquivo `.env` na raiz do projeto com as credenciais do seu banco MySQL (consule template de arquivo .env em "src/templates").
Consulte "query.sql" em "src/templates" para saber quais tables devem ser criadas para compatibilidade com este projeto.

**3. Popular o Catálogo (Seed)**
A aplicação conta com um script automático que insere dezenas de jogos com descrições, requisitos e converte as imagens locais (src/templates/assets) para `LONGBLOB`. Para executá-lo:

```bash
npm run seed

```

**4. Iniciar o Servidor**
Para rodar a aplicação em modo de desenvolvimento (com `nodemon` atualizando em tempo real):

```bash
npm run dev

```

Para rodar em modo padrão:

```bash
npm start

```

Acesse `http://localhost:3000` (ou a porta definida no seu `.env`) para explorar a FrameStore.

```

```