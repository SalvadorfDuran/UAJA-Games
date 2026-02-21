const SHEET_CSV_BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0ZqwSPgtUOPaAwFTKszReQVPJlHxmfIeh1XUPxjdzSv7QsfSEF3f5Y3eViam_PnNaRoxHROHAbzZa/pub?output=csv";
const RESULTADOS_GID = "0";
const PARTIDOS_GID = "903220854";
const TORNEO_STORAGE_KEY = "uaja_torneo";
const TORNEO_ALL_VALUE = "historico";

const DEFAULT_GID = RESULTADOS_GID;
const rowCount = document.getElementById("rowCount");
const summaryTable = document.getElementById("summaryTable");
const tableHint = document.getElementById("tableHint");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const matchSelect = document.getElementById("matchSelect");
const matchTable = document.getElementById("matchTable");
const matchHint = document.getElementById("matchHint");
const matchMeta = document.getElementById("matchMeta");
const torneoSelect = document.getElementById("torneoSelect");
let activeTorneo = TORNEO_ALL_VALUE;

async function loadData(gid) {
  if (tableHint) {
    tableHint.textContent = "Cargando datos...";
  }
  try {
    const csvUrl = buildCsvUrl(gid);
    const response = await fetch(csvUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      throw new Error("No hay filas para mostrar");
    }

    const headers = rows[0].map((header) => header.toLowerCase().trim());
    const bodyRows = rows.slice(1);
    const jugadorIndex = headers.indexOf("jugador");
    const puntosIndex = headers.indexOf("puntos");
    const faltasIndex = findFaltasIndex(headers);
    const torneoIndex = headers.indexOf("torneo");

    if (jugadorIndex === -1 || puntosIndex === -1) {
      renderEmptyTable();
      tableHint.textContent =
        "No se encontraron columnas 'jugador' y 'puntos' en esta hoja.";
      rowCount.textContent = "";
      setStatus("Sin columnas", "error");
      return;
    }

    const filteredRows = filterByTorneo(bodyRows, torneoIndex, activeTorneo);
    const summary = aggregatePoints(
      filteredRows,
      jugadorIndex,
      puntosIndex,
      faltasIndex
    );
    renderSummaryTable(summary);

    if (rowCount) {
      rowCount.textContent = `${summary.length} jugadores`;
    }
    if (tableHint) {
      tableHint.textContent = "";
    }
  } catch (error) {
    console.error(error);
    renderEmptyTable();
    if (tableHint) {
      tableHint.textContent =
        "No se pudieron cargar los datos. Verifica la hoja publicada.";
    }
  }
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (currentValue.length > 0 || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  return rows;
}

function aggregatePoints(rows, jugadorIndex, puntosIndex, faltasIndex) {
  const totals = new Map();

  rows.forEach((row) => {
    const jugador = (row[jugadorIndex] || "").trim();
    if (!jugador) {
      return;
    }
    const puntosRaw = row[puntosIndex] || "0";
    const puntos = parseNumber(puntosRaw);
    const faltasRaw = faltasIndex === -1 ? "0" : row[faltasIndex] || "0";
    const faltas = parseNumber(faltasRaw);

    const current = totals.get(jugador) || { jugador, puntos: 0, pj: 0, faltas: 0 };
    current.puntos += puntos;
    current.pj += 1;
    current.faltas += faltas;
    totals.set(jugador, current);
  });

  return Array.from(totals.values())
    .map((item) => ({
      ...item,
      puntosPorPartido: item.pj ? item.puntos / item.pj : 0,
      faltasPorPartido: item.pj ? item.faltas / item.pj : 0,
    }))
    .sort((a, b) => b.puntos - a.puntos);
}

function parseNumber(value) {
  const cleaned = value.toString().trim().replace(/\./g, "").replace(/,/g, ".");
  const numberValue = Number(cleaned);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function normalizePlayerKey(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getPlayerImagePath(name) {
  const key = normalizePlayerKey(name);
  if (!key) {
    return "";
  }
  return `assets/imagenes/jugador-${key}`;
}

function renderSummaryTable(summary) {
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  [
    "Pos",
    "Jugador",
    "Puntos",
    "Faltas",
    "PJ",
    "Pts/PJ",
    "F/PJ",
  ].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const tbody = document.createElement("tbody");
  let currentRank = 0;
  let lastPoints = null;
  summary.forEach((item) => {
    if (lastPoints === null || item.puntos !== lastPoints) {
      currentRank += 1;
      lastPoints = item.puntos;
    }
    const medal =
      currentRank === 1 ? "🥇" : currentRank === 2 ? "🥈" : currentRank === 3 ? "🥉" : "";
    const tr = document.createElement("tr");
    const positionCell = document.createElement("td");
    positionCell.className = "position-cell";
    if (currentRank <= 3) {
      positionCell.classList.add(`position-top-${currentRank}`);
    }
    positionCell.textContent = `${medal ? `${medal} ` : ""}${currentRank}`;
    positionCell.dataset.label = "Pos";
    const jugadorCell = document.createElement("td");
    jugadorCell.dataset.label = "Jugador";
    const playerWrap = document.createElement("div");
    playerWrap.className = "player-cell";
    const imageBasePath = getPlayerImagePath(item.jugador);
    if (imageBasePath) {
      const img = document.createElement("img");
      img.src = `${imageBasePath}.png`;
      img.alt = item.jugador;
      img.className = "player-image";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => {
        if (img.dataset.fallback !== "jpg") {
          img.dataset.fallback = "jpg";
          img.src = `${imageBasePath}.jpg`;
          return;
        }
        img.remove();
      };
      playerWrap.appendChild(img);
    }
    const nameSpan = document.createElement("span");
    nameSpan.textContent = item.jugador;
    playerWrap.appendChild(nameSpan);
    jugadorCell.appendChild(playerWrap);
    const puntosCell = document.createElement("td");
    puntosCell.className = "points-cell";
    puntosCell.textContent = item.puntos.toString();
    puntosCell.dataset.label = "Puntos";
    const faltasCell = document.createElement("td");
    faltasCell.textContent = item.faltas.toString();
    faltasCell.dataset.label = "Faltas";
    const pjCell = document.createElement("td");
    pjCell.textContent = item.pj.toString();
    pjCell.dataset.label = "PJ";
    const puntosPartidoCell = document.createElement("td");
    puntosPartidoCell.textContent = item.puntosPorPartido.toFixed(2);
    puntosPartidoCell.dataset.label = "Pts/PJ";
    const faltasPartidoCell = document.createElement("td");
    faltasPartidoCell.textContent = item.faltasPorPartido.toFixed(2);
    faltasPartidoCell.dataset.label = "F/PJ";
    tr.appendChild(positionCell);
    tr.appendChild(jugadorCell);
    tr.appendChild(puntosCell);
    tr.appendChild(faltasCell);
    tr.appendChild(pjCell);
    tr.appendChild(puntosPartidoCell);
    tr.appendChild(faltasPartidoCell);
    tbody.appendChild(tr);
  });

  summaryTable.innerHTML = "";
  summaryTable.appendChild(thead);
  summaryTable.appendChild(tbody);

  applyMetricHeatmap(summaryTable, {
    "Pts/PJ": { invert: false },
    "F/PJ": { invert: true },
  });
}

function applyMetricHeatmap(table, columnConfig) {
  if (!table) {
    return;
  }
  const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
    th.textContent.trim()
  );
  const entries = Object.entries(columnConfig || {});
  const targetIndexes = entries
    .map(([label, config]) => ({
      label,
      config: config || {},
      index: headers.indexOf(label),
    }))
    .filter((entry) => entry.index >= 0);
  if (targetIndexes.length === 0) {
    return;
  }

  const rows = Array.from(table.querySelectorAll("tbody tr"));
  targetIndexes.forEach(({ index: colIndex, config }) => {
    const values = rows
      .map((row) => {
        const cell = row.children[colIndex];
        return cell ? parseFloat(cell.textContent.replace(",", ".")) : NaN;
      })
      .filter((value) => Number.isFinite(value));
    if (values.length === 0) {
      return;
    }
    const min = Math.min(...values);
    const max = Math.max(...values);

    rows.forEach((row) => {
      const cell = row.children[colIndex];
      if (!cell) {
        return;
      }
      const raw = parseFloat(cell.textContent.replace(",", "."));
      if (!Number.isFinite(raw)) {
        return;
      }
      let percent = max === min ? 1 : (raw - min) / (max - min);
      if (config.invert) {
        percent = 1 - percent;
      }
      const color = getHeatmapColor(percent);
      cell.style.color = color;
      cell.classList.add("metric-cell");
    });
  });
}

function getHeatmapColor(percent) {
  if (percent <= 0.25) {
    return "#ff4d4d";
  }
  if (percent <= 0.5) {
    return "#ffd21f";
  }
  if (percent <= 0.75) {
    return "#7dffb5";
  }
  return "#16d65a";
}

function renderEmptyTable() {
  summaryTable.innerHTML = "";
}

function buildCsvUrl(gid) {
  const url = new URL(SHEET_CSV_BASE_URL);
  if (gid) {
    url.searchParams.set("gid", gid);
  }
  return url.toString();
}

function filterByTorneo(rows, torneoIndex, torneoValue) {
  if (torneoIndex === -1 || torneoValue === TORNEO_ALL_VALUE) {
    return rows;
  }
  return rows.filter(
    (row) => (row[torneoIndex] || "").trim() === torneoValue
  );
}

function getStoredTorneo() {
  return localStorage.getItem(TORNEO_STORAGE_KEY) || TORNEO_ALL_VALUE;
}

function setStoredTorneo(value) {
  localStorage.setItem(TORNEO_STORAGE_KEY, value);
}

async function initTorneoSelector() {
  if (!torneoSelect) {
    return;
  }
  try {
    const response = await fetch(buildCsvUrl(RESULTADOS_GID), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    const csvText = await response.text();
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      return;
    }
    const headers = rows[0].map((header) => header.toLowerCase().trim());
    const torneoIndex = headers.indexOf("torneo");
    const fechaIndex = headers.indexOf("fecha");
    const torneos = new Set();
    if (torneoIndex !== -1) {
      rows.slice(1).forEach((row) => {
        const torneo = (row[torneoIndex] || "").trim();
        if (torneo) {
          torneos.add(torneo);
        }
      });
    }

    torneoSelect.innerHTML = "";
    const historicoOption = document.createElement("option");
    historicoOption.value = TORNEO_ALL_VALUE;
    historicoOption.textContent = "Histórico";
    torneoSelect.appendChild(historicoOption);

    Array.from(torneos)
      .sort((a, b) => a.localeCompare(b, "es"))
      .forEach((torneo) => {
        const option = document.createElement("option");
        option.value = torneo;
        option.textContent = torneo;
        torneoSelect.appendChild(option);
      });

    const latestTorneo = getLatestTorneo(rows.slice(1), torneoIndex, fechaIndex);
    const storedTorneo = getStoredTorneo();
    activeTorneo = latestTorneo || storedTorneo;
    torneoSelect.value = activeTorneo;
    if (activeTorneo !== storedTorneo) {
      setStoredTorneo(activeTorneo);
    }
    torneoSelect.addEventListener("change", () => {
      activeTorneo = torneoSelect.value;
      setStoredTorneo(activeTorneo);
      loadData(DEFAULT_GID);
      loadPartidosResumen();
    });
  } catch (error) {
    console.error(error);
  }
}

function getLatestTorneo(rows, torneoIndex, fechaIndex) {
  if (!rows || rows.length === 0 || torneoIndex === -1) {
    return "";
  }
  if (fechaIndex === -1) {
    const lastWithTorneo = [...rows]
      .reverse()
      .find((row) => (row[torneoIndex] || "").trim());
    return lastWithTorneo ? (lastWithTorneo[torneoIndex] || "").trim() : "";
  }
  let latest = "";
  let latestTime = 0;
  rows.forEach((row) => {
    const torneo = (row[torneoIndex] || "").trim();
    const fechaRaw = (row[fechaIndex] || "").trim();
    if (!torneo || !fechaRaw) {
      return;
    }
    const time = parseDateValue(fechaRaw);
    if (time >= latestTime) {
      latestTime = time;
      latest = torneo;
    }
  });
  return latest;
}

function parseDateValue(value) {
  if (!value) {
    return 0;
  }
  const parts = value.includes("/") ? value.split("/") : value.split("-");
  if (parts.length !== 3) {
    return 0;
  }
  const [first, second, third] = parts.map((part) => Number(part));
  if (!first || !second || !third) {
    return 0;
  }
  if (value.includes("/")) {
    return new Date(third, second - 1, first).getTime();
  }
  return new Date(first, second - 1, third).getTime();
}

function buildMatchLabel(matchInfo) {
  const parts = [matchInfo.fecha, matchInfo.juego].filter(Boolean);
  const title = parts.join(" - ");
  return `${title} - #${matchInfo.order}`;
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

async function loadPartidosResumen() {
  if (!matchSelect || !matchTable) {
    return;
  }
  matchHint.textContent = "Cargando partidos...";
  try {
    const [partidosCsv, resultadosCsv] = await Promise.all([
      fetch(buildCsvUrl(PARTIDOS_GID), { cache: "no-store" }).then((r) => r.text()),
      fetch(buildCsvUrl(RESULTADOS_GID), { cache: "no-store" }).then((r) => r.text()),
    ]);

    const partidosRows = parseCsv(partidosCsv);
    const resultadosRows = parseCsv(resultadosCsv);
    if (partidosRows.length === 0 || resultadosRows.length === 0) {
      throw new Error("Sin datos de partidos o resultados");
    }

    const partidosHeaders = partidosRows[0].map((h) => h.toLowerCase().trim());
    const resultadosHeaders = resultadosRows[0].map((h) => h.toLowerCase().trim());

    const partidoIdIndex = partidosHeaders.indexOf("partido_id");
    const fechaIndex = partidosHeaders.indexOf("fecha");
    const juegoIndex = partidosHeaders.indexOf("juego");
    const sedeIndex = partidosHeaders.indexOf("sede");

    const resultadoPartidoIndex = resultadosHeaders.indexOf("partido_id");
    const equipoIndex = resultadosHeaders.indexOf("equipo");
    const puntosIndex = resultadosHeaders.indexOf("puntos");
    const jugadorIndex = resultadosHeaders.indexOf("jugador");
    const torneoIndex = resultadosHeaders.indexOf("torneo");

    if (
      partidoIdIndex === -1 ||
      fechaIndex === -1 ||
      juegoIndex === -1 ||
      resultadoPartidoIndex === -1 ||
      equipoIndex === -1 ||
      puntosIndex === -1
    ) {
      throw new Error("Faltan columnas requeridas para partidos");
    }

    const partidosInfo = new Map();
    partidosRows.slice(1).forEach((row) => {
      const partidoId = row[partidoIdIndex]?.trim();
      if (!partidoId) {
        return;
      }
      const fecha = row[fechaIndex]?.trim() || "";
      partidosInfo.set(partidoId, {
        partidoId,
        fecha,
        juego: row[juegoIndex]?.trim() || "",
      });
    });

    const summaryByMatch = new Map();
    resultadosRows.slice(1).forEach((row) => {
      const partidoId = row[resultadoPartidoIndex]?.trim();
      if (!partidoId) {
        return;
      }
      if (torneoIndex !== -1 && activeTorneo !== TORNEO_ALL_VALUE) {
        const torneo = (row[torneoIndex] || "").trim();
        if (torneo !== activeTorneo) {
          return;
        }
      }
      const jugador = jugadorIndex === -1 ? "" : row[jugadorIndex]?.trim() || "";
      const equipoRaw = row[equipoIndex]?.trim() || "";
      const equipo = equipoRaw || jugador || "Equipo";
      const puntos = parseNumber(row[puntosIndex] || "0");
      const current = summaryByMatch.get(partidoId) || {
        partidoId,
        equipos: new Map(),
        integrantes: new Map(),
        puntosJugador: new Map(),
      };
      current.equipos.set(equipo, (current.equipos.get(equipo) || 0) + puntos);
      if (jugador) {
        const miembros = current.integrantes.get(equipo) || new Set();
        miembros.add(jugador);
        current.integrantes.set(equipo, miembros);

        const puntosMap = current.puntosJugador.get(equipo) || new Map();
        puntosMap.set(jugador, (puntosMap.get(jugador) || 0) + puntos);
        current.puntosJugador.set(equipo, puntosMap);
      }
      summaryByMatch.set(partidoId, current);
    });

    const orderedMatches = Array.from(partidosInfo.values()).sort((a, b) => {
      const aId = Number.parseInt(a.partidoId, 10);
      const bId = Number.parseInt(b.partidoId, 10);
      if (!Number.isNaN(aId) && !Number.isNaN(bId)) {
        return bId - aId;
      }
      return b.partidoId.localeCompare(a.partidoId, "es");
    });

    const matchOptions = orderedMatches.map((info) => {
      const numericId = Number.parseInt(info.partidoId, 10);
      const order = Number.isNaN(numericId) ? info.partidoId : numericId;
      const enriched = { ...info, order };
      return { ...enriched, label: buildMatchLabel(enriched) };
    });

    matchSelect.innerHTML = "";
    matchOptions.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.partidoId;
      opt.textContent = option.label;
      matchSelect.appendChild(opt);
    });

    const renderMatch = (partidoId) => {
      const info = partidosInfo.get(partidoId);
      const summary = summaryByMatch.get(partidoId);
      if (!info || !summary) {
        matchHint.textContent = "No hay datos para este partido.";
        matchTable.innerHTML = "";
        matchMeta.textContent = "";
        return;
      }
      matchTable.classList.add("match-table");
      matchMeta.textContent = info.juego || "";
      matchHint.textContent = "";

      const rows = Array.from(summary.equipos.entries())
        .map(([equipo, puntos]) => ({
          equipo,
          puntos,
          integrantes: Array.from(summary.integrantes.get(equipo) || []),
          puntosJugador: summary.puntosJugador.get(equipo) || new Map(),
        }))
        .sort((a, b) => b.puntos - a.puntos);
      const ganador = rows[0]?.equipo || "";

      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      ["Equipo", "Integrantes", "Puntos", "Resultado"].forEach((label) => {
        const th = document.createElement("th");
        th.textContent = label;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);

      const tbody = document.createElement("tbody");
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.classList.add("match-row");
        const isWinner = row.equipo === ganador;
        if (isWinner) {
          tr.classList.add("winner-row");
        }
        const equipoCell = document.createElement("td");
        equipoCell.textContent = toTitleCase(row.equipo);
        equipoCell.dataset.label = "Equipo";
        const integrantesCell = document.createElement("td");
        integrantesCell.dataset.label = "Integrantes";
        const roster = document.createElement("div");
        roster.className = "roster";
        const rosterPlayers = row.integrantes
          .map((name) => ({
            name,
            puntos: row.puntosJugador.get(name) || 0,
          }))
          .sort((a, b) => {
            if (b.puntos !== a.puntos) {
              return b.puntos - a.puntos;
            }
            return a.name.localeCompare(b.name, "es");
          });
        rosterPlayers.forEach((player) => {
          const card = document.createElement("div");
          card.className = "player-card";
          const img = document.createElement("img");
          img.src = `${getPlayerImagePath(player.name)}.png`;
          img.alt = player.name;
          img.className = "player-image";
          img.loading = "lazy";
          img.decoding = "async";
          img.onerror = () => {
            if (img.dataset.fallback !== "jpg") {
              img.dataset.fallback = "jpg";
              img.src = `${getPlayerImagePath(player.name)}.jpg`;
              return;
            }
            img.remove();
          };
          const label = document.createElement("span");
          label.textContent = player.name;
          const points = document.createElement("span");
          points.className = "player-points";
          points.textContent = `${player.puntos} pts`;
          card.appendChild(img);
          card.appendChild(label);
          card.appendChild(points);
          roster.appendChild(card);
        });
        integrantesCell.appendChild(roster);
        const puntosCell = document.createElement("td");
        puntosCell.textContent = row.puntos.toString();
        puntosCell.dataset.label = "Puntos";
        const resultadoCell = document.createElement("td");
        resultadoCell.dataset.label = "Resultado";
        if (isWinner) {
          const badge = document.createElement("span");
          badge.className = "winner-badge";
          badge.textContent = "Ganador";
          resultadoCell.appendChild(badge);
        }
        tr.appendChild(equipoCell);
        tr.appendChild(integrantesCell);
        tr.appendChild(puntosCell);
        tr.appendChild(resultadoCell);
        tbody.appendChild(tr);
      });

      matchTable.innerHTML = "";
      matchTable.appendChild(thead);
      matchTable.appendChild(tbody);
    };

    if (matchOptions.length > 0) {
      renderMatch(matchOptions[0].partidoId);
    }

    matchSelect.addEventListener("change", () => {
      renderMatch(matchSelect.value);
    });
  } catch (error) {
    console.error(error);
    matchHint.textContent =
      "No se pudieron cargar los datos de partidos. Verifica la hoja publicada.";
  }
}

function findFaltasIndex(headers) {
  const normalized = headers.map((header) => header.toLowerCase().trim());
  return normalized.indexOf("falta");
}

const setActiveTab = (target) => {
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  tabPanels.forEach((panel) => panel.classList.remove("active"));
  const button = Array.from(tabButtons).find(
    (btn) => btn.dataset.tab === target
  );
  if (button) {
    button.classList.add("active");
  }
  const panel = document.getElementById(`tab-${target}`);
  if (panel) {
    panel.classList.add("active");
  }
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    setActiveTab(target);
    window.location.hash = target;
  });
});

const hashTarget = window.location.hash.replace("#", "");
if (hashTarget) {
  setActiveTab(hashTarget);
}

activeTorneo = getStoredTorneo();
initTorneoSelector().then(() => {
  loadData(DEFAULT_GID);
  loadPartidosResumen();
});
