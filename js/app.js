/* Ponto de entrada. Seleciona a tela pelo endereço e encaminha cliques e formulários para o módulo responsável. */

// O trecho após # escolhe a tela. Trocar de rota substitui o conteúdo principal e preserva o elemento de áudio.

function render(manterTopo = false) {
  const [r, param] = route().split("/");
  const roles = {
    relatorio: "ouvinte",
    admin: "admin",
    estudio: "artista",
    painel: "ouvinte",
    biblioteca: "ouvinte",
    curtidas: "ouvinte",
    playlists: "ouvinte",
    lista: "ouvinte"
  };
  if (Object.hasOwn(roles, r) && (roles[r] === "ouvinte" ? !usaBiblioteca() : perfil()?.role !== roles[r])) {
    location.replace("#" + (perfil() ? destino(perfil().role) : "login/" + (roles[r] === "artista" ? "artista" : "ouvinte")));
    return;
  }
  if (!manterTopo) topo();
  visiveis = [];
  switch (r) {
    case "inicio":
      main.innerHTML = home();
      break;
    case "painel":
      main.innerHTML = painel();
      break;
    case "ficha":
      main.innerHTML = fichaMusica(param);
      break;
    case "explorar":
      main.innerHTML = explorar();
      break;
    case "curtidas":
      main.innerHTML = curtidasView();
      break;
    case "buscar":
      main.innerHTML = resultadosBusca(route().slice(7));
      break;
    case "relatorio":
      main.innerHTML = relatorioOuvinte(param);
      break;
    case "biblioteca":
      main.innerHTML = bibliotecaView();
      break;
    case "playlists":
      main.innerHTML = listas();
      break;
    case "lista":
      main.innerHTML = lista(param);
      break;
    case "artistas":
      location.replace("#explorar");
      return;
    case "album":
      main.innerHTML = paginaAlbum(param, route().split("/").slice(2).join("/"));
      break;
    case "perfil":
      main.innerHTML = perfilPublico(param);
      break;
    case "estilo":
      main.innerHTML = tag("PLAYLIST POR ESTILO") + "<h1>" + E(param) + "</h1>" + tabela(state.tracks.filter(t => t.genre === param));
      break;
    case "admin":
      main.innerHTML = painelAdmin();
      break;
    case "estudio":
      main.innerHTML = estudio();
      break;
    case "login": case "cadastro":
      main.innerHTML = auth(r, param);
      break;
    case "recuperar": case "redefinir":
      main.innerHTML = recuperarConta(param, r === "redefinir");
      break;
    case "chave":
      main.innerHTML = paginaChave();
      break;
    case "sobre":
      main.innerHTML = sobreECO();
      break;
    case "ajuda": case "uso": case "privacidade":
      main.innerHTML = paginaInformativa(r);
      break;
    default:
      main.innerHTML = '<h1>Página indisponível</h1>' + link("inicio", "Voltar ao início");
  }
  document.title = r === "inicio" ? "ECO — Descoberta musical independente" : (main.querySelector("h1")?.textContent || "Descoberta musical") + " | ECO";
  carregarImagens(main);
  iniciarTrilhos();
  sinalizar();
  acompanharAgenda();
  exibirLancamentos();
}

function menuFaixa(id) {
  const t = faixa(id);
  if (!t) return;
  abrir('<h2>' + E(t.title) + '</h2><p>' + E(nomeArtista(t.artist)) + ' · ' + E(t.album) + ' · ' + E(t.genre)
    + '</p>' + (t.description ? '<p>' + E(t.description) + '</p>' : '') + '<div class="stack">'
    + btn("star", ico("star") + (lib().stars.includes(id) ? " Remover dos favoritos" : " Adicionar aos favoritos"), id, "outline", lib().stars.includes(id))
    + btn("addlist", ico("list") + " Adicionar à playlist", id)
    + link("perfil/" + t.artist, "Ver artista", "outline") + '</div>');
}

function menuLista(id) {
  abrir('<h2>Adicionar à playlist</h2><p>' + E(faixa(id)?.title) + '</p><div class="stack">'
    + lib().lists.map(l => '<button type="button" class="outline" data-act="insertitem" data-id="' + id + '" data-list="'
      + l.id + '" ' + (l.tracks.includes(id) ? "disabled" : "") + '>' + E(l.name)
      + (l.tracks.includes(id) ? " · Adicionada" : "") + '</button>').join("")
    + btn("newlist", ico("plus") + " Criar playlist", id, "primary") + '</div>');
}

function nomeLista(id = "", track = "") {
  const l = lib().lists.find(l => l.id === id);
  abrir('<h2>' + (l ? "Renomear playlist" : "Criar playlist") + '</h2><form id="listform" data-list="' + id
    + '" data-track="' + track + '">'
    + campo("Nome da playlist", "name", l?.name, "required maxlength=70")
    + '<button class="primary">Salvar playlist</button><p class="error" role="alert"></p></form>');
}

// Os controles usam data-act para indicar a ação e data-id para identificar a faixa, o artista ou a playlist.
async function acao(a, id, el) {
  if ([
    "like",
    "follow",
    "star",
    "trackmenu",
    "newlist",
    "renamelist",
    "insertitem",
    "removeitem",
    "addlist",
    "deletelist",
    "confirmdeletelist"
  ].includes(a) && !usaBiblioteca()) {
    if (!perfil()) {
      location.hash = "login/ouvinte";
      aviso("Entre para usar sua biblioteca.");
    } else aviso("Recurso do perfil de ouvinte.");
    return;
  }
  switch (a) {
    case "retrair": case "ampliar":
      ajustarLateral(a === "retrair" ? -1 : 1);
      break;
    case "artistprev": case "artistnext":
      {
        const trilho = el.parentElement.querySelector(".artist-strip");
        trilho.scrollBy({
          left: (a === "artistprev" ? -1 : 1) * Math.max(90, trilho.clientWidth - 24),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
        break;
      }
    case "maisdiscos": case "menosdiscos":
      {
        limiteDiscos = a === "maisdiscos" ? limiteDiscos + 10 : 10;
        render();
        main.querySelector('.discografia [data-act="' + a + '"],.discografia .ctas button')?.focus({preventScroll: true});
        break;
      }
    case "deletelist":
      {
        const l = lib().lists.find(x => x.id === id);
        if (!l) throw Error("Playlist indisponível.");
        abrir('<h2>Excluir playlist?</h2><p>Excluir “' + E(l.name)
          + '”? As músicas continuam no catálogo.</p><div class="ctas">' + btn("fechar", "Cancelar")
          + btn("confirmdeletelist", "Excluir playlist", id, "danger") + '</div>');
        break;
      }
    case "confirmdeletelist":
      {
        const user = leitor();
        await mudar(s => {
          const b = biblioteca(s, user);
          b.lists = b.lists.filter(l => l.id !== id);
        });
        fechar();
        if (route() === "lista/" + id) location.hash = "#playlists"; else render();
        aviso("Playlist excluída.");
        break;
      }
    case "sortearfaixa":
      sortearFaixaInicio();
      break;
    case "play": case "playhero":
      {
        if (!faixa(id)?.audio) {
          location.hash = "ficha/" + id;
          break;
        }
        const group = el.closest(".covers,.tracks");
        const ids = group ? [...group.querySelectorAll("[data-track]")].map(x => x.dataset.track) : state.tracks.map(t => t.id);
        await tocar(id, ids);
        break;
      }
    case "toggle":
      await tocar(current);
      break; case "prev":
      await avancar(-1);
      break; case "next":
      await avancar(1);
      break;
    case "shuffle":
      shuffle = !shuffle;
      mostrarPlayer();
      break; case "repeat":
      repeat = !repeat;
      mostrarPlayer();
      break; case "mute":
      audio.muted = !audio.muted;
      mostrarPlayer();
      break; case "expand":
      expanded = !expanded;
      mostrarPlayer();
      break;
    case "periodo":
      if (perfil()?.role === "artista" && Object.hasOwn(periodosEstudio, id)) {
        periodoEstudio = Number(id);
        render();
      }
      break;
    case "sair":
      audio.pause();
      current = null;
      mostrarPlayer();
      sair();
      location.hash = "inicio";
      render();
      aviso("Você saiu da conta.");
      break;
    case "fechar":
      fechar();
      break;
    case "dispensar":
      {
        if (!usaBiblioteca()) return;
        const user = session;
        await mudar(s => {
          const b = biblioteca(s, user);
          b.lancamentos = (b.lancamentos || []).filter(x => x !== id);
        });
        exibirLancamentos();
        break;
      }
    case "like": case "star": case "follow":
      {
        const key = {like: "likes", star: "stars", follow: "artists"}[a], user = leitor();
        await mudar(s => alternar(biblioteca(s, user)[key], id));
        if (a === "star") fechar();
        if (a === "like") mostrarPlayer();
        render();
        aviso(lib()[key].includes(id) ? "Adicionado à sua coleção." : "Removido da sua coleção.");
        break;
      }
    case "trackmenu":
      menuFaixa(id);
      break;
    case "addlist":
      menuLista(id);
      break;
    case "newlist":
      nomeLista("", id);
      break;
    case "renamelist":
      nomeLista(id);
      break;
    case "insertitem":
      {
        const user = leitor();
        await mudar(s => {
          const l = biblioteca(s, user).lists.find(l => l.id === el.dataset.list);
          if (!l) throw Error("Playlist indisponível.");
          if (!l.tracks.includes(id)) l.tracks.push(id);
        });
        fechar();
        render();
        aviso("Música adicionada à playlist.");
        break;
      }
    case "removeitem":
      {
        const listId = route().split("/")[1], user = leitor();
        await mudar(s => {
          const l = biblioteca(s, user).lists.find(l => l.id === listId);
          if (l) l.tracks = l.tracks.filter(x => x !== id);
        });
        render();
        aviso("Faixa removida da playlist.");
        break;
      }
    case "verSenha":
      {
        const inp = el.previousElementSibling, show = inp.type === "password";
        inp.type = show ? "text" : "password";
        el.innerHTML = ico(show ? "ocultar" : "olho");
        el.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
        break;
      }
    case "publish": case "edittrack":
      draft = null;
      formFaixa(id);
      break;
    case "albumtrack":
      {
        const t = faixa(id);
        exigirArtista();
        if (!t || t.artist !== session) throw Error("Álbum indisponível.");
        draft = null;
        formFaixa("", t.album);
        break;
      }
    case "backdraft":
      limparPreview();
      formFaixa(draft?.id);
      break;
    case "confirmtrack":
      await publicar();
      break;
    case "editprofile":
      perfilForm();
      break;
    case "delete":
      exigirRemocao(faixa(id));
      abrir('<h2>Excluir música?</h2><p>“' + E(faixa(id)?.title)
        + '” será movida para a lixeira e poderá ser restaurada.</p><div class="ctas">'
        + btn("fechar", "Cancelar") + btn("confirmdelete", "Excluir faixa", id, "danger") + '</div>');
      break;
    case "restaurar":
      await restaurarFaixa(id);
      break;
    case "confirmdelete":
      await excluirFaixa(id);
      break;
  }
}
document.addEventListener("click", async e => {
  if (e.target.closest(".skip")) {
    e.preventDefault();
    main.focus();
    return;
  }
  const el = e.target.closest("[data-act]");
  if (!el) return;
  if (el.dataset.busy) return;
  el.dataset.busy = "1";
  try {
    await acao(el.dataset.act, el.dataset.id || "", el);
  } catch (err) {
    falha(err);
  } finally {
    delete el.dataset.busy;
  }
});

function pesquisarNoTopo(input) {
  const termo = input.value.trim(), antes = route(), emBusca = antes.split("/")[0] === "buscar";
  if (!termo && !emBusca) return;
  const destino = termo ? "#buscar/" + encodeURIComponent(termo) : "#explorar";
  if (location.hash !== destino) history[emBusca ? "replaceState" : "pushState"](null, "", destino);
  const manter = emBusca && !!termo;
  render(manter);
  if (!manter) {
    const novo = document.getElementById("busca");
    novo.value = input.value;
    novo.focus({preventScroll: true});
    window.scrollTo(0, 0);
  }
}
document.addEventListener("input", e => {
  if (e.target.id === "busca" && !e.isComposing) pesquisarNoTopo(e.target);
});
document.addEventListener("submit", async e => {
  const f = e.target;
  e.preventDefault();
  if (f.id === "busca-topo") {
    pesquisarNoTopo(f.elements.q);
    return;
  }
  if (f.dataset.busy) return;
  f.dataset.busy = "1";
  const submit = f.querySelector("button:not([type=button])");
  if (submit) submit.disabled = true;
  try {
    switch (f.id) {
      case "recuperarform":
        await redefinirSenha(f);
        break; case "authform":
        await autenticar(f);
        break; case "trackform":
        await revisar(f);
        break; case "perfilform":
        await salvarPerfil(f);
        break;
      case "listform":
        {
          const name = f.elements.name.value.trim(), user = leitor(), {list, track} = f.dataset;
          if (!name) throw Error("Digite um nome para a playlist.");
          await mudar(s => {
            const b = biblioteca(s, user);
            if (list) {
              const l = b.lists.find(x => x.id === list);
              if (!l) throw Error("Playlist indisponível.");
              l.name = name;
            } else b.lists.push({id: crypto.randomUUID(), name, tracks: track ? [track] : []});
          });
          fechar();
          render();
          aviso(track ? "Playlist criada com a faixa." : "Playlist salva.");
          break;
        }
    }
  } catch (err) {
    const msg = f.querySelector(".error");
    if (err.ate) {
      f.dataset.bloqueio = err.ate;
      mostrarBloqueio(f, err.ate);
    } else if (msg) msg.textContent = err.message; else falha(err);
  } finally {
    delete f.dataset.busy;
    if (submit) submit.disabled = Number(f.dataset.bloqueio || 0) > Date.now();
  }
});
document.querySelector("#modal").addEventListener("close", () => {
  limparPreview();
  draft = null;
});
window.addEventListener("hashchange", () => {
  if (route() !== "chave") novaChave = null;
  paginaDiscos = "";
  limiteDiscos = 10;
  if (document.querySelector("#modal").open) fechar();
  if (!state) return;
  render();
  window.scrollTo(0, 0);
  main.focus({preventScroll: true});
});

// Recarrega mudanças feitas em outra aba sem interromper um formulário aberto.
async function sincronizar() {
  if (!state) return;
  state = await lerEstado();
  acompanharAgenda();
  exibirLancamentos();
  if (current && !faixa(current)) {
    audio.pause();
    current = null;
    mostrarPlayer();
  }
  if (!document.querySelector("#modal").open && !main.querySelector("form") && document.activeElement?.tagName !== "INPUT") render();
}
if (canal) canal.onmessage = () => sincronizar().catch(falha);
window.addEventListener("focus", () => sincronizar().catch(falha));
(async () => {
  try {
    state = await lerEstado();
    session = sessionStorage.getItem(SESSAO);
    if (session === "aurora") {
      entrarComo("tame");
    }
    if (!perfil()) sair();
    render();
    if (recuperadaAnterior) aviso("Faixa recuperada: " + recuperadaAnterior);
  } catch {
    main.innerHTML = "<h1>O ECO precisa de armazenamento local</h1><p>Abra o site no navegador com IndexedDB habilitado. No computador, use o servidor local indicado em assets/LEIA-ME.md.</p>";
  }
})();



if (typeof ResizeObserver === "function") {
  new ResizeObserver(([entry]) => document.documentElement.style.setProperty("--altura-topo", entry.target.offsetHeight + "px")).observe(document.getElementById("topo"));
}

document.addEventListener("change", e => {
  if (e.target.id === "mes-relatorio") location.hash = "relatorio/" + e.target.value;
});
