/* Elementos compartilhados pelas telas: ícones, formulários, cartões de imagem, avisos e diálogos. */

const icons = {
  olho: "M2 12q10-15 20 0-10 15-20 0z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  ocultar: "m3 3 18 18 M10 6q7-2 12 6l-3 4 M6 7l-4 5q7 11 16 6",
  recolher: "M4 4v16m12-14-6 6 6 6",
  ampliar: "M20 4v16M8 6l6 6-6 6",
  play: "M8 5v14l11-7z",
  pause: "M8 5v14M16 5v14",
  next: "m5 5 11 7-11 7zM19 5v14",
  prev: "m19 5-11 7 11 7zM5 5v14",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  volume: "M3 9h4l5-4v14l-5-4H3zM16 8q4 4 0 8M19 5q7 7 0 14",
  mute: "M3 9h4l5-4v14l-5-4H3zM16 9l6 6m0-6-6 6",
  shuffle: "M3 6h3c5 0 7 12 12 12h3m-3-3 3 3-3 3M3 18h3c2 0 3-2 5-5m3-5c1-1 2-2 4-2h3m-3-3 3 3-3 3",
  repeat: "M4 10V8a3 3 0 0 1 3-3h13l-3-3m3 3-3 3M20 14v2a3 3 0 0 1-3 3H4l3 3m-3-3 3-3",
  plus: "M12 5v14M5 12h14",
  search: "M15 15l6 6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  home: "m3 10 9-7 9 7v10h-6v-7H9v7H3z",
  library: "M4 4v16M9 4v16M14 5l5 15",
  list: "M3 6h15M3 12h11M3 18h7m8-5v8m-4-4h8",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  star: "m12 3 3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z",
  disc: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  menu: "M3 6h18M3 12h18M3 18h18",
  up: "m5 15 7-7 7 7",
  down: "m5 9 7 7 7-7",
  close: "m6 6 12 12M18 6 6 18",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
  headphones: "M3 16v-4a9 9 0 0 1 18 0v4M3 13h4v7H3zM17 13h4v7h-4z",
  mic: "M9 6a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v4",
  bars: "M4 15v4m5-10v10m5-14v14m5-9v9",
  edit: "m4 16 12-12 4 4L8 20H4z",
  trash: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15",
  logout: "M9 3H4v18h5m0-9h12m-5-5 5 5-5 5",
  head: "M5 3v18l15-9z"
};

function ico(name) {
  return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="' + (name === "play" ? "currentColor" : "none")
    + '" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'
    + icons[name] + '"/></svg>';
}

function button(action, label, icon, id = "", pressed = null) {
  return '<button type="button" class="iconbtn" data-act="' + action + '" data-id="' + E(id) + '" title="'
    + E(label) + '" aria-label="' + E(label) + '" ' + (pressed === null ? "" : 'aria-pressed="' + pressed + '"')
    + '>' + ico(icon) + '</button>';
}

function imageTag(key, cls = "", alt = "") {
  const retrato = cls === "avatar" || cls === "photo-preview";
  const editorial = retrato && retratosDoCatalogo[key] ? retratosDoCatalogo[key] : key;
  const src = key?.startsWith("blob:eco-") ? 'data-img="' + E(key) + '"' : 'src="' + E(key || capaBase(1)) + '"';
  const original = Object.hasOwn(imagensEditoriais, editorial) ? ' data-editorial="' + E(editorial) + '"' : "";
  return '<img class="' + cls + '" ' + src + original + ' alt="' + E(alt) + '" decoding="async" loading="lazy">';
}

async function carregarImagens(root = document) {
  aprimorarImagens(root);
  for (const img of root.querySelectorAll("img[data-img]")) {
    try {
      img.src = await recurso(img.dataset.img);
    } catch {
      img.src = capaBase(1);
    }
  }
}

const link = (r, label, cls = "") => '<a class="' + cls + '"' + (cls.split(" ").includes("sel") ? ' aria-current="page"' : "") + ' href="#'
  + E(r) + '">' + label + '</a>';
const btn = (a, label, id = "", cls = "outline", pressed = null) => '<button type="button" class="' + cls + '" data-act="' + a + '" data-id="' + E(id) + '"'
  + (pressed === null ? "" : ' aria-pressed="' + pressed + '"') + '>' + label + '</button>';
const vazio = (s) => '<p class="empty">' + s + '</p>';

function aviso(msg, desfazer = "") {
  const a = document.querySelector("#aviso");
  clearTimeout(aviso.timer);
  a.innerHTML = E(msg) + (desfazer ? " " + btn("restaurar", "Desfazer", desfazer, "undo-track") : "");
  a.classList.add("on");
  aviso.timer = setTimeout(() => {
    a.classList.remove("on");
    a.textContent = "";
  }, desfazer ? 10000 : 3800);
}

function falha(e) {
  console.error(e);
  aviso(e.name === "QuotaExceededError" ? "Espaço insuficiente no navegador. Tente um arquivo menor." : e.message || "Não foi possível concluir a ação.");
}

function abrir(html) {
  const d = document.querySelector("#modal");
  document.querySelector("#dialogo").innerHTML = '<button class="fechar iconbtn" type="button" data-act="fechar" aria-label="Fechar">'
    + ico("close") + '</button>' + html;
  if (!d.open) d.showModal();
  carregarImagens(d);
  const field = d.querySelector("input:not([type=file]),select");
  if (field) field.focus();
}

function fechar() {
  document.querySelector("#modal").close();
}

function sec(t, sub = "", action = "") {
  return '<div class="sectitle"><div><h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + action + '</div>';
}

function tag(t) {
  return '<span class="kicker"><i></i>' + t + '</span>';
}

const campo = (rotulo, name, value = "", attrs = "") => '<label>' + rotulo + '<input name="' + name + '" value="' + E(value) + '" ' + attrs + '></label>';
const escolha = (rotulo, name, values, v) => '<label>' + rotulo + '<select name="' + name + '">'
  + values.map(x => '<option ' + (v === x ? "selected" : "") + '>' + E(x) + '</option>').join("")
  + '</select></label>';
const texto = (label, name, value = "", lim = 800) => '<label>' + label + '<textarea name="' + name + '" maxlength="' + lim + '">' + E(value) + '</textarea></label>';
