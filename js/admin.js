/* O administrador modera o catálogo por artista e pode restaurar faixas retiradas. */

function linhaGestao(t) {
  const editar = perfil()?.role === "artista" && t.artist === session ? button("edittrack", "Editar " + t.title, "edit", t.id) : "";
  const artista = link("perfil/" + idLink(t.artist), E(nomeArtista(t.artist)));
  return '<article class="track">' + imageTag(t.cover, "thumb") + '<div class="trackname"><strong>'
    + E(t.title) + '</strong><small>' + artista + ' · ' + E(t.genre)
    + '</small></div><div class="actions">' + editar
    + button("delete", "Excluir " + t.title, "trash", t.id) + '</div></article>';
}

function painelAdmin() {
  exigirAdmin();
  const faixas = state.tracks;
  const artistas = Object.values(state.profiles).filter(artistaVisivel).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return '<h1>Administração</h1><section>' + sec("Gerenciar por artista") + artistaCards(artistas)
    + '</section><section>'
    + sec("Moderação de músicas", faixas.length + (faixas.length === 1 ? " faixa" : " faixas") + " no catálogo")
    + (faixas.map(linhaGestao).join("") || vazio("Nenhuma música para moderar.")) + '</section>'
    + lixeira();
}
