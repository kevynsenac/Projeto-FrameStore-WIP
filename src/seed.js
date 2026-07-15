// Script para popular o banco de dados com jogos de exemplo e suas respectivas imagens (cover e screenshots)
// Para executar: npm run seed
require("dotenv").config();
const pool = require("./config/db.js");
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
    preco: 0.0,
    desconto: 100.0,
    platform: "Steam",
    descricao:
      "ARC Raiders é um jogo de tiro de extração cooperativo, free-to-play e em terceira pessoa. Junte-se ao esquadrão dos Raiders e defenda nosso lar de inimigos implacáveis descidos do espaço, enquanto busca por suprimentos vitais nas ruínas da Terra.",
    requisitos:
      "Processador: Intel Core i5-6600K ou AMD Ryzen 5 1600, Memória: 12 GB RAM, Placa de vídeo: NVIDIA GeForce GTX 970 ou AMD Radeon RX 580, Armazenamento: 50 GB",
    cover: "templates/assets/cover/arc_raiders.jpg",
    screenshot1: "templates/assets/screenshots/arc_raiders_1.jpg",
    screenshot2: "templates/assets/screenshots/arc_raiders_2.jpg",
    screenshot3: "templates/assets/screenshots/arc_raiders_3.jpg",
  },
  {
    titulo: "Forza Horizon 6",
    preco: 0.0,
    desconto: null,
    platform: "Steam",
    descricao:
      "Explore o próximo nível do Festival Horizon com o maior e mais diversificado mundo aberto já criado na franquia. Pilote centenas dos melhores carros do mundo em uma campanha imersiva focada na cultura automotiva global.",
    requisitos:
      "Processador: Intel Core i7-10700K ou AMD Ryzen 7 3800XT, Memória: 16 GB RAM, Placa de vídeo: NVIDIA GeForce RTX 3070 ou AMD Radeon RX 6800, Armazenamento: 150 GB",
    cover: "templates/assets/cover/forza_horizon_6.jpg",
    screenshot1: "templates/assets/screenshots/forza_horizon_6_1.jpg",
    screenshot2: "templates/assets/screenshots/forza_horizon_6_2.jpg",
    screenshot3: "templates/assets/screenshots/forza_horizon_6_3.jpg",
  },
  {
    titulo: "Assassin's Creed Black Flag",
    preco: 119.99,
    desconto: 70.0,
    platform: "Steam",
    descricao:
      "O ano é 1715. Piratas governam o Caribe e estabeleceram sua própria república sem lei. Entre esses foras-da-lei está um jovem capitão temível chamado Edward Kenway. Suas façanhas ganham o respeito de lendas, mas o puxam para uma guerra antiga.",
    requisitos:
      "Processador: Intel Core2Quad Q8400 ou AMD Athlon II X4 620, Memória: 2 GB RAM, Placa de vídeo: Nvidia Geforce GTX 260 ou AMD Radeon HD 4870, Armazenamento: 30 GB",
    cover: "templates/assets/cover/assassins_creed_black_flag.jpg",
    screenshot1: "templates/assets/screenshots/assassins_creed_1.jpg",
    screenshot2: "templates/assets/screenshots/assassins_creed_2.jpg",
    screenshot3: "templates/assets/screenshots/assassins_creed_3.jpg",
  },
  {
    titulo: "Grand Theft Auto V",
    preco: 82.5,
    desconto: null,
    platform: "Steam",
    descricao:
      "Quando um malandro de rua, um ladrão de bancos aposentado e um psicopata aterrorizante se envolvem com criminosos e o governo dos EUA, eles devem realizar uma série de golpes perigosos para sobreviver em uma cidade implacável onde não podem confiar em ninguém.",
    requisitos:
      "Processador: Intel Core 2 Quad CPU Q6600 ou AMD Phenom 9850, Memória: 8 GB RAM, Placa de vídeo: NVIDIA 9800 GT 1GB ou AMD HD 4870 1GB, Armazenamento: 110 GB",
    cover: "templates/assets/cover/gta_v.jpg",
    screenshot1: "templates/assets/screenshots/gta_v_1.jpg",
    screenshot2: "templates/assets/screenshots/gta_v_2.jpg",
    screenshot3: "templates/assets/screenshots/gta_v_3.jpg",
  },
  {
    titulo: "EA SPORTS FC 26",
    preco: 349.0,
    desconto: null,
    platform: "Steam",
    descricao:
      "O EA SPORTS FC™ 26 leva você para mais perto do jogo do mundo com o HyperMotionV, PlayStyles otimizados pela Opta e o motor gráfico Frostbite™ revolucionado, além de elencos atualizados da nova temporada e futebol feminino.",
    requisitos:
      "Processador: Intel Core i5-13600K ou AMD Ryzen 5 5600X, Memória: 12 GB RAM, Placa de vídeo: NVIDIA GeForce RTX 3060 ou AMD Radeon RX 6600, Armazenamento: 100 GB",
    cover: "templates/assets/cover/ea_fc_26.jpg",
    screenshot1: "templates/assets/screenshots/ea_fc_26_1.jpg",
    screenshot2: "templates/assets/screenshots/ea_fc_26_2.jpg",
    screenshot3: "templates/assets/screenshots/ea_fc_26_3.jpg",
  },
  {
    titulo: "Need For Speed Heat",
    preco: 279.0,
    desconto: 85.0,
    platform: "Steam",
    descricao:
      "Trabalhe de dia e arrisque tudo à noite em Need for Speed™ Heat, um jogo de corrida emocionante que coloca você contra a força policial desonesta da cidade enquanto você batalha por um lugar na elite das corridas de rua.",
    requisitos:
      "Processador: Core i5-3570 ou FX-6350, Memória: 8 GB RAM, Placa de vídeo: GeForce GTX 760 ou Radeon 7970/Radeon R9 280x, Armazenamento: 50 GB",
    cover: "templates/assets/cover/need_for_speed_heat.jpg",
    screenshot1: "templates/assets/screenshots/need_for_speed_1.jpg",
    screenshot2: "templates/assets/screenshots/need_for_speed_2.jpg",
    screenshot3: "templates/assets/screenshots/need_for_speed_3.jpg",
  },
  {
    titulo: "Euro Truck Simulator 2",
    preco: 61.99,
    desconto: 50.0,
    platform: "Steam",
    descricao:
      "Viaje pela Europa como o rei da estrada, um caminhoneiro que entrega cargas importantes através de distâncias impressionantes! Com dezenas de cidades a explorar, sua resistência, habilidade e velocidade serão levadas ao limite.",
    requisitos:
      "Processador: Intel Core i5-6400 ou AMD Ryzen 3 1200, Memória: 8 GB RAM, Placa de vídeo: NVIDIA GeForce GTX 660 ou AMD Radeon RX 460, Armazenamento: 25 GB",
    cover: "templates/assets/cover/euro_truck_simulator.jpg",
    screenshot1: "templates/assets/screenshots/euro_truck_simulator_2_1.jpg",
    screenshot2: "templates/assets/screenshots/euro_truck_simulator_2_2.jpg",
    screenshot3: "templates/assets/screenshots/euro_truck_simulator_2_3.jpg",
  },
  {
    titulo: "Grand Theft Auto VI",
    preco: 0.0,
    desconto: null,
    platform: "PlayStation",
    descricao:
      "Retorne ao estado de Leonida, lar das ruas iluminadas por neon de Vice City e além, no que promete ser a maior e mais imersiva evolução da série Grand Theft Auto já criada. Jogue com os protagonistas Jason e Lucia.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/gta_vi.jpg",
    screenshot1: "templates/assets/screenshots/gta_vi_1.jpg",
    screenshot2: "templates/assets/screenshots/gta_vi_2.jpg",
    screenshot3: "templates/assets/screenshots/gta_vi_3.jpg",
  },
  {
    titulo: "Batman: Arkham Knight",
    preco: 89.99,
    desconto: 80.0,
    platform: "Steam",
    descricao:
      "Batman™: Arkham Knight traz a conclusão épica da premiada trilogia Arkham da Rocksteady Studios. O jogo introduz a versão excepcionalmente projetada do Batmóvel, que pode ser dirigido pela primeira vez na franquia.",
    requisitos:
      "Processador: Intel Core i5-750 ou AMD Phenom II X4 965, Memória: 6 GB RAM, Placa de vídeo: NVIDIA GeForce GTX 660 ou AMD Radeon HD 7870, Armazenamento: 45 GB",
    cover: "templates/assets/cover/batman_arkham_knight.jpg",
    screenshot1: "templates/assets/screenshots/batman_arkham_knight_1.jpg",
    screenshot2: "templates/assets/screenshots/batman_arkham_knight_2.jpg",
    screenshot3: "templates/assets/screenshots/batman_arkham_knight_3.jpg",
  },
  {
    titulo: "Assetto Corsa",
    preco: 59.99,
    desconto: 75.0,
    platform: "Steam",
    descricao:
      "Assetto Corsa apresenta um motor gráfico avançado que recria ambientes imersivos, iluminação dinâmica e materiais realistas. Projetado para proporcionar uma experiência de direção altamente realista, focando na física da aerodinâmica e pneus.",
    requisitos:
      "Processador: AMD Athlon X2 2.8 GHZ ou Intel Core 2 Duo 2.4 GHZ, Memória: 2 GB RAM, Placa de vídeo: AMD Radeon HD 6450 ou Nvidia GeForce GTX 460, Armazenamento: 15 GB",
    cover: "templates/assets/cover/assetto_corsa.jpg",
    screenshot1: "templates/assets/screenshots/assetto_corsa_1.jpg",
    screenshot2: "templates/assets/screenshots/assetto_corsa_2.jpg",
    screenshot3: "templates/assets/screenshots/assetto_corsa_3.jpg",
  },
  {
    titulo: "The Last of Us Part I",
    preco: 349.9,
    desconto: null,
    platform: "PlayStation",
    descricao:
      "Reviva o jogo adorado que deu início a tudo. Em uma civilização devastada, onde infectados e sobreviventes cruéis correm soltos, Joel é contratado para contrabandear Ellie de 14 anos para fora de uma zona de quarentena militar.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/the_last_of_us_part_1.jpg",
    screenshot1: "templates/assets/screenshots/the_last_of_us_1_1.jpg",
    screenshot2: "templates/assets/screenshots/the_last_of_us_1_2.jpg",
    screenshot3: "templates/assets/screenshots/the_last_of_us_1_3.jpg",
  },
  {
    titulo: "God of War Ragnarök",
    preco: 299.9,
    desconto: 20.0,
    platform: "PlayStation",
    descricao:
      "Junte-se a Kratos e Atreus em uma jornada mítica por respostas e aliados antes que o Ragnarök chegue. Juntos, pai e filho devem arriscar tudo enquanto viajam para cada um dos Nove Reinos em meio à ameaça de Asgard.",
    requisitos: "PlayStation 4 e PlayStation 5",
    cover: "templates/assets/cover/god_of_war_ragnarok.jpg",
    screenshot1: "templates/assets/screenshots/god_of_war_ragnarok_1.jpg",
    screenshot2: "templates/assets/screenshots/god_of_war_ragnarok_2.jpg",
    screenshot3: "templates/assets/screenshots/god_of_war_ragnarok_3.jpg",
  },
  {
    titulo: "Halo Infinite",
    preco: 0.0,
    desconto: 100.0,
    platform: "Xbox",
    descricao:
      "Quando toda a esperança foi perdida e o destino da humanidade está em jogo, Master Chief está pronto para confrontar o inimigo mais implacável que ele já enfrentou. A lendária série Halo retorna com o multiplayer gratuito e épico.",
    requisitos: "Xbox One e Xbox Series X/S",
    cover: "templates/assets/cover/halo_infinite.jpg",
    screenshot1: "templates/assets/screenshots/halo_infinite_1.jpg",
    screenshot2: "templates/assets/screenshots/halo_infinite_2.jpg",
    screenshot3: "templates/assets/screenshots/halo_infinite_3.jpg",
  },
  {
    titulo: "The Legend of Zelda: Tears of the Kingdom",
    preco: 357.99,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Uma jornada épica através da terra e dos céus de Hyrule aguarda. Crie sua própria aventura em um mundo onde o limite é a sua imaginação, dominando as novas habilidades de Link para combater as forças malignas do Ganondorf.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/zelda_tears_of_the_kingdom.jpg",
    screenshot1: "templates/assets/screenshots/zelda_totk_1.jpg",
    screenshot2: "templates/assets/screenshots/zelda_totk_2.jpg",
    screenshot3: "templates/assets/screenshots/zelda_totk_3.jpg",
  },
  {
    titulo: "Super Mario Bros. Wonder",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Encontre surpresas e maravilhas em cada esquina na próxima evolução da diversão clássica e em progressão lateral do Mario. Transforme a jogabilidade com as Flores Fenomenais que alteram o mundo ao seu redor!",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/super_mario_bros_wonder.jpg",
    screenshot1: "templates/assets/screenshots/mario_wonder_1.jpg",
    screenshot2: "templates/assets/screenshots/mario_wonder_2.jpg",
    screenshot3: "templates/assets/screenshots/mario_wonder_3.jpg",
  },
  {
    titulo: "Cyberpunk 2077",
    preco: 199.9,
    desconto: 50.0,
    platform: "Steam",
    descricao:
      "Cyberpunk 2077 é um RPG de ação e aventura de mundo aberto ambientado em Night City, uma megalópole obcecada por poder, glamour e modificações corporais. Jogue como V, um mercenário fora da lei em busca do implante da imortalidade.",
    requisitos:
      "Processador: Core i7-6700 ou Ryzen 5 1600, Memória: 12 GB RAM, Placa de vídeo: GeForce GTX 1060 6GB ou Radeon RX 580 8GB, Armazenamento: 70 GB",
    cover: "templates/assets/cover/cyberpunk_2077.jpg",
    screenshot1: "templates/assets/screenshots/cyberpunk_2077_1.jpg",
    screenshot2: "templates/assets/screenshots/cyberpunk_2077_2.jpg",
    screenshot3: "templates/assets/screenshots/cyberpunk_2077_3.jpg",
  },
  {
    titulo: "Red Dead Redemption 2",
    preco: 249.9,
    desconto: 60.0,
    platform: "PlayStation",
    descricao:
      "Estados Unidos, 1899. O fim da era do faroeste começou. Depois de um assalto dar errado, Arthur Morgan e a gangue Van der Linde são forçados a fugir com agentes federais e os melhores caçadores de recompensas no seu encalço.",
    requisitos: "PlayStation 4 e PlayStation 5",
    cover: "templates/assets/cover/red_dead_redemption_2.jpg",
    screenshot1: "templates/assets/screenshots/rdr2_1.jpg",
    screenshot2: "templates/assets/screenshots/rdr2_2.jpg",
    screenshot3: "templates/assets/screenshots/rdr2_3.jpg",
  },
  {
    titulo: "Marvel's Spider-Man 2",
    preco: 349.9,
    desconto: null,
    platform: "PlayStation",
    descricao:
      "Os Homens-Aranha, Peter Parker e Miles Morales, retornam para uma nova e incrível aventura. Balance, pule e use as novas Asas de Teia para viajar pela Nova York da Marvel, enfrentando novos vilões icônicos como o Venom.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/spiderman_2.jpg",
    screenshot1: "templates/assets/screenshots/spiderman_2_1.jpg",
    screenshot2: "templates/assets/screenshots/spiderman_2_2.jpg",
    screenshot3: "templates/assets/screenshots/spiderman_2_3.jpg",
  },
  {
    titulo: "Forza Motorsport 5",
    preco: 299.0,
    desconto: 30.0,
    platform: "Xbox",
    descricao:
      "Ultrapasse a competição no novíssimo modo carreira. Dispute com seus amigos no multijogador competitivo. Dirija mais de 500 carros em pistas mundialmente famosas com IA de ponta, física avançada e clima dinâmico.",
    requisitos: "Xbox Series X/S",
    cover: "templates/assets/cover/forza_motorsport_5.jpg",
    screenshot1: "templates/assets/screenshots/forza_motorsport_5_1.jpg",
    screenshot2: "templates/assets/screenshots/forza_motorsport_5_2.jpg",
    screenshot3: "templates/assets/screenshots/forza_motorsport_5_3.jpg",
  },
  {
    titulo: "Animal Crossing: New Horizons",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Fuja para uma ilha deserta e crie o seu próprio paraíso enquanto explora, cria e personaliza. Sua fuga na ilha traz uma riqueza de recursos naturais que podem ser usados para criar de tudo, desde conforto até as ferramentas úteis.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/animal_crossing.jpg",
    screenshot1: "templates/assets/screenshots/animal_crossing_1.jpg",
    screenshot2: "templates/assets/screenshots/animal_crossing_2.jpg",
    screenshot3: "templates/assets/screenshots/animal_crossing_3.jpg",
  },
  {
    titulo: "Elden Ring",
    preco: 229.9,
    desconto: 30.0,
    platform: "Steam",
    descricao:
      "Levante-se, Maculado, e seja guiado pela graça para portar o poder do Anel Prístino e se tornar um Lorde Prístino nas Terras Intermédias. Um vasto mundo perfeitamente conectado espera por você.",
    requisitos:
      "Processador: Intel Core i5-8400 ou AMD Ryzen 3 3300X, Memória: 12 GB RAM, Placa de vídeo: NVIDIA GeForce GTX 1060 3GB ou AMD Radeon RX 580 4GB, Armazenamento: 60 GB",
    cover: "templates/assets/cover/elden_ring.jpg",
    screenshot1: "templates/assets/screenshots/elden_ring_1.jpg",
    screenshot2: "templates/assets/screenshots/elden_ring_2.jpg",
    screenshot3: "templates/assets/screenshots/elden_ring_3.jpg",
  },
  {
    titulo: "Ghost of Tsushima Director's Cut",
    preco: 349.9,
    desconto: null,
    platform: "PlayStation",
    descricao:
      "Descubra as maravilhas ocultas de Tsushima nesta aventura de ação em mundo aberto. Forje um novo caminho e trave uma guerra não convencional pela liberdade do Japão feudal contra a invasão mongol.",
    requisitos: "PlayStation 4 e PlayStation 5",
    cover: "templates/assets/cover/ghost_of_tsushima.jpg",
    screenshot1: "templates/assets/screenshots/ghost_of_tsushima_1.jpg",
    screenshot2: "templates/assets/screenshots/ghost_of_tsushima_2.jpg",
    screenshot3: "templates/assets/screenshots/ghost_of_tsushima_3.jpg",
  },
  {
    titulo: "Super Smash Bros. Ultimate",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Ícones dos videogames se enfrentam no confronto definitivo que você pode jogar a qualquer hora e em qualquer lugar! Esmague rivais para fora do cenário com novos personagens, como Simon Belmont e King K. Rool.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/super_smash_bros_ultimate.jpg",
    screenshot1: "templates/assets/screenshots/smash_bros_1.jpg",
    screenshot2: "templates/assets/screenshots/smash_bros_2.jpg",
    screenshot3: "templates/assets/screenshots/smash_bros_3.jpg",
  },
  {
    titulo: "Resident Evil 4 Remake",
    preco: 249.0,
    desconto: 50.0,
    platform: "Steam",
    descricao:
      "Sobrevivência é apenas o começo. Seis anos se passaram desde o desastre biológico em Raccoon City. Leon S. Kennedy rastreia a filha desaparecida do presidente até uma vila europeia isolada onde algo terrível espreita.",
    requisitos:
      "Processador: AMD Ryzen 3 1200 ou Intel Core i5-7500, Memória: 8 GB RAM, Placa de vídeo: AMD Radeon RX 560 4GB ou NVIDIA GeForce GTX 1050 Ti 4GB, Armazenamento: 73 GB",
    cover: "templates/assets/cover/resident_evil_4.jpg",
    screenshot1: "templates/assets/screenshots/resident_evil_4_1.jpg",
    screenshot2: "templates/assets/screenshots/resident_evil_4_2.jpg",
    screenshot3: "templates/assets/screenshots/resident_evil_4_3.jpg",
  },
  {
    titulo: "Sea of Thieves",
    preco: 89.99,
    desconto: 50.0,
    platform: "Xbox",
    descricao:
      "Sea of Thieves oferece a experiência pirata definitiva, desde navegar e lutar até explorar e saquear. Reúna sua tripulação e embarque em jornadas épicas para se tornar uma lenda dos sete mares.",
    requisitos: "Xbox One e Xbox Series X/S",
    cover: "templates/assets/cover/sea_of_thieves.jpg",
    screenshot1: "templates/assets/screenshots/sea_of_thieves_1.jpg",
    screenshot2: "templates/assets/screenshots/sea_of_thieves_2.jpg",
    screenshot3: "templates/assets/screenshots/sea_of_thieves_3.jpg",
  },
  {
    titulo: "Hogwarts Legacy",
    preco: 249.99,
    desconto: 40.0,
    platform: "Steam",
    descricao:
      "Hogwarts Legacy é um RPG de ação e mundo aberto imersivo ambientado no universo de Harry Potter. Explore e descubra feras mágicas, personalize seu personagem, crie poções e domine o lançamento de feitiços.",
    requisitos:
      "Processador: Intel Core i5-6600 ou AMD Ryzen 5 1400, Memória: 16 GB RAM, Placa de vídeo: NVIDIA GeForce GTX 960 4GB ou AMD Radeon RX 470 4GB, Armazenamento: 85 GB",
    cover: "templates/assets/cover/hogwarts_legacy.jpg",
    screenshot1: "templates/assets/screenshots/hogwarts_legacy_1.jpg",
    screenshot2: "templates/assets/screenshots/hogwarts_legacy_2.jpg",
    screenshot3: "templates/assets/screenshots/hogwarts_legacy_3.jpg",
  },
  {
    titulo: "Horizon Forbidden West",
    preco: 299.9,
    desconto: null,
    platform: "PlayStation",
    descricao:
      "Junte-se a Aloy enquanto ela enfrenta o Oeste Proibido, uma fronteira majestosa, mas perigosa, que esconde novas e misteriosas ameaças. Enfrente máquinas colossais em um mundo de tirar o fôlego.",
    requisitos: "PlayStation 4 e PlayStation 5",
    cover: "templates/assets/cover/horizon_forbidden_west.jpg",
    screenshot1: "templates/assets/screenshots/horizon_1.jpg",
    screenshot2: "templates/assets/screenshots/horizon_2.jpg",
    screenshot3: "templates/assets/screenshots/horizon_3.jpg",
  },
  {
    titulo: "Mario Kart 8 Deluxe",
    preco: 299.0,
    desconto: 15.0,
    platform: "Nintendo",
    descricao:
      "Aqueça os motores e prepare-se para jogar com a maior seleção de personagens da história da série, desafiando seus amigos em pistas inspiradas em clássicos da Nintendo e dominando o modo batalha.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/mario_kart_8_deluxe.jpg",
    screenshot1: "templates/assets/screenshots/mario_kart_8_1.jpg",
    screenshot2: "templates/assets/screenshots/mario_kart_8_2.jpg",
    screenshot3: "templates/assets/screenshots/mario_kart_8_3.jpg",
  },
  {
    titulo: "Starfield",
    preco: 299.0,
    desconto: 20.0,
    platform: "Xbox",
    descricao:
      "Starfield é o primeiro universo novo em 25 anos da Bethesda Game Studios. Neste RPG de nova geração, crie o personagem que você quiser e explore a galáxia com liberdade sem paralelos em busca do maior mistério da humanidade.",
    requisitos: "Xbox Series X/S",
    cover: "templates/assets/cover/starfield.jpg",
    screenshot1: "templates/assets/screenshots/starfield_1.jpg",
    screenshot2: "templates/assets/screenshots/starfield_2.jpg",
    screenshot3: "templates/assets/screenshots/starfield_3.jpg",
  },
  {
    titulo: "The Witcher 3: Wild Hunt",
    preco: 129.99,
    desconto: 75.0,
    platform: "Steam",
    descricao:
      "Você é Geralt de Rívia, mercenário matador de monstros. O continente devastado pela guerra e infestado de criaturas sombrias está aberto para ser explorado enquanto você rastreia a Criança da Profecia.",
    requisitos:
      "Processador: Intel CPU Core i5-2500K 3.3GHz ou AMD CPU Phenom II X4 940, Memória: 6 GB RAM, Placa de vídeo: Nvidia GPU GeForce GTX 660 ou AMD GPU Radeon HD 7870, Armazenamento: 35 GB",
    cover: "templates/assets/cover/the_witcher_3.jpg",
    screenshot1: "templates/assets/screenshots/witcher_3_1.jpg",
    screenshot2: "templates/assets/screenshots/witcher_3_2.jpg",
    screenshot3: "templates/assets/screenshots/witcher_3_3.jpg",
  },
  {
    titulo: "Bloodborne",
    preco: 99.5,
    desconto: null,
    platform: "PlayStation",
    descricao:
      "Enfrente seus medos enquanto busca respostas na antiga e arruinada cidade de Yharnam, agora amaldiçoada com uma doença endêmica e aterrorizante que se espalha pelas ruas como fogo.",
    requisitos: "PlayStation 4 e PlayStation 5",
    cover: "templates/assets/cover/bloodborne.jpg",
    screenshot1: "templates/assets/screenshots/bloodborne_1.jpg",
    screenshot2: "templates/assets/screenshots/bloodborne_2.jpg",
    screenshot3: "templates/assets/screenshots/bloodborne_3.jpg",
  },
  {
    titulo: "Gears 5",
    preco: 199.0,
    desconto: 60.0,
    platform: "Xbox",
    descricao:
      "Uma das sagas mais aclamadas dos videogames está maior do que nunca, com cinco modos de jogo emocionantes e a campanha mais profunda e pessoal já vista na franquia, seguindo a jornada de Kait Diaz.",
    requisitos: "Xbox One e Xbox Series X/S",
    cover: "templates/assets/cover/gears_5.jpg",
    screenshot1: "templates/assets/screenshots/gears_5_1.jpg",
    screenshot2: "templates/assets/screenshots/gears_5_2.jpg",
    screenshot3: "templates/assets/screenshots/gears_5_3.jpg",
  },
  {
    titulo: "Stardew Valley",
    preco: 24.99,
    desconto: null,
    platform: "Steam",
    descricao:
      "Você herdou a antiga fazenda do seu avô em Stardew Valley. Armado com ferramentas de segunda mão e algumas moedas, você se prepara para começar sua nova vida no campo e transformar áreas abandonadas em um lar próspero.",
    requisitos:
      "Processador: 2 Ghz, Memória: 2 GB RAM, Placa de vídeo: 256 mb de memória de vídeo com suporte a shader model 3.0, Armazenamento: 500 MB",
    cover: "templates/assets/cover/stardew_valley.jpg",
    screenshot1: "templates/assets/screenshots/stardew_valley_1.jpg",
    screenshot2: "templates/assets/screenshots/stardew_valley_2.jpg",
    screenshot3: "templates/assets/screenshots/stardew_valley_3.jpg",
  },
  {
    titulo: "Pokémon Scarlet",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Capture, batalhe e treine Pokémon na região de Paldea, uma vasta terra cheia de lagos, picos imponentes, desertos, vilarejos e cidades imensas para explorar no primeiro jogo de mundo aberto da franquia.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/pokemon_scarlet.jpg",
    screenshot1: "templates/assets/screenshots/pokemon_scarlet_1.jpg",
    screenshot2: "templates/assets/screenshots/pokemon_scarlet_2.jpg",
    screenshot3: "templates/assets/screenshots/pokemon_scarlet_3.jpg",
  },
  {
    titulo: "Baldur's Gate 3",
    preco: 199.99,
    desconto: 20.0,
    platform: "Steam",
    descricao:
      "Reúna seu grupo e retorne aos Reinos Esquecidos numa história sobre amizade e traição, sacrifício e sobrevivência, além da irresistível e perigosa atração do poder absoluto concedido pelos Devoradores de Mentes.",
    requisitos:
      "Processador: Intel I5 4690 ou AMD FX 8350, Memória: 8 GB RAM, Placa de vídeo: Nvidia GTX 970 ou RX 480 4GB VRAM, Armazenamento: 150 GB",
    cover: "templates/assets/cover/baldurs_gate_3.jpg",
    screenshot1: "templates/assets/screenshots/bg3_1.jpg",
    screenshot2: "templates/assets/screenshots/bg3_2.jpg",
    screenshot3: "templates/assets/screenshots/bg3_3.jpg",
  },
  {
    titulo: "Hollow Knight",
    preco: 46.99,
    desconto: 50.0,
    platform: "Steam",
    descricao:
      "Forje seu próprio caminho em Hollow Knight! Uma aventura de ação épica através de um vasto reino arruinado de insetos e heróis. Explore cavernas tortuosas, lute contra criaturas maculadas e faça amizade com insetos bizarros.",
    requisitos:
      "Processador: Intel Core 2 Duo E5200, Memória: 4 GB RAM, Placa de vídeo: GeForce 9800GTX 1GB, Armazenamento: 9 GB",
    cover: "templates/assets/cover/hollow_knight.jpg",
    screenshot1: "templates/assets/screenshots/hollow_knight_1.jpg",
    screenshot2: "templates/assets/screenshots/hollow_knight_2.jpg",
    screenshot3: "templates/assets/screenshots/hollow_knight_3.jpg",
  },
  {
    titulo: "The Legend of Zelda: Breath of the Wild",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Esqueça tudo que você sabe sobre os jogos The Legend of Zelda. Entre em um mundo de descoberta, exploração e aventura, um jogo da aclamada série que quebra barreiras. Viaje por vastos campos, florestas e picos de montanhas.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/zelda_botw.jpg",
    screenshot1: "templates/assets/screenshots/zelda_botw_1.jpg",
    screenshot2: "templates/assets/screenshots/zelda_botw_2.jpg",
    screenshot3: "templates/assets/screenshots/zelda_botw_3.jpg",
  },
  {
    titulo: "Demon's Souls",
    preco: 349.9,
    desconto: 40.0,
    platform: "PlayStation",
    descricao:
      "Totalmente refeito do zero, este remake magistral convida você a vivenciar a história inquietante e o combate brutal de Demon's Souls. Descubra o mundo de Boletaria em uma qualidade visual estonteante e desempenho incrível.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/demons_souls.jpg",
    screenshot1: "templates/assets/screenshots/demons_souls_1.jpg",
    screenshot2: "templates/assets/screenshots/demons_souls_2.jpg",
    screenshot3: "templates/assets/screenshots/demons_souls_3.jpg",
  },
  {
    titulo: "Forza Horizon 5",
    preco: 249.0,
    desconto: 50.0,
    platform: "Xbox",
    descricao:
      "Sua aventura Horizon definitiva o aguarda! Explore as vibrantes e em constante evolução paisagens de mundo aberto do México com diversão sem limites em centenas dos melhores carros do mundo.",
    requisitos: "Xbox One e Xbox Series X/S",
    cover: "templates/assets/cover/forza_horizon_5.jpg",
    screenshot1: "templates/assets/screenshots/forza_horizon_5_1.jpg",
    screenshot2: "templates/assets/screenshots/forza_horizon_5_2.jpg",
    screenshot3: "templates/assets/screenshots/forza_horizon_5_3.jpg",
  },
  {
    titulo: "Terraria",
    preco: 32.99,
    desconto: null,
    platform: "Steam",
    descricao:
      "Cave, lute, explore, construa! Nada é impossível neste jogo de aventura cheio de ação. O mundo é a sua tela e o próprio solo é a sua tinta. Agarre suas ferramentas e vá em frente!",
    requisitos:
      "Processador: 2.0 GHz, Memória: 2.5 GB RAM, Placa de vídeo: 128mb de memória de vídeo com suporte a Shader Model 2.0+, Armazenamento: 200 MB",
    cover: "templates/assets/cover/terraria.jpg",
    screenshot1: "templates/assets/screenshots/terraria_1.jpg",
    screenshot2: "templates/assets/screenshots/terraria_2.jpg",
    screenshot3: "templates/assets/screenshots/terraria_3.jpg",
  },
  {
    titulo: "Gran Turismo 7",
    preco: 349.9,
    desconto: 25.0,
    platform: "PlayStation",
    descricao:
      "Gran Turismo 7 traz as melhores funcionalidades da história da franquia. Seja você um piloto competitivo, colecionador, construtor, fotógrafo ou fã de arcade, incendeie sua paixão com recursos inspirados no passado e futuro.",
    requisitos: "PlayStation 4 e PlayStation 5",
    cover: "templates/assets/cover/gran_turismo_7.jpg",
    screenshot1: "templates/assets/screenshots/gt7_1.jpg",
    screenshot2: "templates/assets/screenshots/gt7_2.jpg",
    screenshot3: "templates/assets/screenshots/gt7_3.jpg",
  },
  {
    titulo: "Super Mario Odyssey",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Junte-se a Mario em uma imensa aventura 3D pelo mundo todo e use suas novas habilidades para coletar luas para que você possa ligar sua aeronave, a Odyssey, e resgatar a Princesa Peach dos planos de casamento do Bowser.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/super_mario_odyssey.jpg",
    screenshot1: "templates/assets/screenshots/mario_odyssey_1.jpg",
    screenshot2: "templates/assets/screenshots/mario_odyssey_2.jpg",
    screenshot3: "templates/assets/screenshots/mario_odyssey_3.jpg",
  },
  {
    titulo: "Microsoft Flight Simulator 2024",
    preco: 249.95,
    desconto: null,
    platform: "Xbox",
    descricao:
      "Viaje pelo mundo em detalhes incríveis com mais de 37 mil aeroportos, 2 milhões de cidades, 1,5 bilhão de edifícios, montanhas reais, estradas, árvores, rios, animais, trânsito e muito mais. Teste suas habilidades de pilotagem.",
    requisitos: "Xbox Series X/S",
    cover: "templates/assets/cover/flight_simulator_2024.jpg",
    screenshot1: "templates/assets/screenshots/flight_simulator_2024_1.jpg",
    screenshot2: "templates/assets/screenshots/flight_simulator__2024_2.jpg",
    screenshot3: "templates/assets/screenshots/flight_simulator__2024_3.jpg",
  },
  {
    titulo: "Hades",
    preco: 73.99,
    desconto: 40.0,
    platform: "Steam",
    descricao:
      "Desafie o deus dos mortos enquanto você batalha para sair do Submundo neste jogo roguelike de exploração de masmorras dos criadores de Bastion e Transistor. Cada tentativa de fuga revela mais da história.",
    requisitos:
      "Processador: Dual Core 2.4 GHz, Memória: 4 GB RAM, Placa de vídeo: 1GB VRAM com suporte a OpenGL 2.1+, Armazenamento: 15 GB",
    cover: "templates/assets/cover/hades.jpg",
    screenshot1: "templates/assets/screenshots/hades_1.jpg",
    screenshot2: "templates/assets/screenshots/hades_2.jpg",
    screenshot3: "templates/assets/screenshots/hades_3.jpg",
  },
  {
    titulo: "Final Fantasy XVI",
    preco: 349.9,
    desconto: 30.0,
    platform: "PlayStation",
    descricao:
      "O 16º título principal da lendária série Final Fantasy marca uma virada sombria para a franquia de RPG, com uma complexa história de vingança, lutas de poder e tragédia inescapável envolvendo os Eikons.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/final_fantasy_16.jpg",
    screenshot1: "templates/assets/screenshots/ff16_1.jpg",
    screenshot2: "templates/assets/screenshots/ff16_2.jpg",
    screenshot3: "templates/assets/screenshots/ff16_3.jpg",
  },
  {
    titulo: "Metroid Dread",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "A caçadora de recompensas intergaláctica Samus Aran desce para investigar uma misteriosa transmissão e se vê caçada por implacáveis robôs E.M.M.I. em um planeta inexplorado repleto de perigos mortais.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/metroid_dread.jpg",
    screenshot1: "templates/assets/screenshots/metroid_dread_1.jpg",
    screenshot2: "templates/assets/screenshots/metroid_dread_2.jpg",
    screenshot3: "templates/assets/screenshots/metroid_dread_3.jpg",
  },
  {
    titulo: "Alan Wake 2",
    preco: 225.0,
    desconto: 20.0,
    platform: "PlayStation",
    descricao:
      "Uma série de assassinatos ritualísticos ameaça Bright Falls. Saga Anderson, uma agente do FBI de sucesso, chega para investigar. Enquanto isso, Alan Wake tenta escrever sua fuga de um pesadelo sombrio que desafia a realidade.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/alan_wake_2.jpg",
    screenshot1: "templates/assets/screenshots/alan_wake_2_1.jpg",
    screenshot2: "templates/assets/screenshots/alan_wake_2_2.jpg",
    screenshot3: "templates/assets/screenshots/alan_wake_2_3.jpg",
  },
  {
    titulo: "Ratchet & Clank: Rift Apart",
    preco: 349.9,
    desconto: 40.0,
    platform: "PlayStation",
    descricao:
      "Viaje através das dimensões com Ratchet e Clank e enfrente um imperador robótico maligno de outra realidade. Pule entre mundos repletos de ação e em altíssima velocidade com visuais deslumbrantes.",
    requisitos: "PlayStation 5",
    cover: "templates/assets/cover/ratchet_and_clank.jpg",
    screenshot1: "templates/assets/screenshots/ratchet_and_clank_1.jpg",
    screenshot2: "templates/assets/screenshots/ratchet_and_clank_2.jpg",
    screenshot3: "templates/assets/screenshots/ratchet_and_clank_3.jpg",
  },
  {
    titulo: "Splatoon 3",
    preco: 299.0,
    desconto: null,
    platform: "Nintendo",
    descricao:
      "Entre na região de Splatlands, um deserto árido habitado por Inklings e Octolings durões e calejados pelas batalhas, e participe de disputas de tinta frenéticas e super coloridas.",
    requisitos: "Nintendo Switch",
    cover: "templates/assets/cover/splatoon_3.jpg",
    screenshot1: "templates/assets/screenshots/splatoon_3_1.jpg",
    screenshot2: "templates/assets/screenshots/splatoon_3_2.jpg",
    screenshot3: "templates/assets/screenshots/splatoon_3_3.jpg",
  },
  {
    titulo: "Monster Hunter: World",
    preco: 99.9,
    desconto: 65.0,
    platform: "Steam",
    descricao:
      "Bem-vindo a um novo mundo! Em Monster Hunter: World, a última edição da série, você pode curtir a experiência de caçada definitiva, usando tudo à sua disposição para caçar monstros imensos em um novo ecossistema.",
    requisitos:
      "Processador: Intel Core i5-4460 ou AMD FX-6300, Memória: 8 GB RAM, Placa de vídeo: NVIDIA GeForce GTX 760 ou AMD Radeon R7 260x, Armazenamento: 48 GB",
    cover: "templates/assets/cover/monster_hunter_world.jpg",
    screenshot1: "templates/assets/screenshots/mhw_1.jpg",
    screenshot2: "templates/assets/screenshots/mhw_2.jpg",
    screenshot3: "templates/assets/screenshots/mhw_3.jpg",
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
        `INSERT INTO JOGOS (titulo, preco, desconto, platform, descricao, requisitos, cover, screenshot1, screenshot2, screenshot3) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          game.titulo,
          game.preco,
          game.desconto,
          game.platform,
          game.descricao, 
          game.requisitos, 
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
