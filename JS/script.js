import { db } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ============================= VARIÁVEIS ============================= */
let convidados = [];
let sentados = new Set();
let senhaLiberada = false; // controla se a senha foi inserida corretamente

const sentadosRef = collection(db, "sentados");
const SENHA_CERIMONIA = "030126"; // troque conforme necessário

/* ============================= UTILIDADES ============================= */
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function jaSentou(nome) {
  return sentados.has(nome);
}

/* ============================= FIREBASE – TEMPO REAL ============================= */
onSnapshot(sentadosRef, snapshot => {
  sentados.clear();
  snapshot.forEach(doc => sentados.add(doc.id));
  atualizarTela();
});

/* ============================= CARREGAR CONVIDADOS ============================= */
fetch("JS/convidados.json")
  .then(r => r.json())
  .then(data => {
    convidados = data;
    // não mostrar mesas automaticamente, só com senha
  });

/* ============================= CHECKBOX (SALVAR NO FIREBASE) ============================= */
window.toggleSentado = async function (nome) {
  const ref = doc(db, "sentados", nome);
  if (jaSentou(nome)) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, { sentado: true });
  }
};

/* ============================= BUSCA ============================= */
window.buscar = function () {
  if (!senhaLiberada) return; // busca só funciona se senha liberada

  const termo = normalizar(
    document.getElementById("searchInput").value.trim()
  );

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  if (!termo) {
    mostrarMesas();
    return;
  }

  const encontrados = convidados.filter(c =>
    normalizar(c.nome).includes(termo)
  );

  if (!encontrados.length) {
    resultado.innerHTML =
      `<div class="alert alert-danger">Nenhum convidado encontrado</div>`;
    return;
  }

  const mesas = [...new Set(encontrados.map(c => c.mesa))];
  mesas.forEach(mesa => {
    const pessoas = convidados.filter(c => c.mesa === mesa);
    resultado.innerHTML += renderMesa(mesa, pessoas, termo);
  });
};

/* ============================= MOSTRAR TODAS AS MESAS ============================= */
function mostrarMesas() {
  if (!senhaLiberada) return; // só mostra mesas com senha correta

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  for (let mesa = 1; mesa <= 30; mesa++) {
    const pessoas = convidados.filter(c => c.mesa === mesa);
    if (pessoas.length) {
      resultado.innerHTML += renderMesa(mesa, pessoas);
    }
  }
}

/* ============================= RENDER MESA ============================= */
function renderMesa(mesa, pessoas, termo = "") {
  return `
    <div class="card mesa-card">
      <div class="card-header mesa-header">Mesa ${mesa}</div>
      <ul class="list-group list-group-flush">
        ${pessoas.map(p => {
          const destaque = termo && normalizar(p.nome).includes(termo);
          return `
            <li class="list-group-item d-flex align-items-center gap-2
              ${destaque ? "convidado-destaque" : termo ? "convidado-opaco" : ""} 
              ${jaSentou(p.nome) ? "sentado" : ""}">
              <input type="checkbox" class="form-check-input" 
                ${jaSentou(p.nome) ? "checked" : ""}
                onchange="toggleSentado('${p.nome}')">
              <span>${p.nome}</span>
            </li>
          `;
        }).join("")}
      </ul>
    </div>
  `;
}

/* ============================= ATUALIZA TELA ============================= */
function atualizarTela() {
  if (!senhaLiberada) return;
  const termo = document.getElementById("searchInput")?.value?.trim();
  termo ? buscar() : mostrarMesas();
}

/* ============================= NAVEGAÇÃO ============================= */
function esconderTudo() {
  document.getElementById("home").classList.add("d-none");
  document.getElementById("cerimonia").classList.add("d-none");
  document.getElementById("mesas").classList.add("d-none");
  document.getElementById("areaBusca").classList.add("d-none");
  document.getElementById("btnVoltar").classList.add("d-none");
}

window.mostrarCerimonia = function () {
  senhaLiberada = false; // esquece a senha ao mudar de aba
  esconderTudo();
  document.getElementById("cerimonia").classList.remove("d-none");
  document.getElementById("btnVoltar").classList.remove("d-none");
};

window.voltarHome = function () {
  senhaLiberada = false; // esquece a senha
  esconderTudo();
  document.getElementById("home").classList.remove("d-none");
};

window.acessarMesas = function () {
  const senha = prompt("Área restrita – Digite a senha:");
  if (senha === SENHA_CERIMONIA) {
    senhaLiberada = true;
    esconderTudo();
    document.getElementById("mesas").classList.remove("d-none");
    document.getElementById("areaBusca").classList.remove("d-none");
    document.getElementById("btnVoltar").classList.remove("d-none");
    mostrarMesas();
  } else {
    alert("Senha incorreta.");
  }
};
