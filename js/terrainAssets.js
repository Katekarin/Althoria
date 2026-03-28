(function () {
  const DEFAULT_BASE_PATH = "graphic/ground";

  const ASSET_FILES = {
    groundBase: "Ground1.jpg",
    groundOverlay: "Grass1.jpg",
    splitSprites: [
      "house.png",
      "house01.png",
      "house02.png",
      "rock01.png",
      "tree01.png",
      "tree02.png",
    ],
    atlases: [],
  };

  const SPLIT_TYPE_OVERRIDES = {
    "house.png": "fortress",
    "house01.png": "fortress",
    "house02.png": "fortress",
    "rock01.png": "barricade",
    "tree01.png": "ruins",
    "tree02.png": "ruins",
  };

  // Manual size controls per sprite (easy tuning point).
  // 1.0 = base size. Increase/decrease as needed.
  const SPLIT_SIZE_OVERRIDES = {
    "house.png": { renderScaleMul: 1.0, hitScaleMul: 1.0 },
    "house01.png": { renderScaleMul: 1.75, hitScaleMul: 1.75 },
    "house02.png": { renderScaleMul: 1.75, hitScaleMul: 1.75 },
    "rock01.png": { renderScaleMul: 1.0, hitScaleMul: 1.0 },
    "tree01.png": { renderScaleMul: 1.0, hitScaleMul: 1.0 },
    "tree02.png": { renderScaleMul: 1.0, hitScaleMul: 1.0 },
  };

  // Normalized atlas cuts (0..1) so they adapt to source texture resolution.
  const ATLAS_CUTS = {
    Forest1: [
      { id: "f1_tree_cluster_a", x: 0.02, y: 0.05, w: 0.3, h: 0.36, type: "ruins", value: 3, passability: 0, usage: "Zageszczony teren drzew i rumowisk." },
      { id: "f1_tree_cluster_b", x: 0.35, y: 0.08, w: 0.28, h: 0.33, type: "ruins", value: 3, passability: 0, usage: "Punkt blokujacy LOS i podejscie." },
      { id: "f1_log_barrier", x: 0.66, y: 0.17, w: 0.3, h: 0.2, type: "barricade", value: 2, passability: 0, usage: "Niska barykada do oslaniania natarcia." },
      { id: "f1_open_ruins", x: 0.12, y: 0.49, w: 0.42, h: 0.45, type: "fortress", value: 7, passability: 1, usage: "Otwarta struktura ze sciankami i wnętrzem." },
      { id: "f1_stump_set", x: 0.58, y: 0.5, w: 0.36, h: 0.33, type: "ruins", value: 2, passability: 0, usage: "Mniejszy teren trudny." },
    ],
    Forest2: [
      { id: "f2_fallen_tree", x: 0.06, y: 0.11, w: 0.38, h: 0.22, type: "barricade", value: 2, passability: 0, usage: "Wysoki pień jako oslona liniowa." },
      { id: "f2_rock_group", x: 0.48, y: 0.08, w: 0.28, h: 0.28, type: "ruins", value: 3, passability: 0, usage: "Grupa glazow, silna blokada toru." },
      { id: "f2_walls_open", x: 0.05, y: 0.42, w: 0.42, h: 0.48, type: "fortress", value: 7, passability: 1, usage: "Otwarta forteca z przechodnim srodkiem." },
      { id: "f2_low_brush", x: 0.52, y: 0.42, w: 0.2, h: 0.22, type: "ruins", value: 2, passability: 0, usage: "Niski teren utrudniajacy ruch." },
      { id: "f2_wood_wall", x: 0.74, y: 0.39, w: 0.22, h: 0.34, type: "barricade", value: 2, passability: 0, usage: "Sciana drewniana do oslon." },
    ],
    Forest3: [
      { id: "f3_stones_long", x: 0.03, y: 0.12, w: 0.4, h: 0.23, type: "barricade", value: 2, passability: 0, usage: "Dlugie kamienne zasieki." },
      { id: "f3_dense_ruins", x: 0.46, y: 0.06, w: 0.32, h: 0.34, type: "ruins", value: 3, passability: 0, usage: "Gesty teren trudny." },
      { id: "f3_fort_open", x: 0.08, y: 0.42, w: 0.45, h: 0.48, type: "fortress", value: 7, passability: 1, usage: "Duza otwarta struktura obronna." },
      { id: "f3_rock_spires", x: 0.58, y: 0.46, w: 0.18, h: 0.32, type: "ruins", value: 2, passability: 0, usage: "Skalne iglice blokujace przejscie." },
      { id: "f3_rubble_line", x: 0.77, y: 0.5, w: 0.2, h: 0.2, type: "barricade", value: 2, passability: 0, usage: "Niska rubiez z gruzu." },
    ],
  };

  const state = {
    initialized: false,
    basePath: DEFAULT_BASE_PATH,
    groundBaseUrl: "",
    groundOverlayUrl: "",
    groundOverlayOpacity: 0.82,
    visuals: {
      barricade: [],
      ruins: [],
      fortress: [],
    },
    objectDb: [],
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Nie mozna zaladowac grafiki: ${src}`));
      img.src = src;
    });
  }

  function atlasNameFromFile(file) {
    const dot = file.lastIndexOf(".");
    return dot >= 0 ? file.slice(0, dot) : file;
  }

  function hashString(seed) {
    let hash = 0;

    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }

    return hash;
  }

  function hasKeyword(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  function getVisualWeight(entry) {
    const text = `${entry.id || ""} ${entry.usage || ""}`.toLowerCase();
    const treeKeywords = ["tree", "forest", "wood", "log", "stump", "brush"];
    const rockKeywords = ["rock", "stone", "rubble", "spires", "glaz"];

    let weight = 1;

    if (hasKeyword(text, treeKeywords)) {
      weight *= 1.9;
    }

    if (hasKeyword(text, rockKeywords)) {
      weight *= 0.5;
    }

    if (entry.sourceAtlas && entry.sourceAtlas !== "split") {
      weight *= 1.15;
    }

    return Math.max(0.15, weight);
  }

  function classifySprite(width, height) {
    const area = width * height;
    const ratio = width / Math.max(1, height);

    if (area >= 42000 || (width >= 260 && height >= 170)) {
      return "fortress";
    }

    if (ratio >= 1.45 || width >= 230 || (area >= 18000 && ratio >= 1.1)) {
      return "barricade";
    }

    return "ruins";
  }

  function getOpaqueBounds(image, alphaThreshold = 16) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    if (width <= 0 || height <= 0) {
      return { x: 0, y: 0, w: 1, h: 1 };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      return { x: 0, y: 0, w: width, h: height };
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0);

    let rgba;

    try {
      rgba = ctx.getImageData(0, 0, width, height).data;
    } catch (_error) {
      // Some runtimes taint canvas for local/file assets; fallback keeps game running.
      return { x: 0, y: 0, w: width, h: height };
    }

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width * 4;

      for (let x = 0; x < width; x++) {
        const alpha = rgba[rowOffset + x * 4 + 3];

        if (alpha < alphaThreshold) {
          continue;
        }

        if (x < minX) {
          minX = x;
        }

        if (y < minY) {
          minY = y;
        }

        if (x > maxX) {
          maxX = x;
        }

        if (y > maxY) {
          maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return { x: 0, y: 0, w: width, h: height };
    }

    return {
      x: minX,
      y: minY,
      w: Math.max(1, maxX - minX + 1),
      h: Math.max(1, maxY - minY + 1),
    };
  }

  async function initialize(options = {}) {
    if (state.initialized) {
      return state;
    }

    state.basePath = options.basePath || DEFAULT_BASE_PATH;
    state.groundBaseUrl = `${state.basePath}/${ASSET_FILES.groundBase}`;
    state.groundOverlayUrl = `${state.basePath}/${ASSET_FILES.groundOverlay}`;
    state.groundOverlayOpacity = 0.5 + Math.random() * 0.25;

    // Validate base textures once so we fail fast if assets are missing.
    await loadImage(state.groundBaseUrl);
    await loadImage(state.groundOverlayUrl);

    const spriteCandidates = ASSET_FILES.splitSprites;

    for (const spriteFile of spriteCandidates) {
      const spriteUrl = `${state.basePath}/${spriteFile}`;
      let image;

      try {
        image = await loadImage(spriteUrl);
      } catch (_error) {
        continue;
      }

      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const type = SPLIT_TYPE_OVERRIDES[spriteFile] || classifySprite(width, height);
      const sizeOverride = SPLIT_SIZE_OVERRIDES[spriteFile] || { renderScaleMul: 1, hitScaleMul: 1 };
      const solidBounds = getOpaqueBounds(image);
      const solidAreaRatio = (solidBounds.w * solidBounds.h) / Math.max(1, width * height);

      const objectRecord = {
        id: spriteFile.replace(".png", ""),
        sourceAtlas: "split",
        spriteUrl,
        atlasUrl: spriteUrl,
        atlasWidth: width,
        atlasHeight: height,
        cutX: 0,
        cutY: 0,
        cutW: width,
        cutH: height,
        cutXNorm: 0,
        cutYNorm: 0,
        cutWNorm: 1,
        cutHNorm: 1,
        solidXNorm: solidBounds.x / Math.max(1, width),
        solidYNorm: solidBounds.y / Math.max(1, height),
        solidWNorm: solidBounds.w / Math.max(1, width),
        solidHNorm: solidBounds.h / Math.max(1, height),
        solidAreaRatio,
        type,
        value: type === "fortress" ? 7 : type === "barricade" ? 2 : 3,
        passability: type === "fortress" ? 1 : 0,
        usage: "Auto-wczytany pojedynczy obiekt PNG.",
        widthRatio: solidBounds.w / Math.max(1, solidBounds.h),
        heightRatio: solidBounds.h / Math.max(1, solidBounds.w),
        renderScaleMul: Number(sizeOverride.renderScaleMul) || 1,
        hitScaleMul: Number(sizeOverride.hitScaleMul) || 1,
      };

      state.objectDb.push(objectRecord);

      if (state.visuals[type]) {
        state.visuals[type].push(objectRecord);
      }
    }

    for (const atlasFile of ASSET_FILES.atlases) {
      const atlasName = atlasNameFromFile(atlasFile);
      const cuts = ATLAS_CUTS[atlasName] || [];

      if (!cuts.length) {
        continue;
      }

      const atlasUrl = `${state.basePath}/${atlasFile}`;
      let image;

      try {
        image = await loadImage(atlasUrl);
      } catch (_error) {
        continue;
      }
      const atlasWidth = image.naturalWidth;
      const atlasHeight = image.naturalHeight;

      for (const cut of cuts) {
        const cutX = Math.floor(cut.x * atlasWidth);
        const cutY = Math.floor(cut.y * atlasHeight);
        const cutW = Math.max(1, Math.floor(cut.w * atlasWidth));
        const cutH = Math.max(1, Math.floor(cut.h * atlasHeight));

        const objectRecord = {
          id: cut.id,
          sourceAtlas: atlasName,
          atlasUrl,
          atlasWidth,
          atlasHeight,
          cutX,
          cutY,
          cutW,
          cutH,
          cutXNorm: cut.x,
          cutYNorm: cut.y,
          cutWNorm: cut.w,
          cutHNorm: cut.h,
          solidXNorm: cut.x,
          solidYNorm: cut.y,
          solidWNorm: cut.w,
          solidHNorm: cut.h,
          solidAreaRatio: 1,
          type: cut.type,
          value: cut.value,
          passability: cut.passability,
          usage: cut.usage,
          widthRatio: cut.w,
          heightRatio: cut.h,
          renderScaleMul: 1,
          hitScaleMul: 1,
        };

        state.objectDb.push(objectRecord);

        if (state.visuals[cut.type]) {
          state.visuals[cut.type].push(objectRecord);
        }
      }
    }

    state.initialized = true;
    return state;
  }

  function isReady() {
    return state.initialized;
  }

  function getGroundCss() {
    if (!state.initialized) {
      return null;
    }

    return `url('${state.groundBaseUrl}') left top / cover no-repeat`;
  }

  function getGroundLayers() {
    if (!state.initialized) {
      return null;
    }

    return {
      baseCss: `url('${state.groundBaseUrl}') left top / cover no-repeat`,
      overlayCss: `url('${state.groundOverlayUrl}') left top / 10% auto repeat`,
      overlayOpacity: state.groundOverlayOpacity,
    };
  }

  function pickVisual(feature) {
    if (!state.initialized) {
      return null;
    }

    let list = state.visuals[feature.type] || [];

    if (!list.length) {
      list = [
        ...state.visuals.barricade,
        ...state.visuals.ruins,
        ...state.visuals.fortress,
      ];
    }

    if (!list.length) {
      return null;
    }

    if (feature.visualHint) {
      let hint = String(feature.visualHint).toLowerCase();

      if (hint === "house1") {
        hint = "house01";
      } else if (hint === "house2") {
        hint = "house02";
      }

      const hinted = list.filter((entry) => String(entry.id || "").toLowerCase().includes(hint));

      if (hinted.length) {
        list = hinted;
      }
    }

    const key = `${feature.id}:${feature.type}:${Math.round(feature.xIn * 10)}:${Math.round(feature.yIn * 10)}`;
    let random = hashString(key) / 0xffffffff;
    const weighted = list.map((entry) => ({ entry, weight: getVisualWeight(entry) }));
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);

    if (totalWeight <= 0) {
      const index = hashString(key) % list.length;
      return list[index];
    }

    for (const item of weighted) {
      random -= item.weight / totalWeight;

      if (random <= 0) {
        return item.entry;
      }
    }

    return weighted[weighted.length - 1].entry;
  }

  function getObjectDatabase() {
    return state.objectDb.map((entry) => ({ ...entry }));
  }

  window.TerrainAssets = {
    initialize,
    isReady,
    getGroundCss,
    getGroundLayers,
    pickVisual,
    getObjectDatabase,
  };
})();
