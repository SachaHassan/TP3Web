import Cookie from "./cookie.js";
import { create2DArray } from "./utils.js";

export default class Grille {
  tabCookies = [];

  constructor(l, c) {
    this.c = c;
    this.l = l;
    this.cookiesCliquees = [];

    this.remplirTableauDeCookies(6);
  }

  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      let ligne = Math.floor(index / this.l);
      let colonne = index % this.c;
      console.log("On remplit le div index=" + index + " l=" + ligne + " col=" + colonne);

      let img = this.tabCookies[ligne][colonne].htmlImage;

      img.onclick = (evt) => {
        let cookie = this.getCookieFromImage(evt.target);
        console.log("On a cliqué sur la ligne " + ligne + " et la colonne " + colonne);
        console.log("Le cookie cliqué est de type " + cookie.type);
        if (!this.cookiesCliquees.includes(cookie)) {
          this.cookiesCliquees.push(cookie);
          cookie.selectionnee();
          console.log("COUCOU");
        }
        if (this.cookiesCliquees.length == 2) {
          let cookie1 = this.cookiesCliquees[0];
          let cookie2 = this.cookiesCliquees[1];

          this.essayerDeSwapper(cookie1, cookie2);
          console.log("JE PASSE ICI");
        }
      }

      img.ondragstart = (evt) => {
        console.log("dragstart");
        let imgClickee = evt.target;
        let cookie = this.getCookieFromImage(imgClickee);
        evt.dataTransfer.setData("pos", JSON.stringify(imgClickee.dataset));
      }

      img.ondragover = (evt) => {
        evt.preventDefault();
      }

      img.ondragenter = (evt) => {
        evt.target.classList.add("grilleDragOver");
      }

      img.ondragleave = (evt) => {
        evt.target.classList.remove("grilleDragOver");
      }

      img.ondrop = (evt) => {
        evt.target.classList.remove("grilleDragOver");

        let position = JSON.parse(evt.dataTransfer.getData("pos"));
        let cookie1 = this.getCookieFromLC(
          position.ligne,
          position.colonne
        );

        let img = evt.target;
        let cookie2 = this.getCookieFromImage(img);

        this.essayerDeSwapper(cookie1, cookie2);
      }

      div.appendChild(img);
    });
  }

  essayerDeSwapper(cookie1, cookie2) {
    if (this.swap(cookie1, cookie2)) {
      cookie2.deselectionnee();
      this.cookiesCliquees = [];
    } else {
      cookie2.deselectionnee();
      this.cookiesCliquees.splice(1, 1);
    }
  }
  getCookieFromImage(img) {
    let [l, c] = Cookie.getLigneColonneFromImg(img);

    return this.getCookieFromLC(l, c);
  }

  getCookieFromLC(l, c) {
    return this.tabCookies[l][c];
  }

  swap(cookie1, cookie2) {
    if (!Cookie.swapDistancePossible(cookie1, cookie2)) return false;

    Cookie.swapCookies(cookie1, cookie2);

    this.checkAlignmentsAndDestroy();

    return true;
  }

  remplirTableauDeCookies(nbDeCookiesDifferents) {
    this.tabCookies = create2DArray(this.l);

    for (let l = 0; l < this.l; l++) {
      for (let c = 0; c < this.c; c++) {
        let type = Math.floor(nbDeCookiesDifferents * Math.random()); // valeur aléatoire entre 0 et nbDeCookiesDifferents
        this.tabCookies[l][c] = new Cookie(type, l, c);
      }
    }
    return this.tabCookies;
  }

    checkAlignmentsAndDestroy() {
        // Vérifier les alignements horizontaux
        for (let l = 0; l < this.l; l++) {
            let currentType = -1;
            let count = 0;
            let startC = 0;
            for (let c = 0; c < this.c; c++) {
                let cookie = this.tabCookies[l][c];
                if (cookie && cookie.type === currentType) {
                    count++;
                    if (count === 3) {
                        this.destroyCookies(l, startC, l, c);
                        break;
                    }
                } else {
                    currentType = cookie ? cookie.type : -1;
                    count = cookie ? 1 : 0;
                    startC = c;
                }
            }
        }

        // Vérifier les alignements verticaux
        for (let c = 0; c < this.c; c++) {
            let currentType = -1;
            let count = 0;
            let startL = 0;
            for (let l = 0; l < this.l; l++) {
                let cookie = this.tabCookies[l][c];
                if (cookie && cookie.type === currentType) {
                    count++;
                    if (count === 3) {
                        this.destroyCookies(startL, c, l, c);
                        break;
                    }
                } else {
                    currentType = cookie ? cookie.type : -1;
                    count = cookie ? 1 : 0;
                    startL = l;
                }
            }
        }
    }

    destroyCookies(startL, startC, endL, endC) {
        // Détruire les cookies alignés
        for (let l = startL; l <= endL; l++) {
            for (let c = startC; c <= endC; c++) {
                let cookie = this.tabCookies[l][c];
                if (cookie) {
                    cookie.htmlImage.remove();
                    this.tabCookies[l][c] = null;
                }
            }
        }

        // Faire descendre les cookies situés au-dessus
        for (let l = endL; l >= 0; l--) {
            for (let c = startC; c <= endC; c++) {
                if (!this.tabCookies[l][c]) {
                    let swapL = l - 1;
                    while (swapL >= 0 && !this.tabCookies[swapL][c]) {
                        swapL--;
                    }
                    if (swapL >= 0) {
                        let cookieToMove = this.tabCookies[swapL][c];
                        this.tabCookies[swapL][c] = null;
                        this.tabCookies[l][c] = cookieToMove;
                        cookieToMove.ligne = l;
                        cookieToMove.htmlImage.dataset.ligne = l;
                        cookieToMove.htmlImage.style.top = `${l * 80}px`; // Mise à jour de la position visuelle
                    }
                }
            }
        }

        // Générer de nouveaux cookies pour remplir les espaces vides
        for (let l = 0; l < this.l; l++) {
            for (let c = 0; c < this.c; c++) {
                if (!this.tabCookies[l][c]) {
                    let type = Math.floor(Math.random() * 6); // Générer un nouveau type de cookie aléatoire
                    let newCookie = new Cookie(type, l, c);
                    this.tabCookies[l][c] = newCookie;
                    let img = newCookie.htmlImage;
                    img.style.top = `${l * 80}px`; // Positionner le cookie visuellement
                    img.style.transition = "top 0.5s ease"; // Ajouter une transition pour l'animation de la chute
                    document.querySelector("#grille").appendChild(img);
                }
            }
        }
    }


}
