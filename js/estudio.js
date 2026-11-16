/* Área do artista: perfil, revisão de arquivos, publicação, agendamento e lixeira. */

function exigirArtista() {
  if (perfil()?.role !== "artista") throw Error("Entre com um perfil de artista para acessar o estúdio.");
}

function estudio() {
  if (perfil()?.role !== "artista") return auth("login", "artista");
  const p = perfil(), ts = state.tracks.filter(t => t.artist === p.id);
  const soma = t => Object.values(state.plays[t.id] || {}).reduce((a, b) => a + b, 0);
  const following = Object.values(state.libs).filter(b => b.artists.includes(p.id)).length;
  const hero = '<section class="studio-hero">' + (p.banner ? imageTag(p.banner, "studio-backdrop") : "")
    + '<div class="studio-intro">' + avatarArtista(p) + '<div>' + tag("PAINEL DO ARTISTA") + '<h1>Olá, '
    + E(p.name)
    + '!</h1><p>Acompanhe suas músicas, seu público e seus resultados.</p><div class="ctas">'
    + btn("publish", ico("plus") + " Publicar música", "", "primary")
    + btn("editprofile", "Editar perfil") + '</div></div></div></section>';
  return hero + '<div class="studio-public">'
    + link("perfil/" + p.id, "Ver perfil público " + ico("arrow"), "textlink")
    + '</div><div class="stats">'
    + [
      ["Faixas no catálogo", ts.length],
      ["Reproduções", ts.reduce((n, t) => n + soma(t), 0)],
      ["Seguidores", following],
      ...alcanceArtista(ts),
      ["Álbuns lançados", albunsDe(ts).size]
    ].map(([label, n]) => '<article><small>' + label + '</small><b>' + n + '</b></article>').join("")
    + '</div>' + painelDesempenho(ts) + agendaEstudio() + '<section>' + sec("Mais ouvidas")
    + resumoPorFaixa(ts) + '</section>'
    + discografia(p, ts.slice().sort((a, b) => b.date.localeCompare(a.date))) + albunsEstudio(p, ts)
    + lixeira(p.id);
}
let draft = null;

function formFaixa(id, album = "") {
  exigirArtista();
  const t = id ? (faixa(id) || state.agenda?.find(t => t.id === id)) : null;
  if (id && (!t || t.artist !== session)) throw Error("Faixa indisponível.");
  const v = draft || t || {album};
  abrir('<h2>' + (id ? "Editar música" : "Publicar música") + '</h2><form id="trackform" data-id="' + E(id)
    + '">' + campo("Título", "title", v.title, 'required maxlength="90"')
    + campo("Álbum ou single", "album", v.album, 'maxlength="90" placeholder="Single"')
    + escolha("Gênero", "genre", v.genre && !generos.includes(v.genre) ? [v.genre, ...generos] : generos, v.genre)
    + texto("Descrição", "description", v.description)
    + (!id || state.agenda?.some(t => t.id === id) ? campo("Agendar lançamento (opcional)", "quando", v.quando ?? chaveLocal(t?.date), 'type="datetime-local"')
      + '<small>Deixe em branco para publicar agora. Use o horário local deste dispositivo.</small>' : "")
    + campo("Capa · JPG ou PNG", "cover", "", 'type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" ' + (!t && !v.coverFile ? "required" : ""))
    + campo("Áudio · MP3", "audio", "", 'type="file" accept="audio/mpeg,.mp3" ' + (!t && !v.audioFile ? "required" : ""))
    + (draft ? '<small>Os arquivos selecionados na etapa anterior foram mantidos.</small>' : '')
    + '<button class="primary">Revisar publicação</button><p class="error" role="alert"></p></form>');
}

async function validarMidia(file, kind, publicacao = false) {
  if (!file) return;
  if (publicacao) {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
    if (kind === "image" && !((jpg && /\.jpe?g$/i.test(file.name)) || (png && /\.png$/i.test(file.name)))) throw Error("Envie a capa em JPG ou PNG.");
    const mp3 = (bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51) || (bytes[0] === 255 && (bytes[1] & 224) === 224 && (bytes[1] & 6) === 2);
    if (kind === "audio" && (!mp3 || !/\.mp3$/i.test(file.name))) throw Error("Formato inválido. Envie o áudio em MP3.");
  }
  if (file.size > (kind === "image" ? (publicacao ? 5 : 8) : 50) * 1024 * 1024) throw Error("O arquivo excede o limite de envio. Selecione uma versão menor.");
  const url = URL.createObjectURL(file);
  try {
    await new Promise((res, rej) => {
      const el = kind === "image" ? new Image() : new Audio();
      const timer = setTimeout(() => end(false), 12000);
      function end(ok) {
        clearTimeout(timer);
        el.onload = el.onerror = el.onloadedmetadata = null;
        ok ? res() : rej(Error("Arquivo de " + (kind === "image" ? "imagem" : "áudio") + " ilegível ou formato incompatível."));
      }
      el.onerror = () => end(false);
      if (kind === "image") el.onload = () => end(true); else {
        el.preload = "metadata";
        el.onloadedmetadata = () => end(Number.isFinite(el.duration) && el.duration > 0);
      }
      el.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
let previewURLs = [];

function limparPreview() {
  previewURLs.forEach(u => URL.revokeObjectURL(u));
  previewURLs = [];
}

function temporario(file) {
  const url = URL.createObjectURL(file);
  previewURLs.push(url);
  return url;
}

// Mantém os arquivos como rascunho durante a prévia. A gravação no catálogo acontece só depois da confirmação.
async function revisar(form) {
  exigirArtista();
  const d = new FormData(form), id = form.dataset.id, t = id ? (faixa(id) || state.agenda?.find(t => t.id === id)) : null;
  if (id && (!t || t.artist !== session)) throw Error("Faixa indisponível.");
  const novo = (n) => d.get(n)?.size ? d.get(n) : draft?.[n + "File"];
  const coverFile = novo("cover"), audioFile = novo("audio");
  await Promise.all([validarMidia(coverFile, "image", true), validarMidia(audioFile, "audio", true)]);
  const title = d.get("title").trim();
  if (!title) throw Error("Informe o título da música.");
  const quando = d.get("quando") || "";
  if (quando && !(Date.parse(quando) > Date.now())) throw Error("Escolha uma data e hora futuras para o lançamento.");
  draft = {
    id,
    title,
    quando,
    album: d.get("album").trim() || "Single",
    genre: d.get("genre"),
    description: d.get("description").trim(),
    coverFile,
    audioFile
  };
  limparPreview();
  const cover = coverFile ? temporario(coverFile) : await recurso(t.cover), src = audioFile ? temporario(audioFile) : await recurso(t.audio);
  abrir('<h2>Revisar publicação</h2><div class="review">' + imageTag(cover, "reviewcover") + '<h3>'
    + E(title) + '</h3><p>' + E(draft.album) + ' · ' + E(draft.genre) + '</p><p>' + E(draft.description)
    + '</p>'
    + (src ? '<audio controls preload="metadata" src="' + E(src) + '"></audio>' : '<small>Referência sem áudio.</small>')
    + '</div><p>'
    + (quando ? 'Lançamento agendado para ' + E(dataHora(quando)) + '.' : 'Publicação imediata no catálogo deste navegador.')
    + '</p><div class="ctas">' + btn("backdraft", "Voltar")
    + btn("confirmtrack", quando ? "Confirmar agendamento" : "Confirmar publicação", "", "primary")
    + '</div>');
}

async function publicar() {
  exigirArtista();
  if (!draft) return;
  const v = draft, autor = session;
  await mudar((s, files) => {
    const agenda = s.agenda ??= [];
    const pendente = agenda.find(t => t.id === v.id);
    let t = v.id ? (pendente || s.tracks.find(t => t.id === v.id)) : null;
    if (s.profiles[autor]?.role !== "artista" || session !== autor) throw Error("Escolha um artista.");
    if (v.id && (!t || t.artist !== autor)) throw Error("O lançamento foi alterado ou excluído.");
    if (v.quando && (!(Date.parse(v.quando) > Date.now()) || (t && !pendente))) throw Error("Revise o horário do lançamento.");
    const nova = !t || !!pendente;
    if (pendente) agenda.splice(agenda.indexOf(pendente), 1);
    if (!t) t = {id: crypto.randomUUID(), artist: autor, demo: false};
    if (nova) {
      t.date = v.quando ? new Date(v.quando).toISOString() : new Date().toISOString();
      if (v.quando) agenda.push(t);
      else {
        s.tracks.unshift(t);
        avisarSeguidores(s, t);
      }
    }
    t.artist = autor;
    for (const k of ["title", "genre", "album", "description"]) t[k] = v[k];
    for (const k of ["cover", "audio"]) if (v[k + "File"]) {
      descartar(files, t[k]);
      t[k] = guardarArquivo(files, v[k + "File"]);
    }
  });
  fechar();
  render();
  aviso(v.quando ? "Lançamento agendado." : "Música publicada no catálogo.");
}

function exigirRemocao(t) {
  if (!t || !(admin() || (perfil()?.role === "artista" && t.artist === session))) throw Error("Sem permissão para remover esta faixa.");
}

function retirarReferencia(lista, id, contexto, registro) {
  const i = lista.indexOf(id);
  if (i < 0) return;
  registro.colecoes.push({...contexto, indice: i, proxima: lista[i + 1]});
  lista.splice(i, 1);
}

function reinserir(lista, item, indice, proxima, chave) {
  const i = proxima ? lista.findIndex(v => chave(v) === proxima) : -1;
  lista.splice(i < 0 ? Math.min(indice, lista.length) : i, 0, item);
}

// A lixeira guarda a posição da faixa e os vínculos com as coleções para permitir a restauração.
async function excluirFaixa(id) {
  exigirRemocao(faixa(id));
  await mudar(s => {
    const indice = s.tracks.findIndex(t => t.id === id), t = s.tracks[indice];
    exigirRemocao(t);
    const registro = {faixa: t, indice, proxima: s.tracks[indice + 1]?.id, por: session, colecoes: [], plays: s.plays[id]};
    for (const [usuario, b] of Object.entries(s.libs)) {
      for (const campo of ["likes", "stars", "recent"]) retirarReferencia(b[campo], id, {usuario, campo}, registro);
      for (const l of b.lists) retirarReferencia(l.tracks, id, {usuario, playlist: l.id}, registro);
    }
    (s.removidas ??= []).unshift(registro);
    s.tracks.splice(indice, 1);
    delete s.plays[id];
  });
  if (current === id) {
    audio.pause();
    current = null;
    audio.removeAttribute("src");
    audio.load();
    mostrarPlayer();
  }
  fechar();
  render();
  aviso("Música movida para a lixeira.", id);
}

function podeRestaurar(r) {
  return !!r && (admin() || (perfil()?.role === "artista" && r.por === session && r.faixa.artist === session));
}

async function restaurarFaixa(id) {
  await mudar(s => {
    const i = s.removidas.findIndex(r => r.faixa.id === id), r = s.removidas[i];
    if (!podeRestaurar(r) || s.tracks.some(t => t.id === id)) throw Error("Faixa indisponível para restauração.");
    reinserir(s.tracks, r.faixa, r.indice, r.proxima, t => t.id);
    if (r.plays) s.plays[id] = r.plays;
    for (const c of r.colecoes) {
      const b = s.libs[c.usuario];
      if (!b) continue;
      const lista = c.campo ? b[c.campo] : b.lists.find(l => l.id === c.playlist)?.tracks;
      if (lista && !lista.includes(id)) {
        reinserir(lista, id, c.indice, c.proxima, v => v);
        if (c.campo === "recent") lista.splice(60);
      }
    }
    s.removidas.splice(i, 1);
  });
  render();
  aviso("Música restaurada no catálogo.");
}

function lixeira(artista = "") {
  const itens = (state.removidas || []).filter(r => podeRestaurar(r) && (!artista || r.faixa.artist === artista));
  if (!itens.length) return "";
  return '<section>' + sec("Lixeira", "Faixas removidas deste navegador.")
    + itens.map(({faixa: t}) => '<article class="track">' + imageTag(t.cover, "thumb") + '<div class="trackname"><strong>'
      + E(t.title) + '</strong><small>' + E(nomeArtista(t.artist)) + '</small></div>'
      + btn("restaurar", "Restaurar", t.id, "outline") + '</article>').join("")
    + '</section>';
}

function campoImagemPerfil(p, k, label) {
  const atual = p[k] ? imageTag(p[k], k === "photo" ? "photo-preview" : "banner-preview", "Imagem atual") : '<small>Sem imagem</small>';
  const remover = p[k] ? '<label class="remove-image"><input type="checkbox" name="remove-' + k + '"> Remover '
    + (k === "photo" ? "foto" : "capa") + ' ao salvar</label>' : "";
  return '<fieldset class="profile-media"><legend>' + label + '</legend>' + atual
    + campo("Escolher nova imagem", k, "", 'type="file" accept="image/*"') + remover + '</fieldset>';
}

function perfilForm() {
  exigirArtista();
  const p = perfil();
  if (p?.role !== "artista") throw Error("Artista indisponível.");
  abrir('<h2>Editar perfil de ' + E(p.name) + '</h2><form id="perfilform" data-owner="' + E(p.id) + '">'
    + campo("Nome artístico", "name", p.name, 'required maxlength="70"')
    + texto("Biografia", "bio", p.bio)
    + campo("Gêneros musicais", "genres", p.genres, 'maxlength="100"')
    + campo("Rede social", "social", p.social, 'type="url" placeholder="https://..."')
    + campoImagemPerfil(p, "photo", "Foto de perfil")
    + campoImagemPerfil(p, "banner", "Imagem de capa")
    + '<div class="ctas"><button class="primary">Salvar alterações</button>'
    + btn("fechar", "Cancelar") + '</div><p class="error" role="alert"></p></form>');
}

async function salvarPerfil(form) {
  exigirArtista();
  const d = new FormData(form), id = session, name = d.get("name").trim(), social = d.get("social").trim();
  if (!name) throw Error("Informe um nome artístico.");
  if (social && !/^https?:\/\//i.test(social)) throw Error("Use um endereço começando com https:// ou http://.");
  const imagens = ["photo", "banner"];
  for (const k of imagens) {
    if (d.get(k)?.size && d.get("remove-" + k)) throw Error("Para substituir a imagem, desmarque a opção de remover.");
    if (d.get(k)?.size) await validarMidia(d.get(k), "image");
  }
  await mudar((s, files) => {
    const p = s.profiles[id];
    if (p?.role !== "artista" || session !== id) throw Error("Artista indisponível.");
    Object.assign(p, {name, social, bio: d.get("bio").trim(), genres: d.get("genres").trim()});
    for (const k of imagens) {
      const file = d.get(k);
      if (!file?.size && !d.get("remove-" + k)) continue;
      descartar(files, p[k]);
      p[k] = file?.size ? guardarArquivo(files, file) : "";
    }
  });
  fechar();
  render();
  aviso("Perfil atualizado.");
}
