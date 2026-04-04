const state = {
  boardW: 30,
  boardH: 30,
  wallThickness: 0.25,
  snapStep: 0.5,
  gridStep: 1,
  pxPerIn: 24,
  tool: "wall",
  wallStart: null,
  walls: [],
  blockers: [],
  campfires: [],
  victory: [],
  deployP1: [],
  deployP2: [],
  history: [],
  mapsFolderHandle: null,
};

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const mapIdInput = document.getElementById("mapIdInput");
const boardWInput = document.getElementById("boardWInput");
const boardHInput = document.getElementById("boardHInput");
const toolSelect = document.getElementById("toolSelect");
const objWInput = document.getElementById("objWInput");
const objHInput = document.getElementById("objHInput");
const statusEl = document.getElementById("status");
const exportOutput = document.getElementById("exportOutput");
const loadFileInput = document.getElementById("loadFileInput");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function snapHalf(value) {
  return Math.round(value / state.snapStep) * state.snapStep;
}

function formatNum(n) {
  return Number(n.toFixed(3));
}

function snapshot() {
  return {
    boardW: state.boardW,
    boardH: state.boardH,
    wallStart: state.wallStart ? { ...state.wallStart } : null,
    walls: state.walls.map((entry) => ({ ...entry })),
    blockers: state.blockers.map((entry) => ({ ...entry })),
    campfires: state.campfires.map((entry) => ({ ...entry })),
    victory: state.victory.map((entry) => ({ ...entry })),
    deployP1: state.deployP1.map((entry) => ({ ...entry })),
    deployP2: state.deployP2.map((entry) => ({ ...entry })),
  };
}

function pushHistory() {
  state.history.push(snapshot());

  if (state.history.length > 120) {
    state.history.shift();
  }
}

function restoreFromSnapshot(entry) {
  state.boardW = entry.boardW;
  state.boardH = entry.boardH;
  state.wallStart = entry.wallStart ? { ...entry.wallStart } : null;
  state.walls = entry.walls.map((item) => ({ ...item }));
  state.blockers = entry.blockers.map((item) => ({ ...item }));
  state.campfires = entry.campfires.map((item) => ({ ...item }));
  state.victory = entry.victory.map((item) => ({ ...item }));
  state.deployP1 = entry.deployP1.map((item) => ({ ...item }));
  state.deployP2 = entry.deployP2.map((item) => ({ ...item }));

  boardWInput.value = String(state.boardW);
  boardHInput.value = String(state.boardH);
}

function updateCanvasSize() {
  const viewportW = window.innerWidth - 480;
  const viewportH = window.innerHeight - 80;
  const fitScale = Math.floor(Math.min(viewportW / state.boardW, viewportH / state.boardH));
  state.pxPerIn = clamp(fitScale, 12, 28);

  canvas.width = Math.round(state.boardW * state.pxPerIn);
  canvas.height = Math.round(state.boardH * state.pxPerIn);
}

function toPx(inches) {
  return inches * state.pxPerIn;
}

function toInches(px) {
  return px / state.pxPerIn;
}

function getMouseInches(event) {
  const rect = canvas.getBoundingClientRect();
  const x = clamp(toInches(event.clientX - rect.left), 0, state.boardW);
  const y = clamp(toInches(event.clientY - rect.top), 0, state.boardH);
  return { x: snapHalf(x), y: snapHalf(y) };
}

function toCellCenter(pos) {
  const cellX = clamp(Math.floor(pos.x), 0, Math.max(0, state.boardW - 1));
  const cellY = clamp(Math.floor(pos.y), 0, Math.max(0, state.boardH - 1));

  return {
    x: formatNum(cellX + 0.5),
    y: formatNum(cellY + 0.5),
  };
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#2f2f2f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x <= state.boardW; x += state.gridStep) {
    const px = Math.round(toPx(x)) + 0.5;
    ctx.strokeStyle = x % 5 === 0 ? "rgba(206,175,121,0.35)" : "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= state.boardH; y += state.gridStep) {
    const py = Math.round(toPx(y)) + 0.5;
    ctx.strokeStyle = y % 5 === 0 ? "rgba(206,175,121,0.35)" : "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }
}

function drawRectObject(entry, color) {
  const left = toPx(entry.xIn - entry.wIn * 0.5);
  const top = toPx(entry.yIn - entry.hIn * 0.5);
  const w = toPx(entry.wIn);
  const h = toPx(entry.hIn);

  ctx.fillStyle = color;
  ctx.fillRect(left, top, w, h);
}

function drawDeployCell(cell, fillColor, strokeColor) {
  const left = toPx(cell.xIn - 0.5);
  const top = toPx(cell.yIn - 0.5);
  const size = toPx(1);

  ctx.fillStyle = fillColor;
  ctx.fillRect(left, top, size, size);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(left + 0.5, top + 0.5, size - 1, size - 1);
}

function drawPoint(point, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(toPx(point.xIn), toPx(point.yIn), 7, 0, Math.PI * 2);
  ctx.fill();
}

function redraw() {
  drawGrid();

  state.deployP1.forEach((cell) => drawDeployCell(cell, "rgba(48, 180, 84, 0.28)", "rgba(80, 225, 116, 0.95)"));
  state.deployP2.forEach((cell) => drawDeployCell(cell, "rgba(196, 76, 61, 0.28)", "rgba(220, 96, 80, 0.95)"));

  state.walls.forEach((wall) => drawRectObject(wall, "#b6a27c"));
  state.blockers.forEach((blocker) => drawRectObject(blocker, "#8d826d"));
  state.campfires.forEach((p) => drawPoint(p, "#4baad8"));
  state.victory.forEach((p) => drawPoint(p, "#64d46f"));

  if (state.wallStart) {
    drawPoint({ xIn: state.wallStart.x, yIn: state.wallStart.y }, "#ffd96e");
  }
}

function addWallFromPoints(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
    return;
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    const xMin = Math.min(start.x, end.x);
    const xMax = Math.max(start.x, end.x);
    const len = Math.max(0.5, xMax - xMin);
    state.walls.push({
      xIn: formatNum((xMin + xMax) * 0.5),
      yIn: formatNum(start.y),
      wIn: formatNum(len),
      hIn: state.wallThickness,
      label: `W${state.walls.length + 1}`,
    });
  } else {
    const yMin = Math.min(start.y, end.y);
    const yMax = Math.max(start.y, end.y);
    const len = Math.max(0.5, yMax - yMin);
    state.walls.push({
      xIn: formatNum(start.x),
      yIn: formatNum((yMin + yMax) * 0.5),
      wIn: state.wallThickness,
      hIn: formatNum(len),
      label: `W${state.walls.length + 1}`,
    });
  }
}

function addBlockerAt(pos) {
  const wIn = clamp(Number(objWInput.value) || 1, 0.5, 20);
  const hIn = clamp(Number(objHInput.value) || 1, 0.5, 20);

  state.blockers.push({
    xIn: formatNum(pos.x),
    yIn: formatNum(pos.y),
    wIn: formatNum(wIn),
    hIn: formatNum(hIn),
    label: `B${state.blockers.length + 1}`,
  });
}

function addPointAt(collectionKey, pos) {
  const arr = state[collectionKey];
  const prefix = collectionKey === "campfires" ? "cf" : "vp";
  arr.push({ id: `${prefix}-${arr.length + 1}`, xIn: formatNum(pos.x), yIn: formatNum(pos.y) });
}

function toggleDeploymentCell(key, pos) {
  const cell = toCellCenter(pos);
  const list = state[key];
  const index = list.findIndex((entry) => entry.xIn === cell.x && entry.yIn === cell.y);

  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push({
      id: `${key === "deployP1" ? "dp-p1" : "dp-p2"}-${list.length + 1}`,
      xIn: cell.x,
      yIn: cell.y,
      wIn: 1,
      hIn: 1,
    });
  }
}

function distanceToRectCenter(pos, rect) {
  return Math.hypot(pos.x - rect.xIn, pos.y - rect.yIn);
}

function eraseAt(pos) {
  const combined = [
    ...state.walls.map((e) => ({ type: "walls", e })),
    ...state.blockers.map((e) => ({ type: "blockers", e })),
    ...state.campfires.map((e) => ({ type: "campfires", e })),
    ...state.victory.map((e) => ({ type: "victory", e })),
    ...state.deployP1.map((e) => ({ type: "deployP1", e })),
    ...state.deployP2.map((e) => ({ type: "deployP2", e })),
  ];

  if (!combined.length) {
    return;
  }

  let nearest = combined[0];
  let nearestDist = distanceToRectCenter(pos, nearest.e);

  combined.forEach((item) => {
    const dist = distanceToRectCenter(pos, item.e);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = item;
    }
  });

  state[nearest.type] = state[nearest.type].filter((entry) => entry !== nearest.e);
}

function onCanvasClick(event) {
  const pos = getMouseInches(event);

  if (state.tool === "wall") {
    if (!state.wallStart) {
      state.wallStart = pos;
      statusEl.textContent = `Sciana: start (${pos.x}\", ${pos.y}\"). Kliknij koniec.`;
      redraw();
      return;
    }

    pushHistory();
    addWallFromPoints(state.wallStart, pos);
    state.wallStart = null;
    statusEl.textContent = "Sciana dodana.";
  } else if (state.tool === "blocker") {
    pushHistory();
    addBlockerAt(pos);
    statusEl.textContent = "Bloker dodany.";
  } else if (state.tool === "campfire") {
    pushHistory();
    addPointAt("campfires", pos);
    statusEl.textContent = "Ognisko dodane.";
  } else if (state.tool === "victory") {
    pushHistory();
    addPointAt("victory", pos);
    statusEl.textContent = "Punkt zwyciestwa dodany.";
  } else if (state.tool === "deployP1") {
    pushHistory();
    toggleDeploymentCell("deployP1", pos);
    statusEl.textContent = "Zmieniono kratke startowa gracza 1.";
  } else if (state.tool === "deployP2") {
    pushHistory();
    toggleDeploymentCell("deployP2", pos);
    statusEl.textContent = "Zmieniono kratke startowa gracza 2.";
  } else if (state.tool === "erase") {
    pushHistory();
    eraseAt(pos);
    statusEl.textContent = "Usunieto najblizszy obiekt.";
  }

  redraw();
}

function buildMapFileText() {
  const mapId = (mapIdInput.value || "custom-map").trim() || "custom-map";

  const wallLines = state.walls.map((w) =>
    `      { xIn: ${w.xIn}, yIn: ${w.yIn}, wIn: ${w.wIn}, hIn: ${w.hIn}, label: "${w.label}" }`
  );

  const blockerLines = state.blockers.map((b) =>
    `      { xIn: ${b.xIn}, yIn: ${b.yIn}, wIn: ${b.wIn}, hIn: ${b.hIn}, label: "${b.label}" }`
  );

  const campfireLines = state.campfires.map((p) =>
    `        { id: "${p.id}", xIn: ${p.xIn}, yIn: ${p.yIn} }`
  );

  const victoryLines = state.victory.map((p) =>
    `        { id: "${p.id}", xIn: ${p.xIn}, yIn: ${p.yIn} }`
  );

  const deployP1Lines = state.deployP1.map((p, index) =>
    `          { id: "dp-p1-${index + 1}", xIn: ${p.xIn}, yIn: ${p.yIn}, wIn: 1, hIn: 1 }`
  );

  const deployP2Lines = state.deployP2.map((p, index) =>
    `          { id: "dp-p2-${index + 1}", xIn: ${p.xIn}, yIn: ${p.yIn}, wIn: 1, hIn: 1 }`
  );

  return `(function () {\n  window.ASO_MAP_BLUEPRINT = {\n    id: "${mapId}",\n    layout: "building",\n    board: { widthIn: ${state.boardW}, heightIn: ${state.boardH} },\n    wallThicknessIn: ${state.wallThickness},\n\n    walls: [\n${wallLines.join(",\n")}\n    ],\n\n    blockers: [\n${blockerLines.join(",\n")}\n    ],\n\n    points: {\n      campfires: [\n${campfireLines.join(",\n")}\n      ],\n      victory: [\n${victoryLines.join(",\n")}\n      ],\n      deployment: {\n        player: [\n${deployP1Lines.join(",\n")}\n        ],\n        enemy: [\n${deployP2Lines.join(",\n")}\n        ]\n      }\n    }\n  };\n})();\n`;
}

async function pickMapsFolder() {
  if (!("showDirectoryPicker" in window)) {
    statusEl.textContent = "Twoja przegladarka nie wspiera bezposredniego zapisu do folderu maps.";
    return;
  }

  try {
    const picked = await window.showDirectoryPicker({ mode: "readwrite" });

    if (!picked || String(picked.name || "").toLowerCase() !== "maps") {
      statusEl.textContent = "Wybierz dokladnie folder o nazwie maps.";
      return;
    }

    state.mapsFolderHandle = picked;
    statusEl.textContent = "Folder maps podlaczony.";
  } catch (_error) {
    statusEl.textContent = "Nie podlaczono folderu maps.";
  }
}

async function saveToMapsFolder() {
  if (!state.mapsFolderHandle) {
    await pickMapsFolder();
  }

  if (!state.mapsFolderHandle) {
    return;
  }

  const fileName = `${(mapIdInput.value || "custom-map").trim() || "custom-map"}.js`;
  const content = buildMapFileText();

  try {
    const fileHandle = await state.mapsFolderHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    exportOutput.value = content;
    statusEl.textContent = `Zapisano w maps: ${fileName}`;
  } catch (_error) {
    statusEl.textContent = "Nie udalo sie zapisac do folderu maps.";
  }
}

function normalizeRectEntry(entry, fallbackLabel) {
  return {
    xIn: formatNum(Number(entry?.xIn) || 0),
    yIn: formatNum(Number(entry?.yIn) || 0),
    wIn: formatNum(Math.max(0.25, Number(entry?.wIn) || 1)),
    hIn: formatNum(Math.max(0.25, Number(entry?.hIn) || 1)),
    label: String(entry?.label || fallbackLabel || "OBJ"),
  };
}

function normalizePointEntry(entry, idPrefix, index) {
  return {
    id: String(entry?.id || `${idPrefix}-${index + 1}`),
    xIn: formatNum(Number(entry?.xIn) || 0),
    yIn: formatNum(Number(entry?.yIn) || 0),
  };
}

function normalizeDeployEntry(entry, idPrefix, index) {
  const x = formatNum(Number(entry?.xIn) || 0);
  const y = formatNum(Number(entry?.yIn) || 0);
  const cell = toCellCenter({ x, y });

  return {
    id: String(entry?.id || `${idPrefix}-${index + 1}`),
    xIn: cell.x,
    yIn: cell.y,
    wIn: 1,
    hIn: 1,
  };
}

function applyLoadedBlueprint(blueprint) {
  pushHistory();

  state.boardW = clamp(Number(blueprint?.board?.widthIn) || 30, 10, 80);
  state.boardH = clamp(Number(blueprint?.board?.heightIn) || 30, 10, 80);
  state.wallThickness = Math.max(0.2, Number(blueprint?.wallThicknessIn) || 0.25);
  state.wallStart = null;
  state.walls = Array.isArray(blueprint?.walls)
    ? blueprint.walls.map((entry, index) => normalizeRectEntry(entry, `W${index + 1}`))
    : [];
  state.blockers = Array.isArray(blueprint?.blockers)
    ? blueprint.blockers.map((entry, index) => normalizeRectEntry(entry, `B${index + 1}`))
    : [];
  state.campfires = Array.isArray(blueprint?.points?.campfires)
    ? blueprint.points.campfires.map((entry, index) => normalizePointEntry(entry, "cf", index))
    : [];
  state.victory = Array.isArray(blueprint?.points?.victory)
    ? blueprint.points.victory.map((entry, index) => normalizePointEntry(entry, "vp", index))
    : [];
  state.deployP1 = Array.isArray(blueprint?.points?.deployment?.player)
    ? blueprint.points.deployment.player.map((entry, index) => normalizeDeployEntry(entry, "dp-p1", index))
    : [];
  state.deployP2 = Array.isArray(blueprint?.points?.deployment?.enemy)
    ? blueprint.points.deployment.enemy.map((entry, index) => normalizeDeployEntry(entry, "dp-p2", index))
    : [];

  mapIdInput.value = String(blueprint?.id || "custom-map");
  boardWInput.value = String(state.boardW);
  boardHInput.value = String(state.boardH);

  updateCanvasSize();
  redraw();
  statusEl.textContent = "Mapa wczytana do edytora.";
}

function parseBlueprintFromText(text) {
  const sandboxWindow = {};

  try {
    const parsed = new Function("window", `${text}; return window.ASO_MAP_BLUEPRINT;`)(sandboxWindow);
    return parsed || null;
  } catch (_error) {
    return null;
  }
}

async function loadMapFromFile() {
  const file = loadFileInput.files && loadFileInput.files[0];

  if (!file) {
    statusEl.textContent = "Wybierz plik .js z mapa.";
    return;
  }

  const text = await file.text();
  const blueprint = parseBlueprintFromText(text);

  if (!blueprint) {
    statusEl.textContent = "Nie udalo sie odczytac mapy z pliku.";
    return;
  }

  applyLoadedBlueprint(blueprint);
}

function applyBoardSize() {
  pushHistory();
  state.boardW = clamp(Number(boardWInput.value) || 30, 10, 80);
  state.boardH = clamp(Number(boardHInput.value) || 30, 10, 80);
  state.wallStart = null;
  updateCanvasSize();
  redraw();
  statusEl.textContent = `Plansza ustawiona na ${state.boardW}\" x ${state.boardH}\".`;
}

function setTool(value) {
  state.tool = value;
  state.wallStart = null;

  if (value === "wall") {
    statusEl.textContent = "Tryb: Sciana. Kliknij punkt startowy.";
  } else if (value === "blocker") {
    statusEl.textContent = "Tryb: Bloker. Kliknij, aby postawic obiekt.";
  } else if (value === "campfire") {
    statusEl.textContent = "Tryb: Ognisko. Kliknij, aby postawic punkt.";
  } else if (value === "victory") {
    statusEl.textContent = "Tryb: Punkt zwyciestwa. Kliknij, aby postawic punkt.";
  } else if (value === "deployP1") {
    statusEl.textContent = "Tryb: Start gracza 1. Klikaj kratki 1x1, aby wlaczyc/wylaczyc.";
  } else if (value === "deployP2") {
    statusEl.textContent = "Tryb: Start gracza 2. Klikaj kratki 1x1, aby wlaczyc/wylaczyc.";
  } else {
    statusEl.textContent = "Tryb: Usuwanie. Kliknij najblizszy obiekt.";
  }

  redraw();
}

function undoLast() {
  if (state.wallStart) {
    state.wallStart = null;
    redraw();
    return;
  }

  const previous = state.history.pop();

  if (!previous) {
    statusEl.textContent = "Brak historii do cofniecia.";
    return;
  }

  restoreFromSnapshot(previous);
  updateCanvasSize();
  redraw();
  statusEl.textContent = "Cofnieto ostatnia zmiane.";
}

function clearAll() {
  pushHistory();
  state.wallStart = null;
  state.walls = [];
  state.blockers = [];
  state.campfires = [];
  state.victory = [];
  state.deployP1 = [];
  state.deployP2 = [];
  redraw();
  statusEl.textContent = "Wyczyszczono mape.";
}

document.getElementById("applyBoardBtn").addEventListener("click", applyBoardSize);
document.getElementById("undoBtn").addEventListener("click", undoLast);
document.getElementById("clearBtn").addEventListener("click", clearAll);
document.getElementById("loadBtn").addEventListener("click", () => {
  void loadMapFromFile();
});
document.getElementById("saveToFolderBtn").addEventListener("click", () => {
  void saveToMapsFolder();
});

toolSelect.addEventListener("change", (event) => setTool(event.target.value));
canvas.addEventListener("click", onCanvasClick);
window.addEventListener("resize", () => {
  updateCanvasSize();
  redraw();
});

updateCanvasSize();
redraw();
