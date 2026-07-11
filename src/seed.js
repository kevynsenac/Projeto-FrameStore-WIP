// Script para popular o banco de dados com jogos de exemplo e suas respectivas imagens (cover e screenshots)
// Para executar: npm run seed
require("dotenv").config();
const pool = require("./db.js");
const fs = require("fs");
const path = require("path");

function getFileBuffer(imagePath) {
  try {
    if (!imagePath) return null;
    const absolutePath = path.resolve(__dirname, imagePath);
    if (fs.existsSync(absolutePath)) {
      return fs.readFileSync(absolutePath);
    }
    console.warn(`[Aviso] Imagem não encontrada: ${imagePath}`);
    return null;
  } catch (error) {
    console.error(`Erro ao ler a imagem ${imagePath}:`, error);
    return null;
  }
}

const games = [
  {
    titulo: "ARC Raiders",
    preco: 249.0,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/arc_raiders.jpg",
    screenshot1: "templates/assets/screenshots/arc_raiders_1.png",
    screenshot2: "templates/assets/screenshots/arc_raiders_2.png",
    screenshot3: "templates/assets/screenshots/arc_raiders_3.png",
  },
  {
    titulo: "Forza Horizon 6",
    preco: 299.0,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/forza_horizon_6.jpg",
    screenshot1: "templates/assets/screenshots/forza_horizon_6_1.png",
    screenshot2: "templates/assets/screenshots/forza_horizon_6_2.png",
    screenshot3: "templates/assets/screenshots/forza_horizon_6_3.png",
  },
  {
    titulo: "Assassin's Creed Black Flag",
    preco: 119.99,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/assassins_creed_black_flag.jpg",
    screenshot1: "templates/assets/screenshots/assassins_creed_1.png",
    screenshot2: "templates/assets/screenshots/assassins_creed_2.png",
    screenshot3: "templates/assets/screenshots/assassins_creed_3.png",
  },
  {
    titulo: "GTA V",
    preco: 74.99,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/gta_v.jpg",
    screenshot1: "templates/assets/screenshots/gta_v_1.png",
    screenshot2: "templates/assets/screenshots/gta_v_2.png",
    screenshot3: "templates/assets/screenshots/gta_v_3.png",
  },
  {
    titulo: "FC 26",
    preco: 349.0,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/ea_fc_26.jpg",
    screenshot1: "templates/assets/screenshots/ea_fc_26_1.png",
    screenshot2: "templates/assets/screenshots/ea_fc_26_2.png",
    screenshot3: "templates/assets/screenshots/ea_fc_26_3.png",
  },
  {
    titulo: "Need For Speed Heat",
    preco: 279.0,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/need_for_speed_heat.jpeg",
    screenshot1: "templates/assets/screenshots/need_for_speed_1.png",
    screenshot2: "templates/assets/screenshots/need_for_speed_2.png",
    screenshot3: "templates/assets/screenshots/need_for_speed_3.png",
  },
  {
    titulo: "Euro Truck Simulator 2",
    preco: 99.99,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/euro_truck_simulator.jpg",
    screenshot1: "templates/assets/screenshots/euro_truck_simulator_2_1.png",
    screenshot2: "templates/assets/screenshots/euro_truck_simulator_2_2.png",
    screenshot3: "templates/assets/screenshots/euro_truck_simulator_2_3.png",
  },
  {
    titulo: "GTA VI",
    preco: 0.0,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/gta_vi.jpg",
    screenshot1: "templates/assets/screenshots/gta_vi_1.png",
    screenshot2: "templates/assets/screenshots/gta_vi_2.png",
    screenshot3: "templates/assets/screenshots/gta_vi_3.png",
  },
  {
    titulo: "Batman Arkham Knight",
    preco: 89.99,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/batman_arkham_knight.jpg",
    screenshot1: "templates/assets/screenshots/batman_arkham_knight_1.png",
    screenshot2: "templates/assets/screenshots/batman_arkham_knight_2.png",
    screenshot3: "templates/assets/screenshots/batman_arkham_knight_3.png",
  },
  {
    titulo: "Assetto Corsa",
    preco: 59.99,
    desconto: null,
    platform: "Steam",
    cover: "templates/assets/cover/assetto_corsa.jpg",
    screenshot1: "templates/assets/screenshots/assetto_corsa_1.png",
    screenshot2: "templates/assets/screenshots/assetto_corsa_2.png",
    screenshot3: "templates/assets/screenshots/assetto_corsa_3.png",
  },
];

async function seedDatabase() {
  try {
    console.log("Iniciando o Seed do Banco de Dados...");

    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("TRUNCATE TABLE JOGOS");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Tabela JOGOS limpa com sucesso.");

    for (const game of games) {
      const coverBuffer = getFileBuffer(game.cover);
      const screenshot1Buffer = getFileBuffer(game.screenshot1);
      const screenshot2Buffer = getFileBuffer(game.screenshot2);
      const screenshot3Buffer = getFileBuffer(game.screenshot3);

      await pool.query(
        `INSERT INTO JOGOS (titulo, preco, desconto, platform, cover, screenshot1, screenshot2, screenshot3) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          game.titulo,
          game.preco,
          game.desconto,
          game.platform,
          coverBuffer,
          screenshot1Buffer,
          screenshot2Buffer,
          screenshot3Buffer,
        ],
      );

      console.log(`Jogo cadastrado: ${game.titulo}`);
    }

    console.log("Seed finalizado com sucesso!");
  } catch (error) {
    console.error("Erro fatal durante o seed:", error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
