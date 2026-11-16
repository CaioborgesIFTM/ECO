/* Cadastro, entrada e recuperação de acesso. Sem provedor configurado, esses fluxos usam o perfil deste navegador. */

// Configuração pública opcional do Supabase Auth. Use somente a chave publicável.
const provedorECO = {url: "", chavePublica: ""};
const emailAtivo = () => Boolean(provedorECO.url && provedorECO.chavePublica);
let novaChave = null;
const bytesHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");

function chaveAleatoria() {
  return bytesHex(crypto.getRandomValues(new Uint8Array(16)));
}

// Deriva um verificador com o sal próprio da conta. O cadastro local salva o resultado da derivação.
async function verificador(valor, sal) {
  const texto = new TextEncoder();
  const chave = await crypto.subtle.importKey("raw", texto.encode(valor), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name: "PBKDF2", hash: "SHA-256", iterations: 600000, salt: texto.encode(sal)}, chave, 256);
  return bytesHex(new Uint8Array(bits));
}

async function servicoConta(caminho, dados, token, metodo = "POST") {
  const resposta = await fetch(provedorECO.url.replace(/\/$/, "") + "/auth/v1/" + caminho, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      apikey: provedorECO.chavePublica,
      ...(token ? {Authorization: "Bearer " + token} : {})
    },
    body: JSON.stringify(dados)
  });
  if (!resposta.ok) throw Error(resposta.status === 429 ? "Muitas tentativas. Aguarde e tente novamente." : "Não foi possível concluir. Confira os dados e tente novamente.");
  return resposta.json();
}

function painelAcesso(role) {
  const artista = role === "artista";
  return '<div class="authart identidade-acesso"><img src="assets/' + (artista ? "microfone" : "fone")
    + '-acesso.webp" alt="" class="icone-acesso"><div>'
    + tag(artista ? "PARA ARTISTAS" : "PARA OUVINTES") + '<h2>'
    + (artista ? "Seu som merece ser ouvido." : "Sua próxima descoberta começa aqui.") + '</h2><p>'
    + (artista ? "Dê voz às suas faixas e acompanhe quem se conecta com elas." : "Encontre novos artistas e guarde as músicas que ficam com você.")
    + '</p></div></div>';
}

function auth(tipo, role = "ouvinte") {
  if (role !== "artista") role = "ouvinte";
  const novo = tipo === "cadastro", base = novo ? "cadastro" : "login";
  const perfis = ["ouvinte", "artista"].map(r => link(base + "/" + r, r === "ouvinte" ? "Ouvinte" : "Artista", "chip " + (r === role ? "sel" : ""))).join("");
  return '<div class="authbox">' + painelAcesso(role) + '<div class="authform"><h1>'
    + (novo ? "Crie sua conta" : "Entre no ECO") + '</h1><p>'
    + (novo ? "Escolha como quer participar do ECO." : role === "artista" ? "Acesse seu Estúdio e seus lançamentos." : "Entre para reencontrar sua coleção.")
    + '</p><div class="chips">' + perfis + '</div><form id="authform" data-role="' + role
    + '" data-tipo="' + base + '">'
    + (novo ? campo(role === "artista" ? "Nome artístico" : "Seu nome", "name", "", "required maxlength=70 autocomplete=name") : "")
    + campo("E-mail", "email", "", 'type="email" required autocomplete="email"')
    + senha("Senha", "password", novo)
    + (novo ? senha("Confirmar senha", "confirm", true) : link("recuperar/" + role, "Esqueci minha senha", "textlink"))
    + '<p class="error" role="alert"></p><button class="primary">' + (novo ? "Criar conta" : "Entrar")
    + '</button></form>'
    + link((novo ? "login/" : "cadastro/") + role, novo ? "Já tenho uma conta" : "Criar uma conta", "textlink")
    + '</div></div>';
}

async function autenticar(form) {
  const d = new FormData(form), role = form.dataset.role, novo = form.dataset.tipo === "cadastro";
  const email = normalizar(d.get("email")), pass = d.get("password"), name = (d.get("name") || "").trim();
  const conta = Object.values(state.profiles).find(p => p.email === email && p.role === role);
  if (!novo && (email === contaAdmin.email || (!conta?.externa && (conta || !emailAtivo())))) {
    const id = await verificarAcesso(email, role, pass);
    entrarComo(id);
    location.hash = destino(perfil().role);
    aviso("Você entrou no ECO.");
    return;
  }
  if (novo) {
    if (!name) throw Error("Informe seu nome.");
    if (pass.length < 8) throw Error("Escolha uma senha com pelo menos 8 caracteres.");
    if (pass !== d.get("confirm")) throw Error("As senhas precisam ser iguais.");
    if (email === contaAdmin.email || Object.values(state.profiles).some(p => p.email === email)) throw Error("Esse e-mail já está cadastrado.");
  }
  if (emailAtivo()) {
    if (novo) {
      await servicoConta("signup", {email, password: pass, data: {nome: name, perfil: role}});
      location.hash = "login/" + role;
      aviso("Confira seu e-mail para confirmar o cadastro e entrar.");
      return;
    }
    const {user} = await servicoConta("token?grant_type=password", {email, password: pass});
    if (user?.user_metadata?.perfil !== role) throw Error("Selecione o tipo de perfil usado no cadastro.");
    const id = "conta-" + user.id;
    await mudar(s => {
      s.profiles[id] ??= {
        id,
        name: user.user_metadata.nome,
        email,
        role,
        externa: true,
        createdAt: user.created_at,
        bio: "",
        genres: "",
        social: "",
        photo: "",
        banner: ""
      };
    });
    entrarComo(id);
    location.hash = destino(role);
    return;
  }
  const id = crypto.randomUUID(), sal = chaveAleatoria(), codigo = chaveAleatoria();
  const [senhaHash, recuperacaoHash] = await Promise.all([verificador(pass, sal), verificador(codigo, sal)]);
  await mudar(s => {
    if (Object.values(s.profiles).some(p => p.email === email)) throw Error("Esse e-mail já está cadastrado.");
    s.profiles[id] = {
      id,
      name,
      email,
      role,
      sal,
      senhaHash,
      recuperacaoHash,
      createdAt: new Date().toISOString(),
      bio: "",
      genres: "",
      social: "",
      photo: "",
      banner: ""
    };
  });
  novaChave = {codigo, role};
  location.hash = "chave";
}

function paginaChave() {
  if (!novaChave) return link("login/ouvinte", "Voltar ao login", "outline");
  return '<article class="eco-leitura"><h1>Guarde seu código de recuperação</h1><p>Ele permite escolher outra senha para seu perfil neste navegador. Guarde uma cópia em um lugar privado.</p><p><code class="codigo-conta">'
    + E(novaChave.codigo) + '</code></p>' + link("login/" + novaChave.role, "Ir para o login", "primary")
    + '</article>';
}

function recuperarConta(role, etapa = false) {
  role = role === "artista" ? "artista" : "ouvinte";
  const online = emailAtivo();
  return '<div class="authbox">' + painelAcesso(role)
    + '<div class="authform"><h1>Recuperar senha</h1><p>'
    + (online ? (etapa ? "Informe o código recebido no seu e-mail e escolha a nova senha." : "Enviaremos um código para o e-mail da sua conta.") : "Informe seu e-mail e o código de recuperação que você guardou ao criar o perfil neste navegador.")
    + '</p><form id="recuperarform" data-role="' + role + '" data-etapa="' + (etapa ? "trocar" : "iniciar")
    + '">' + campo("E-mail", "email", "", 'type="email" required autocomplete="email"')
    + (!online || etapa ? campo("Código de recuperação", "codigo", "", "required autocomplete=one-time-code")
      + senha("Nova senha", "password", true) + senha("Confirmar nova senha", "confirm", true) : "")
    + '<p class="error" role="alert"></p><button class="primary">'
    + (online && !etapa ? "Enviar código por e-mail" : "Salvar nova senha") + '</button></form>'
    + link("login/" + role, "Voltar ao login", "textlink") + '</div></div>';
}

async function redefinirSenha(form) {
  const d = new FormData(form), email = normalizar(d.get("email")), role = form.dataset.role;
  if (emailAtivo() && form.dataset.etapa === "iniciar") {
    await servicoConta("recover", {email});
    location.hash = "redefinir/" + role;
    return;
  }
  const pass = d.get("password"), codigo = d.get("codigo").trim();
  if (pass.length < 8 || pass !== d.get("confirm")) throw Error("Use pelo menos 8 caracteres e confirme a mesma senha.");
  if (emailAtivo()) {
    const v = await servicoConta("verify", {email, token: codigo, type: "recovery"});
    await servicoConta("user", {password: pass}, v.access_token, "PUT");
  } else {
    const conta = Object.values(state.profiles).find(p => p.email === email && p.role === role);
    if (!conta?.recuperacaoHash || await verificador(codigo, conta.sal) !== conta.recuperacaoHash) throw Error("O e-mail ou o código de recuperação está incorreto.");
    const sal = chaveAleatoria(), novo = chaveAleatoria(), senhaHash = await verificador(pass, sal), recuperacaoHash = await verificador(novo, sal);
    await mudar(s => {
      const p = s.profiles[conta.id];
      if (p?.recuperacaoHash !== conta.recuperacaoHash) throw Error("O código já foi utilizado.");
      Object.assign(p, {sal, senhaHash, recuperacaoHash});
      if (s.tentativas) delete s.tentativas[p.id];
    });
    novaChave = {codigo: novo, role};
    location.hash = "chave";
    aviso("Senha atualizada.");
    return;
  }
  location.hash = "login/" + role;
  aviso("Senha atualizada. Entre com a nova senha.");
}


function senha(label, name, nova = false) {
  return '<label>' + label + '<span class="senha"><input type="password" minlength="' + (nova ? 8 : 1)
    + '" required name="' + name + '" autocomplete="' + (nova ? "new-password" : "current-password")
    + '"><button type="button" data-act="verSenha" aria-label="Mostrar senha">' + ico("olho")
    + '</button></span></label>';
}

async function verificarAcesso(email, role, senhaInformada) {
  const anterior = Object.values(state.profiles).find(p => p.email === email && p.role === role);
  const hash = anterior?.senhaHash ? await verificador(senhaInformada, anterior.sal) : null;
  let usuario, erro;
  await mudar(s => {
    const conta = email === contaAdmin.email ? contaAdmin : Object.values(s.profiles).find(p => p.email === email && p.role === role);
    if (!conta) {
      erro = "E-mail, senha ou tipo de perfil incorretos.";
      return;
    }
    const tentativas = s.tentativas ??= {};
    const registro = tentativas[conta.id] || {falhas: 0, ate: 0}, agora = Date.now();
    if (registro.ate > agora) {
      erro = registro.ate;
      return;
    }
    if (registro.ate) {
      registro.falhas = 0;
      registro.ate = 0;
    }
    const correta = conta.id === contaAdmin.id ? senhaInformada === "1234567" : conta.externa ? false : conta.senhaHash ? conta.senhaHash === hash : senhaInformada === DEMO || (senhaInformada === "123456" && email === role + "@gmail.com");
    if (correta) {
      delete tentativas[conta.id];
      usuario = conta.id;
      return;
    }
    registro.falhas++;
    if (registro.falhas >= 3) registro.ate = agora + 300000;
    tentativas[conta.id] = registro;
    erro = registro.ate || "E-mail, senha ou tipo de perfil incorretos.";
  });
  if (erro) {
    const e = Error(typeof erro === "number" ? "Acesso temporariamente bloqueado." : erro);
    if (typeof erro === "number") e.ate = erro;
    throw e;
  }
  return usuario;
}

function mostrarBloqueio(form, ate) {
  const msg = form.querySelector(".error"), botao = form.querySelector("button.primary");
  function atualizar() {
    if (!form.isConnected) return;
    const segundos = Math.max(0, Math.ceil((ate - Date.now()) / 1000));
    botao.disabled = segundos > 0;
    msg.textContent = segundos ? "Três tentativas incorretas. Tente novamente em " + tempo(segundos) + "." : "Você já pode tentar novamente.";
    if (segundos) setTimeout(atualizar, 1000);
  }
  atualizar();
}
