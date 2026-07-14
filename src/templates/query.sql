-- Cria o banco de dados e as tables iniciais compatíveis com o projeto
CREATE DATABASE IF NOT EXISTS framestore;

USE framestore;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS USUARIOS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    saldo DECIMAL(10, 2) DEFAULT 0.00,
    pontos INT DEFAULT 0,
    adm BOOLEAN DEFAULT FALSE,
    ultima_roleta DATE DEFAULT NULL,
    foto_perfil LONGBLOB,
    fundo_perfil LONGBLOB,
    bio VARCHAR(255),
    cor_tema VARCHAR(7) DEFAULT '#2a2aef'
);

-- Tabela de Jogos
CREATE TABLE IF NOT EXISTS JOGOS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    desconto DECIMAL(5, 2) NULL, -- Porcentagem de desconto
    platform VARCHAR(100),
    descricao TEXT,
    requisitos TEXT,
    cover LONGBLOB,
    screenshot1 LONGBLOB,
    screenshot2 LONGBLOB,
    screenshot3 LONGBLOB
);

-- Tabela de Cupons
CREATE TABLE IF NOT EXISTS CUPONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    data_expiracao DATETIME NULL,
    desconto DECIMAL(10, 2) NOT NULL,
    custo_pontos INT NOT NULL
);

-- Tabela de Carrinho
CREATE TABLE IF NOT EXISTS CARRINHO (
    id_usuario INT NOT NULL,
    id_jogo INT NOT NULL,
    PRIMARY KEY (id_usuario, id_jogo),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id) ON DELETE CASCADE,
    FOREIGN KEY (id_jogo) REFERENCES JOGOS (id) ON DELETE CASCADE
);

-- Tabela de Biblioteca
CREATE TABLE IF NOT EXISTS BIBLIOTECA (
    id_usuario INT NOT NULL,
    id_jogo INT NOT NULL,
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo_resgate VARCHAR(50),
    PRIMARY KEY (id_usuario, id_jogo),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id) ON DELETE CASCADE,
    FOREIGN KEY (id_jogo) REFERENCES JOGOS (id) ON DELETE CASCADE
);

-- Tabela de Usuário Cupons
CREATE TABLE IF NOT EXISTS USUARIO_CUPONS (
    id_usuario INT NOT NULL,
    id_cupom INT NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_usuario, id_cupom),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id) ON DELETE CASCADE,
    FOREIGN KEY (id_cupom) REFERENCES CUPONS (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CARTOES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    numero_mascarado VARCHAR(20) NOT NULL,
    nome_titular VARCHAR(100) NOT NULL,
    vencimento VARCHAR(5) NOT NULL,
    bandeira VARCHAR(50) NOT NULL,
    saldo_cartao DECIMAL(10, 2) DEFAULT 5000.00,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id) ON DELETE CASCADE
);