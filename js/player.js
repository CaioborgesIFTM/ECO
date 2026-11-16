/* Reprodução, fila e medição de escutas. O mesmo elemento de áudio acompanha a navegação entre as telas. */

const audio = document.querySelector("#audio");
let current = null, queue = [], orderToken = 0, shuffle = false, repeat = false, expanded = false, playCounted = false;

function mostrarPlayer() {
  const panel = document.querySelector("#player"), t = faixa(current);
  panel.hidden = !t;
  document.body.classList.toggle("com-player", !!t);
  if (!t) return;
  panel.classList.toggle("expandido", expanded);
  panel.innerHTML = '<div class="agora">' + imageTag(t.cover) + '<div><strong>' + E(t.title) + '</strong><small>'
    + E(nomeArtista(t.artist)) + '</small></div>'
    + (usaBiblioteca() ? button("like", lib().likes.includes(t.id) ? "Descurtir faixa" : "Curtir faixa", "heart", t.id, lib().likes.includes(t.id)) : "")
    + '</div><div class="transport">' + button("shuffle", "Aleatório", "shuffle", "", shuffle)
    + button("prev", "Anterior", "prev")
    + button("toggle", audio.paused ? "Reproduzir" : "Pausar", audio.paused ? "play" : "pause")
    + button("next", "Próxima", "next") + button("repeat", "Repetir faixa", "repeat", "", repeat)
    + '</div><div class="scrub"><small id="elapsed"></small><input id="seek" type="range" min="0" max="1" step=".05" aria-label="Posição da faixa"><small id="duration"></small></div><div class="sound">'
    + button("mute", audio.muted ? "Reativar áudio" : "Silenciar", audio.muted ? "mute" : "volume")
    + '<input id="vol" type="range" min="0" max="1" step=".01" value="' + audio.volume
    + '" aria-label="Volume"></div><div class="mini">'
    + button("expand", expanded ? "Recolher player" : "Expandir player", expanded ? "down" : "up") + '</div>';
  carregarImagens(panel);
  atualizarTempo();
  sinalizar();
}

function sinalizar() {
  document.querySelectorAll("[data-track]").forEach(el => {
    el.classList.toggle("tocando", el.dataset.track === current && !audio.paused);
  });
}

function atualizarTempo() {
  const seek = document.querySelector("#seek");
  if (!seek) return;
  seek.max = audio.duration || 1;
  seek.value = audio.currentTime || 0;
  document.querySelector("#elapsed").textContent = tempo(audio.currentTime);
  document.querySelector("#duration").textContent = tempo(audio.duration);
}

// O token identifica o último pedido de reprodução, para uma leitura lenta não substituir uma faixa escolhida depois.
async function tocar(id, ids, force = false) {
  const t = faixa(id);
  if (!t?.audio) return;
  if (id === current && !force) {
    if (audio.paused) await audio.play(); else audio.pause();
    return;
  }
  const token = ++orderToken;
  const src = await recurso(t.audio);
  if (token !== orderToken) return;
  queue = (ids || [id]).filter(x => faixa(x)?.audio);
  if (!queue.includes(id)) queue.push(id);
  audio.pause();
  inicioContinuo = null;
  current = id;
  playCounted = false;
  audio.src = src;
  mostrarPlayer();
  await audio.play();
}

async function avancar(step, auto = false) {
  const ids = queue.filter(x => faixa(x)?.audio);
  if (!ids.length) return;
  let i = ids.indexOf(current);
  if (auto && repeat) {
    await tocar(current, ids, true);
    return;
  }
  if (shuffle && ids.length > 1) i = (i + 1 + Math.floor(Math.random() * (ids.length - 1))) % ids.length;
  else {
    if (auto && i === ids.length - 1) {
      mostrarPlayer();
      return;
    }
    i = (i + step + ids.length) % ids.length;
  }
  await tocar(ids[i], ids, true);
}
audio.addEventListener("timeupdate", atualizarTempo); audio.addEventListener("loadedmetadata", atualizarTempo);
audio.addEventListener("play", mostrarPlayer); audio.addEventListener("pause", mostrarPlayer);
let inicioContinuo = null;

// Uma execução conta apenas uma vez, após 30 segundos contínuos. Pausa, espera e mudança de posição reiniciam a medição.
function medirEscuta() {
  if (inicioContinuo === null || audio.seeking || playCounted || !current) return;
  if (audio.currentTime - inicioContinuo < 30) return;
  playCounted = true;
  const id = current, user = session;
  mudar(s => registrarEscuta(s, id, user)).then(() => {
    if (["relatorio", "estudio"].includes(route().split("/")[0]) && !document.querySelector("#modal").open) render();
  }).catch(falha);
}
audio.addEventListener("playing", () => {
  if (inicioContinuo === null) inicioContinuo = audio.currentTime;
});
audio.addEventListener("timeupdate", medirEscuta);
audio.addEventListener("seeking", () => {
  inicioContinuo = null;
});
audio.addEventListener("seeked", () => {
  if (!audio.paused) inicioContinuo = audio.currentTime;
});
for (const evento of ["waiting", "pause", "emptied", "stalled"]) {
  audio.addEventListener(evento, () => {
    if (evento === "stalled" && audio.readyState >= 3) return;
    if (evento === "pause") medirEscuta();
    inicioContinuo = null;
  });
}

audio.addEventListener("ended", () => avancar(1, true).catch(falha)); audio.addEventListener("error", () => aviso("Não foi possível reproduzir este formato de áudio."));
document.querySelector("#player").addEventListener("input", e => {
  if (e.target.id === "seek" && Number.isFinite(audio.duration)) audio.currentTime = Number(e.target.value);
  if (e.target.id === "vol") {
    audio.volume = Number(e.target.value);
    audio.muted = false;
    const b = document.querySelector('[data-act="mute"]');
    b.innerHTML = ico("volume");
    b.setAttribute("aria-label", "Silenciar");
  }
});
