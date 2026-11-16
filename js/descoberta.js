/* Busca, gêneros, álbuns e fichas. Uma referência sem áudio pode ser consultada no catálogo. */

function totalPlays(t) {
  return Object.values(state.plays[t.id] || {}).reduce((a, b) => a + b, 0);
}

function albunsDe(faixas) {
  const albuns = new Map();
  for (const t of faixas) {
    if (!t.album || normalizar(t.album) === "single") continue;
    if (!albuns.has(t.album)) albuns.set(t.album, []);
    albuns.get(t.album).push(t);
  }
  for (const tracks of albuns.values()) tracks.sort((a, b) => (a.trackNumber || Infinity) - (b.trackNumber || Infinity));
  return albuns;
}

function rotaAlbum(artist, album) {
  return "album/" + idLink(artist) + "/" + idLink(album);
}

function albunsEstudio(p, ts, titulo = "Seus álbuns") {
  const colecao = [...albunsDe(ts)].map(([nome, tracks]) => link(rotaAlbum(p.id, nome), imageTag(tracks[0].cover, "album-cover") + '<span><strong>' + E(nome) + '</strong><small>'
    + tracks.length + (tracks.length === 1 ? " faixa" : " faixas") + '</small></span>' + ico("arrow"), "album-tile")).join("");
  if (!colecao && titulo === "Álbuns") return "";
  return '<section>' + sec(titulo)
    + (colecao ? '<div class="album-grid">' + colecao + '</div>' : vazio("Ao publicar uma música, informe o nome do álbum para reuni-la aqui."))
    + '</section>';
}

function paginaAlbum(id, nome) {
  const p = state.profiles[id], ts = albunsDe(state.tracks.filter(t => t.artist === id)).get(nome);
  if (!p || !ts) return vazio("Álbum indisponível.");
  const gerencia = perfil()?.role === "artista" && perfil().id === id;
  const voltar = gerencia ? link("estudio", "← Estúdio", "textlink") : link("perfil/" + id, "← Perfil do artista", "textlink");
  const linhas = ts.map((t, i) => '<li><span class="ordem">' + String(i + 1).padStart(2, "0") + '</span>'
    + link("ficha/" + t.id, E(t.title), "album-title")
    + (t.duration ? '<small>' + E(t.duration) + '</small>' : "")
    + (t.audio ? button("play", "Reproduzir " + t.title, "play", t.id) : "")
    + (gerencia ? button("edittrack", "Editar " + t.title, "edit", t.id) : admin() ? button("delete", "Excluir " + t.title, "trash", t.id) : "")
    + '</li>').join("");
  return voltar + '<header class="album-head">' + imageTag(ts[0].cover, "album-cover") + '<div>'
    + tag("ÁLBUM") + '<h1>' + E(nome) + '</h1>' + link("perfil/" + id, E(p.name), "textlink") + '<p>' + ts.length
    + (ts.length === 1 ? " faixa" : " faixas") + '</p>'
    + (gerencia ? btn("albumtrack", ico("plus") + " Adicionar faixa", ts[0].id, "primary") : "")
    + '</div></header><ol class="album-tracks">' + linhas + '</ol>';
}

function gruposArtistas(tracks, peso) {
  const ranking = new Map();
  tracks.forEach((t, i) => ranking.set(t.artist, (ranking.get(t.artist) || 0) + peso(t, i)));
  return [...ranking].sort((a, b) => b[1] - a[1]).map(([id]) => state.profiles[id]).filter(artistaVisivel).slice(0, 4);
}

function artistasOuvinte(profiles) {
  return artistaCards(profiles);
}

function resultadosBusca(termo) {
  if (!normalizar(termo)) return "<h1>Buscar no ECO</h1>" + vazio("Digite o nome de uma faixa, artista, álbum ou gênero.");
  const ts = state.tracks.filter(t => pesquisar(t, termo));
  const ps = Object.values(state.profiles).filter(p => artistaVisivel(p) && normalizar(p.name).includes(normalizar(termo)));
  return '<h1>Resultados da busca</h1><p>' + E(termo) + '</p>'
    + ((ts.length ? sec("Músicas") + tabela(ts) : "") + (ps.length ? sec("Artistas") + artistaCards(ps) : "") || vazio("Nenhum resultado. Experimente outro título ou artista."));
}

function descoberta() {
  const tracks = state.tracks;
  const destaque = tracks.slice(0, 4), estilos = [...new Set(tracks.map(t => t.genre))];
  const estilosHtml = '<div class="ref-grid generos">'
    + estilos.map(g => {
      const t = tracks.find(t => t.genre === g);
      return link("estilo/" + idLink(g), imageTag(t.cover, "foto-ref") + '<span class="ref-info"><strong>' + E(g)
        + '</strong><small>Explorar gênero</small></span>', "ref-item");
    }).join("")
    + '</div>';
  return '<section>' + sec("Em alta agora", "Seleção editorial do ECO.") + cards(destaque)
    + '</section><section>' + sec("Explore por gênero") + estilosHtml + '</section><section>'
    + sec("Artistas em destaque") + artistaCards() + '</section>';
}

function fichaMusica(id) {
  const t = faixa(id);
  if (!t) return vazio("Faixa indisponível.");
  return link("explorar", "← Explorar", "textlink") + '<div class="ref-detail">'
    + imageTag(t.cover, "reviewcover", "Imagem de " + t.title) + '<div>'
    + tag(t.audio ? "FAIXA DO ECO" : "REFERÊNCIA MUSICAL") + '<h1>' + E(t.title) + '</h1>'
    + link("perfil/" + t.artist, E(nomeArtista(t.artist)), "textlink") + '<p>'
    + [
      t.album && normalizar(t.album) !== "single" ? link(rotaAlbum(t.artist, t.album), E(t.album), "textlink") : E(t.album),
      E(t.genre),
      E(t.duration)
    ].filter(Boolean).join(" · ")
    + '</p><p>' + E(t.description) + '</p>'
    + (t.audio ? btn("play", ico("play") + " Reproduzir", id, "primary") : '<p>Referência para descoberta musical. Áudio indisponível no ECO.</p>')
    + '</div></div>';
}
