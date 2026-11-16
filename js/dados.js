/* Catálogo inicial, perfis e persistência no navegador. Os arquivos de áudio e imagem ficam separados dos metadados. */

/* Catálogo original e transações locais do protótipo ECO. */
const SESSAO = "eco.perfil.v2";
const DEMO = "eco12345";
const generos = ["Eletrônica", "Ambient", "Synthpop", "Lo-fi", "MPB", "House", "Indie", "Rock", "Hip hop", "Outro"];
const artistasBase = [
  {
    "id": "weeknd",
    "name": "The Weeknd",
    "role": "artista",
    "genres": "R&B",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/weeknd.webp",
    "email": ""
  },
  {
    "id": "billie",
    "name": "Billie Eilish",
    "role": "artista",
    "genres": "Pop alternativo",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/billie.webp",
    "email": ""
  },
  {
    "id": "tame",
    "name": "Tame Impala",
    "role": "artista",
    "genres": "Rock psicodélico",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/tame.webp",
    "email": "artista@gmail.com"
  },
  {
    "id": "dragons",
    "name": "Imagine Dragons",
    "role": "artista",
    "genres": "Pop rock",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/dragons.webp",
    "email": ""
  },
  {
    "id": "lana",
    "name": "Lana Del Rey",
    "role": "artista",
    "genres": "Pop alternativo",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/lana.webp",
    "email": ""
  },
  {
    "id": "tyler",
    "name": "Tyler, The Creator",
    "role": "artista",
    "genres": "Hip hop",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/tyler.webp",
    "email": ""
  },
  {
    "id": "olivia",
    "name": "Olivia Rodrigo",
    "role": "artista",
    "genres": "Pop punk",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/good4u.webp",
    "email": ""
  },
  {
    "id": "maneva",
    "name": "Maneva",
    "role": "artista",
    "genres": "Reggae",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/luz.webp",
    "email": ""
  },
  {
    "id": "arctic",
    "name": "Arctic Monkeys",
    "role": "artista",
    "genres": "Rock alternativo",
    "bio": "",
    "social": "",
    "banner": "assets/hero.webp",
    "photo": "assets/rumine.webp",
    "email": ""
  }
];
const catalogoBase = [
  {
    "id": "solitude",
    "title": "Solitude Is Bliss",
    "artist": "tame",
    "album": "Innerspeaker",
    "duration": "3:48",
    "genre": "Rock psicodélico",
    "audio": "",
    "cover": "assets/solitude.webp",
    "date": "",
    "description": "",
    "reference": true
  },
  {
    "id": "good4u",
    "title": "good 4 u",
    "artist": "olivia",
    "album": "SOUR",
    "duration": "2:58",
    "genre": "Pop punk",
    "audio": "",
    "cover": "assets/good4u.webp",
    "date": "",
    "description": "",
    "reference": true
  },
  {
    "id": "luz",
    "title": "Luz que me traz paz",
    "artist": "maneva",
    "album": "Luz que me traz paz",
    "duration": "3:41",
    "genre": "Reggae",
    "audio": "",
    "cover": "assets/luz.webp",
    "date": "",
    "description": "",
    "reference": true
  },
  {
    "id": "rumine",
    "title": "R U Mine?",
    "artist": "arctic",
    "album": "AM",
    "duration": "3:21",
    "genre": "Rock alternativo",
    "audio": "",
    "cover": "assets/rumine.webp",
    "date": "",
    "description": "",
    "reference": true
  },
  {
    "id": "let-it-happen",
    "title": "Let It Happen",
    "artist": "tame",
    "album": "Currents",
    "duration": "",
    "genre": "Rock psicodélico",
    "audio": "",
    "cover": "assets/tame.webp",
    "date": "",
    "description": "",
    "reference": true
  }
];
const capaCurrents = "assets/currents.webp", fotoTame = "assets/tame-painel.webp";
const titulosCurrents = [
  "Let It Happen",
  "Nangs",
  "The Moment",
  "Yes I'm Changing",
  "Eventually",
  "Gossip",
  "The Less I Know the Better",
  "Past Life",
  "Disciples",
  "'Cause I'm a Man",
  "Reality in Motion",
  "Love / Paranoia",
  "New Person, Same Old Mistakes"
];

function atualizarCurrents(s) {
  const p = s.profiles.tame;
  if (p?.photo === "assets/tame.webp") p.photo = fotoTame;
  if (p?.banner === "assets/hero.webp") p.banner = fotoTame;
  const antiga = s.tracks.find(t => t.id === "solitude" && t.artist === "tame" && t.reference && !t.audio);
  if (antiga) {
    s.tracks = s.tracks.filter(t => t !== antiga);
    delete s.plays.solitude;
    for (const b of Object.values(s.libs)) {
      for (const campo of ["likes", "stars", "recent"]) b[campo] = b[campo].filter(id => id !== "solitude");
      for (const lista of b.lists) lista.tracks = lista.tracks.filter(id => id !== "solitude");
    }
  }
  titulosCurrents.forEach((title, i) => {
    const id = i === 0 ? "let-it-happen" : "currents-" + (i + 1);
    const atual = s.tracks.find(t => t.id === id);
    if (atual) {
      if (atual.artist === "tame" && atual.album === "Currents") {
        atual.trackNumber = i + 1;
        if (atual.cover === "assets/tame.webp") atual.cover = capaCurrents;
      }
      return;
    }
    s.tracks.push({
      id,
      title,
      artist: "tame",
      album: "Currents",
      trackNumber: i + 1,
      genre: "Rock psicodélico",
      audio: "",
      cover: capaCurrents,
      date: "",
      description: "",
      reference: true
    });
  });
  return atualizarArtistas(s);
}

function atualizarArtistas(s) {
  const anterior = s.profiles.sza;
  if (anterior) {
    // Preserva a autoria de uploads existentes para a administração.
    if (s.tracks.some(t => t.artist === "sza")) anterior.arquivado = true;
    else delete s.profiles.sza;
  }
  for (const b of Object.values(s.libs)) b.artists = b.artists.filter(id => id !== "sza");
  s.catalogVersion = 5;
  return s;
}

function artistaVisivel(p) {
  return p?.role === "artista" && !p.arquivado;
}

function usaBiblioteca() {
  return ["ouvinte", "artista"].includes(perfil()?.role);
}
const capaBase = () => "assets/hero.webp";

function estadoInicial() {
  const profiles = {listener: {id: "listener", name: "Ouvinte ECO", role: "ouvinte", email: "ouvinte@gmail.com"}};
  for (const p of artistasBase) profiles[p.id] = {...p};
  return atualizarCurrents({profiles, tracks: catalogoBase.map(t => ({...t})), libs: {}, plays: {}});
}
let recuperadaAnterior = "";

// Versões anteriores guardavam caminhos relativos em media/. Só referências empacotadas mudam de pasta.
function atualizarCaminhosLocais(s) {
  if (!s || s.versaoAssets === 1) return;
  function ajustar(item, campos) {
    for (const campo of campos) {
      const valor = item?.[campo];
      if (typeof valor === "string" && valor.startsWith("media/")) item[campo] = "assets/" + valor.slice(6);
    }
  }
  for (const perfil of Object.values(s.profiles)) ajustar(perfil, ["photo", "banner"]);
  for (const faixa of [...s.tracks, ...(s.agenda || [])]) ajustar(faixa, ["cover", "audio"]);
  for (const registro of s.removidas || []) ajustar(registro.faixa, ["cover", "audio"]);
  s.versaoAssets = 1;
}

// Mantém bibliotecas existentes quando uma versão do catálogo inicial muda.
function atualizarCatalogo(antigo) {
  atualizarCaminhosLocais(antigo);
  const s = migrarCatalogo(antigo);
  s.versaoAssets = 1;
  if (s.removidas) return s;
  s.removidas = [];
  if (!antigo) return s;
  const base = estadoInicial().tracks;
  const faltantes = base.filter(t => s.profiles[t.artist] && !s.tracks.some(atual => atual.id === t.id));
  for (const t of faltantes) {
    const pos = base.findIndex(f => f.id === t.id);
    const proxima = base.slice(pos + 1).find(f => s.tracks.some(atual => atual.id === f.id));
    const i = proxima ? s.tracks.findIndex(f => f.id === proxima.id) : s.tracks.length;
    if (faltantes.length === 1) {
      s.tracks.splice(i, 0, t);
      recuperadaAnterior = t.title;
    }
    else s.removidas.push({faixa: t, indice: i, proxima: proxima?.id, por: "admin-eco", colecoes: []});
  }
  return s;
}

function migrarCatalogo(s) {
  if (!s) return estadoInicial();
  if (s.catalogVersion === 5) return s;
  if (s.catalogVersion === 4) return atualizarArtistas(s);
  if (s.catalogVersion === 3) return atualizarCurrents(s);
  const antigos = new Set(["eco-1", "eco-2", "eco-3", "eco-4", "eco-5", "eco-6"]);
  const removidos = new Set(s.tracks.filter(t => antigos.has(t.id) && !t.audio?.startsWith("blob:eco-")).map(t => t.id));
  s.tracks = [...s.tracks.filter(t => !removidos.has(t.id)), ...catalogoBase.map(t => ({...t}))];
  for (const p of ["aurora", "lia", "cais", "nara", "indigo"]) {
    if (s.tracks.some(t => t.artist === p)) {
      if (s.profiles[p]) s.profiles[p].email = "";
    } else delete s.profiles[p];
  }
  for (const p of artistasBase) s.profiles[p.id] = {...p};
  for (const b of Object.values(s.libs)) {
    for (const k of ["recent", "stars", "likes"]) b[k] = b[k].filter(id => !removidos.has(id));
    b.artists = b.artists.filter(id => s.profiles[id]);
    for (const l of b.lists) l.tracks = l.tracks.filter(id => !removidos.has(id));
  }
  for (const id of removidos) delete s.plays[id];
  return atualizarCurrents(s);
}

function biblioteca(s, id) {
  return s.libs[id] ??= ({likes: [], stars: [], artists: [], lists: [], recent: []});
}
const conexao = new Promise((resolve, reject) => {
  const r = indexedDB.open("eco-estudio-v2", 1);
  r.onupgradeneeded = () => {
    r.result.createObjectStore("estado");
    r.result.createObjectStore("arquivos");
  };
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});
let state, session;
const canal = typeof BroadcastChannel === "function" ? new BroadcastChannel("eco.atualizacoes.v2") : null;

async function lerEstado() {
  const db = await conexao;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("estado", "readwrite"), store = tx.objectStore("estado"), r = store.get("principal");
    let resultado, erro;
    r.onsuccess = () => {
      try {
        const antigo = r.result, precisaSalvar = antigo?.versaoAssets !== 1 || !antigo?.removidas || antigo.catalogVersion !== 5;
        resultado = atualizarCatalogo(antigo);
        const lancou = liberarAgendadas(resultado);
        if (precisaSalvar || lancou) store.put(resultado, "principal");
      } catch (e) {
        erro = e;
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(resultado);
    tx.onabort = () => reject(erro || tx.error || Error("Falha ao carregar catálogo."));
  });
}

// Lê o estado mais recente e grava os metadados e os arquivos na mesma transação. Só então avisa as outras abas.
async function mudar(alterar) {
  const db = await conexao;
  await new Promise((resolve, reject) => {
    let updated, erro;
    const tx = db.transaction(["estado", "arquivos"], "readwrite"), store = tx.objectStore("estado"), r = store.get("principal");
    r.onsuccess = () => {
      try {
        updated = atualizarCatalogo(r.result);
        liberarAgendadas(updated);
        alterar(updated, tx.objectStore("arquivos"));
        store.put(updated, "principal");
      } catch (e) {
        erro = e;
        tx.abort();
      }
    };
    tx.oncomplete = () => {
      state = updated;
      resolve();
    };
    tx.onabort = () => reject(erro ?? tx.error ?? Error("Não foi possível salvar."));
  });
  canal?.postMessage("atualizado");
}
const urls = new Map();

// Uma chave blob:eco- identifica um arquivo no IndexedDB. O endereço temporário gerado aqui pode ser usado pelo player ou pela imagem.
async function recurso(key) {
  if (!key?.startsWith("blob:eco-")) return key;
  if (!urls.has(key)) {
    const db = await conexao;
    const blob = await new Promise((resolve, reject) => {
      const r = db.transaction("arquivos").objectStore("arquivos").get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    if (!blob) throw Error("Arquivo indisponível neste navegador.");
    urls.set(key, URL.createObjectURL(blob));
  }
  return urls.get(key);
}

function guardarArquivo(store, file) {
  const key = "blob:eco-" + crypto.randomUUID();
  store.put(file, key);
  return key;
}

function descartar(store, key) {
  if (key?.startsWith("blob:eco-")) store.delete(key);
}
const contaAdmin = Object.freeze({id: "admin-eco", role: "admin", name: "Administrador", email: "administrador@gmail.com"});

function perfil() {
  return session === contaAdmin.id ? contaAdmin : state.profiles[session];
}

function admin() {
  return perfil()?.role === "admin";
}

function destino(role) {
  return role === "admin" ? "admin" : role === "artista" ? "estudio" : "painel";
}

function exigirAdmin() {
  if (!admin()) throw Error("Acesso exclusivo da administração.");
}

function leitor() {
  return session || "visitante";
}

function lib() {
  return biblioteca(state, leitor());
}

function faixa(id) {
  return state.tracks.find(t => t.id === id);
}

function nomeArtista(id) {
  return state.profiles[id]?.name || "Artista independente";
}

function alternar(lista, id) {
  const i = lista.indexOf(id);
  if (i < 0) lista.push(id); else lista.splice(i, 1);
}

function normalizar(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function pesquisar(t, q) {
  return normalizar([t.title, nomeArtista(t.artist), t.album, t.genre].join(" ")).includes(normalizar(q));
}

function escapar(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
}
const E = escapar;

function idLink(id) {
  return encodeURIComponent(id);
}

function tempo(n) {
  return Number.isFinite(n) ? Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0") : "0:00";
}

function dataBR(value) {
  return new Date(value.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR");
}

function entrarComo(id) {
  session = id;
  sessionStorage.setItem(SESSAO, id);
}

function sair() {
  session = null;
  sessionStorage.removeItem(SESSAO);
}


function avisarSeguidores(s, faixa) {
  for (const b of Object.values(s.libs)) {
    if (b.artists.includes(faixa.artist)) (b.lancamentos ??= []).push(faixa.id);
  }
}

// Move para o catálogo os lançamentos cujo horário já chegou. Também é chamada quando o usuário reabre o site.
function liberarAgendadas(s, agora = Date.now()) {
  const prontas = (s.agenda || []).filter(t => Date.parse(t.date) <= agora);
  if (!prontas.length) return false;
  s.agenda = s.agenda.filter(t => !prontas.includes(t));
  for (const t of prontas.sort((a, b) => a.date.localeCompare(b.date))) {
    s.tracks.unshift(t);
    avisarSeguidores(s, t);
  }
  return true;
}

function registrarEscuta(s, id, usuario, agora = new Date()) {
  const t = s.tracks.find(item => item.id === id);
  if (!t) return;
  const dia = agora.toISOString().slice(0, 10);
  const dias = s.plays[id] ??= {};
  dias[dia] = (dias[dia] || 0) + 1;
  if (!usuario || !s.profiles[usuario]) return;
  const b = biblioteca(s, usuario);
  b.recent = [id, ...b.recent.filter(x => x !== id)].slice(0, 60);
  const mes = dia.slice(0, 7), porFaixa = (b.meses ??= {})[mes] ??= {};
  const registro = porFaixa[id] ??= {artist: t.artist, genre: t.genre, title: t.title, n: 0};
  registro.n++;
  registro.ultima = agora.toISOString();
}

function dataHora(value) {
  return new Date(value).toLocaleString("pt-BR", {dateStyle: "short", timeStyle: "short"});
}

function chaveLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
