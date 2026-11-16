/* Relatórios do ouvinte e do artista, contagens por período e avisos de lançamento. */

const periodosEstudio = {1: "1 dia", 7: "7 dias", 30: "30 dias", 365: "1 ano"};
let periodoEstudio = 30;
const tarifaSimulada = 0.01;

function desempenho(ts, dias, hoje = new Date()) {
  const grupos = new Map(), diaMs = 86400000;
  const final = Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate());
  let total = 0;
  for (let i = dias - 1; i >= 0; i--) {
    const key = new Date(final - i * diaMs).toISOString().slice(0, 10);
    const n = ts.reduce((s, t) => s + (state.plays[t.id]?.[key] || 0), 0);
    const periodo = dias === 365 ? key.slice(0, 7) : key;
    if (!grupos.has(periodo)) grupos.set(periodo, {inicio: key, fim: key, n: 0});
    const g = grupos.get(periodo);
    g.fim = key;
    g.n += n;
    total += n;
  }
  return {grupos: [...grupos.values()], total};
}

function painelDesempenho(ts) {
  const {grupos, total} = desempenho(ts, periodoEstudio), max = Math.max(1, ...grupos.map(g => g.n));
  const intervalo = dataBR(grupos[0].inicio) + (grupos.length > 1 ? " – " + dataBR(grupos.at(-1).fim) : "");
  const curto = d => d.slice(8) + "/" + d.slice(5, 7);
  const label = g => g.inicio === g.fim ? curto(g.inicio) : curto(g.inicio) + " – " + curto(g.fim);
  const barras = grupos.map(g => '<div title="' + label(g) + ' · ' + g.n + '"><i style="height:' + 100 * g.n / max + '%"></i></div>').join("");
  const eixo = [...new Set([0, Math.floor((grupos.length - 1) / 2), grupos.length - 1])].map(i => '<span>' + curto(grupos[i].inicio) + '</span>').join("");
  const detalhes = '<details class="chart-data"><summary>Ver contagem por '
    + (periodoEstudio === 365 ? "período" : "dia")
    + '</summary><table><thead><tr><th>Período</th><th>Reproduções</th></tr></thead><tbody>'
    + grupos.map(g => '<tr><td>' + label(g) + '</td><td>' + g.n + '</td></tr>').join("")
    + '</tbody></table></details>';
  const estimativa = (total * tarifaSimulada).toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
  const filtros = Object.entries(periodosEstudio).map(([n, label]) => '<button class="chip" data-act="periodo" data-id="' + n + '" aria-pressed="'
    + (Number(n) === periodoEstudio) + '">' + label + '</button>').join("");
  return '<section class="chart"><div class="sectitle"><div><h2>Desempenho</h2><p>' + intervalo
    + ' · UTC</p></div><div class="chips" role="group" aria-label="Período do relatório">'
    + filtros
    + '</div></div><div class="financeiro"><div><small>Reproduções no período</small><strong>'
    + total + '</strong></div><div><small>Ganhos estimados · simulação</small><strong>' + estimativa
    + '</strong></div></div>'
    + (total ? '<div class="activity-plot" aria-hidden="true">' + barras
      + '</div><div class="activity-axis" aria-hidden="true">' + eixo + '</div>' : '<p class="chart-empty">' + ico("bars") + ' Nenhuma reprodução registrada neste período.</p>')
    + detalhes
    + '<p class="period-note">Simulação escolar de R$ 0,01 por reprodução local.</p></section>';
}

function relatorioOuvinte(mes) {
  const meses = lib().meses || {}, atual = new Date().toISOString().slice(0, 7);
  const opcoes = [...new Set([atual, ...Object.keys(meses)])].sort().reverse();
  if (!opcoes.includes(mes)) mes = atual;
  const registros = Object.entries(meses[mes] || {}), artistas = new Map(), estilos = new Map();
  let total = 0;
  for (const [, r] of registros) {
    total += r.n;
    artistas.set(r.artist, (artistas.get(r.artist) || 0) + r.n);
    estilos.set(r.genre, (estilos.get(r.genre) || 0) + r.n);
  }
  const nomeMes = m => new Date(m + "-15T12:00:00").toLocaleDateString("pt-BR", {month: "long", year: "numeric"});
  const ranking = (map, nome) => '<ol class="eco-ranking">'
    + [...map].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => '<li><span>' + E(nome(k)) + '</span><b>' + n + '</b></li>').join("")
    + '</ol>';
  const seletor = '<label class="mes-eco">Mês<select id="mes-relatorio">'
    + opcoes.map(m => '<option value="' + m + '" ' + (mes === m ? "selected" : "") + '>' + nomeMes(m) + '</option>').join("")
    + '</select></label>';
  let html = tag("SUA BIBLIOTECA") + '<div class="sectitle"><h1>Seu mês em música</h1>' + seletor
    + '</div><p>Cada reprodução conta após 30 segundos contínuos de escuta.</p>';
  if (!total) return html
    + '<div class="collection-empty"><p>Nenhuma escuta registrada neste mês. Ouça uma faixa com áudio publicado para começar seu relatório.</p>'
    + link("painel", "Ir para Para você", "outline") + '</div>';
  const recentes = registros.sort((a, b) => b[1].ultima.localeCompare(a[1].ultima)).slice(0, 8);
  return html + '<div class="stats">'
    + [["Reproduções", total], ["Artistas ouvidos", artistas.size], ["Gêneros", estilos.size]].map(([k, n]) => '<article><small>' + k + '</small><b>' + n + '</b></article>').join("")
    + '</div><div class="eco-dupla"><section>' + sec("Artistas mais ouvidos")
    + ranking(artistas, nomeArtista) + '</section><section>' + sec("Gêneros mais ouvidos")
    + ranking(estilos, k => k) + '</section></div><section>' + sec("Últimas escutas do mês")
    + '<ol class="eco-ranking">'
    + recentes.map(([id, r]) => '<li><span>' + (faixa(id) ? link("ficha/" + id, E(r.title)) : E(r.title)) + '</span><small>'
      + E(dataHora(r.ultima)) + '</small></li>').join("")
    + '</ol></section>';
}

function alcanceArtista(ts) {
  const ids = new Set(ts.map(t => t.id));
  let ouvintes = 0, curtidas = 0;
  for (const b of Object.values(state.libs)) {
    if (Object.values(b.meses || {}).some(m => Object.keys(m).some(id => ids.has(id)))) ouvintes++;
    curtidas += b.likes.filter(id => ids.has(id)).length;
  }
  return [["Ouvintes alcançados", ouvintes], ["Curtidas nas faixas", curtidas]];
}

function agendaEstudio() {
  const agendadas = (state.agenda || []).filter(t => t.artist === session).sort((a, b) => a.date.localeCompare(b.date));
  if (!agendadas.length) return "";
  return '<section>'
    + sec("Lançamentos agendados", "Visíveis no catálogo a partir do horário escolhido.")
    + agendadas.map(t => '<article class="track">' + imageTag(t.cover, "thumb") + '<div class="trackname"><strong>'
      + E(t.title) + '</strong><small>' + E(t.album) + ' · ' + E(dataHora(t.date)) + '</small></div>'
      + button("edittrack", "Editar agendamento", "edit", t.id) + '</article>').join("")
    + '</section>';
}
let timerAgenda;

function acompanharAgenda() {
  clearTimeout(timerAgenda);
  const proxima = Math.min(...(state.agenda || []).map(t => Date.parse(t.date)));
  if (Number.isFinite(proxima)) timerAgenda = setTimeout(() => sincronizar().catch(falha), Math.max(0, Math.min(2147483647, proxima - Date.now() + 50)));
}

function exibirLancamentos() {
  const local = document.getElementById("lancamentos");
  const ids = usaBiblioteca() ? (lib().lancamentos || []).filter(id => faixa(id)) : [];
  if (!ids.length) {
    local.hidden = true;
    local.innerHTML = "";
    return;
  }
  const t = faixa(ids[0]);
  local.hidden = false;
  local.innerHTML = '<div><small>Novo lançamento de ' + E(nomeArtista(t.artist)) + '</small>'
    + link("ficha/" + idLink(t.id), E(t.title), "textlink") + '</div>'
    + button("dispensar", "Fechar aviso de lançamento", "close", t.id);
}

function resumoPorFaixa(ts) {
  const ordem = [...ts].sort((a, b) => totalPlays(b) - totalPlays(a));
  if (!ordem.length) return vazio("Seus resultados aparecem depois da primeira publicação.");
  const linha = t => '<li>'
    + link("ficha/" + idLink(t.id), imageTag(t.cover, "thumb") + '<span>' + E(t.title) + '</span>', "ranking-faixa")
    + '<b>' + totalPlays(t) + ' <small>reproduções</small></b></li>';
  return '<ol class="eco-ranking">' + ordem.slice(0, 3).map(linha).join("") + '</ol>'
    + (ordem.length > 3 ? '<details class="chart-data"><summary>Ver todas as faixas</summary><ol class="eco-ranking">'
      + ordem.slice(3).map(linha).join("") + '</ol></details>' : "");
}
