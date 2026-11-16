# ECO — Descoberta musical

O ECO é um projeto escolar de descoberta musical para ouvintes e artistas independentes. A interface é feita com HTML, CSS e JavaScript e funciona em hospedagem estática. Os arquivos deste repositório já estão prontos para publicação.

## Como publicar no GitHub Pages

1. Extraia o ZIP no computador. Abra a pasta que contém `index.html`.
2. No repositório `loganmorais-hue/Ecos`, envie **o conteúdo da pasta** para a raiz da branch `main`. No GitHub, você pode usar **Add file → Upload files**. Envie os quatro itens juntos: `index.html`, `assets/`, `css/` e `js/`. Confirme o commit.
3. Abra **Settings → Pages**. Em **Build and deployment**, selecione **Deploy from a branch**. Escolha **main** e **/(root)** e clique em **Save**.
4. Aguarde a publicação. Em **Settings → Pages**, use **Visit site**. Para o repositório indicado, o endereço esperado é `https://loganmorais-hue.github.io/Ecos/`.
5. Abra a página inicial, entre em **Explorar** e abra uma faixa para conferir a publicação. Se uma imagem faltar, confira o nome do arquivo e suas maiúsculas e minúsculas no repositório.

Não é preciso instalar pacotes, executar uma compilação ou configurar chaves para usar o modo local de contas.

[Documentação do GitHub Pages](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Como executar no computador

Na pasta de `index.html`, abra o terminal e execute um dos comandos abaixo com Python 3 instalado.

| Sistema | Comando |
| --- | --- |
| Windows | `py -m http.server 8000 --bind 127.0.0.1` |
| macOS ou Linux | `python3 -m http.server 8000 --bind 127.0.0.1` |

Abra `http://127.0.0.1:8000/` e use **Ctrl+C** para encerrar. O Live Server do VS Code também funciona. Volte pelo mesmo navegador, endereço e porta para reencontrar seus dados.

## Onde editar

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da página, ordem dos scripts e áreas permanentes de navegação, diálogo e reprodução. |
| `assets/` | Logo, capas, retratos, imagens de acesso e créditos das imagens. |
| `css/eco.css` | Cores, tipografia, componentes e regras para diferentes larguras de tela. |
| `js/app.js` | Inicialização, rotas e eventos de clique, pesquisa e envio de formulários. |
| `js/componentes.js` | Ícones, botões, imagens, campos de formulário e diálogos usados em várias telas. |
| `js/interface.js` | Cabeçalho, lateral, início, painel do ouvinte e biblioteca. |
| `js/descoberta.js` | Busca, gêneros, fichas de músicas e álbuns. |
| `js/estudio.js` | Painel do artista, edição de perfil, revisão e publicação de faixas, exclusão e restauração. |
| `js/admin.js` | Painel de moderação. |
| `js/desempenho.js` | Relatórios de escuta, métricas do artista e avisos de lançamento. |
| `js/player.js` | Fila, volume, reprodução, progresso e contagem de escutas. |
| `js/dados.js` | Catálogo inicial, perfis, IndexedDB, arquivos enviados e atualização de dados antigos. |
| `js/contas.js` | Cadastro, login, senha e recuperação de acesso. |
| `js/imagens.js` | Carregamento de imagens de maior resolução sobre as capas e retratos locais. |
| `js/institucional.js` | Sobre, Central de ajuda, Termos, Privacidade e rodapé. |

Para mudar o texto de apresentação do início, procure `inicioPadrao` em `js/interface.js`. A função `bannerInicio`, no mesmo arquivo, monta essa abertura. As perguntas frequentes estão em `gruposAjuda`, em `js/institucional.js`.

Ao adicionar imagens, use `assets/nome.webp` no HTML ou nas telas montadas pelo JavaScript. No CSS, use `../assets/nome.webp`, pois o navegador resolve o caminho a partir da pasta da folha de estilos. As telas usam endereços como `#explorar` e `#estudio`, o que permite recarregar uma tela no GitHub Pages.

## Como testar na apresentação

| Perfil de apresentação | E-mail | Senha de exemplo |
| --- | --- | --- |
| Ouvinte | `ouvinte@gmail.com` | `eco12345` |
| Artista | `artista@gmail.com` | `eco12345` |
| Administrador | `administrador@gmail.com` | `1234567` |

1. Entre como artista e publique um MP3 autorizado com uma capa JPG ou PNG.
2. Saia, entre como ouvinte no mesmo navegador, pesquise o título e reproduza a faixa. Após 30 segundos contínuos, confira **Meu mês**.
3. Curta a faixa, adicione-a a uma playlist e recarregue a página. Com o perfil de administrador, você pode retirar a faixa e restaurá-la na lixeira.

## O que acontece com os dados

O IndexedDB guarda as faixas enviadas, as imagens, os perfis e as coleções neste navegador. O GitHub Pages distribui os arquivos da aplicação. Publicar o site em outro domínio inicia um armazenamento separado. Uma música enviada por um visitante só aparece nos perfis daquele navegador e naquela origem. As referências comerciais do catálogo têm ficha e capa; o áudio disponível para reprodução vem das publicações com arquivo.

As contas da tabela são públicas e servem à apresentação. Novos perfis locais escolhem uma senha individual e recebem um código de recuperação. O projeto inclui uma integração opcional com Supabase Auth em `js/contas.js`. O envio de e-mail depende da configuração de um provedor e remetente. Nesse arquivo de cliente, use apenas a URL do projeto e sua chave publicável. A autenticação e as permissões do protótipo local não protegem um catálogo compartilhado em produção.

Os créditos de fotografias e capas estão em [assets/creditos-imagens.txt](creditos-imagens.txt).


As telas são abertas a partir de `index.html` pelas rotas como `#estudio` e `#biblioteca`.
