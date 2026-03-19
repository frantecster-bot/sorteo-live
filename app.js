let numbers = [];
let picks = {};
let counter = {};
let interval;

function init() {
  const grid = document.getElementById("grid");

  for (let i = 1; i <= CONFIG.totalNumbers; i++) {
    numbers.push(i);

    let div = document.createElement("div");
    div.className = "num";
    div.innerText = i;

    div.onclick = () => pickNumber(i, div);

    grid.appendChild(div);
  }
}

function pickNumber(num, el) {
  let name = document.getElementById("name").value;

  if (!name) return alert("Ingresá nombre");
  if (picks[num]) return alert("Número ocupado");

  picks[num] = name;
  el.classList.add("taken");
  el.innerText = num + "\\n" + name;

  log(`✔ ${name} eligió ${num}`);
}

function log(msg) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML += msg + "<br>";
  logDiv.scrollTop = logDiv.scrollHeight;
}

function startDraw() {
  if (Object.keys(picks).length < CONFIG.minPlayers) {
    alert("Pocos jugadores");
    return;
  }

  counter = {};
  log("🚀 Sorteo iniciado");

  interval = setInterval(() => {
    let rand = numbers[Math.floor(Math.random() * numbers.length)];

    log("🎲 Sale: " + rand);

    if (picks[rand]) {
      counter[rand] = (counter[rand] || 0) + 1;

      if (counter[rand] >= CONFIG.winHits) {
        clearInterval(interval);

        log(`🏆 GANADOR: ${picks[rand]} (${rand})`);
      }
    }
  }, CONFIG.drawSpeed);
}

init();
