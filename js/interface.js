/* Cabeçalho, menu lateral, início e coleção do ouvinte. Cada tela monta apenas a parte do conteúdo que precisa trocar. */

let visiveis = [];
const main = document.getElementById("conteudo");
const route = () => decodeURIComponent(location.hash.slice(1) || "inicio");

function avatarArtista(p) {
  if (p.photo) return imageTag(p.photo, "avatar");
  const iniciais = p.name.trim().split(/\s+/).slice(0, 2).map(n => Array.from(n)[0]).join("");
  return '<span class="avatar avatar-iniciais" aria-hidden="true">' + E(iniciais) + '</span>';
}

function artistaCards(perfis = Object.values(state.profiles).filter(artistaVisivel)) {
  if (!perfis.length) return vazio("Nenhum artista por aqui ainda.");
  const itens = perfis.map(p => link("perfil/" + idLink(p.id), avatarArtista(p) + '<strong>' + E(p.name) + '</strong>', "artist-round")).join("");
  return '<div class="artist-carousel">' + button("artistprev", "Artistas anteriores", "arrow")
    + '<div class="artist-strip" tabindex="0" aria-label="Lista de artistas">' + itens + '</div>'
    + button("artistnext", "Próximos artistas", "arrow") + '</div>';
}

// Compara a largura disponível com a do conteúdo antes de mostrar os controles de rolagem.
function atualizarSetas(trilho) {
  const faixa = trilho.parentElement, anterior = faixa.firstElementChild, proxima = faixa.lastElementChild;
  const foco = document.activeElement;
  // Compara com a largura total, inclusive o espaço que as próprias setas ocupariam.
  const precisaRolar = trilho.scrollWidth > faixa.clientWidth + 1;
  faixa.classList.toggle("tem-rolagem", precisaRolar);
  anterior.disabled = !precisaRolar || trilho.scrollLeft <= 1;
  proxima.disabled = !precisaRolar || trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 1;
  if ((foco === anterior && anterior.disabled) || (foco === proxima && proxima.disabled)) {
    const destino = !anterior.disabled ? anterior : !proxima.disabled ? proxima : trilho;
    destino.focus({preventScroll: true});
  }
}
const medirTrilhos = typeof ResizeObserver === "function" ? new ResizeObserver(itens => itens.forEach(i => atualizarSetas(i.target))) : null;

function iniciarTrilhos() {
  medirTrilhos?.disconnect();
  for (const trilho of main.querySelectorAll(".artist-strip")) {
    atualizarSetas(trilho);
    medirTrilhos?.observe(trilho);
    trilho.onscroll = () => atualizarSetas(trilho);
  }
}

function cards(tracks) {
  return tracks.length ? '<div class="covers">'
    + tracks.map(t => '<article class="cover" data-track="' + t.id + '"><div class="sleeve">'
      + imageTag(t.cover, "", "Capa de " + t.title)
      + button("play", t.audio ? "Ouvir " + t.title : "Ver ficha de " + t.title, t.audio ? "play" : "arrow", t.id)
      + '</div><div class="meta"><small>' + E(t.genre) + '</small><strong>' + E(t.title) + '</strong>'
      + link("perfil/" + t.artist, E(nomeArtista(t.artist))) + '</div></article>').join("")
    + '</div>' : vazio("Nenhuma faixa por aqui ainda.");
}

function tabela(tracks, opts = {}) {
  visiveis = tracks.map(t => t.id);
  if (!tracks.length) return vazio(opts.empty || "Nenhuma faixa por aqui ainda.");
  return '<div class="tracks">'
    + tracks.map((t, i) => '<article class="track" data-track="' + t.id
      + '"><button class="trackplay" data-act="play" data-id="' + t.id + '" aria-label="'
      + (t.audio ? "Ouvir " : "Ver ficha de ") + E(t.title) + '">' + imageTag(t.cover) + '<span>'
      + ico(t.audio ? "play" : "arrow") + '</span></button><div class="trackname"><strong>' + E(t.title)
      + '</strong>' + link("perfil/" + t.artist, E(nomeArtista(t.artist)))
      + '</div><span class="trackgenre">' + E(t.genre) + '</span><div class="actions">'
      + (usaBiblioteca() ? button("like", "Curtir " + t.title, "heart", t.id, lib().likes.includes(t.id))
        + button("trackmenu", "Opções de " + t.title, "menu", t.id) : "")
      + (opts.list ? button("removeitem", "Remover da playlist", "close", t.id) : "") + '</div></article>').join("")
    + '</div>';
}

function buscaTopo() {
  const valor = route().startsWith("buscar/") ? route().slice(7) : "";
  return '<form id="busca-topo" role="search"><input id="busca" type="search" name="q" aria-label="Buscar músicas, artistas, álbuns e gêneros" placeholder="Buscar no ECO" value="'
    + E(valor) + '"><button aria-label="Pesquisar">' + ico("search") + '</button></form>';
}
const tamanhosLateral = ["compacta", "normal", "ampla"];
let modoLateral = "normal";
try {
  const salvo = localStorage.getItem("eco.lateral");
  if (tamanhosLateral.includes(salvo)) modoLateral = salvo;
} catch { }

function controlesLateral() {
  const controle = (acao, rotulo, icone, limite) => '<button type="button" class="iconbtn" data-act="' + acao + '" aria-label="' + rotulo + '" title="'
    + rotulo + '"' + (modoLateral === limite ? ' disabled' : '') + '>' + ico(icone) + '</button>';
  return '<div class="ajuste-lateral" role="group" aria-label="Largura da navegação">'
    + controle("retrair", "Recolher navegação", "recolher", "compacta")
    + controle("ampliar", "Ampliar navegação", "ampliar", "ampla") + '</div>';
}

function ajustarLateral(passo) {
  const indice = tamanhosLateral.indexOf(modoLateral);
  modoLateral = tamanhosLateral[Math.max(0, Math.min(2, indice + passo))];
  try {
    localStorage.setItem("eco.lateral", modoLateral);
  } catch { }
  topo();
  const alvo = passo < 0 ? "retrair" : "ampliar";
  const nav = document.querySelector("#lateral");
  (nav.querySelector('[data-act="' + alvo + '"]:not(:disabled)') || nav.querySelector(".ajuste-lateral button:not(:disabled)"))?.focus();
}

function topo() {
  const p = perfil(), pagina = route().split("/")[0];
  const area = ({perfil: "explorar", album: "explorar", estilo: "explorar", ficha: "explorar", lista: "playlists"})[pagina] || pagina;
  const destinos = [["inicio", "Início"], ["explorar", "Explorar"], ["sobre", "Sobre"]];
  const nav = destinos.map(([dest, rotulo]) => link(dest, rotulo, area === dest ? "sel" : "")).join("");
  const conta = p ? link(destino(p.role), ico("user") + '<span>' + E(p.name) + '</span>', "account" + (pagina === destino(p.role) ? " sel" : ""))
    + button("sair", "Sair da conta", "logout") : link("login/ouvinte", "Entrar", "plain" + (pagina === "login" ? " sel" : ""))
  + link("cadastro", "Criar conta", "primary" + (pagina === "cadastro" ? " sel" : ""));
  document.querySelector("#topo").innerHTML = link("inicio", '<img src="assets/logo.png" alt="ECO">', "marca")
    + '<nav aria-label="Navegação principal">' + nav + '</nav>' + buscaTopo()
    + '<div class="top-actions">' + conta + '</div>';
  const aside = document.querySelector("#lateral");
  document.querySelector("#shell").dataset.lateral = modoLateral;
  aside.hidden = !p;
  document.querySelector("#shell").classList.toggle("workspace", !!p);
  if (p) {
    const links = (items) => items.map(([dest, icon, label]) => '<a href="#' + dest + '" aria-label="' + label + '" title="' + label + '"'
      + (area === dest ? ' class="sel" aria-current="page"' : '') + '>' + ico(icon) + '<span>' + label
      + '</span></a>').join("");
    const grupo = (label, items) => '<div class="nav-set"><small>' + label + '</small>' + links(items) + '</div>';
    aside.innerHTML = '<nav aria-label="Menu da conta">' + controlesLateral()
      + grupo("Descobrir", [["inicio", "home", "Início"], ["explorar", "search", "Explorar"], ["sobre", "disc", "Sobre"]])
      + (usaBiblioteca() ? grupo("Sua coleção", [
        ["painel", "headphones", "Para você"],
        ["biblioteca", "library", "Biblioteca"],
        ["curtidas", "heart", "Curtidas"],
        ["playlists", "list", "Playlists"],
        ["relatorio", "bars", "Meu mês"]
      ]) : "")
      + (p.role === "artista" ? grupo("Criação", [["estudio", "bars", "Estúdio"]]) : admin() ? grupo("Gestão", [["admin", "bars", "Administração"]]) : "")
      + '</nav>';
  }
  document.querySelector("#rodape").innerHTML = rodapeECO();
}
const inicioPadrao = {
  titulo: "Descubra seu",
  enfase: "próximo som.",
  descricao: "Explore álbuns, conheça artistas e encontre as faixas que vão fazer parte do seu dia."
};

function bannerInicio(copy) {
  const arte = '<div class="capa-eco" aria-hidden="true"><div class="vinil-eco"><i></i></div><div class="envelope-eco"><span class="gravura-eco"></span><b>ECO</b><span class="marca-sonora">▂▆▄▇▃▅</span></div></div>';
  return '<section class="hero hero-eco"><div class="hero-layout"><div class="hero-copy">'
    + tag("DESCOBERTA MUSICAL INDEPENDENTE") + '<h1>' + E(copy.titulo) + '<br><em>' + E(copy.enfase)
    + '</em></h1><p>' + E(copy.descricao) + '</p><div class="ctas">'
    + link("explorar", "Explorar catálogo " + ico("arrow"), "primary")
    + link("sobre", "Conhecer o ECO", "outline") + '</div></div>' + arte + '</div></section>';
}

function generosInicio(faixas) {
  const grupos = new Map();
  for (const t of faixas) {
    if (!t.genre) continue;
    if (!grupos.has(t.genre)) grupos.set(t.genre, {capa: t.cover, n: 0});
    grupos.get(t.genre).n++;
  }
  if (!grupos.size) return "";
  const itens = [...grupos].map(([nome, g]) => {
    const legenda = g.n + (g.n === 1 ? " faixa" : " faixas");
    return link("estilo/" + idLink(nome), imageTag(g.capa, "genre-art") + '<span class="genre-title"><strong>' + E(nome) + '</strong><small>'
      + legenda + '</small></span>' + ico("arrow"), "genre-door");
  });
  return '<section>' + sec("Explore por gênero") + '<div class="home-genres">' + itens.join("") + '</div></section>';
}

function estanteInicio() {
  const itens = [];
  for (const p of Object.values(state.profiles).filter(artistaVisivel)) {
    const faixas = state.tracks.filter(t => t.artist === p.id);
    for (const [nome, ts] of albunsDe(faixas)) {
      const detalhe = ts.length + (ts.length === 1 ? " faixa no ECO" : " faixas no ECO");
      itens.push(link(rotaAlbum(p.id, nome), '<span class="shelf-art">' + imageTag(ts[0].cover) + '</span><span class="shelf-label"><small>'
        + E(p.name) + '</small><strong>' + E(nome) + '</strong><span>' + detalhe + '</span></span>'
        + ico("arrow"), "shelf-item"));
    }
  }
  return itens.length ? '<section>' + sec("Estante de álbuns") + '<div class="home-shelf">' + itens.join("") + '</div></section>' : "";
}
let ultimaSorteada = "";

function sortearFaixaInicio() {
  const outras = state.tracks.filter(t => t.id !== ultimaSorteada);
  const opcoes = outras.length ? outras : state.tracks;
  if (!opcoes.length) return;
  ultimaSorteada = opcoes[Math.floor(Math.random() * opcoes.length)].id;
  location.hash = "#ficha/" + idLink(ultimaSorteada);
}

function surpresaInicio(faixas) {
  if (!faixas.length) return "";
  const capas = [...new Set(faixas.map(t => t.cover).filter(Boolean))].slice(0, 3);
  return '<section class="home-surprise"><div><h2>Descoberta ao acaso</h2><p>Sorteie uma faixa para conhecer a música, o álbum e quem assina o som.</p>'
    + btn("sortearfaixa", ico("shuffle") + " Sortear uma faixa", "", "primary")
    + '</div><div class="surprise-covers" aria-hidden="true">' + capas.map(c => imageTag(c)).join("")
    + '</div></section>';
}

function home() {
  const copy = {...inicioPadrao, ...state.home}, featured = state.tracks.slice(0, 4);
  visiveis = featured.map(t => t.id);
  return bannerInicio(copy) + '<section>'
    + sec("Faixas em destaque", "", link("explorar", "Ver catálogo " + ico("arrow"), "textlink"))
    + cards(featured) + '</section>' + generosInicio(state.tracks)
    + '<section class="home-artist-gallery">' + sec("Artistas para descobrir") + artistaCards()
    + '</section>' + estanteInicio() + surpresaInicio(state.tracks);
}

function painel() {
  const b = lib(), generosPreferidos = new Set([...b.likes, ...b.stars, ...b.recent].map(faixa).filter(Boolean).map(t => t.genre));
  const score = t => (generosPreferidos.has(t.genre) ? 3 : 0) + (b.artists.includes(t.artist) ? 2 : 0);
  const lista = [...state.tracks], recomendadas = [...lista].sort((a, b) => score(b) - score(a)), emAlta = [...lista].sort((a, b) => totalPlays(b) - totalPlays(a));
  const sugeridos = gruposArtistas(recomendadas, t => score(t)), populares = gruposArtistas(emAlta, totalPlays);
  return tag("PARA VOCÊ") + '<h1>Seu ECO do dia</h1><section>'
    + sec("Músicas recomendadas para você", generosPreferidos.size ? "Com base no que você ouviu e salvou." : "Uma seleção para explorar.")
    + cards(recomendadas.slice(0, 4)) + '</section><section>'
    + sec("Músicas em alta", "Reproduções no seu ECO.") + tabela(emAlta.slice(0, 5))
    + '</section><section>' + sec("Cantores recomendados") + artistasOuvinte(sugeridos)
    + '</section><section>'
    + sec("Cantores em alta", "Artistas por reproduções acumuladas neste navegador.")
    + artistasOuvinte(populares) + '</section><section>' + sec("Tocadas recentemente")
    + (b.recent.length ? cards(b.recent.map(faixa).filter(Boolean).slice(0, 4)) : vazio("Seu histórico aparece quando você ouve a primeira faixa."))
    + '</section>';
}

function explorar() {
  return tag("DESCOBERTA MUSICAL") + '<h1>Explorar</h1>' + descoberta();
}

function perfilPublico(id) {
  const p = state.profiles[id];
  if (!p || p.role !== "artista") return vazio("Artista indisponível.");
  const faixas = state.tracks.filter(t => t.artist === id);
  const cabecalho = (p.banner ? '<div class="profile-banner">' + imageTag(p.banner) + '</div>' : '')
    + '<div class="identity">' + avatarArtista(p) + '<div>' + tag("ARTISTA") + '<h1>' + E(p.name) + '</h1>'
    + (p.genres ? '<p>' + E(p.genres) + '</p>' : '') + '</div>';
  const proprio = perfil()?.role === "artista" && session === id;
  const acaoPerfil = proprio ? btn("editprofile", ico("edit") + " Editar perfil", id, "outline") : usaBiblioteca() ? btn("follow", lib().artists.includes(id) ? "Seguindo" : "Seguir artista", id, "outline", lib().artists.includes(id)) : "";
  const bio = p.bio ? '<p class="lead">' + E(p.bio) + '</p>' : "";
  const rede = p.social ? '<a class="textlink" href="' + E(p.social)
    + '" target="_blank" rel="noopener noreferrer">Rede social ' + ico("arrow") + '</a>' : "";
  return (admin() ? link("admin", "← Voltar à administração", "textlink admin-back") : "") + cabecalho
    + acaoPerfil + '</div>' + bio + rede + discografia(p, faixas, proprio) + albunsEstudio(p, faixas, "Álbuns")
    + ((admin() || proprio) ? lixeira(id) : "");
}
let paginaDiscos = "", limiteDiscos = 10;

function discografia(p, faixas, publicar = false) {
  if (paginaDiscos !== route()) {
    paginaDiscos = route();
    limiteDiscos = 10;
  }
  const visiveis = faixas.slice(0, limiteDiscos), gestao = admin() || perfil()?.id === p.id;
  const linhas = gestao ? visiveis.map(linhaGestao).join("") : tabela(visiveis);
  const verMais = limiteDiscos < faixas.length ? btn("maisdiscos", "Mostrar mais " + ico("down"), "", "outline") : "";
  const recolher = limiteDiscos > 10 ? btn("menosdiscos", "Mostrar menos " + ico("up"), "", "outline") : "";
  return '<section class="discografia">'
    + sec("Discografia", faixas.length + (faixas.length === 1 ? " faixa" : " faixas"), publicar ? btn("publish", ico("plus") + " Publicar música", "", "primary") : "")
    + (linhas || vazio("Nenhuma faixa neste perfil."))
    + (verMais || recolher ? '<div class="ctas">' + verMais + recolher + '</div>' : "") + '</section>';
}

function colecaoVazia(msg) {
  return '<div class="collection-empty"><p>' + E(msg) + '</p>' + link("painel", "Adicionar", "outline") + '</div>';
}

function linhasPlaylists() {
  return lib().lists.length ? '<div class="playlist-list">'
    + lib().lists.map(l => '<div>'
      + link("lista/" + idLink(l.id), ico("list") + '<span><strong>' + E(l.name) + '</strong><small>' + l.tracks.filter(faixa).length
        + ' faixas</small></span>', "playlist-link")
      + button("deletelist", "Excluir playlist " + l.name, "trash", l.id) + '</div>').join("")
    + '</div>' : colecaoVazia("Você ainda não tem playlists.");
}

function listas() {
  return tag("SUA BIBLIOTECA") + '<div class="sectitle"><h1>Playlists</h1>'
    + btn("newlist", ico("plus") + " Criar playlist", "", "primary") + '</div>' + linhasPlaylists();
}

function lista(id) {
  const l = lib().lists.find(x => x.id === id);
  if (!l) return vazio("Playlist indisponível.");
  const ts = l.tracks.map(faixa).filter(Boolean);
  return tag("PLAYLIST") + '<div class="sectitle"><h1>' + E(l.name) + '</h1><div class="ctas">'
    + btn("renamelist", "Renomear", l.id) + btn("deletelist", "Excluir playlist", l.id, "outline")
    + '</div></div>'
    + (ts.length ? tabela(ts, {list: true}) : colecaoVazia("Sua playlist ainda está vazia."));
}

function minhasPlaylists() {
  return '<section>'
    + sec("Minhas playlists", "", link("playlists", "Gerenciar " + ico("arrow"), "textlink"))
    + linhasPlaylists() + '</section>';
}

function curtidasView() {
  const ts = lib().likes.map(faixa).filter(Boolean);
  return tag("SUA BIBLIOTECA") + '<h1>Curtidas</h1>'
    + (ts.length ? tabela(ts) : colecaoVazia("Você ainda não curtiu nenhuma música."))
    + minhasPlaylists();
}

function bibliotecaView() {
  const b = lib(), ts = b.stars.map(faixa).filter(Boolean), artistas = b.artists.map(id => state.profiles[id]).filter(artistaVisivel), recentes = b.recent.map(faixa).filter(Boolean);
  return tag("COLEÇÃO PESSOAL") + '<div class="sectitle"><h1>Biblioteca</h1>'
    + link("relatorio", "Ver meu mês " + ico("arrow"), "textlink") + '</div>' + sec("Faixas favoritas")
    + (ts.length ? tabela(ts) : colecaoVazia("Você ainda não guardou faixas favoritas."))
    + minhasPlaylists() + '<section>' + sec("Artistas favoritos")
    + (artistas.length ? artistaCards(artistas) : colecaoVazia("Você ainda não segue artistas."))
    + '</section><section>' + sec("Histórico recente")
    + (recentes.length ? cards(recentes.slice(0, 4)) : colecaoVazia("Seu histórico começa na primeira reprodução."))
    + '</section>';
}
