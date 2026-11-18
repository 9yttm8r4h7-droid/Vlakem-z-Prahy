"use strict";

/* 0. UKLÁDÁNÍ
   Každá položka má vlastní klíč a textovou hodnotu "ano" nebo "ne".
   Není potřeba JSON ani převádění seznamů. Paměť pomůže, pokud prohlížeč
   úložiště zakáže: ovládání dál funguje, jen se po obnovení zapomene. */
const pamet = {};

function nactiHodnotu(klic) {
  if (pamet[klic] !== undefined) {
    return pamet[klic];
  }
  try {
    return localStorage.getItem(klic);
  } catch {
    return null;
  }
}

function ulozHodnotu(klic, hodnota) {
  pamet[klic] = hodnota;
  try {
    localStorage.setItem(klic, hodnota);
  } catch {
    // Hodnota už je v paměti; na disk ji tento prohlížeč neuložil.
  }
}

/* 1. HVĚZDIČKY
   data-save v HTML obsahuje označení výletu, např. "pacifik".
   Všechny hvězdičky obsluhuje jedna společná funkce. */
const tlacitkaUlozit = document.querySelectorAll("[data-save]");

function zobrazHvezdicky() {
  for (const tlacitko of tlacitkaUlozit) {
    const klic = "vylet-" + tlacitko.dataset.save;
    const nazev = tlacitko.dataset.name;
    if (nactiHodnotu(klic) === "ano") {
      tlacitko.textContent = "★ Uloženo";
      tlacitko.setAttribute("aria-pressed", "true");
      tlacitko.setAttribute("aria-label", "Odebrat uložený výlet: " + nazev);
    } else {
      tlacitko.textContent = "☆ Uložit";
      tlacitko.setAttribute("aria-pressed", "false");
      tlacitko.setAttribute("aria-label", "Uložit výlet: " + nazev);
    }
  }
}

function prepniVylet() {
  // this je tlačítko, na které návštěvník právě klikl.
  const klic = "vylet-" + this.dataset.save;
  if (nactiHodnotu(klic) === "ano") {
    ulozHodnotu(klic, "ne");
  } else {
    ulozHodnotu(klic, "ano");
  }
  zobrazHvezdicky();
  filtrujVylety();
}

for (const tlacitko of tlacitkaUlozit) {
  tlacitko.hidden = false;
  tlacitko.addEventListener("click", prepniVylet);
}
zobrazHvezdicky();

/* 2. FILTR VÝLETŮ
   Na ostatních stránkách filtr není. Podmínka if zabrání chybě.
   data-duration na kartě říká, zda jde o "half" (půl dne), nebo "day". */
const panelFiltru = document.querySelector("#trip-filters");
const tlacitkaFiltru = document.querySelectorAll("[data-filter]");
const jenUlozene = document.querySelector("#favorites-only");
const karty = document.querySelectorAll("[data-trip]");
let delka = "all";

function filtrujVylety() {
  if (!panelFiltru) {
    return;
  }
  let pocet = 0;
  for (const karta of karty) {
    let zobrazit = true;
    if (delka !== "all" && karta.dataset.duration !== delka) {
      zobrazit = false;
    }
    if (jenUlozene.checked && nactiHodnotu("vylet-" + karta.dataset.trip) !== "ano") {
      zobrazit = false;
    }
    karta.hidden = !zobrazit;
    if (zobrazit) {
      pocet = pocet + 1;
    }
  }
  document.querySelector("#results-count").textContent = "Zobrazeno " + pocet + " ze " + karty.length + " výletů";
  document.querySelector("#empty-trips").hidden = pocet !== 0;
}

function zmenFiltr() {
  delka = this.dataset.filter;
  for (const tlacitko of tlacitkaFiltru) {
    tlacitko.setAttribute("aria-pressed", "false");
  }
  this.setAttribute("aria-pressed", "true");
  filtrujVylety();
}

if (panelFiltru) {
  panelFiltru.hidden = false;
  for (const tlacitko of tlacitkaFiltru) {
    tlacitko.addEventListener("click", zmenFiltr);
  }
  jenUlozene.addEventListener("change", filtrujVylety);
  filtrujVylety();
}

/* 3. SEZNAM PŘED CESTOU
   Každé políčko se ukládá samostatně podle svého data-check. */
const policka = document.querySelectorAll("[data-check]");
const pocitadlo = document.querySelector("#check-progress");
const tlacitkoReset = document.querySelector("#reset-checklist");

function spocitejHotove() {
  let pocet = 0;
  for (const policko of policka) {
    if (policko.checked) {
      pocet = pocet + 1;
    }
  }
  pocitadlo.textContent = pocet + " z " + policka.length + " hotovo";
}

function ulozPolicko() {
  const klic = "seznam-" + this.dataset.check;
  if (this.checked) {
    ulozHodnotu(klic, "ano");
  } else {
    ulozHodnotu(klic, "ne");
  }
  spocitejHotove();
}

function vymazSeznam() {
  for (const policko of policka) {
    policko.checked = false;
    ulozHodnotu("seznam-" + policko.dataset.check, "ne");
  }
  spocitejHotove();
}

if (policka.length > 0) {
  for (const policko of policka) {
    policko.checked = nactiHodnotu("seznam-" + policko.dataset.check) === "ano";
    policko.addEventListener("change", ulozPolicko);
  }
  pocitadlo.hidden = false;
  tlacitkoReset.hidden = false;
  tlacitkoReset.addEventListener("click", vymazSeznam);
  spocitejHotove();
}

/* 4. TISK
   Tlačítko otevře tiskové okno. Vzhled papíru určuje @media print v CSS. */
function vytiskniStranku() {
  window.print();
}

const tlacitkaTisku = document.querySelectorAll("[data-print]");
for (const tlacitko of tlacitkaTisku) {
  tlacitko.hidden = false;
  tlacitko.addEventListener("click", vytiskniStranku);
}
