const STORAGE_KEY = "listaTarefa_dados";
let contador = 0;
let input = document.getElementById("inputTarefa");
let btnEnter = document.getElementById("enter");
let main = document.getElementById("areaLista");
let toastTimeout = null;

// Toast "Salvo!"
function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = "Salvo!";
  toast.classList.add("visivel");
  toast.setAttribute("aria-hidden", "false");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("visivel");
    toast.setAttribute("aria-hidden", "true");
  }, 2000);
}

// Carrega tarefas do localStorage
function carregarTarefas() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) {
    const { tarefas, ultimoId } = JSON.parse(dados);
    contador = ultimoId || 0;
    if (tarefas && tarefas.length > 0) {
      tarefas.forEach((t, i) => {
        renderizarTarefa(t.id, t.texto, t.concluida, i);
      });
    }
  }
}

// Salva tarefas no localStorage
function salvarTarefas(mostrarToast = true) {
  const itens = main.querySelectorAll(".item:not(.saindo)");
  const tarefas = [];
  itens.forEach((el) => {
    tarefas.push({
      id: parseInt(el.id, 10),
      texto: el.querySelector(".item-nome").textContent,
      concluida: el.classList.contains("clicado"),
    });
  });
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ tarefas, ultimoId: contador })
  );
  if (mostrarToast) showToast();
}

function renderizarTarefa(id, texto, concluida, index = 0) {
  const classeExtra = concluida ? " clicado" : "";
  const iconeClasse = concluida ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
  const novoItem = document.createElement("div");
  novoItem.id = id;
  novoItem.className = "item" + classeExtra;
  novoItem.style.setProperty("--i", index);
  novoItem.innerHTML = `
    <div onclick="marcarTarefa(${id})" class="item-icone">
      <i id="icone_${id}" class="${iconeClasse}"></i>
    </div>
    <div onclick="marcarTarefa(${id})" class="item-nome">${escapeHtml(texto)}</div>
    <div class="item-botao">
      <button onclick="deletar(${id})" class="delete" type="button" aria-label="Deletar">
        <i class="fa-solid fa-trash"></i> Deletar
      </button>
    </div>
  `;
  main.appendChild(novoItem);
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function addTarefa() {
  const valorInput = (input.value || "").trim();
  if (!valorInput) return;

  contador += 1;
  const total = main.querySelectorAll(".item").length;
  renderizarTarefa(contador, valorInput, false, total);
  salvarTarefas();
  input.value = "";
  input.focus();
}

function deletar(id) {
  const tarefa = document.getElementById(id);
  if (!tarefa) return;

  tarefa.classList.add("saindo");
  tarefa.addEventListener(
    "animationend",
    () => {
      tarefa.remove();
      salvarTarefas();
    },
    { once: true }
  );
}

function marcarTarefa(id) {
  const item = document.getElementById(id);
  if (!item) return;

  const concluida = item.classList.toggle("clicado");
  const icone = document.getElementById("icone_" + id);
  if (icone) {
    icone.className = concluida ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
  }
  if (concluida) {
    item.classList.add("completando");
    setTimeout(() => item.classList.remove("completando"), 500);
  }
  item.parentNode.appendChild(item);
  salvarTarefas();
}

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    btnEnter.click();
  }
});

// Placeholder responsivo: texto curto em telas pequenas para não cortar
function atualizarPlaceholder() {
  if (!input) return;
  input.placeholder = window.matchMedia("(max-width: 520px)").matches
    ? "Nova tarefa..."
    : "O que você precisa fazer?";
}

// Inicialização: carregar do localStorage ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
  carregarTarefas();
  atualizarPlaceholder();
});
window.addEventListener("resize", atualizarPlaceholder);
