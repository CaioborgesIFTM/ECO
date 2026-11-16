/* Textos e links do rodapé, da página Sobre, da ajuda e dos termos. */

function rodapeECO() {
  const coluna = (titulo, itens) => '<nav aria-label="' + titulo + '"><h2>' + titulo + '</h2>' + itens.map(([r, n]) => link(r, n)).join("") + '</nav>';
  const artista = perfil()?.role === "artista" ? "estudio" : "login/artista";
  return '<div class="footer-identidade">'
    + link("inicio", '<img src="assets/logo.png" alt="ECO — início">', "marca")
    + '<p>Descoberta musical para quem escuta e para quem cria.</p></div>'
    +
    coluna("Navegação", [["inicio", "Início"], ["explorar", "Explorar"], ["sobre", "Sobre o ECO"]])
    +
    coluna("Comunidade", [["painel", "Para ouvintes"], [artista, "Para artistas"], ["playlists", "Minhas playlists"]])
    +
    coluna("Ajuda e informações", [["ajuda", "Central de ajuda"], ["uso", "Termos de uso"], ["privacidade", "Privacidade"]]);
}

function sobreECO() {
  return '<article class="eco-sobre"><header>' + tag("SOBRE O ECO")
    + '<h1>Há mais música para descobrir.</h1><p>O ECO nasceu de uma pergunta: como fazer uma boa música chegar a quem ainda não conhece o artista? Aqui, quem escuta pode sair do repertório de sempre, e quem cria tem espaço para encontrar seu público.</p></header><div class="sobre-colunas"><section>'
    + ico("headphones")
    + '<h2>Para quem escuta</h2><p>As faixas que você curte, os gêneros que ouve e os artistas que segue ajudam o ECO a indicar a próxima descoberta. Guarde suas favoritas em playlists e veja quem mais tocou no seu mês.</p>'
    + link("explorar", "Explorar o catálogo " + ico("arrow"), "textlink") + '</section><section>'
    + ico("mic")
    + '<h2>Para quem cria</h2><p>Reúna suas faixas em álbuns, escolha quando cada lançamento chega ao catálogo e acompanhe as reproduções e curtidas no Estúdio.</p>'
    + link(perfil()?.role === "artista" ? "estudio" : "cadastro/artista", perfil()?.role === "artista" ? "Abrir meu Estúdio" : "Criar perfil de artista", "textlink")
    + '</section></div></article>';
}

function paginaInformativa(rota) {
  if (rota === "ajuda") return centralAjuda();
  const paginas = {
    uso: [
      "Termos de uso",
      [
        [
          "Publicações",
          "Publique somente áudios e imagens de sua autoria ou para os quais você tenha autorização. O crédito do artista deve acompanhar a faixa."
        ],
        [
          "Catálogo",
          "Fichas de descoberta identificam músicas e álbuns. A reprodução depende da disponibilidade de um áudio autorizado."
        ],
        [
          "Moderação",
          "O artista gerencia suas publicações no Estúdio. A administração pode retirar e restaurar músicas do catálogo."
        ]
      ]
    ],
    privacidade: [
      "Privacidade",
      [
        [
          "Sua coleção",
          "Curtidas, playlists, artistas seguidos, escutas e arquivos publicados ficam no armazenamento deste navegador. A sessão é mantida nesta aba."
        ],
        [
          "Recomendações",
          "O ECO usa suas interações com artistas e gêneros para ordenar sugestões. Depois de 30 segundos contínuos de reprodução, a escuta entra nas estatísticas."
        ],
        [
          "Seus dados",
          "Você pode desfazer curtidas, deixar de seguir artistas e excluir playlists. Limpar os dados do site no navegador apaga também as publicações e coleções salvas neste dispositivo."
        ],
        [
          "Acesso",
          "Perfis locais novos usam um verificador de senha e um código de recuperação. Quando o serviço de contas por e-mail está habilitado, ele processa as credenciais e o envio de códigos."
        ]
      ]
    ]
  };
  const [titulo, itens] = paginas[rota];
  return '<article class="eco-pagina"><header>' + tag("INFORMAÇÕES DO ECO") + '<h1>' + titulo
    + '</h1></header><div class="grade-documento">'
    + itens.map(([h, p]) => '<section><h2>' + h + '</h2><p>' + p + '</p></section>').join("")
    + '</div></article>';
}
const gruposAjuda = [
  [
    "Conta e acesso",
    [
      [
        "Qual perfil devo escolher?",
        "Escolha Ouvinte para descobrir músicas e organizar sua coleção. O perfil Artista também tem acesso ao Estúdio para publicar faixas."
      ],
      [
        "Como recupero minha senha?",
        "Na tela de entrada, escolha Esqueci minha senha. Para um perfil local, use o e-mail cadastrado e o código que você guardou ao criar a conta.",
        ["recuperar", "Recuperar senha"]
      ],
      [
        "Onde ficam minhas músicas e playlists?",
        "Sua coleção e seus arquivos ficam neste navegador. Use o mesmo endereço do ECO e o mesmo perfil para encontrá-los de novo."
      ]
    ]
  ],
  [
    "Descoberta e biblioteca",
    [
      [
        "Como encontro uma música?",
        "Use a busca no cabeçalho. Você pode procurar pelo título, artista, álbum ou gênero.",
        ["explorar", "Explorar catálogo"]
      ],
      [
        "Por que algumas faixas abrem uma ficha?",
        "A ficha apresenta o artista, a capa e o álbum. Quando há áudio publicado no ECO, a faixa também oferece o botão Reproduzir."
      ],
      [
        "Como adiciono uma música à playlist?",
        "Abra as opções da faixa, escolha Adicionar à playlist e selecione uma lista. Você também pode criar uma nessa etapa."
      ],
      [
        "Como acompanho um artista?",
        "Abra o perfil pelo retrato ou pelo nome e clique em Seguir artista. Novos lançamentos desse artista geram avisos neste navegador."
      ],
      [
        "Como o ECO conta minhas escutas?",
        "Após 30 segundos contínuos de reprodução, a escuta entra no histórico. Em Meu mês, você vê os artistas e gêneros que mais ouviu."
      ]
    ]
  ],
  [
    "Publicação e Estúdio",
    [
      [
        "Como publico uma música?",
        "No Estúdio, escolha Publicar música, preencha o título e o gênero, envie seu áudio MP3 e uma capa JPG ou PNG. Revise os dados e confirme a publicação."
      ],
      [
        "Como reúno faixas em um álbum?",
        "Use o mesmo nome de álbum ao publicar cada faixa. Você também pode abrir um álbum no Estúdio e escolher Adicionar faixa."
      ],
      [
        "Posso agendar um lançamento?",
        "Sim. Escolha uma data e uma hora futuras no formulário de publicação. No horário escolhido, a faixa entra no catálogo se o ECO estiver aberto. Se estiver fechado, ela aparece ao reabrir."
      ],
      [
        "Consigo restaurar uma faixa excluída?",
        "Use Desfazer logo após a exclusão ou abra a Lixeira do Estúdio e escolha Restaurar. Faixas retiradas pela administração podem ser restauradas pelo administrador."
      ]
    ]
  ]
];

function centralAjuda() {
  const grupos = gruposAjuda.map(([nome, itens]) => '<section class="faq-grupo"><h2>' + E(nome) + '</h2>'
    + itens.map(([q, a, acao]) => '<details><summary>' + E(q) + ico("down") + '</summary><div><p>' + E(a) + '</p>'
      + (acao ? link(acao[0], acao[1], "textlink") : "") + '</div></details>').join("")
    + '</section>').join("");
  return '<article class="eco-pagina"><header>' + tag("SUPORTE")
    + '<h1>Central de ajuda</h1></header><div class="grade-ajuda">' + grupos + '</div></article>';
}
