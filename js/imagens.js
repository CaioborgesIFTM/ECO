/* As imagens locais aparecem primeiro. As versões de maior resolução são carregadas quando o retrato se aproxima da tela. */

// Melhora apenas as imagens editoriais. Fotos enviadas pelo usuário seguem o fluxo local.
const imagensEditoriais = {
  "assets/weeknd.webp": "https://upload.wikimedia.org/wikipedia/commons/9/98/The_Weeknd_with_hand_in_the_air_performing_live_in_Hong_Kong_in_November_2018.jpg",
  "assets/billie.webp": "https://upload.wikimedia.org/wikipedia/commons/9/99/Billie_Eilish_at_Pukkelpop_Festival_-_18_AUGUST_2019_%2810%29.jpg",
  "assets/dragons.webp": "https://www.coca-cola.com/content/dam/onexp/global/central/offerings/coke-studio/artists/2_Imagine_Dragons_by_Eric_Ray_Davidson_GREEN_04_1-1.jpg",
  "assets/lana.webp": "https://upload.wikimedia.org/wikipedia/commons/7/71/Lana_Del_Rey_Cannes_2012.jpg",
  "assets/tyler.webp": "https://upload.wikimedia.org/wikipedia/commons/b/be/Tyler_the_Creator_2022_cropped_%28cropped%29.png",
  "retrato/olivia": "https://content.promiflash.de/article-images/video_1080/olivia-rodrigo-posiert-laechelnd.jpg",
  "retrato/maneva": "https://www.correiodopovo.com.br/image/contentid/policy%3A1.1561595%3A1734132037/MANEVA_fotopor_LanaPinho-6.jpg?%24p%24f%24q%24w=7145236&f=4x3&q=0.9&w=900",
  "retrato/arctic": "https://www.nme.com/wp-content/uploads/2018/01/Arctic-Monkeys_Photo-Credit-Zackery-Michael-HI-RES.jpg",
  "assets/currents.webp": "https://cdn.shopify.com/s/files/1/1867/3055/files/tame-impala-currents-theaudioco-523.webp",
  "assets/good4u.webp": "https://vader-prod.s3.amazonaws.com/1715801449-81ksMs1qujL.jpg",
  "assets/luz.webp": "https://i1.sndcdn.com/artworks-000338044350-k1fnp7-t500x500.jpg",
  "assets/rumine.webp": "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163"
};
const retratosDoCatalogo = {
  "assets/good4u.webp": "retrato/olivia",
  "assets/luz.webp": "retrato/maneva",
  "assets/rumine.webp": "retrato/arctic"
};
const originaisEmCarga = new Map();

function carregarOriginal(img) {
  const url = imagensEditoriais[img.dataset.editorial];
  if (!url) return;
  if (!originaisEmCarga.has(url)) {
    const foto = new Image();
    const carga = new Promise(resolve => {
      foto.onload = () => resolve(foto.naturalWidth >= 300);
      foto.onerror = () => resolve(false);
      foto.referrerPolicy = "no-referrer";
      foto.src = url;
    });
    originaisEmCarga.set(url, carga);
    carga.then(ok => {
      if (!ok) originaisEmCarga.delete(url);
    });
  }
  originaisEmCarga.get(url).then(ok => {
    if (ok && img.isConnected) {
      img.referrerPolicy = "no-referrer";
      img.src = url;
    }
  });
}
const observadorDeImagens = typeof IntersectionObserver === "function" ? new IntersectionObserver(itens => {
  for (const item of itens) if (item.isIntersecting) {
    observadorDeImagens.unobserve(item.target);
    carregarOriginal(item.target);
  }
}, {rootMargin: "200px"}) : null;

function aprimorarImagens(root) {
  for (const img of root.querySelectorAll("img[data-editorial]")) {
    if (observadorDeImagens) observadorDeImagens.observe(img); else carregarOriginal(img);
  }
}
