(function () {
  const MAP_SELECTION_STORAGE_KEY = "athoria.selectedMapFile.v1";
  const fallbackFile = "js/mapBlueprint.js";
  const files = Array.isArray(window.ASO_MAP_FILES) ? window.ASO_MAP_FILES : [];

  let selectedFile = fallbackFile;

  const url = new URL(window.location.href);
  const mapFromQuery = url.searchParams.get("map");

  try {
    const saved = localStorage.getItem(MAP_SELECTION_STORAGE_KEY);
    if (saved) {
      selectedFile = String(saved);
    }
  } catch (_error) {
    selectedFile = fallbackFile;
  }

  const existsInRegistry = files.some((entry) => entry && entry.file === selectedFile);
  if (!existsInRegistry) {
    selectedFile = fallbackFile;
  }

  if (mapFromQuery) {
    const normalizedFromQuery = String(mapFromQuery);
    const inRegistryFromQuery = files.some((entry) => entry && entry.file === normalizedFromQuery);

    if (inRegistryFromQuery) {
      selectedFile = normalizedFromQuery;
      try {
        localStorage.setItem(MAP_SELECTION_STORAGE_KEY, selectedFile);
      } catch (_error) {
        // Ignore storage failures.
      }
    }
  }

  window.ASO_SELECTED_MAP_FILE = selectedFile;
  window.ASO_MAP_SELECTION_STORAGE_KEY = MAP_SELECTION_STORAGE_KEY;

  function appendScript(src, onLoad, onError, withCacheBust = false) {
    const script = document.createElement("script");
    const rawSrc = String(src || "");
    const srcWithBust = withCacheBust
      ? `${rawSrc}${rawSrc.includes("?") ? "&" : "?"}v=${Date.now()}`
      : rawSrc;
    script.src = encodeURI(srcWithBust);
    script.onload = () => {
      if (typeof onLoad === "function") {
        onLoad();
      }
    };
    script.onerror = () => {
      if (typeof onError === "function") {
        onError();
      }
    };
    document.body.appendChild(script);
  }

  function loadGameScriptOnce() {
    if (window.__ASO_GAME_SCRIPT_LOADED__) {
      return;
    }

    window.__ASO_GAME_SCRIPT_LOADED__ = true;
    appendScript("js/game.js");
  }

  appendScript(
    selectedFile,
    () => {
      loadGameScriptOnce();
    },
    () => {
      window.ASO_SELECTED_MAP_FILE = fallbackFile;
      try {
        localStorage.setItem(MAP_SELECTION_STORAGE_KEY, fallbackFile);
      } catch (_error) {
        // Ignore storage failures.
      }
      appendScript(fallbackFile, () => {
        loadGameScriptOnce();
      }, undefined, true);
    },
    true
  );
})();
