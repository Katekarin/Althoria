let faction = null;
let points = 0;
let team = [];
let hoverPreviewState = { timer: null, unitId: null };
let weaponLoadoutsNormalized = false;
let builderState = {
  templateId: "",
  armorId: "",
  weaponId: "",
  secondaryWeaponIds: [],
  squadSize: 1,
};

let rooms = [];
let activeRoomId = "";

let units = [];
let enemyTeam = [];
let enemyFaction = "";
let selected = null;
let actionMode = "move";
let selectedActionWeaponId = null;
let activeSide = "player";
let enemyTurnInProgress = false;
let currentActivationUnit = null;
let deploymentState = null;
let actionState = { apLeft: 3, moveUsed: false, bonusUsed: false, mainUsed: false, shootUsed: false, disengaged: false, charged: false };
let combatLogEntries = [];
let turn = 1;
let round = 1;

let objectives = [];
let terrainFeatures = [];
let terrainPathProfile = { matchup: "2-2", player: 2, enemy: 2 };
let terrainAssetDb = [];
let terrainAssetsReady = false;
let groundLayers = null;
let battlefieldAtmosphere = null;

let isAnimating = false;

const BOARD_WIDTH_IN = 40;
const BOARD_HEIGHT_IN = 29.5;
const PIXELS_PER_INCH = 24;
const UNIT_RADIUS_IN = 0.5;
const MIN_GAP_IN = 0.9;
const MELEE_RANGE_IN = 1;
const STANDARD_ATTACK_RANGE_IN = 3;
const OBJECTIVE_CAPTURE_RANGE_IN = 1.5;
const OBJECTIVE_DIAMETER_IN = 1.5;
const OBJECTIVE_RADIUS_IN = OBJECTIVE_DIAMETER_IN / 2;
const ENGAGEMENT_RANGE_IN = 1.5;
const OBJECTIVE_HEAL_RANGE_IN = 6;
const OBJECTIVE_HEAL_AMOUNT = 2;
const OBJECTIVE_SPRITE_URL = "graphic/ground/campfire.png";
const PREDEFINED_HOUSE_A = { xIn: 7.5, yIn: 6.8 };
const PREDEFINED_HOUSE_B = { xIn: 32.5, yIn: 22.7 };
const PREDEFINED_CENTER_OBJECTIVE = { xIn: BOARD_WIDTH_IN * 0.5, yIn: BOARD_HEIGHT_IN * 0.5 };
const CHARGE_BONUS_RANGE_IN = 3;
const DEBUG_COMBAT = true;
const SHOW_SECTOR_OVERLAY = false;
const SIDE_SECTOR_COLUMNS = 2;
const SIDE_SECTOR_ROWS = 5;
const SECTORS_PER_SIDE = SIDE_SECTOR_COLUMNS * SIDE_SECTOR_ROWS;
const HALF_BOARD_IN = BOARD_WIDTH_IN / 2;
const SECTOR_WIDTH_IN = HALF_BOARD_IN / SIDE_SECTOR_COLUMNS;
const SECTOR_HEIGHT_IN = BOARD_HEIGHT_IN / SIDE_SECTOR_ROWS;
const TERRAIN_EDGE_PADDING_IN = 0.9;
const LARGE_STRUCTURES_PER_SIDE_DEFAULT = 2;
const SMALL_STRUCTURES_PER_SIDE_DEFAULT = 6;
const DECOR_STRUCTURES_PER_SIDE_MIN_DEFAULT = 14;
const DECOR_STRUCTURES_PER_SIDE_MAX_DEFAULT = 24;
const PATH_VARIANT_MATCHUPS = ["1-3", "2-2", "3-1"];
const DEPLOY_RADIUS_IN = 6;
const DEPLOY_BATCH_SIZE = 2;
const PATH_SAMPLE_STEP_IN = 0.18;
const MOVE_ANIMATION_MS_PER_IN = 85;
const ROOMS_STORAGE_KEY = "wh40.rooms.v1";

const TERRAIN_DENSITY_PRESETS = {
  light: { largePerSide: 1, smallPerSide: 4, decorMin: 8, decorMax: 14 },
  normal: {
    largePerSide: LARGE_STRUCTURES_PER_SIDE_DEFAULT,
    smallPerSide: SMALL_STRUCTURES_PER_SIDE_DEFAULT,
    decorMin: DECOR_STRUCTURES_PER_SIDE_MIN_DEFAULT,
    decorMax: DECOR_STRUCTURES_PER_SIDE_MAX_DEFAULT,
  },
  dense: { largePerSide: 3, smallPerSide: 8, decorMin: 20, decorMax: 32 },
};

let terrainGenerationConfig = { ...TERRAIN_DENSITY_PRESETS.normal };

const TERRAIN_CATALOG = {
  large: [
    { id: "fortress-yard", name: "Twierdza Otwarta", type: "fortress", sizeClass: "large", wIn: 5.0, hIn: 3.8, passability: 1, value: 7, usage: "Kontrola strefy i oslonieta walka przy scianach." },
    { id: "grand-ruins", name: "Wielkie Ruiny", type: "ruins", sizeClass: "large", wIn: 4.6, hIn: 3.2, passability: 0, value: 6, usage: "Mocny punkt oporu i blokowanie ruchu." },
    { id: "bastion-line", name: "Bastion z barykad", type: "barricade", sizeClass: "large", wIn: 5.8, hIn: 1.2, passability: 0, value: 6, usage: "Dluga oslona liniowa przez srodek sektora." }
  ],
  small: [
    { id: "low-wall", name: "Niska Barykada", type: "barricade", sizeClass: "small", wIn: 2.8, hIn: 0.8, passability: 0, value: 2, usage: "Szybka oslona i punkt zatrzymania szarzy." },
    { id: "angled-wall", name: "Barykada Lamana", type: "barricade", sizeClass: "small", wIn: 2.4, hIn: 0.9, passability: 0, value: 2, usage: "Osie ruchu pod katem i krotka oslona." },
    { id: "small-ruins", name: "Male Ruiny", type: "ruins", sizeClass: "small", wIn: 2.2, hIn: 1.8, passability: 0, value: 3, usage: "Punkt blokujacy i waski przesmyk." },
    { id: "courtyard-fence", name: "Ogrodzenie Dziedzinca", type: "barricade", sizeClass: "small", wIn: 2.6, hIn: 0.8, passability: 0, value: 2, usage: "Lekka oslona przy podejsciu." },
    { id: "broken-pillars", name: "Zlamane Filary", type: "ruins", sizeClass: "small", wIn: 1.9, hIn: 1.9, passability: 0, value: 3, usage: "Mikro-przeszkoda do walki na 1 cal." }
  ]
};

const FACTION_UNIT_LIBRARY = window.FACTION_UNIT_LIBRARY || {};
const FACTION_LORE = window.FACTION_LORE_DATA || {
  kingdoms: {
    title: "Lore: Wolne Krolestwa",
    body: "Brak zaladowanego pliku loreData.js.",
  },
};
const GAME_RULES_GUIDE = window.GAME_RULES_GUIDE || {
  title: "Instrukcja Gry",
  body: "Brak zaladowanego pliku gameGuideData.js.",
};

function getFactionUnitLibrary() {
  normalizeWeaponLoadoutsOnce();

  if (!FACTION_UNIT_LIBRARY || typeof FACTION_UNIT_LIBRARY !== "object") {
    return [];
  }

  return FACTION_UNIT_LIBRARY[faction] || FACTION_UNIT_LIBRARY.kingdoms || [];
}

function getFactionLibraryById(factionId) {
  normalizeWeaponLoadoutsOnce();

  if (!FACTION_UNIT_LIBRARY || typeof FACTION_UNIT_LIBRARY !== "object") {
    return [];
  }

  return FACTION_UNIT_LIBRARY[factionId] || [];
}

function openLorePanel(factionId = "kingdoms") {
  const modal = document.getElementById("loreModal");
  const titleEl = document.getElementById("loreModalTitle");
  const bodyEl = document.getElementById("loreModalBody");
  const loreEntry = FACTION_LORE[factionId] || FACTION_LORE.kingdoms;

  if (!modal || !titleEl || !bodyEl || !loreEntry) {
    return;
  }

  titleEl.innerText = loreEntry.title;
  bodyEl.innerText = loreEntry.body;
  modal.classList.add("lore-modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function openGuidePanel() {
  const modal = document.getElementById("loreModal");
  const titleEl = document.getElementById("loreModalTitle");
  const bodyEl = document.getElementById("loreModalBody");

  if (!modal || !titleEl || !bodyEl) {
    return;
  }

  titleEl.innerText = GAME_RULES_GUIDE.title;
  bodyEl.innerText = GAME_RULES_GUIDE.body;
  modal.classList.add("lore-modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function closeLorePanel() {
  const modal = document.getElementById("loreModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("lore-modal--open");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLorePanel();
  }
});

function getTemplateById(templateId) {
  return getFactionUnitLibrary().find((entry) => entry.id === templateId) || null;
}

function getSquadCapForClassType(classType) {
  const normalized = String(classType || "").toLowerCase();

  if (normalized === "common") {
    return 6;
  }

  if (normalized === "rare") {
    return 5;
  }

  if (normalized === "elite") {
    return 3;
  }

  return 1;
}

function normalizeSquadSize(value, classType) {
  const cap = getSquadCapForClassType(classType);
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return clamp(Math.round(parsed), 1, cap);
}

function getUnitCurrentModels(unit) {
  const maxModels = Math.max(1, Number(unit?.squadSize) || 1);
  const modelHp = Math.max(1, Number(unit?.modelHp) || Math.ceil((Number(unit?.maxHp) || maxModels) / maxModels));
  const hp = Math.max(0, Number(unit?.hp) || 0);

  if (hp <= 0) {
    return 0;
  }

  return clamp(Math.ceil(hp / modelHp), 1, maxModels);
}

function getSquadAttackDice(baseAttacks, modelCount) {
  const base = Math.max(1, Number(baseAttacks) || 1);
  const models = Math.max(1, Number(modelCount) || 1);

  if (models <= 1) {
    return base;
  }

  return Math.max(1, Math.ceil(base / 2)) * models;
}

function normalizeOptionAbilities(option) {
  if (!option || !Array.isArray(option.abilities)) {
    return [];
  }

  return option.abilities
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
}

function getAbilityValueFromList(abilities, key) {
  if (!Array.isArray(abilities)) {
    return 0;
  }

  const pattern = new RegExp(`^${key}\\s+(\\d+)\\+?$`, "i");

  for (const ability of abilities) {
    const match = String(ability || "").trim().match(pattern);

    if (match) {
      return Number(match[1]) || 0;
    }
  }

  return 0;
}

function hasAbilityInList(abilities, key) {
  if (!Array.isArray(abilities)) {
    return false;
  }

  return abilities.some((entry) => String(entry || "").trim().toLowerCase() === key.toLowerCase());
}

function buildWeaponAbilities(option) {
  const explicit = normalizeOptionAbilities(option);
  const derived = [];
  const attacks = Number(option?.attacks) || 0;
  const range = Number(option?.range) || 1;
  const damage = Number(option?.damage) || 0;
  const hitTarget = Number(String(option?.hit || "6+").replace("+", "")) || 6;

  if (range > 1) {
    derived.push("Volley 1");
    derived.push("Heavy");

    if (damage >= 3) {
      derived.push("Precise 1");
    }

    if (damage >= 4) {
      derived.push("Armour Piercing 1");
    }
  } else {
    if (damage >= 4) {
      derived.push("Brutal 1");
      derived.push("Strength 1");
    }

    if (attacks >= 6) {
      derived.push("Ferocious 1");
      derived.push("Rending");
    }

    if (hitTarget >= 5) {
      derived.push("Riposte 1");
    }

    if (attacks >= 5) {
      derived.push("Ceaseless");
    }
  }

  if (attacks <= 3) {
    derived.push("Accurate 1");
  }

  if (damage >= 5) {
    derived.push("Lethal 5+");
  }

  if (range > 1 && damage >= 4) {
    derived.push("Blast 1");
  }

  if (damage >= 6 || hitTarget <= 2) {
    derived.push("Limited");
  }

  if (!explicit.length && !derived.length) {
    derived.push("Ceaseless");
  }

  return Array.from(new Set([...explicit, ...derived]));
}

function buildArmorAbilities(option) {
  const explicit = normalizeOptionAbilities(option);
  const derived = [];
  const save = Number(String(option?.save || "6+").replace("+", "")) || 6;
  const hpBonus = Number(option?.hpBonus) || 0;

  if (save <= 4) {
    derived.push("Block 1");
  }

  if (save <= 3 || hpBonus >= 6) {
    derived.push("Endurance 1");
  }

  if (save <= 2 || hpBonus >= 8) {
    derived.push("Dodge 1");
  }

  if (save <= 3 || hpBonus >= 4) {
    derived.push("Ceaseless 1");
  }

  if (save <= 2 && hpBonus >= 8) {
    derived.push("Heavy 1");
  }

  if (!explicit.length && !derived.length) {
    derived.push("Block 1");
  }

  return Array.from(new Set([...explicit, ...derived]));
}

function parseSaveTarget(saveText) {
  const parsed = Number(String(saveText || "6+").replace("+", ""));
  return Number.isFinite(parsed) ? parsed : 6;
}

function formatSaveTarget(saveTarget) {
  return `${Math.max(2, Math.min(6, Number(saveTarget) || 6))}+`;
}

function getAllowedSaveTargetsByClass(classType) {
  const normalized = String(classType || "").toLowerCase();

  if (normalized === "common") {
    return [5, 6];
  }

  if (normalized === "rare") {
    return [4, 5];
  }

  if (normalized === "elite") {
    return [3, 4];
  }

  if (normalized === "heroic") {
    return [2];
  }

  return [2, 3, 4, 5, 6];
}

function normalizeArmorSaveForClass(saveText, classType, armorOption = null) {
  if (armorOption && armorOption.allowSaveException) {
    return formatSaveTarget(parseSaveTarget(saveText));
  }

  const value = parseSaveTarget(saveText);
  const allowed = getAllowedSaveTargetsByClass(classType);

  if (!allowed.length) {
    return formatSaveTarget(value);
  }

  let best = allowed[0];
  let bestDistance = Math.abs(value - best);

  for (let i = 1; i < allowed.length; i++) {
    const current = allowed[i];
    const distance = Math.abs(value - current);

    if (distance < bestDistance) {
      best = current;
      bestDistance = distance;
    }
  }

  return formatSaveTarget(best);
}

function parseHitTarget(hitText) {
  const parsed = Number(String(hitText || "6+").replace("+", ""));
  return Number.isFinite(parsed) ? parsed : 6;
}

function formatHitTarget(hitTarget) {
  return `${Math.max(2, Math.min(6, Number(hitTarget) || 6))}+`;
}

function uniqueAbilityList(...lists) {
  const merged = [];

  lists.forEach((list) => {
    if (!Array.isArray(list)) {
      return;
    }

    list.forEach((entry) => {
      const text = String(entry || "").trim();

      if (text) {
        merged.push(text);
      }
    });
  });

  return Array.from(new Set(merged));
}

function getWeaponBaseProfile(option, template) {
  if (option?.baseProfile && typeof option.baseProfile === "object") {
    return option.baseProfile;
  }

  if (option?.baseArchetype && typeof window.getWeaponArchetypeBaseline === "function") {
    const tier = option.baseTier || template?.classType || "common";
    const baseline = window.getWeaponArchetypeBaseline(option.baseArchetype, tier);

    if (baseline) {
      return baseline;
    }
  }

  return option;
}

function inferWeaponCategory(option) {
  const source = `${String(option?.id || "").toLowerCase()} ${String(option?.name || "").toLowerCase()}`;

  if (/crossbow|kusza/.test(source)) {
    return "kusze";
  }

  if (/bow|luk/.test(source)) {
    return "luki";
  }

  if (/shield|tarcz/.test(source)) {
    return "tarcze";
  }

  if (/halberd|pole|spear|pike|wloczn|drzew/.test(source)) {
    return "drzewcowe";
  }

  if (/hammer|mace|maul|flail|morgen|obuch|mlot|buzdygan|cep/.test(source)) {
    return "obuchowe";
  }

  if (/axe|topor|hatchet/.test(source)) {
    return "toporowate";
  }

  if (/sword|blade|miecz|szabla|ostrz/.test(source)) {
    return "miecze";
  }

  return null;
}

function diffAbilities(baseAbilities, targetAbilities) {
  const baseLower = new Set((baseAbilities || []).map((entry) => String(entry || "").trim().toLowerCase()));

  return (targetAbilities || [])
    .map((entry) => String(entry || "").trim())
    .filter((entry) => entry && !baseLower.has(entry.toLowerCase()));
}

function buildAutoModifierFromLegacyOption(option, baseline) {
  if (!baseline) {
    return null;
  }

  return {
    attacks: (Number(option?.attacks) || 1) - (Number(baseline.attacks) || 1),
    damage: (Number(option?.damage) || 1) - (Number(baseline.damage) || 1),
    range: (Number(option?.range) || 1) - (Number(baseline.range) || 1),
    cost: 0,
    setHit: String(option?.hit || baseline.hit || "6+"),
    abilities: diffAbilities(baseline.abilities, normalizeOptionAbilities(option)),
  };
}

function normalizeTemplateWeaponLoadouts(template) {
  if (!template || !Array.isArray(template.weaponOptions)) {
    return;
  }

  const tier = String(template.classType || "common").toLowerCase();

  template.weaponOptions = template.weaponOptions.map((option) => {
    if (!option || typeof option !== "object") {
      return option;
    }

    if (option.baseProfile || option.baseArchetype) {
      return option;
    }

    const category = option.category || inferWeaponCategory(option);

    if (!category || typeof window.getWeaponArchetypeBaseline !== "function") {
      return option;
    }

    const baseline = window.getWeaponArchetypeBaseline(category, tier);

    if (!baseline) {
      return option;
    }

    const autoModifier = buildAutoModifierFromLegacyOption(option, baseline);

    return {
      ...option,
      category,
      baseArchetype: category,
      baseTier: tier,
      modifiers: autoModifier || option.modifiers || { abilities: uniqueAbilityList(option.abilities) },
    };
  });
}

function normalizeWeaponLoadoutsOnce() {
  if (weaponLoadoutsNormalized) {
    return;
  }

  if (!FACTION_UNIT_LIBRARY || typeof FACTION_UNIT_LIBRARY !== "object") {
    weaponLoadoutsNormalized = true;
    return;
  }

  Object.values(FACTION_UNIT_LIBRARY).forEach((templates) => {
    if (!Array.isArray(templates)) {
      return;
    }

    templates.forEach((template) => normalizeTemplateWeaponLoadouts(template));
  });

  weaponLoadoutsNormalized = true;
}

function applyWeaponModifier(profile, modifier = null) {
  if (!modifier || typeof modifier !== "object") {
    return profile;
  }

  const next = { ...profile };
  const attacksDelta = Number(modifier.attacks) || 0;
  const damageDelta = Number(modifier.damage) || 0;
  const rangeDelta = Number(modifier.range) || 0;
  const costDelta = Number(modifier.cost) || 0;

  next.attacks = Math.max(1, (Number(next.attacks) || 1) + attacksDelta);
  next.damage = Math.max(1, (Number(next.damage) || 1) + damageDelta);
  next.range = Math.max(1, (Number(next.range) || 1) + rangeDelta);
  next.cost = Math.max(0, (Number(next.cost) || 0) + costDelta);

  const hitBase = parseHitTarget(next.hit);
  const hitMod = Number(modifier.hitMod) || 0;
  const hitBonus = Number(modifier.hitBonus) || 0;

  if (typeof modifier.setHit === "string") {
    next.hit = modifier.setHit;
  } else {
    next.hit = formatHitTarget(hitBase + hitMod - hitBonus);
  }

  next.abilities = uniqueAbilityList(next.abilities, modifier.abilities);
  return next;
}

function getTemplateWeaponModifier(template, option) {
  if (!template || typeof template !== "object") {
    return null;
  }

  const globalMod = template.weaponPlatformBonus;
  const byCategory = option?.category && template.weaponPlatformBonusByCategory
    ? template.weaponPlatformBonusByCategory[option.category]
    : null;
  const byId = option?.id && template.weaponPlatformBonusById
    ? template.weaponPlatformBonusById[option.id]
    : null;

  return {
    attacks: (Number(globalMod?.attacks) || 0) + (Number(byCategory?.attacks) || 0) + (Number(byId?.attacks) || 0),
    damage: (Number(globalMod?.damage) || 0) + (Number(byCategory?.damage) || 0) + (Number(byId?.damage) || 0),
    range: (Number(globalMod?.range) || 0) + (Number(byCategory?.range) || 0) + (Number(byId?.range) || 0),
    cost: (Number(globalMod?.cost) || 0) + (Number(byCategory?.cost) || 0) + (Number(byId?.cost) || 0),
    hitMod: (Number(globalMod?.hitMod) || 0) + (Number(byCategory?.hitMod) || 0) + (Number(byId?.hitMod) || 0),
    hitBonus: (Number(globalMod?.hitBonus) || 0) + (Number(byCategory?.hitBonus) || 0) + (Number(byId?.hitBonus) || 0),
    abilities: uniqueAbilityList(globalMod?.abilities, byCategory?.abilities, byId?.abilities),
  };
}

function resolveWeaponOption(option, template) {
  const hasExplicitBase = Boolean(option?.baseProfile) || Boolean(option?.baseArchetype);
  const legacyCategory = option?.category || inferWeaponCategory(option);
  const legacyTier = option?.baseTier || template?.classType || "common";
  const legacyBaseline = !hasExplicitBase && typeof window.getWeaponArchetypeBaseline === "function"
    ? window.getWeaponArchetypeBaseline(legacyCategory, legacyTier)
    : null;
  const autoLegacyModifier = !hasExplicitBase && !option?.modifiers
    ? buildAutoModifierFromLegacyOption(option, legacyBaseline)
    : null;

  const base = getWeaponBaseProfile(option, template) || option;
  const profile = {
    attacks: Number(base?.attacks) || 1,
    hit: typeof base?.hit === "string" ? base.hit : "6+",
    damage: Number(base?.damage) || 1,
    range: Number(base?.range) || 1,
    cost: Number(option?.cost ?? base?.cost) || 0,
    abilities: uniqueAbilityList(base?.abilities),
  };

  const templateModifier = getTemplateWeaponModifier(template, option);
  const optionModifier = option?.modifiers && typeof option.modifiers === "object"
    ? {
      ...option.modifiers,
      abilities: uniqueAbilityList(option.modifiers.abilities, option.abilities),
    }
    : (autoLegacyModifier
      ? autoLegacyModifier
      : { abilities: uniqueAbilityList(option.abilities) });

  const withTemplateBonus = applyWeaponModifier(profile, templateModifier);
  const withOptionBonus = applyWeaponModifier(withTemplateBonus, optionModifier);

  return {
    id: option.id,
    name: option.name,
    attacks: withOptionBonus.attacks,
    hit: withOptionBonus.hit,
    damage: withOptionBonus.damage,
    range: withOptionBonus.range,
    cost: withOptionBonus.cost,
    abilities: uniqueAbilityList(withOptionBonus.abilities),
    category: option.category || legacyCategory || null,
  };
}

function toUnitWeapon(option, template = null) {
  const resolved = resolveWeaponOption(option, template);

  return {
    id: resolved.id,
    name: resolved.name,
    attacks: resolved.attacks,
    hit: resolved.hit,
    damage: resolved.damage,
    range: resolved.range,
    cost: resolved.cost,
    abilities: buildWeaponAbilities(resolved),
    category: resolved.category,
  };
}

function buildUnitFromSelection(template, armor, weapon, extraWeapons = [], requestedSquadSize = 1) {
  const normalizedSave = normalizeArmorSaveForClass(armor.save, template.classType, armor);
  const effectiveArmor = { ...armor, save: normalizedSave };
  const hpPerModel = template.base.hp + armor.hpBonus;
  const armorAbilities = buildArmorAbilities(effectiveArmor);
  const armorHeavy = getAbilityValueFromList(armorAbilities, "Heavy");
  const move = Math.max(3, template.base.move + armor.moveMod - armorHeavy);
  const unitAbilities = normalizeOptionAbilities(template);
  const squadSize = normalizeSquadSize(requestedSquadSize, template.classType);
  const primaryWeapon = toUnitWeapon(weapon, template);
  const secondaryWeapons = extraWeapons.map((entry) => toUnitWeapon(entry, template));
  const allWeapons = [primaryWeapon, ...secondaryWeapons];
  const hasMeleeWeapon = allWeapons.some((entry) => (Number(entry.range) || 1) <= 1);
  const modelCost = template.base.cost + armor.cost + primaryWeapon.cost + secondaryWeapons.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const totalHp = hpPerModel * squadSize;

  if (!hasMeleeWeapon) {
    secondaryWeapons.push({
      id: "hunting-knife",
      name: "Noz mysliwski",
      attacks: 4,
      hit: "4+",
      damage: 2,
      range: 1,
      abilities: [],
    });
  }

  return {
    id: crypto.randomUUID(),
    type: template.classType,
    classType: template.classType,
    templateId: template.id,
    templateName: template.name,
    hp: totalHp,
    maxHp: totalHp,
    maxRecoverableHp: totalHp,
    modelHp: hpPerModel,
    squadSize,
    currentModels: squadSize,
    move,
    cost: modelCost * squadSize,
    modelCost,
    apl: template.base.apl,
    ga: template.base.ga,
    df: template.base.df,
    sv: normalizedSave,
    abilities: unitAbilities,
    armor: {
      id: armor.id,
      name: armor.name,
      save: normalizedSave,
      passability: 0,
      value: armor.cost,
      usage: "Wybor pancerza z kreatora",
      abilities: armorAbilities,
    },
    weapon: primaryWeapon,
    secondaryWeapons,
    side: "player",
    xIn: 0,
    yIn: 0
  };
}

function refreshBuilderOptions() {
  const templates = getFactionUnitLibrary();
  const templateSelect = document.getElementById("unitTemplateSelect");
  const armorSelect = document.getElementById("armorSelect");
  const weaponSelect = document.getElementById("weaponSelect");
  const secondaryWeaponsSelect = document.getElementById("secondaryWeaponsSelect");
  const squadSizeInput = document.getElementById("squadSizeInput");
  const squadSizeHint = document.getElementById("squadSizeHint");

  if (!templates.length) {
    templateSelect.innerHTML = "";
    armorSelect.innerHTML = "";
    weaponSelect.innerHTML = "";
    if (secondaryWeaponsSelect) {
      secondaryWeaponsSelect.innerHTML = "";
    }
    if (squadSizeInput) {
      squadSizeInput.value = "1";
      squadSizeInput.max = "1";
    }
    if (squadSizeHint) {
      squadSizeHint.innerText = "Limit oddzialu: 1";
    }
    return;
  }

  if (!builderState.templateId || !templates.some((t) => t.id === builderState.templateId)) {
    builderState.templateId = templates[0].id;
  }

  const template = getTemplateById(builderState.templateId);

  templateSelect.innerHTML = templates
    .map((entry) => `<option value="${entry.id}" ${entry.id === builderState.templateId ? "selected" : ""}>${entry.name} (${entry.classType})</option>`)
    .join("");

  if (!builderState.armorId || !template.armorOptions.some((entry) => entry.id === builderState.armorId)) {
    builderState.armorId = template.armorOptions[0].id;
  }

  if (!builderState.weaponId || !template.weaponOptions.some((entry) => entry.id === builderState.weaponId)) {
    builderState.weaponId = template.weaponOptions[0].id;
  }

  armorSelect.innerHTML = template.armorOptions
    .map((entry) => {
      const displaySave = normalizeArmorSaveForClass(entry.save, template.classType, entry);
      return `<option value="${entry.id}" ${entry.id === builderState.armorId ? "selected" : ""}>${entry.name} | Save ${displaySave} | +${entry.hpBonus} HP | Cost +${entry.cost}</option>`;
    })
    .join("");

  weaponSelect.innerHTML = template.weaponOptions
    .map((entry) => {
      const resolved = resolveWeaponOption(entry, template);
      return `<option value="${entry.id}" ${entry.id === builderState.weaponId ? "selected" : ""}>${entry.name} | A ${resolved.attacks} | Hit ${resolved.hit} | Dmg ${resolved.damage} | Cost +${resolved.cost}</option>`;
    })
    .join("");

  if (!Array.isArray(builderState.secondaryWeaponIds)) {
    builderState.secondaryWeaponIds = [];
  }

  builderState.squadSize = normalizeSquadSize(builderState.squadSize, template.classType);

  builderState.secondaryWeaponIds = builderState.secondaryWeaponIds.filter((id) => id !== builderState.weaponId);
  const validSecondaryIds = new Set(template.weaponOptions.map((entry) => entry.id));
  builderState.secondaryWeaponIds = builderState.secondaryWeaponIds.filter((id) => validSecondaryIds.has(id));

  if (secondaryWeaponsSelect) {
    secondaryWeaponsSelect.innerHTML = template.weaponOptions
      .filter((entry) => entry.id !== builderState.weaponId)
      .map((entry) => {
        const resolved = resolveWeaponOption(entry, template);
        return `<option value="${entry.id}" ${builderState.secondaryWeaponIds.includes(entry.id) ? "selected" : ""}>${entry.name} | A ${resolved.attacks} | Hit ${resolved.hit} | Dmg ${resolved.damage} | Cost +${resolved.cost}</option>`;
      })
      .join("");
  }

  if (squadSizeInput) {
    const cap = getSquadCapForClassType(template.classType);
    squadSizeInput.min = "1";
    squadSizeInput.max = String(cap);
    squadSizeInput.step = "1";
    squadSizeInput.value = String(builderState.squadSize);
  }

  if (squadSizeHint) {
    const cap = getSquadCapForClassType(template.classType);
    squadSizeHint.innerText = `Limit oddzialu: ${cap}`;
  }

  updateBuilderPreview();
}

function onBuilderSelectionChanged() {
  builderState.templateId = document.getElementById("unitTemplateSelect").value;
  const template = getTemplateById(builderState.templateId);

  if (!template) {
    return;
  }

  builderState.armorId = document.getElementById("armorSelect").value;
  builderState.weaponId = document.getElementById("weaponSelect").value;
  const secondaryWeaponsSelect = document.getElementById("secondaryWeaponsSelect");
  const squadSizeInput = document.getElementById("squadSizeInput");

  if (!template.armorOptions.some((entry) => entry.id === builderState.armorId)) {
    builderState.armorId = template.armorOptions[0].id;
  }

  if (!template.weaponOptions.some((entry) => entry.id === builderState.weaponId)) {
    builderState.weaponId = template.weaponOptions[0].id;
  }

  if (secondaryWeaponsSelect) {
    builderState.secondaryWeaponIds = Array.from(secondaryWeaponsSelect.selectedOptions)
      .map((entry) => entry.value)
      .filter((id) => id !== builderState.weaponId);
  } else {
    builderState.secondaryWeaponIds = [];
  }

  builderState.squadSize = normalizeSquadSize(squadSizeInput ? squadSizeInput.value : builderState.squadSize, template.classType);

  refreshBuilderOptions();
}

function updateBuilderPreview() {
  const template = getTemplateById(builderState.templateId);

  if (!template) {
    document.getElementById("builderPreview").innerHTML = '<div class="hint-box">Brak danych jednostki.</div>';
    return;
  }

  const armor = template.armorOptions.find((entry) => entry.id === builderState.armorId) || template.armorOptions[0];
  const weapon = template.weaponOptions.find((entry) => entry.id === builderState.weaponId) || template.weaponOptions[0];
  const secondaryWeapons = template.weaponOptions.filter((entry) => builderState.secondaryWeaponIds.includes(entry.id) && entry.id !== weapon.id);
  const unit = buildUnitFromSelection(template, armor, weapon, secondaryWeapons, builderState.squadSize);
  const weaponAbilities = unit.weapon.abilities;
  const normalizedArmorSave = normalizeArmorSaveForClass(armor.save, template.classType, armor);
  const armorAbilities = buildArmorAbilities({ ...armor, save: normalizedArmorSave });
  const allWeapons = getAllUnitWeapons(unit);

  document.getElementById("builderPreview").innerHTML = `
    <article class="unit-card selected-card builder-preview__card">
      <div class="unit-card-top">
        <div>
          <div class="unit-name">${template.name}</div>
          <div class="unit-type">${template.classType.toUpperCase()}</div>
        </div>
        <div class="wounds">Koszt ${unit.cost}</div>
      </div>
      <div class="stat-row">
        <div class="stat-box"><span>HP</span><strong>${unit.hp}</strong></div>
        <div class="stat-box"><span>MDL</span><strong>${unit.squadSize}</strong></div>
        <div class="stat-box"><span>M</span><strong>${unit.move}"</strong></div>
        <div class="stat-box"><span>APL</span><strong>${unit.apl}</strong></div>
        <div class="stat-box"><span>DF</span><strong>${unit.df}</strong></div>
        <div class="stat-box"><span>SV</span><strong>${normalizedArmorSave}</strong></div>
        <div class="stat-box"><span>WPN</span><strong>${allWeapons.length}</strong></div>
      </div>
      <div class="subline">HP na model: ${unit.modelHp} | Koszt na model: ${unit.modelCost}</div>
      <div class="weapon-line" style="margin-bottom: 6px;">
        <div>Armor:</div><div style="grid-column: span 4;">${armor.name}</div>
      </div>
      <div class="subline">Armor keywords: ${armorAbilities.length ? armorAbilities.join(", ") : "brak"}</div>
      <div class="weapon-line header" style="margin-top: 8px;">
        <div>Weapon</div><div>A</div><div>WS</div><div>Dmg</div><div>Range</div>
      </div>
      ${allWeapons.map((entry) => {
        const entryAbilities = entry.abilities || [];
        return `
        <div class="weapon-line">
          <div>${entry.name}</div>
          <div>${getSquadAttackDice(entry.attacks, unit.squadSize)}</div>
          <div>${entry.hit}</div>
          <div>${entry.damage}</div>
          <div>${entry.range}"</div>
        </div>
        <div class="subline">A/model: ${entry.attacks}${unit.squadSize > 1 ? ` | Oddzial: ceil(${entry.attacks}/2) x ${unit.squadSize}` : ""} | Keywords: ${entryAbilities.length ? entryAbilities.join(", ") : "brak"}</div>
        `;
      }).join("")}
      <div class="subline" style="margin-top: 8px;">Glowna bron: ${weapon.name} | Keywords: ${weaponAbilities.join(", ")}</div>
    </article>
  `;
}

function addConfiguredUnit() {
  const template = getTemplateById(builderState.templateId);

  if (!template) {
    return;
  }

  const armor = template.armorOptions.find((entry) => entry.id === builderState.armorId) || template.armorOptions[0];
  const weapon = template.weaponOptions.find((entry) => entry.id === builderState.weaponId) || template.weaponOptions[0];
  const secondaryWeapons = template.weaponOptions.filter((entry) => builderState.secondaryWeaponIds.includes(entry.id) && entry.id !== weapon.id);
  const unit = buildUnitFromSelection(template, armor, weapon, secondaryWeapons, builderState.squadSize);

  if (points + unit.cost > 115) {
    setStatus("Limit punktow przekroczony. Zmien konfiguracje modelu.");
    return;
  }

  team.push(unit);
  points += unit.cost;
  document.getElementById("points").innerText = points;
}

function getTerrainPresetById(presetId) {
  return TERRAIN_DENSITY_PRESETS[presetId] || TERRAIN_DENSITY_PRESETS.normal;
}

function getDefaultRooms() {
  return [
    {
      id: crypto.randomUUID(),
      name: "Dziedziniec Treningowy",
      density: "light",
      notes: "Lzejsza mapa pod szybkie testy.",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: "Ruiny Balans",
      density: "normal",
      notes: "Domyslny balans terenu.",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: "Forteca Gestwa",
      density: "dense",
      notes: "Wieksza liczba blokujacych i dekoracyjnych elementow.",
      createdAt: new Date().toISOString(),
    },
  ];
}

function saveRooms() {
  try {
    const payload = { rooms, activeRoomId };
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignore storage errors (private mode / quota).
  }
}

function loadRooms() {
  try {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);

    if (!raw) {
      rooms = getDefaultRooms();
      activeRoomId = rooms[0]?.id || "";
      saveRooms();
      return;
    }

    const payload = JSON.parse(raw);
    const loadedRooms = Array.isArray(payload?.rooms) ? payload.rooms : [];
    rooms = loadedRooms.filter((room) => room && room.id && room.name).map((room) => ({
      id: String(room.id),
      name: String(room.name),
      density: room.density && TERRAIN_DENSITY_PRESETS[room.density] ? room.density : "normal",
      notes: room.notes ? String(room.notes) : "",
      createdAt: room.createdAt ? String(room.createdAt) : new Date().toISOString(),
    }));

    if (!rooms.length) {
      rooms = getDefaultRooms();
    }

    activeRoomId = rooms.some((room) => room.id === payload?.activeRoomId)
      ? payload.activeRoomId
      : rooms[0].id;
  } catch (_error) {
    rooms = getDefaultRooms();
    activeRoomId = rooms[0]?.id || "";
  }
}

function getActiveRoom() {
  return rooms.find((room) => room.id === activeRoomId) || null;
}

function applyActiveRoomTerrainConfig() {
  const activeRoom = getActiveRoom();
  const preset = getTerrainPresetById(activeRoom?.density || "normal");
  terrainGenerationConfig = { ...preset };
}

function renderRoomsPanel() {
  const roomList = document.getElementById("roomList");
  const activeRoomLabel = document.getElementById("activeRoomLabel");

  if (!roomList || !activeRoomLabel) {
    return;
  }

  const activeRoom = getActiveRoom();
  activeRoomLabel.innerText = activeRoom
    ? `Aktywny pokoj: ${activeRoom.name} (${activeRoom.density})`
    : "Aktywny pokoj: brak";

  roomList.innerHTML = rooms.map((room) => {
    const selectedClass = room.id === activeRoomId ? " room-entry--active" : "";
    const note = room.notes ? `<div class="room-note">${room.notes}</div>` : "";

    return `
      <article class="room-entry${selectedClass}">
        <div class="room-top">
          <strong>${room.name}</strong>
          <span>${room.density}</span>
        </div>
        ${note}
        <div class="room-actions">
          <button onclick="selectRoom('${room.id}')">Wybierz</button>
          <button onclick="deleteRoom('${room.id}')">Usun</button>
        </div>
      </article>
    `;
  }).join("");
}

function createRoomFromMenu() {
  const nameInput = document.getElementById("roomNameInput");
  const densitySelect = document.getElementById("roomDensitySelect");
  const notesInput = document.getElementById("roomNotesInput");

  if (!nameInput || !densitySelect || !notesInput) {
    return;
  }

  const name = nameInput.value.trim();

  if (!name) {
    return;
  }

  const density = TERRAIN_DENSITY_PRESETS[densitySelect.value] ? densitySelect.value : "normal";

  rooms.unshift({
    id: crypto.randomUUID(),
    name,
    density,
    notes: notesInput.value.trim(),
    createdAt: new Date().toISOString(),
  });

  activeRoomId = rooms[0].id;
  nameInput.value = "";
  notesInput.value = "";
  saveRooms();
  applyActiveRoomTerrainConfig();
  renderRoomsPanel();
}

function selectRoom(roomId) {
  if (!rooms.some((room) => room.id === roomId)) {
    return;
  }

  activeRoomId = roomId;
  saveRooms();
  applyActiveRoomTerrainConfig();
  renderRoomsPanel();
}

function deleteRoom(roomId) {
  rooms = rooms.filter((room) => room.id !== roomId);

  if (!rooms.length) {
    rooms = getDefaultRooms();
  }

  if (!rooms.some((room) => room.id === activeRoomId)) {
    activeRoomId = rooms[0].id;
  }

  saveRooms();
  applyActiveRoomTerrainConfig();
  renderRoomsPanel();
}

function initRoomManager() {
  loadRooms();
  applyActiveRoomTerrainConfig();
  renderRoomsPanel();
}

function openSinglePlayerMenu() {
  const mainMenu = document.getElementById("mainMenu");
  const singleMenu = document.getElementById("menu");

  if (mainMenu) {
    mainMenu.style.display = "none";
  }

  if (singleMenu) {
    singleMenu.style.display = "block";
  }
}

function backToMainMenu() {
  const mainMenu = document.getElementById("mainMenu");
  const singleMenu = document.getElementById("menu");

  closeLorePanel();

  if (singleMenu) {
    singleMenu.style.display = "none";
  }

  if (mainMenu) {
    mainMenu.style.display = "block";
  }
}

function selectFaction(f) {
  faction = f;
  document.getElementById("menu").style.display = "none";
  document.getElementById("builder").style.display = "block";
  refreshBuilderOptions();
}

async function startGame() {
  document.getElementById("builder").style.display = "none";
  document.getElementById("game").style.display = "block";
  turn = 1;
  round = 1;
  activeSide = "player";
  enemyTurnInProgress = false;
  currentActivationUnit = null;
  combatLogEntries = [];
  resetActionState();
  setActionMode("move");
  applyActiveRoomTerrainConfig();

  if (window.TerrainAssets && !window.TerrainAssets.isReady()) {
    try {
      await window.TerrainAssets.initialize({ basePath: "graphic/ground" });
      terrainAssetDb = window.TerrainAssets.getObjectDatabase();
      terrainAssetsReady = true;
    } catch (error) {
      terrainAssetDb = [];
      terrainAssetsReady = false;
      console.error("Terrain asset loading failed:", error);
      setStatus("Nie udalo sie zaladowac wszystkich grafik terenu. Uzywam fallbacku.");
    }
  } else if (window.TerrainAssets && window.TerrainAssets.isReady()) {
    terrainAssetDb = window.TerrainAssets.getObjectDatabase();
    terrainAssetsReady = true;
  }

  initBattlefield();
  generateTerrainBySectors();
  generateObjectives();
  const generatedEnemy = generateRandomEnemyTeam(points);
  enemyTeam = generatedEnemy.units;
  enemyFaction = generatedEnemy.factionId;
  spawnUnits();
}

function getDeploymentAnchor(side) {
  if (side === "player") {
    return { xIn: 1.4, yIn: BOARD_HEIGHT_IN - 1.4 };
  }

  return { xIn: BOARD_WIDTH_IN - 1.4, yIn: 1.4 };
}

function getDeploymentQueueUnit(side) {
  if (!deploymentState || !deploymentState.active) {
    return null;
  }

  const remaining = getRemainingDeploymentUnits(side);

  if (!remaining.length) {
    return null;
  }

  const preferredId = deploymentState.selectedBySide[side];

  if (preferredId) {
    const preferred = remaining.find((unit) => unit.id === preferredId);

    if (preferred) {
      return preferred;
    }
  }

  return remaining[0];
}

function countDeploymentRemaining(side) {
  if (!deploymentState || !deploymentState.active) {
    return 0;
  }

  return getRemainingDeploymentUnits(side).length;
}

function getRemainingDeploymentUnits(side) {
  if (!deploymentState || !deploymentState.active) {
    return [];
  }

  return deploymentState.queues[side].filter((unit) => !deploymentState.placedIds[side].has(unit.id));
}

function isDeploymentUnitPlaced(side, unit) {
  if (!deploymentState || !deploymentState.active) {
    return false;
  }

  return deploymentState.placedIds[side].has(unit.id);
}

function setDeploymentSelection(side, unitId) {
  if (!deploymentState || !deploymentState.active) {
    return;
  }

  const remaining = getRemainingDeploymentUnits(side);

  if (!remaining.some((unit) => unit.id === unitId)) {
    return;
  }

  deploymentState.selectedBySide[side] = unitId;
}

function buildEnemyFromPlayerUnit(playerUnit) {
  return {
    id: crypto.randomUUID(),
    type: playerUnit.type,
    classType: playerUnit.classType,
    templateName: playerUnit.templateName,
    hp: playerUnit.maxHp,
    maxHp: playerUnit.maxHp,
    maxRecoverableHp: Math.max(0, Number(playerUnit.maxRecoverableHp) || Number(playerUnit.maxHp) || 0),
    modelHp: playerUnit.modelHp,
    squadSize: playerUnit.squadSize,
    currentModels: playerUnit.squadSize,
    move: playerUnit.move,
    apl: playerUnit.apl,
    ga: playerUnit.ga,
    df: playerUnit.df,
    sv: playerUnit.sv,
    abilities: Array.isArray(playerUnit.abilities) ? [...playerUnit.abilities] : [],
    armor: { ...playerUnit.armor },
    weapon: { ...playerUnit.weapon },
    secondaryWeapons: Array.isArray(playerUnit.secondaryWeapons) ? playerUnit.secondaryWeapons.map((weapon) => ({ ...weapon })) : [],
    side: "enemy",
    xIn: 0,
    yIn: 0,
  };
}

function buildPlayerDeploymentUnit(baseUnit) {
  return {
    id: crypto.randomUUID(),
    type: baseUnit.type,
    classType: baseUnit.classType,
    templateName: baseUnit.templateName,
    hp: baseUnit.maxHp,
    maxHp: baseUnit.maxHp,
    maxRecoverableHp: Math.max(0, Number(baseUnit.maxRecoverableHp) || Number(baseUnit.maxHp) || 0),
    modelHp: baseUnit.modelHp,
    squadSize: baseUnit.squadSize,
    currentModels: baseUnit.squadSize,
    move: baseUnit.move,
    apl: baseUnit.apl,
    ga: baseUnit.ga,
    df: baseUnit.df,
    sv: baseUnit.sv,
    abilities: Array.isArray(baseUnit.abilities) ? [...baseUnit.abilities] : [],
    armor: { ...baseUnit.armor },
    weapon: { ...baseUnit.weapon },
    secondaryWeapons: Array.isArray(baseUnit.secondaryWeapons) ? baseUnit.secondaryWeapons.map((weapon) => ({ ...weapon })) : [],
    side: "player",
    xIn: 0,
    yIn: 0,
  };
}

function pickRandomArrayItem(list) {
  if (!Array.isArray(list) || !list.length) {
    return null;
  }

  return list[Math.floor(Math.random() * list.length)];
}

function getMinimumPossibleUnitCost(templates) {
  if (!Array.isArray(templates) || !templates.length) {
    return Infinity;
  }

  let minCost = Infinity;

  templates.forEach((template) => {
    const minArmor = Math.min(...template.armorOptions.map((entry) => Number(entry.cost) || 0));
    const minWeapon = Math.min(...template.weaponOptions.map((entry) => Number(entry.cost) || 0));
    const candidate = (Number(template.base?.cost) || 0) + minArmor + minWeapon;

    if (candidate < minCost) {
      minCost = candidate;
    }
  });

  return minCost;
}

function buildRandomUnitFromTemplate(template) {
  const armor = pickRandomArrayItem(template.armorOptions) || template.armorOptions[0];
  const weapon = pickRandomArrayItem(template.weaponOptions) || template.weaponOptions[0];
  const squadSize = normalizeSquadSize(Math.floor(Math.random() * getSquadCapForClassType(template.classType)) + 1, template.classType);
  const secondaryWeapons = template.weaponOptions
    .filter((entry) => entry.id !== weapon.id)
    .filter(() => Math.random() < 0.35)
    .slice(0, 2);

  return buildUnitFromSelection(template, armor, weapon, secondaryWeapons, squadSize);
}

function generateRandomEnemyTeam(maxPoints) {
  const factionIds = Object.keys(FACTION_UNIT_LIBRARY).filter((key) => Array.isArray(getFactionLibraryById(key)) && getFactionLibraryById(key).length);

  if (!factionIds.length) {
    return { factionId: "kingdoms", units: [] };
  }

  const factionId = pickRandomArrayItem(factionIds) || "kingdoms";
  const templates = getFactionLibraryById(factionId);
  const minUnitCost = getMinimumPossibleUnitCost(templates);
  const budget = Math.max(0, Math.floor(Number(maxPoints) || 0));
  const unitsPool = [];
  let spent = 0;
  let safety = 0;

  while (spent < budget && safety < 320) {
    safety += 1;

    if (spent + minUnitCost > budget) {
      break;
    }

    const template = pickRandomArrayItem(templates);

    if (!template) {
      break;
    }

    const candidate = buildRandomUnitFromTemplate(template);

    if (spent + candidate.cost > budget) {
      continue;
    }

    unitsPool.push(candidate);
    spent += candidate.cost;
  }

  return { factionId, units: unitsPool };
}

function getMeleeWeaponForUnit(unit) {
  if (unit?.weapon && (Number(unit.weapon.range) || 1) <= 1) {
    return unit.weapon;
  }

  if (!Array.isArray(unit?.secondaryWeapons)) {
    return null;
  }

  return unit.secondaryWeapons.find((weapon) => (Number(weapon.range) || 1) <= 1) || null;
}

function getAllUnitWeapons(unit) {
  const weapons = [];

  if (unit?.weapon) {
    weapons.push(unit.weapon);
  }

  if (Array.isArray(unit?.secondaryWeapons)) {
    weapons.push(...unit.secondaryWeapons);
  }

  return weapons;
}

function getWeaponById(unit, weaponId) {
  if (!weaponId) {
    return null;
  }

  return getAllUnitWeapons(unit).find((weapon) => weapon.id === weaponId) || null;
}

function getSelectedActionWeapon(unit) {
  return getWeaponById(unit, selectedActionWeaponId);
}

function setWeaponActionMode(weaponId) {
  if (activeSide !== "player" || enemyTurnInProgress || (deploymentState && deploymentState.active)) {
    return;
  }

  if (!selected || selected.side !== "player") {
    setStatus("Najpierw wybierz swoja jednostke.");
    return;
  }

  const weapon = getWeaponById(selected, weaponId);

  if (!weapon) {
    setStatus("Wybrana bron nie jest dostepna dla tej jednostki.");
    return;
  }

  const mode = (Number(weapon.range) || 1) > 1 ? "shoot" : "attack";
  setActionMode(mode, weapon.id);
}

function getRangedWeaponForUnit(unit) {
  if (unit?.weapon && (Number(unit.weapon.range) || 1) > 1) {
    return unit.weapon;
  }

  if (!Array.isArray(unit?.secondaryWeapons)) {
    return null;
  }

  return unit.secondaryWeapons.find((weapon) => (Number(weapon.range) || 1) > 1) || null;
}

function canAttemptChargeNow() {
  return !actionState.moveUsed
    && !actionState.bonusUsed
    && !actionState.mainUsed
    && !actionState.shootUsed
    && !actionState.disengaged;
}

function getDeploymentPrompt() {
  if (!deploymentState || !deploymentState.active) {
    return "";
  }

  const sideLabel = deploymentState.side === "player" ? "GRACZ" : "ENEMY";
  const current = getDeploymentQueueUnit(deploymentState.side);
  const unitLabel = current ? getUnitLabel(current) : "brak";
  const leftPlayer = countDeploymentRemaining("player");
  const leftEnemy = countDeploymentRemaining("enemy");

  if (deploymentState.side === "enemy") {
    return `Deployment: ENEMY wystawia ${unitLabel} automatycznie. Pozostalo Ty:${leftPlayer} / Enemy:${leftEnemy}.`;
  }

  return `Deployment: ${sideLabel} wystawia ${unitLabel}. Kliknij w promieniu ${DEPLOY_RADIUS_IN}" od punktu w rogu. Pozostalo Ty:${leftPlayer} / Enemy:${leftEnemy}.`;
}

function findDeploymentPointForSide(side) {
  const anchor = getDeploymentAnchor(side);

  for (let attempt = 0; attempt < 160; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * Math.max(0.5, DEPLOY_RADIUS_IN - UNIT_RADIUS_IN * 1.5);
    const xIn = clamp(anchor.xIn + Math.cos(angle) * radius, UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN);
    const yIn = clamp(anchor.yIn + Math.sin(angle) * radius, UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN);
    const check = canDeployAt(side, xIn, yIn);

    if (check.ok) {
      return { xIn, yIn };
    }
  }

  // Last-resort fallback near anchor so deployment does not stall.
  const fallback = findClosestFreePoint(anchor.xIn, anchor.yIn, null);
  return { xIn: fallback.xIn, yIn: fallback.yIn };
}

function runEnemyAutoDeploymentBatch() {
  if (!deploymentState || !deploymentState.active || deploymentState.side !== "enemy") {
    return;
  }

  while (deploymentState && deploymentState.active && deploymentState.side === "enemy" && deploymentState.batchPlaced < DEPLOY_BATCH_SIZE) {
    const unit = getDeploymentQueueUnit("enemy");

    if (!unit) {
      break;
    }

    const target = findDeploymentPointForSide("enemy");
    placeUnit(unit, target.xIn, target.yIn);
    deploymentState.placedIds.enemy.add(unit.id);

    if (deploymentState.selectedBySide.enemy === unit.id) {
      deploymentState.selectedBySide.enemy = null;
    }

    deploymentState.batchPlaced += 1;
  }

  advanceDeploymentTurn();
  render();
}

function finishDeploymentPhase() {
  deploymentState = null;
  selected = null;
  currentActivationUnit = null;
  activeSide = "player";
  enemyTurnInProgress = false;
  resetActionState();
  setActionMode("move");
  setStatus("Deployment zakonczony. Wybierz swoja jednostke i rozpocznij ture.");
  render();
}

function advanceDeploymentTurn() {
  if (!deploymentState) {
    return;
  }

  const playerLeft = countDeploymentRemaining("player");
  const enemyLeft = countDeploymentRemaining("enemy");

  if (playerLeft <= 0 && enemyLeft <= 0) {
    finishDeploymentPhase();
    return;
  }

  const currentSide = deploymentState.side;
  const otherSide = currentSide === "player" ? "enemy" : "player";
  const currentLeft = countDeploymentRemaining(currentSide);
  const otherLeft = countDeploymentRemaining(otherSide);

  if (currentLeft <= 0 && otherLeft > 0) {
    deploymentState.side = otherSide;
    deploymentState.batchPlaced = 0;
    setStatus(getDeploymentPrompt());

    if (deploymentState.side === "enemy") {
      runEnemyAutoDeploymentBatch();
    }

    return;
  }

  if (deploymentState.batchPlaced >= DEPLOY_BATCH_SIZE && otherLeft > 0) {
    deploymentState.side = otherSide;
    deploymentState.batchPlaced = 0;

    if (deploymentState.side === "enemy") {
      setStatus(getDeploymentPrompt());
      runEnemyAutoDeploymentBatch();
      return;
    }
  }

  // If player has no units left to deploy, enemy should keep auto-deploying in batches
  // until all enemy units are placed.
  if (deploymentState.side === "enemy" && otherLeft <= 0 && currentLeft > 0) {
    deploymentState.batchPlaced = 0;
    setStatus(getDeploymentPrompt());
    runEnemyAutoDeploymentBatch();
    return;
  }

  setStatus(getDeploymentPrompt());
}

function canDeployAt(side, xIn, yIn) {
  const anchor = getDeploymentAnchor(side);
  const distToAnchor = Math.hypot(xIn - anchor.xIn, yIn - anchor.yIn);

  if (distToAnchor > DEPLOY_RADIUS_IN) {
    return { ok: false, reason: `Poza strefa deploymentu (${DEPLOY_RADIUS_IN}").` };
  }

  if (isPointBlockedByTerrain(xIn, yIn, UNIT_RADIUS_IN * 0.6)) {
    return { ok: false, reason: "To miejsce blokuje teren nieprzechodni." };
  }

  if (isPointBlockedByUnits(xIn, yIn, null)) {
    return { ok: false, reason: "Za blisko innej jednostki." };
  }

  if (isPointBlockedByObjectives(xIn, yIn, UNIT_RADIUS_IN * 0.25)) {
    return { ok: false, reason: "Nie mozna ustawic jednostki na ognisku." };
  }

  return { ok: true, reason: "ok" };
}

function handleDeploymentClick(xIn, yIn) {
  if (!deploymentState || !deploymentState.active) {
    return;
  }

  if (deploymentState.side !== "player") {
    return;
  }

  const side = deploymentState.side;
  const unit = getDeploymentQueueUnit(side);

  if (!unit) {
    advanceDeploymentTurn();
    render();
    return;
  }

  const check = canDeployAt(side, xIn, yIn);

  if (!check.ok) {
    setStatus(`${check.reason} ${getDeploymentPrompt()}`);
    return;
  }

  placeUnit(unit, xIn, yIn);
  deploymentState.placedIds[side].add(unit.id);

  if (deploymentState.selectedBySide[side] === unit.id) {
    deploymentState.selectedBySide[side] = null;
  }

  deploymentState.batchPlaced += 1;
  advanceDeploymentTurn();
  render();
}

function initBattlefield() {
  const field = document.getElementById("battlefield");
  field.style.setProperty("--scale", String(PIXELS_PER_INCH));
  field.style.setProperty("--board-w", String(BOARD_WIDTH_IN));
  field.style.setProperty("--board-h", String(BOARD_HEIGHT_IN));

  if (terrainAssetsReady && window.TerrainAssets) {
    groundLayers = typeof window.TerrainAssets.getGroundLayers === "function"
      ? window.TerrainAssets.getGroundLayers()
      : null;
    const groundCss = groundLayers ? groundLayers.baseCss : window.TerrainAssets.getGroundCss();

    if (groundCss) {
      field.style.background = groundCss;
    }
  }

  battlefieldAtmosphere = buildBattlefieldAtmosphereLayers();

  field.onclick = async (event) => {
    if (event.target !== field || isAnimating) {
      return;
    }

    const rect = field.getBoundingClientRect();
    const xIn = clamp((event.clientX - rect.left) / PIXELS_PER_INCH, UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN);
    const yIn = clamp((event.clientY - rect.top) / PIXELS_PER_INCH, UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN);

    if (deploymentState && deploymentState.active) {
      handleDeploymentClick(xIn, yIn);
      return;
    }

    if (!selected || activeSide !== "player" || enemyTurnInProgress) {
      return;
    }

    if (actionMode === "move") {
      await tryMoveSelected(xIn, yIn, selected.move, "move");
      return;
    }

    if (actionMode === "dash") {
      await tryMoveSelected(xIn, yIn, Math.max(1, Math.floor(selected.move / 2)), "bonus");
      return;
    }

    setStatus("Aktualny tryb akcji nie uzywa klikniecia na puste pole.");
  };
}

function buildBattlefieldAtmosphereLayers() {
  const dirtMaskParts = [];
  const patchCount = 5 + Math.floor(Math.random() * 4);

  for (let i = 0; i < patchCount; i++) {
    const cx = 8 + Math.random() * 84;
    const cy = 7 + Math.random() * 86;
    const rx = 3.5 + Math.random() * 8.5;
    const ry = 2.6 + Math.random() * 7.6;
    const inner = 38 + Math.random() * 18;
    const outer = 74 + Math.random() * 14;
    dirtMaskParts.push(`radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, rgba(0, 0, 0, 0.9) ${inner}%, rgba(0, 0, 0, 0) ${outer}%)`);
  }

  const dustVeil = [
    "linear-gradient(170deg, rgba(0,0,0,0.16), rgba(0,0,0,0.02) 42%, rgba(0,0,0,0.24))",
    "radial-gradient(circle at 15% 20%, rgba(242, 210, 140, 0.08), transparent 36%)",
    "radial-gradient(circle at 82% 68%, rgba(166, 122, 76, 0.1), transparent 34%)",
  ].join(",");

  return {
    dirtMaskCss: dirtMaskParts.join(","),
    veilCss: dustVeil,
  };
}

function generateObjectives() {
  objectives = [
    { id: "obj-house-a", xIn: PREDEFINED_HOUSE_A.xIn, yIn: PREDEFINED_HOUSE_A.yIn, owner: null },
    { id: "obj-mid", xIn: PREDEFINED_CENTER_OBJECTIVE.xIn, yIn: PREDEFINED_CENTER_OBJECTIVE.yIn, owner: null },
    { id: "obj-house-b", xIn: PREDEFINED_HOUSE_B.xIn, yIn: PREDEFINED_HOUSE_B.yIn, owner: null }
  ];
}

function resetActionState() {
  actionState = { apLeft: 3, moveUsed: false, bonusUsed: false, mainUsed: false, shootUsed: false, disengaged: false, charged: false };
}

function isUnitActivatedThisRound(unit) {
  return unit.lastActivatedRound === round;
}

function markUnitActivated(unit) {
  unit.lastActivatedRound = round;
}

function getAvailableUnitsForSide(side) {
  return units.filter((unit) => unit.side === side && unit.hp > 0 && !isUnitActivatedThisRound(unit));
}

function isRoundExhausted() {
  return getAvailableUnitsForSide("player").length === 0 && getAvailableUnitsForSide("enemy").length === 0;
}

function startNextRound() {
  round += 1;
  document.getElementById("round").innerText = round;
  setStatus(`Nowa runda ${round}. Wszystkie jednostki sa znow aktywne.`);
}

function canUseAction(channel) {
  if (actionState.apLeft <= 0) {
    return false;
  }

  if (channel === "move") {
    return !actionState.moveUsed;
  }

  if (channel === "bonus") {
    return !actionState.bonusUsed;
  }

  if (channel === "main") {
    return !actionState.mainUsed;
  }

  if (channel === "shoot") {
    return !actionState.shootUsed;
  }

  return false;
}

function spendAction(channel) {
  if (!canUseAction(channel)) {
    return false;
  }

  actionState.apLeft -= 1;

  if (channel === "move") {
    actionState.moveUsed = true;
  }

  if (channel === "bonus") {
    actionState.bonusUsed = true;
  }

  if (channel === "main") {
    actionState.mainUsed = true;
  }

  if (channel === "shoot") {
    actionState.shootUsed = true;
  }

  return true;
}

function maybeAutoEndTurn() {
  if (actionState.apLeft <= 0) {
    void endTurnEarly();
  }
}

function setActionMode(mode, weaponId = null) {
  actionMode = mode;

  if (mode === "attack" || mode === "shoot") {
    selectedActionWeaponId = weaponId || selectedActionWeaponId;
  } else {
    selectedActionWeaponId = null;
  }

  updateActionHud();
}

async function endTurnEarly() {
  if (enemyTurnInProgress || activeSide !== "player") {
    return;
  }

  if (!currentActivationUnit) {
    if (getAvailableUnitsForSide("player").length > 0) {
      setStatus("Wybierz jednostke do aktywacji tej tury.");
      return;
    }
  }

  if (currentActivationUnit) {
    markUnitActivated(currentActivationUnit);
  }

  selected = null;
  currentActivationUnit = null;

  const enemyCanAct = getAvailableUnitsForSide("enemy").length > 0;

  if (enemyCanAct) {
    activeSide = "enemy";
    enemyTurnInProgress = true;
    setStatus("Tura przeciwnika...");
    render();

    await runEnemyTurn();

    enemyTurnInProgress = false;
    activeSide = "player";
  }

  // If player has exhausted all activations for this round, automatically fast-forward
  // remaining enemy activations so the player does not need to click End Turn repeatedly.
  while (getAvailableUnitsForSide("player").length === 0 && getAvailableUnitsForSide("enemy").length > 0) {
    activeSide = "enemy";
    enemyTurnInProgress = true;
    setStatus("Gracz bez aktywacji - przeciwnik konczy swoje aktywacje.");
    render();

    await runEnemyTurn();

    enemyTurnInProgress = false;
    activeSide = "player";
  }

  if (isRoundExhausted()) {
    startNextRound();
  }

  turn += 1;
  const campfireReports = applyCampfireHealing();

  if (campfireReports.length) {
    pushCombatLog(campfireReports, "Ogniska", "support");
  }

  resetActionState();
  setActionMode("move");
  document.getElementById("turn").innerText = turn;

  if (getAvailableUnitsForSide("player").length === 0) {
    setStatus(campfireReports.length
      ? `${campfireReports[0]} Brak dostepnych jednostek gracza w tej rundzie. Koniec rundy po turze enemy.`
      : "Brak dostepnych jednostek gracza w tej rundzie. Koniec rundy po turze enemy.");
  } else {
    setStatus(campfireReports.length
      ? `${campfireReports[0]} Nowa aktywacja gracza. Wybierz 1 jednostke i wydaj AP.`
      : "Nowa aktywacja gracza. Wybierz 1 jednostke i wydaj AP.");
  }

  render();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNearestPointTowards(startX, startY, targetX, targetY, maxDistance) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const fullDist = Math.hypot(dx, dy);

  if (fullDist <= 0.001) {
    return { xIn: startX, yIn: startY };
  }

  const stepDist = Math.min(maxDistance, fullDist);
  const nx = dx / fullDist;
  const ny = dy / fullDist;

  return {
    xIn: clamp(startX + nx * stepDist, UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN),
    yIn: clamp(startY + ny * stepDist, UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN)
  };
}

function findBestMoveTarget(unit, targetX, targetY, maxDistance) {
  for (let shrink = 1; shrink >= 0.2; shrink -= 0.15) {
    const target = getNearestPointTowards(unit.xIn, unit.yIn, targetX, targetY, maxDistance * shrink);
    const pathBlock = getPathBlockInfo(unit.xIn, unit.yIn, target.xIn, target.yIn, [unit]);

    if (!pathBlock.blocked) {
      return target;
    }

    const baseAngle = Math.atan2(targetY - unit.yIn, targetX - unit.xIn);

    for (let arc = 1; arc <= 6; arc++) {
      const spread = arc * (Math.PI / 14);
      const angles = [baseAngle + spread, baseAngle - spread];

      for (const angle of angles) {
        const testX = clamp(unit.xIn + Math.cos(angle) * (maxDistance * shrink), UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN);
        const testY = clamp(unit.yIn + Math.sin(angle) * (maxDistance * shrink), UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN);
        const altBlock = getPathBlockInfo(unit.xIn, unit.yIn, testX, testY, [unit]);

        if (!altBlock.blocked) {
          return { xIn: testX, yIn: testY };
        }
      }
    }
  }

  return null;
}

async function performChargeAttack(attacker, target, options = {}) {
  if (!window.CombatSystem || typeof window.CombatSystem.performChargeAttack !== "function") {
    return false;
  }

  return window.CombatSystem.performChargeAttack(attacker, target, options);
}

function performStandardAttack(attacker, target, options = {}) {
  if (!window.CombatSystem || typeof window.CombatSystem.performStandardAttack !== "function") {
    return false;
  }

  return window.CombatSystem.performStandardAttack(attacker, target, options);
}

async function enemyMoveUnit(enemyUnit, targetX, targetY, moveLimit) {
  const best = findBestMoveTarget(enemyUnit, targetX, targetY, moveLimit);

  if (!best) {
    return false;
  }

  await animateUnitMovement(enemyUnit, best.xIn, best.yIn);
  setStatus(`Enemy ruch: ${getUnitLabel(enemyUnit)} przesuwa sie.`);
  render();
  return true;
}

function enemyCaptureObjective(enemyUnit, objective) {
  const dist = Math.hypot(enemyUnit.xIn - objective.xIn, enemyUnit.yIn - objective.yIn);
  const captureCenterRange = OBJECTIVE_RADIUS_IN + OBJECTIVE_CAPTURE_RANGE_IN;

  if (dist > captureCenterRange) {
    return false;
  }

  objective.owner = "enemy";
  setStatus("Enemy przejal cel.");
  render();
  return true;
}

async function runEnemyTurn() {
  if (!window.EnemyAI || typeof window.EnemyAI.runTurn !== "function") {
    setStatus("Brak AI przeciwnika. Tura enemy pominieta.");
    return;
  }

  const availableEnemy = getAvailableUnitsForSide("enemy");

  if (!availableEnemy.length) {
    setStatus("Enemy nie ma juz aktywacji w tej rundzie.");
    return;
  }

  await window.EnemyAI.runTurn({
    getEnemyUnits: () => getAvailableUnitsForSide("enemy"),
    getPlayerUnits: () => units.filter((unit) => unit.side === "player" && unit.hp > 0),
    getObjectives: () => objectives,
    getDistanceBetweenUnits: (a, b) => getDistanceInches(a, b),
    getDistanceToObjective: (unit, objective) => Math.hypot(unit.xIn - objective.xIn, unit.yIn - objective.yIn),
    tryEnemyCharge: async (attacker, target) => {
      const ok = await performChargeAttack(attacker, target, { consumeMainAction: false, allowOnlyPlayer: false });
      if (ok) {
        render();
      }
      return ok;
    },
    tryEnemyMove: async (unit, xIn, yIn, moveLimit) => enemyMoveUnit(unit, xIn, yIn, moveLimit),
    tryEnemyAttack: (attacker, target) => performStandardAttack(attacker, target, {
      consumeMainAction: false,
      allowOnlyPlayer: false,
    }),
    tryEnemyCapture: (unit, objective) => enemyCaptureObjective(unit, objective),
    markEnemyActivated: (unit) => markUnitActivated(unit),
    delay,
  });

  cleanupDeadUnits();
}

function spawnUnits() {
  units = [];
  selected = null;
  const enemySource = enemyTeam.length
    ? enemyTeam
    : team.map((unit) => buildEnemyFromPlayerUnit(unit));

  deploymentState = {
    active: true,
    side: "player",
    batchPlaced: 0,
    selectedBySide: { player: null, enemy: null },
    placedIds: { player: new Set(), enemy: new Set() },
    queues: {
      player: team.map((unit) => buildPlayerDeploymentUnit(unit)),
      enemy: enemySource.map((unit) => buildEnemyFromPlayerUnit(unit)),
    },
  };

  const firstPlayer = getDeploymentQueueUnit("player");

  if (firstPlayer) {
    deploymentState.selectedBySide.player = firstPlayer.id;
  }

  const firstEnemy = getDeploymentQueueUnit("enemy");

  if (firstEnemy) {
    deploymentState.selectedBySide.enemy = firstEnemy.id;
  }

  setStatus(getDeploymentPrompt());
  pushCombatLog([
    `Enemy frakcja: ${enemyFaction}.`,
    `Enemy punkty: ${enemySource.reduce((sum, unit) => sum + (Number(unit.cost) || 0), 0)}/${points}.`,
  ], "Losowanie przeciwnika", "neutral");
  render();

  if (deploymentState.side === "enemy") {
    runEnemyAutoDeploymentBatch();
  }
}

function placeUnit(unit, xIn, yIn) {
  const fallback = findClosestFreePoint(xIn, yIn, unit);
  unit.xIn = fallback.xIn;
  unit.yIn = fallback.yIn;
  units.push(unit);
}

function getSectorRect(side, sectorIndex) {
  const row = Math.floor(sectorIndex / SIDE_SECTOR_COLUMNS);
  const col = sectorIndex % SIDE_SECTOR_COLUMNS;
  const sideOffset = side === "player" ? 0 : HALF_BOARD_IN;

  return {
    xMin: sideOffset + col * SECTOR_WIDTH_IN,
    xMax: sideOffset + (col + 1) * SECTOR_WIDTH_IN,
    yMin: row * SECTOR_HEIGHT_IN,
    yMax: (row + 1) * SECTOR_HEIGHT_IN,
  };
}

function clampToRect(value, min, max, margin) {
  return clamp(value, min + margin, max - margin);
}

function mirrorX(xIn) {
  return BOARD_WIDTH_IN - xIn;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickManyUnique(list, count) {
  const pool = [...list];
  const picked = [];

  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }

  while (picked.length < count) {
    picked.push(pickRandom(list));
  }

  return picked;
}

function pickManyUniqueNumbers(maxExclusive, count) {
  const nums = Array.from({ length: maxExclusive }, (_, i) => i);
  const picked = [];

  while (nums.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * nums.length);
    picked.push(nums.splice(index, 1)[0]);
  }

  return picked;
}

function cloneMirroredPiece(feature, sectorIndex) {
  return {
    id: crypto.randomUUID(),
    catalogId: feature.catalogId,
    name: feature.name,
    type: feature.type,
    sizeClass: feature.sizeClass,
    xIn: mirrorX(feature.xIn),
    yIn: feature.yIn,
    wIn: feature.wIn,
    hIn: feature.hIn,
    passability: feature.passability,
    value: feature.value,
    usage: feature.usage,
    side: "enemy",
    sectorIndex
  };
}

function createFeatureFromCatalog(side, sectorIndex, entry) {
  const rect = getSectorRect(side, sectorIndex);
  const baseX = rect.xMin + SECTOR_WIDTH_IN * 0.5;
  const baseY = rect.yMin + SECTOR_HEIGHT_IN * 0.5;
  const jitterX = (Math.random() - 0.5) * 1.2;
  const jitterY = (Math.random() - 0.5) * 0.9;
  const margin = TERRAIN_EDGE_PADDING_IN + Math.max(entry.wIn, entry.hIn) * 0.5;

  return {
    id: crypto.randomUUID(),
    catalogId: entry.id,
    name: entry.name,
    type: entry.type,
    sizeClass: entry.sizeClass,
    xIn: clampToRect(baseX + jitterX, rect.xMin, rect.xMax, margin),
    yIn: clampToRect(baseY + jitterY, rect.yMin, rect.yMax, margin),
    wIn: entry.wIn,
    hIn: entry.hIn,
    passability: entry.passability,
    value: entry.value,
    usage: entry.usage,
    side,
    sectorIndex
  };
}

function getSideBounds(side) {
  if (side === "player") {
    return { xMin: 0, xMax: HALF_BOARD_IN };
  }

  return { xMin: HALF_BOARD_IN, xMax: BOARD_WIDTH_IN };
}

function getSectorIndexForPoint(side, xIn, yIn) {
  const sideBounds = getSideBounds(side);
  const xInside = xIn - sideBounds.xMin;
  const col = clamp(Math.floor((xInside / HALF_BOARD_IN) * SIDE_SECTOR_COLUMNS), 0, SIDE_SECTOR_COLUMNS - 1);
  const row = clamp(Math.floor((yIn / BOARD_HEIGHT_IN) * SIDE_SECTOR_ROWS), 0, SIDE_SECTOR_ROWS - 1);
  return row * SIDE_SECTOR_COLUMNS + col;
}

function createFeatureAt(side, entry, xIn, yIn, patch = {}) {
  const sideBounds = getSideBounds(side);
  const rawWIn = patch.wIn || entry.wIn;
  const rawHIn = patch.hIn || entry.hIn;
  const scale = Math.max(1, Number(patch.renderScale) || 1, Number(patch.hitScale) || 1);
  const margin = TERRAIN_EDGE_PADDING_IN + Math.max(rawWIn * scale, rawHIn * scale) * 0.5;
  const clampedX = clamp(xIn, sideBounds.xMin + margin, sideBounds.xMax - margin);
  const clampedY = clamp(yIn, margin, BOARD_HEIGHT_IN - margin);

  return {
    id: crypto.randomUUID(),
    catalogId: entry.id,
    name: patch.name || entry.name,
    type: patch.type || entry.type,
    sizeClass: patch.sizeClass || entry.sizeClass,
    xIn: clampedX,
    yIn: clampedY,
    wIn: patch.wIn || entry.wIn,
    hIn: patch.hIn || entry.hIn,
    passability: patch.passability ?? entry.passability,
    value: patch.value ?? entry.value,
    usage: patch.usage || entry.usage,
    side,
    sectorIndex: getSectorIndexForPoint(side, clampedX, clampedY),
  };
}

function createFeatureAtBoard(entry, xIn, yIn, patch = {}) {
  const rawWIn = patch.wIn || entry.wIn;
  const rawHIn = patch.hIn || entry.hIn;
  const scale = Math.max(1, Number(patch.renderScale) || 1, Number(patch.hitScale) || 1);
  const marginScale = patch.forcePlace ? 1 : scale;
  const margin = TERRAIN_EDGE_PADDING_IN + Math.max(rawWIn * marginScale, rawHIn * marginScale) * 0.5;
  const clampedX = clamp(xIn, margin, BOARD_WIDTH_IN - margin);
  const clampedY = clamp(yIn, margin, BOARD_HEIGHT_IN - margin);
  const side = clampedX < HALF_BOARD_IN ? "player" : "enemy";

  return {
    id: crypto.randomUUID(),
    catalogId: entry.id,
    name: patch.name || entry.name,
    type: patch.type || entry.type,
    sizeClass: patch.sizeClass || entry.sizeClass,
    xIn: clampedX,
    yIn: clampedY,
    wIn: patch.wIn || entry.wIn,
    hIn: patch.hIn || entry.hIn,
    passability: patch.passability ?? entry.passability,
    value: patch.value ?? entry.value,
    usage: patch.usage || entry.usage,
    side,
    sectorIndex: getSectorIndexForPoint(side, clampedX, clampedY),
  };
}

function parseMatchup(matchup) {
  const parts = matchup.split("-").map((value) => Number(value));
  const playerVariant = [1, 2, 3].includes(parts[0]) ? parts[0] : 2;
  const enemyVariant = [1, 2, 3].includes(parts[1]) ? parts[1] : 2;
  return { playerVariant, enemyVariant };
}

function choosePathMatchup() {
  const matchup = pickRandom(PATH_VARIANT_MATCHUPS);
  const parsed = parseMatchup(matchup);

  terrainPathProfile = {
    matchup,
    player: parsed.playerVariant,
    enemy: parsed.enemyVariant,
  };
}

function getVariantLabel(variant) {
  if (variant === 1) {
    return "1-Easy flank";
  }

  if (variant === 2) {
    return "2-Open mid";
  }

  return "3-Hard fortified";
}

function getVariantPlan(variant) {
  if (variant === 1) {
    return {
      name: "easy-flank",
      laneCenters: [0.2, 0.5, 0.8],
      laneWidths: [4.8, 2.7, 3.2],
      laneBlockBias: [0.28, 0.62, 0.48],
      connectorWidth: 2.1,
      connectorBias: 0.22,
    };
  }

  if (variant === 2) {
    return {
      name: "open-mid",
      laneCenters: [0.22, 0.5, 0.78],
      laneWidths: [3.3, 5.6, 3.3],
      laneBlockBias: [0.56, 0.2, 0.56],
      connectorWidth: 2.7,
      connectorBias: 0.16,
    };
  }

  return {
    name: "hard-fortified",
    laneCenters: [0.2, 0.5, 0.8],
    laneWidths: [2.5, 2.2, 2.5],
    laneBlockBias: [0.68, 0.78, 0.68],
    connectorWidth: 2.2,
    connectorBias: 0.24,
  };
}

function xOnSide(side, t) {
  if (side === "player") {
    return t * HALF_BOARD_IN;
  }

  return BOARD_WIDTH_IN - t * HALF_BOARD_IN;
}

function getOpenCorridorWeight(yIn, plan) {
  const centerYs = plan.laneCenters.map((norm) => norm * BOARD_HEIGHT_IN);
  let laneOpen = 0;

  for (let i = 0; i < centerYs.length; i++) {
    const center = centerYs[i];
    const width = plan.laneWidths[i];
    const dist = Math.abs(yIn - center);
    const gaussian = Math.exp(-((dist * dist) / (2 * width * width)));
    const openness = 1 - plan.laneBlockBias[i];
    laneOpen = Math.max(laneOpen, gaussian * openness);
  }

  let connectorOpen = 0;

  for (let i = 0; i < centerYs.length - 1; i++) {
    const connectorY = (centerYs[i] + centerYs[i + 1]) * 0.5;
    const dist = Math.abs(yIn - connectorY);
    const gaussian = Math.exp(-((dist * dist) / (2 * plan.connectorWidth * plan.connectorWidth)));
    connectorOpen = Math.max(connectorOpen, gaussian * (1 - plan.connectorBias));
  }

  return clamp(Math.max(laneOpen, connectorOpen), 0, 1);
}

function overlapsFeatureInList(xIn, yIn, wIn, hIn, list) {
  return list.some((feature) => {
    const footprint = getFeatureFootprint(feature);
    const overlapX = Math.abs(feature.xIn - xIn) < (footprint.wIn + wIn) * 0.52;
    const overlapY = Math.abs(feature.yIn - yIn) < (footprint.hIn + hIn) * 0.52;
    return overlapX && overlapY;
  });
}

function buildSideBlockingFeatures(side, variant) {
  const plan = getVariantPlan(variant);
  const largePool = TERRAIN_CATALOG.large.filter((entry) => entry.passability === 0);
  const smallPool = TERRAIN_CATALOG.small.filter((entry) => entry.passability === 0);
  const sideBounds = getSideBounds(side);
  const pieces = [];
  const largeCandidates = variant === 3
    ? largePool.filter((entry) => entry.type !== "fortress")
    : largePool;
  const targets = [
    ...pickManyUnique(largeCandidates, terrainGenerationConfig.largePerSide),
    ...pickManyUnique(smallPool, terrainGenerationConfig.smallPerSide),
  ];

  for (const entry of targets) {
    let placed = false;

    for (let attempt = 0; attempt < 70 && !placed; attempt++) {
      const xIn = clamp(
        sideBounds.xMin + 1 + Math.random() * (HALF_BOARD_IN - 2),
        sideBounds.xMin + 1,
        sideBounds.xMax - 1
      );
      const yIn = clamp(1 + Math.random() * (BOARD_HEIGHT_IN - 2), 1, BOARD_HEIGHT_IN - 1);
      const openness = getOpenCorridorWeight(yIn, plan);
      const blockingChance = entry.sizeClass === "large"
        ? 0.55 * (1 - openness)
        : 0.72 * (1 - openness * 0.92);

      if (Math.random() > blockingChance) {
        continue;
      }

      if (overlapsFeatureInList(xIn, yIn, entry.wIn, entry.hIn, pieces)) {
        continue;
      }

      pieces.push(createFeatureAt(side, entry, xIn, yIn));
      placed = true;
    }

    if (!placed) {
      const fallbackX = sideBounds.xMin + HALF_BOARD_IN * (0.2 + Math.random() * 0.6);
      const fallbackY = BOARD_HEIGHT_IN * (0.18 + Math.random() * 0.64);
      pieces.push(createFeatureAt(side, entry, fallbackX, fallbackY));
    }
  }

  return pieces;
}

function overlapsBlockingFeature(xIn, yIn, wIn, hIn, side) {
  return terrainFeatures.some((feature) => {
    if (feature.side !== side || feature.passability > 0) {
      return false;
    }

    const footprint = getFeatureFootprint(feature);
    const overlapX = Math.abs(feature.xIn - xIn) < (footprint.wIn + wIn) * 0.48;
    const overlapY = Math.abs(feature.yIn - yIn) < (footprint.hIn + hIn) * 0.48;
    return overlapX && overlapY;
  });
}

function buildSideDecorFeatures(side, variant, count) {
  const decor = [];
  const plan = getVariantPlan(variant);
  const sideBounds = getSideBounds(side);

  for (let i = 0; i < count * 3 && decor.length < count; i++) {
    const xIn = sideBounds.xMin + 0.6 + Math.random() * (HALF_BOARD_IN - 1.2);
    const yIn = 0.6 + Math.random() * (BOARD_HEIGHT_IN - 1.2);
    const openness = getOpenCorridorWeight(yIn, plan);
    const sizeBase = 0.7 + Math.random() * 1.1;
    const entry = {
      id: `decor-${side}-${variant}-${decor.length}`,
      name: "Dekoracja terenu",
      type: openness > 0.45 ? "ruins" : "barricade",
      sizeClass: "decor",
      wIn: sizeBase,
      hIn: sizeBase * (0.72 + Math.random() * 0.46),
      passability: 2,
      value: 0,
      usage: "Dekoracja: przechodnia, poprawia czytelnosc mapy.",
    };

    const targetX = clamp(xIn, sideBounds.xMin + 0.7, sideBounds.xMax - 0.7);
    const targetY = clamp(yIn, 0.7, BOARD_HEIGHT_IN - 0.7);

    if (overlapsBlockingFeature(targetX, targetY, entry.wIn, entry.hIn, side)) {
      continue;
    }

    if (overlapsFeatureInList(targetX, targetY, entry.wIn, entry.hIn, decor)) {
      continue;
    }

    decor.push(createFeatureAt(side, entry, targetX, targetY, {
      passability: 2,
      value: 0,
      sizeClass: "decor",
      usage: "Dekoracja przechodnia (nie blokuje ruchu).",
    }));
  }

  return decor;
}

function generateTerrainBySectors() {
  terrainFeatures = [];
  terrainPathProfile = { matchup: "predef", player: 2, enemy: 2 };

  const houseEntry = {
    id: "house-fort",
    name: "Domek lesny",
    type: "fortress",
    sizeClass: "large",
    wIn: 1.3,
    hIn: 1.0,
    passability: 2,
    value: 6,
    usage: "Domek w centrum lasu.",
  };

  const treeEntry = {
    id: "forest-tree-block",
    name: "Gesty zagajnik",
    type: "ruins",
    sizeClass: "small",
    wIn: 2.2,
    hIn: 2.2,
    passability: 0,
    value: 3,
    usage: "Zageszczone drzewa blokujace przejscie.",
  };

  const rockEntry = {
    id: "forest-rock-block",
    name: "Skaly i pnie",
    type: "barricade",
    sizeClass: "small",
    wIn: 2.6,
    hIn: 1.05,
    passability: 0,
    value: 2,
    usage: "Niska przeszkoda skalna.",
  };

  const blockingPlacements = [
    {
      entry: houseEntry,
      xIn: PREDEFINED_HOUSE_A.xIn,
      yIn: PREDEFINED_HOUSE_A.yIn,
      patch: { passability: 2, renderScale: 67.5, hitScale: 67.5, visualHint: "house01", forcePlace: true },
    },
    {
      entry: houseEntry,
      xIn: PREDEFINED_HOUSE_B.xIn,
      yIn: PREDEFINED_HOUSE_B.yIn,
      patch: { passability: 2, renderScale: 67.5, hitScale: 67.5, visualHint: "house02", forcePlace: true },
    },
  ];

  for (const placement of blockingPlacements) {
    const patch = placement.patch || {};
    const defaultScale = placement.entry.type === "fortress" ? 5 : 3;
    const hitScale = Number(patch.hitScale) || defaultScale;
    const scaledWIn = (patch.wIn || placement.entry.wIn) * hitScale;
    const scaledHIn = (patch.hIn || placement.entry.hIn) * hitScale;
    const patchWithScale = {
      renderScale: Number(patch.renderScale) || defaultScale,
      hitScale,
      ...patch,
    };

    if (!patch.forcePlace && overlapsFeatureInList(placement.xIn, placement.yIn, scaledWIn, scaledHIn, terrainFeatures)) {
      continue;
    }

    terrainFeatures.push(createFeatureAtBoard(placement.entry, placement.xIn, placement.yIn, patchWithScale));
  }

  const randomPools = [
    { entry: treeEntry, count: 12, scale: 3 },
    { entry: rockEntry, count: 4, scale: 2 },
  ];

  const centerClearRadius = 3.2;

  for (const pool of randomPools) {
    for (let i = 0; i < pool.count; i++) {
      for (let attempt = 0; attempt < 120; attempt++) {
        const xIn = 2 + Math.random() * (BOARD_WIDTH_IN - 4);
        const yIn = 2 + Math.random() * (BOARD_HEIGHT_IN - 4);

        if (Math.hypot(xIn - PREDEFINED_CENTER_OBJECTIVE.xIn, yIn - PREDEFINED_CENTER_OBJECTIVE.yIn) < centerClearRadius) {
          continue;
        }

        if (Math.hypot(xIn - PREDEFINED_HOUSE_A.xIn, yIn - PREDEFINED_HOUSE_A.yIn) < 3.8) {
          continue;
        }

        if (Math.hypot(xIn - PREDEFINED_HOUSE_B.xIn, yIn - PREDEFINED_HOUSE_B.yIn) < 3.8) {
          continue;
        }

        const scaledWIn = pool.entry.wIn * pool.scale;
        const scaledHIn = pool.entry.hIn * pool.scale;

        if (overlapsFeatureInList(xIn, yIn, scaledWIn, scaledHIn, terrainFeatures)) {
          continue;
        }

        terrainFeatures.push(createFeatureAtBoard(pool.entry, xIn, yIn, {
          passability: pool.entry.passability,
          value: pool.entry.value,
          sizeClass: pool.entry.sizeClass,
          renderScale: pool.scale,
          hitScale: pool.scale,
        }));
        break;
      }
    }
  }

  applyFeatureVisualProfiles();
}

function isPointInsideFeature(xIn, yIn, feature, extraPadding = 0) {
  const footprint = getFeatureFootprint(feature);
  const offsetXIn = Number(feature.hitOffsetXIn) || 0;
  const offsetYIn = Number(feature.hitOffsetYIn) || 0;
  const centerX = feature.xIn + offsetXIn;
  const centerY = feature.yIn + offsetYIn;

  if (feature.hitShape === "circle") {
    const radiusIn = Math.max(0.05, Number(feature.hitRadiusIn) || Math.min(footprint.wIn, footprint.hIn) * 0.5);
    return Math.hypot(xIn - centerX, yIn - centerY) <= radiusIn + extraPadding;
  }

  if (feature.hitShape === "ellipse") {
    const rx = Math.max(0.05, footprint.wIn / 2 + extraPadding);
    const ry = Math.max(0.05, footprint.hIn / 2 + extraPadding);
    const nx = (xIn - centerX) / rx;
    const ny = (yIn - centerY) / ry;
    return nx * nx + ny * ny <= 1;
  }

  const halfW = footprint.wIn / 2 + extraPadding;
  const halfH = footprint.hIn / 2 + extraPadding;

  if (feature.type === "fortress") {
    const inOuter = xIn >= centerX - halfW && xIn <= centerX + halfW && yIn >= centerY - halfH && yIn <= centerY + halfH;

    if (!inOuter) {
      return false;
    }

    const wallIn = 0.45;
    const innerHalfW = Math.max(0, halfW - wallIn);
    const innerHalfH = Math.max(0, halfH - wallIn);
    const inInner = xIn >= centerX - innerHalfW && xIn <= centerX + innerHalfW && yIn >= centerY - innerHalfH && yIn <= centerY + innerHalfH;

    return !inInner;
  }

  return xIn >= centerX - halfW && xIn <= centerX + halfW && yIn >= centerY - halfH && yIn <= centerY + halfH;
}

function isPointBlockedByTerrain(xIn, yIn, extraPadding = 0) {
  return terrainFeatures.some((feature) => feature.passability <= 0 && isPointInsideFeature(xIn, yIn, feature, extraPadding));
}

function isPointBlockedByObjectives(xIn, yIn, extraPadding = 0) {
  return objectives.some((objective) => Math.hypot(objective.xIn - xIn, objective.yIn - yIn) <= OBJECTIVE_RADIUS_IN + extraPadding);
}

function isPointBlockedByUnits(xIn, yIn, ignoreUnit = null) {
  return units.some((unit) => {
    if (unit === ignoreUnit) {
      return false;
    }

    return Math.hypot(unit.xIn - xIn, unit.yIn - yIn) < MIN_GAP_IN;
  });
}

function isPointBlockedByUnitsWithList(xIn, yIn, ignoreUnits = []) {
  return units.some((unit) => {
    if (ignoreUnits.includes(unit)) {
      return false;
    }

    return Math.hypot(unit.xIn - xIn, unit.yIn - yIn) < MIN_GAP_IN;
  });
}

function getPathBlockInfo(startX, startY, endX, endY, ignoreUnits = []) {
  const dist = Math.hypot(endX - startX, endY - startY);

  if (dist <= 0.001) {
    return { blocked: false, reason: "none" };
  }

  const steps = Math.max(2, Math.ceil(dist / PATH_SAMPLE_STEP_IN));

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const xIn = startX + (endX - startX) * t;
    const yIn = startY + (endY - startY) * t;

    if (isPointBlockedByTerrain(xIn, yIn, UNIT_RADIUS_IN * 0.6)) {
      return { blocked: true, reason: "terrain" };
    }

    if (isPointBlockedByObjectives(xIn, yIn, UNIT_RADIUS_IN * 0.35)) {
      return { blocked: true, reason: "objective" };
    }

    if (isPointBlockedByUnitsWithList(xIn, yIn, ignoreUnits)) {
      return { blocked: true, reason: "unit" };
    }
  }

  return { blocked: false, reason: "none" };
}

function hasClearLineOfFire(attacker, target) {
  const dx = target.xIn - attacker.xIn;
  const dy = target.yIn - attacker.yIn;
  const dist = Math.hypot(dx, dy);

  if (dist <= 0.001) {
    return true;
  }

  const steps = Math.max(2, Math.ceil(dist / PATH_SAMPLE_STEP_IN));

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const xIn = attacker.xIn + dx * t;
    const yIn = attacker.yIn + dy * t;

    const terrainBlocked = terrainFeatures.some((feature) => isPointInsideFeature(xIn, yIn, feature, UNIT_RADIUS_IN * 0.2));

    if (terrainBlocked) {
      return false;
    }

    const objectiveBlocked = objectives.some((objective) => Math.hypot(objective.xIn - xIn, objective.yIn - yIn) <= OBJECTIVE_RADIUS_IN * 0.85);

    if (objectiveBlocked) {
      return false;
    }

    const unitBlocked = units.some((unit) => {
      if (unit === attacker || unit === target || unit.hp <= 0) {
        return false;
      }

      return Math.hypot(unit.xIn - xIn, unit.yIn - yIn) <= UNIT_RADIUS_IN * 0.9;
    });

    if (unitBlocked) {
      return false;
    }
  }

  return true;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function animateUnitMovement(unit, targetX, targetY) {
  const startX = unit.xIn;
  const startY = unit.yIn;
  const dist = Math.hypot(targetX - startX, targetY - startY);
  const duration = Math.max(140, Math.round(dist * MOVE_ANIMATION_MS_PER_IN));

  isAnimating = true;

  return new Promise((resolve) => {
    const t0 = performance.now();

    function tick(now) {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / duration);
      const k = easeInOutQuad(t);

      unit.xIn = startX + (targetX - startX) * k;
      unit.yIn = startY + (targetY - startY) * k;
      render();

      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }

      unit.xIn = targetX;
      unit.yIn = targetY;
      isAnimating = false;
      render();
      resolve();
    }

    requestAnimationFrame(tick);
  });
}

function findClosestFreePoint(targetX, targetY, ignoreUnit = null) {
  for (let radius = 0; radius <= 4.5; radius += 0.35) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 10) {
      const xIn = clamp(targetX + Math.cos(angle) * radius, UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN);
      const yIn = clamp(targetY + Math.sin(angle) * radius, UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN);

      if (isPointBlockedByTerrain(xIn, yIn, UNIT_RADIUS_IN * 0.6)) {
        continue;
      }

      if (isPointBlockedByUnits(xIn, yIn, ignoreUnit)) {
        continue;
      }

      if (isPointBlockedByObjectives(xIn, yIn, UNIT_RADIUS_IN * 0.25)) {
        continue;
      }

      return { xIn, yIn };
    }
  }

  return {
    xIn: clamp(targetX, UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN),
    yIn: clamp(targetY, UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN)
  };
}

function getTerrainPoints(side) {
  return terrainFeatures.filter((feature) => feature.side === side).reduce((sum, feature) => sum + feature.value, 0);
}

function getTerrainCounts(side) {
  return terrainFeatures
    .filter((feature) => feature.side === side)
    .reduce((acc, feature) => {
      if (feature.sizeClass === "large") {
        acc.large += 1;
      } else if (feature.sizeClass === "small") {
        acc.small += 1;
      } else {
        acc.decor += 1;
      }

      return acc;
    }, { large: 0, small: 0, decor: 0 });
}

function getDistanceInches(a, b) {
  const dx = a.xIn - b.xIn;
  const dy = a.yIn - b.yIn;
  return Math.hypot(dx, dy);
}

function countEnemyUnitsInRange(unit, rangeIn) {
  return units.filter((other) => {
    if (other === unit || other.side === unit.side || other.hp <= 0) {
      return false;
    }

    return getDistanceInches(unit, other) <= rangeIn;
  }).length;
}

function getFeatureRenderSize(feature) {
  const scale = Math.max(1, Number(feature.renderScale) || 1);
  return {
    wIn: feature.renderWIn || feature.wIn * scale,
    hIn: feature.renderHIn || feature.hIn * scale,
  };
}

function getFeatureFootprint(feature) {
  const scale = Math.max(1, Number(feature.hitScale) || 1);
  return {
    wIn: feature.hitWIn || feature.wIn * scale,
    hIn: feature.hitHIn || feature.hIn * scale,
  };
}

function applyFeatureVisualProfile(feature) {
  feature.renderWIn = feature.wIn;
  feature.renderHIn = feature.hIn;
  feature.hitWIn = feature.wIn;
  feature.hitHIn = feature.hIn;
  feature.hitShape = "box";
  feature.hitRadiusIn = 0;
  feature.hitOffsetXIn = 0;
  feature.hitOffsetYIn = 0;
  const defaultScale = feature.type === "fortress" ? 5 : 3;
  const renderScale = clamp(Number(feature.renderScale) || defaultScale, 0.3, 40);
  const hitScale = clamp(Number(feature.hitScale) || defaultScale, 0.3, 40);

  if (!terrainAssetsReady || !window.TerrainAssets || typeof window.TerrainAssets.pickVisual !== "function") {
    return;
  }

  const visual = window.TerrainAssets.pickVisual(feature);

  if (!visual) {
    return;
  }

  const baseArea = Math.max(0.25, feature.wIn * feature.hIn);
  const visualRenderMul = clamp(Number(visual.renderScaleMul) || 1, 0.2, 10);
  const visualHitMul = clamp(Number(visual.hitScaleMul) || 1, 0.2, 10);
  const solidWNorm = clamp(visual.solidWNorm ?? visual.cutWNorm ?? 1, 0.12, 1);
  const solidHNorm = clamp(visual.solidHNorm ?? visual.cutHNorm ?? 1, 0.12, 1);
  const solidAreaRatio = clamp(visual.solidAreaRatio ?? (solidWNorm * solidHNorm), 0.18, 1);
  const aspect = clamp((visual.widthRatio || (solidWNorm / Math.max(0.01, solidHNorm))), 0.35, 4.5);

  const renderAreaScale = clamp(0.4 + solidAreaRatio * 0.9, 0.42, 1);
  const hitAreaScale = clamp(0.25 + solidAreaRatio * 0.8, 0.3, 1);
  const renderArea = baseArea * renderAreaScale;
  const hitArea = baseArea * hitAreaScale;

  const renderWIn = Math.sqrt(renderArea * aspect);
  const renderHIn = renderArea / Math.max(0.1, renderWIn);
  const hitWIn = Math.sqrt(hitArea * aspect);
  const hitHIn = hitArea / Math.max(0.1, hitWIn);

  feature.renderWIn = clamp(renderWIn * renderScale * visualRenderMul, 0.45, 30);
  feature.renderHIn = clamp(renderHIn * renderScale * visualRenderMul, 0.45, 30);
  feature.hitWIn = clamp(hitWIn * hitScale * visualHitMul, 0.35, 24);
  feature.hitHIn = clamp(hitHIn * hitScale * visualHitMul, 0.35, 24);

  const tag = `${feature.catalogId || ""} ${feature.id || ""} ${feature.name || ""}`.toLowerCase();
  const isTree = tag.includes("tree") || tag.includes("zagajnik") || tag.includes("forest-tree");
  const isRock = tag.includes("rock") || tag.includes("skaly") || tag.includes("glaz") || tag.includes("kamien");

  if (isTree) {
    // Tree collision is only the trunk; canopy is walkable.
    const trunkRadius = Math.max(0.24, Math.min(feature.renderWIn, feature.renderHIn) * 0.16);
    feature.hitShape = "circle";
    feature.hitRadiusIn = trunkRadius;
    feature.hitWIn = trunkRadius * 2;
    feature.hitHIn = trunkRadius * 2;
    feature.hitOffsetYIn = Math.max(0.12, feature.renderHIn * 0.22);
    return;
  }

  if (isRock) {
    // Rock blocks movement with a tighter, rounded footprint.
    feature.hitShape = "ellipse";
    feature.hitWIn = Math.max(0.45, feature.hitWIn * 0.72);
    feature.hitHIn = Math.max(0.4, feature.hitHIn * 0.66);
  }
}

function applyFeatureVisualProfiles() {
  terrainFeatures.forEach((feature) => applyFeatureVisualProfile(feature));
}

async function tryMoveSelected(xIn, yIn, moveLimit, actionChannel) {
  if (isAnimating) {
    return;
  }

  const dist = Math.hypot(selected.xIn - xIn, selected.yIn - yIn);

  if (!canUseAction(actionChannel)) {
    setStatus("Ta akcja w tej turze jest juz wykorzystana albo brak AP.");
    return;
  }

  if (dist > moveLimit) {
    setStatus(`Za daleko. Limit ruchu tej akcji: ${moveLimit}".`);
    return;
  }

  const pathBlock = getPathBlockInfo(selected.xIn, selected.yIn, xIn, yIn, [selected]);

  if (pathBlock.blocked) {
    if (pathBlock.reason === "terrain") {
      setStatus("Sciezka ruchu jest zablokowana przez teren.");
    } else if (pathBlock.reason === "objective") {
      setStatus("Sciezka ruchu przecina ognisko - nie mozna wejsc na punkt.");
    } else {
      setStatus("Sciezka ruchu jest zablokowana przez inna jednostke.");
    }
    return;
  }

  const enemyNearbyBefore = countEnemyUnitsInRange(selected, ENGAGEMENT_RANGE_IN) > 0;
  await animateUnitMovement(selected, xIn, yIn);

  if (!spendAction(actionChannel)) {
    setStatus("Nie udalo sie zuzyc AP tej akcji.");
    return;
  }

  const enemyNearbyAfter = countEnemyUnitsInRange(selected, ENGAGEMENT_RANGE_IN) > 0;

  if (enemyNearbyBefore && !enemyNearbyAfter) {
    actionState.disengaged = true;
    actionState.moveUsed = true;
    actionState.bonusUsed = true;
    setStatus(`Ruch wykonany: ${dist.toFixed(1)}". Wyjscie z zasiegu ${ENGAGEMENT_RANGE_IN}\" przeciwnika: brak kolejnej akcji ruchu i brak szarzy w tej aktywacji.`);
    selected = null;
    render();
    maybeAutoEndTurn();
    return;
  }

  setStatus(`Ruch wykonany: ${dist.toFixed(1)}".`);
  selected = null;
  render();
  maybeAutoEndTurn();
}

async function onUnitClick(unit) {
  if (deploymentState && deploymentState.active) {
    return;
  }

  if (isAnimating) {
    return;
  }

  if (activeSide !== "player" || enemyTurnInProgress) {
    return;
  }

  if (!selected) {
    if (unit.side === "player") {
      if (isUnitActivatedThisRound(unit)) {
        setStatus("Ta jednostka byla juz aktywowana w tej rundzie.");
        return;
      }

      if (currentActivationUnit && currentActivationUnit !== unit) {
        setStatus("W tej turze aktywujesz tylko jedna jednostke.");
        return;
      }

      if (!currentActivationUnit) {
        currentActivationUnit = unit;
        resetActionState();
      }
      selected = unit;
      setStatus(`Wybrano ${unit.type}. Ruch: ${unit.move}", bron melee: ${unit.weapon.range}".`);
      render();
    }
    return;
  }

  if (unit === selected) {
    selected = null;
    setStatus("Odznaczono jednostke.");
    render();
    return;
  }

  if (unit.side === "player") {
    if (currentActivationUnit && currentActivationUnit !== unit) {
      setStatus("Nie mozna zmienic aktywowanej jednostki w tej turze.");
      return;
    }

    if (isUnitActivatedThisRound(unit)) {
      setStatus("Ta jednostka byla juz aktywowana w tej rundzie.");
      return;
    }

    selected = unit;
    setStatus(`Przelaczono na ${unit.type}. Ruch: ${unit.move}", bron melee: ${unit.weapon.range}".`);
    render();
    return;
  }

  if (actionMode !== "attack" && actionMode !== "shoot") {
    setStatus("Aby zaatakowac, wybierz przycisk broni na pasku akcji.");
    return;
  }

  if (actionMode === "shoot") {
    const selectedWeapon = getSelectedActionWeapon(selected);
    const rangedWeapon = selectedWeapon && (Number(selectedWeapon.range) || 1) > 1
      ? selectedWeapon
      : getRangedWeaponForUnit(selected);

    if (!rangedWeapon) {
      setStatus("Ta bron nie jest dystansowa. Wybierz tryb 'Atak main'.");
      return;
    }

    if (!canUseAction("shoot")) {
      setStatus("Akcja strzalu jest juz wykorzystana albo brak AP.");
      return;
    }

    const shot = performStandardAttack(selected, unit, {
      consumeMainAction: true,
      consumeActionChannel: "shoot",
      allowOnlyPlayer: true,
      requireRanged: true,
      maxRangeIn: rangedWeapon.range,
      weaponId: rangedWeapon.id,
      movementState: {
        moved: Boolean(actionState.moveUsed),
        charged: Boolean(actionState.charged),
        fellBack: Boolean(actionState.disengaged),
        dashed: Boolean(actionState.bonusUsed && !actionState.moveUsed),
      },
    });

    if (!shot) {
      return;
    }

    selected = null;
    render();
    maybeAutoEndTurn();
    return;
  }

  if (!canUseAction("main")) {
    setStatus("Main akcja jest juz wykorzystana albo brak AP.");
    return;
  }

  const movedThisActivation = actionState.moveUsed;
  const chargeLockedByDisengage = Boolean(actionState.disengaged);
  const selectedWeapon = getSelectedActionWeapon(selected);
  const meleeWeapon = selectedWeapon && (Number(selectedWeapon.range) || 1) <= 1
    ? selectedWeapon
    : getMeleeWeaponForUnit(selected);

  if (!meleeWeapon) {
    setStatus("Ta jednostka nie ma broni wręcz, nie moze wykonac szarzy ani ataku wręcz.");
    return;
  }

  if (!canAttemptChargeNow()) {
    const attacked = performStandardAttack(selected, unit, {
      consumeMainAction: true,
      consumeActionChannel: "main",
      allowOnlyPlayer: true,
      requireMelee: true,
      maxRangeIn: MELEE_RANGE_IN,
      weaponId: meleeWeapon.id,
    });

    if (!attacked) {
      if (chargeLockedByDisengage) {
        setStatus(`Po wyjsciu z zasiegu ${ENGAGEMENT_RANGE_IN}" nie mozesz szarzowac. Atak wrecz nieudany.`);
      } else if (movedThisActivation) {
        setStatus("Po zwyklym ruchu nie mozesz szarzowac. Atak wrecz nieudany.");
      } else {
        setStatus("Szarza wymaga braku wczesniejszych akcji w tej aktywacji. Atak wrecz nieudany.");
      }
      return;
    }

    selected = null;
    render();
    maybeAutoEndTurn();
    return;
  }

  const charged = await performChargeAttack(selected, unit, { consumeMainAction: true, allowOnlyPlayer: true, weaponId: meleeWeapon.id });

  if (!charged) {
    return;
  }

  actionState.charged = true;

  selected = null;
  render();
  maybeAutoEndTurn();
}

function onObjectiveClick(objective) {
  if (deploymentState && deploymentState.active) {
    return;
  }

  if (activeSide !== "player" || enemyTurnInProgress) {
    return;
  }

  if (!selected || selected.side !== "player") {
    setStatus("Najpierw wybierz swoja jednostke.");
    return;
  }

  if (actionMode !== "capture") {
    setStatus("Aby przejac cel, przelacz tryb na 'Przejecie celu main'.");
    return;
  }

  if (!canUseAction("main")) {
    setStatus("Main akcja jest juz wykorzystana albo brak AP.");
    return;
  }

  const dist = Math.hypot(selected.xIn - objective.xIn, selected.yIn - objective.yIn);
  const captureCenterRange = OBJECTIVE_RADIUS_IN + OBJECTIVE_CAPTURE_RANGE_IN;

  if (dist > captureCenterRange) {
    setStatus(`Za daleko od celu. Potrzeba <= ${OBJECTIVE_CAPTURE_RANGE_IN}\", jest ${dist.toFixed(1)}\".`);
    return;
  }

  objective.owner = "player";
  spendAction("main");
  setStatus("Cel przejety akcja glowna.");
  selected = null;
  render();
  maybeAutoEndTurn();
}

function applyCampfireHealing() {
  const reports = [];

  objectives.forEach((objective) => {
    if (objective.owner !== "player" && objective.owner !== "enemy") {
      return;
    }

    let healedCount = 0;
    let healedTotal = 0;

    units.forEach((unit) => {
      if (unit.side !== objective.owner || unit.hp <= 0) {
        return;
      }

      const dist = Math.hypot(unit.xIn - objective.xIn, unit.yIn - objective.yIn);

      if (dist > OBJECTIVE_HEAL_RANGE_IN) {
        return;
      }

      const before = unit.hp;
      const recoverCap = Math.max(0, Number(unit.maxRecoverableHp) || Number(unit.maxHp) || 0);
      unit.hp = Math.min(recoverCap, unit.hp + OBJECTIVE_HEAL_AMOUNT);
      const healed = unit.hp - before;

      unit.currentModels = getUnitCurrentModels(unit);

      if (healed > 0) {
        healedCount += 1;
        healedTotal += healed;
      }
    });

    if (healedTotal > 0) {
      const sideLabel = objective.owner === "player" ? "Twoje" : "Enemy";
      reports.push(`${sideLabel} ognisko leczy +${healedTotal} HP (${healedCount} jednostki w zasiegu ${OBJECTIVE_HEAL_RANGE_IN}\").`);
    }
  });

  return reports;
}

function findChargePosition(attacker, target) {
  const baseAngle = Math.atan2(attacker.yIn - target.yIn, attacker.xIn - target.xIn);

  for (let step = 0; step < 24; step++) {
    const offset = (Math.PI / 12) * step;
    const candidates = step === 0 ? [baseAngle] : [baseAngle + offset, baseAngle - offset];

    for (const angle of candidates) {
      const xIn = clamp(target.xIn + Math.cos(angle) * MELEE_RANGE_IN, UNIT_RADIUS_IN, BOARD_WIDTH_IN - UNIT_RADIUS_IN);
      const yIn = clamp(target.yIn + Math.sin(angle) * MELEE_RANGE_IN, UNIT_RADIUS_IN, BOARD_HEIGHT_IN - UNIT_RADIUS_IN);

      const blocked = units.some((unit) => {
        if (unit === attacker || unit === target) {
          return false;
        }

        return Math.hypot(unit.xIn - xIn, unit.yIn - yIn) < MIN_GAP_IN;
      });

      if (!blocked && !isPointBlockedByTerrain(xIn, yIn, UNIT_RADIUS_IN * 0.6)) {
        return { xIn, yIn };
      }
    }
  }

  return null;
}

function parseHitValue(hitText) {
  return Number(String(hitText).replace("+", ""));
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollPool(pool, threshold) {
  const rolls = [];
  let successes = 0;

  for (let i = 0; i < pool; i++) {
    const roll = rollD6();
    rolls.push(roll);

    if (roll >= threshold) {
      successes++;
    }
  }

  return { rolls, successes, threshold };
}

function formatRollDebug(label, result) {
  return `${label}: [${result.rolls.join(", ")}] vs ${result.threshold}+ => ${result.successes} sukcesow`;
}

function debugFightConsole(attacker, defender, debug) {
  if (!DEBUG_COMBAT) {
    return;
  }

  console.groupCollapsed(`FIGHT | ${attacker.type} -> ${defender.type}`);
  console.log(formatRollDebug("ATK roll", debug.attackRoll));
  console.log(formatRollDebug("DEF save", debug.defenderSaveRoll));
  console.log("Sukcesy save obroncy:", debug.defenderSaveSuccess);
  console.log("Zablokowane przez obronce:", debug.blockedByDefender);
  console.log("Przeszle trafienia:", debug.damageHits, "| obrazenia:", debug.damageToDefender);
  console.log(formatRollDebug("COUNTER roll", debug.counterRoll));
  console.log(formatRollDebug("ATK save", debug.attackerSaveRoll));
  console.log("Sukcesy save atakujacego:", debug.attackerSaveSuccess);
  console.log("Zablokowane przez atakujacego:", debug.blockedByAttacker);
  console.log("Przeszle trafienia kontry:", debug.counterDamageHits, "| obrazenia:", debug.damageToAttacker);
  console.log(`HP attacker: ${debug.attackerHpBefore} -> ${attacker.hp}`);
  console.log(`HP defender: ${debug.defenderHpBefore} -> ${defender.hp}`);
  console.groupEnd();
}

function resolveFightExchange(attacker, defender, modifiers = {}) {
  if (!window.CombatSystem || typeof window.CombatSystem.resolveFightExchange !== "function") {
    return [];
  }

  return window.CombatSystem.resolveFightExchange(attacker, defender, modifiers);
}

function cleanupDeadUnits() {
  if (currentActivationUnit && currentActivationUnit.hp <= 0) {
    currentActivationUnit = null;
  }

  if (selected && selected.hp <= 0) {
    selected = null;
  }

  units = units.filter((unit) => unit.hp > 0);
}

function pushCombatLog(lines, title = "Raport", tone = "neutral") {
  const normalized = (Array.isArray(lines) ? lines : [lines])
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);

  if (!normalized.length) {
    return;
  }

  combatLogEntries.unshift({
    id: crypto.randomUUID(),
    title,
    tone,
    lines: normalized,
    time: new Date(),
  });

  if (combatLogEntries.length > 18) {
    combatLogEntries.length = 18;
  }
}

function renderCombatLog() {
  const list = document.getElementById("combatLogList");

  if (!list) {
    return;
  }

  if (!combatLogEntries.length) {
    list.innerHTML = '<div class="combat-log-empty">Brak wpisow. Pierwsze starcie pojawi sie tutaj.</div>';
    return;
  }

  list.innerHTML = combatLogEntries.map((entry) => {
    const hh = String(entry.time.getHours()).padStart(2, "0");
    const mm = String(entry.time.getMinutes()).padStart(2, "0");
    const lines = entry.lines.map((line) => `<li>${line}</li>`).join("");

    return `
      <article class="combat-log-entry combat-log-entry--${entry.tone}">
        <div class="combat-log-headline">
          <strong>${entry.title}</strong>
          <span>${hh}:${mm}</span>
        </div>
        <ul>${lines}</ul>
      </article>
    `;
  }).join("");
}

function setStatus(message, options = {}) {
  document.getElementById("status").innerText = message;

  if (options.log) {
    const tone = options.tone || "neutral";
    const title = options.title || "Status";
    pushCombatLog([message], title, tone);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getHoverCardRoot() {
  return document.getElementById("unitHoverCard");
}

function getWeaponKeywordsDisplay(weapon) {
  if (!weapon) {
    return "-";
  }

  const list = Array.isArray(weapon.abilities) ? weapon.abilities : [];
  return list.length ? list.join(", ") : "-";
}

function buildDatasheetCardHtml(unit, options = {}) {
  const { showSide = false } = options;
  const maxModels = Math.max(1, Number(unit.squadSize) || 1);
  const currentModels = getUnitCurrentModels(unit);
  const allWeapons = getAllUnitWeapons(unit);
  const maxWeaponRange = allWeapons.length
    ? Math.max(...allWeapons.map((entry) => Number(entry.range) || 1))
    : 1;
  const headerMeta = showSide
    ? `${String(unit.side || "").toUpperCase()} | ${String(unit.type || "").toUpperCase()}`
    : String(unit.type || "").toUpperCase();

  return `
    <article class="unit-card unit-card--datasheet selected-card">
      <div class="datasheet-head">
        <div>
          <div class="unit-name">${getUnitLabel(unit)}</div>
          <div class="unit-type">${headerMeta}</div>
        </div>
        <div class="datasheet-stats">
          <div class="stat-chip"><span>APL</span><strong>${unit.apl}</strong></div>
          <div class="stat-chip"><span>MOVE</span><strong>${unit.move}"</strong></div>
          <div class="stat-chip"><span>SAVE</span><strong>${unit.armor.save}</strong></div>
          <div class="stat-chip"><span>WOUNDS</span><strong>${unit.hp}</strong></div>
        </div>
      </div>
      <div class="datasheet-subline">SQD ${currentModels}/${maxModels} | HP/MAX ${unit.hp}/${unit.maxHp} | WR ${maxWeaponRange}" | ARMOR ${unit.armor.name}</div>
      <div class="datasheet-table-wrap">
        <table class="datasheet-table">
          <thead>
            <tr><th>NAME</th><th>ATK</th><th>HIT</th><th>DMG</th><th>WR</th><th>KEYWORDS</th></tr>
          </thead>
          <tbody>
            ${allWeapons.map((weapon) => `
              <tr>
                <td>${weapon.name}</td>
                <td>${getSquadAttackDice(weapon.attacks, maxModels)}</td>
                <td>${weapon.hit}</td>
                <td>${weapon.damage}</td>
                <td>${weapon.range}"</td>
                <td>${getWeaponKeywordsDisplay(weapon)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function updateHoverCardPosition(clientX, clientY) {
  const card = getHoverCardRoot();

  if (!card || card.style.display !== "block") {
    return;
  }

  const offset = 16;
  const width = card.offsetWidth || 280;
  const height = card.offsetHeight || 180;
  const maxX = window.innerWidth - width - 8;
  const maxY = window.innerHeight - height - 8;
  const x = clamp(clientX + offset, 8, Math.max(8, maxX));
  const y = clamp(clientY + offset, 8, Math.max(8, maxY));

  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
}

function buildHoverCardHtml(unit) {
  return buildDatasheetCardHtml(unit, { showSide: true });
}

function hideUnitHoverCard() {
  const card = getHoverCardRoot();

  if (hoverPreviewState.timer) {
    clearTimeout(hoverPreviewState.timer);
    hoverPreviewState.timer = null;
  }

  hoverPreviewState.unitId = null;

  if (!card) {
    return;
  }

  card.style.display = "none";
  card.setAttribute("aria-hidden", "true");
}

function showUnitHoverCard(unit, clientX, clientY) {
  const card = getHoverCardRoot();

  if (!card || !unit || unit.hp <= 0) {
    return;
  }

  card.innerHTML = buildHoverCardHtml(unit);
  card.style.display = "block";
  card.setAttribute("aria-hidden", "false");
  updateHoverCardPosition(clientX, clientY);
}

function scheduleUnitHoverCard(unit, event) {
  if (hoverPreviewState.timer) {
    clearTimeout(hoverPreviewState.timer);
    hoverPreviewState.timer = null;
  }

  hoverPreviewState.unitId = unit.id;

  hoverPreviewState.timer = setTimeout(() => {
    if (hoverPreviewState.unitId !== unit.id) {
      return;
    }

    showUnitHoverCard(unit, event.clientX, event.clientY);
    hoverPreviewState.timer = null;
  }, 350);
}

function renderUnit(unit) {
  const field = document.getElementById("battlefield");
  const marker = document.createElement("div");
  const currentModels = getUnitCurrentModels(unit);

  unit.currentModels = currentModels;

  marker.classList.add("token", unit.side === "player" ? "unit" : "enemy");

  if (isUnitActivatedThisRound(unit)) {
    marker.classList.add("spent");
  }

  if (unit === selected) {
    marker.classList.add("selected");
  }

  marker.style.left = `${unit.xIn * PIXELS_PER_INCH}px`;
  marker.style.top = `${unit.yIn * PIXELS_PER_INCH}px`;
  marker.title = `${unit.type} | Oddzial ${currentModels}/${Math.max(1, Number(unit.squadSize) || 1)} | HP ${unit.hp}/${unit.maxHp} | Move ${unit.move}\"`;
  marker.innerText = String(currentModels);
  marker.onclick = (event) => {
    event.stopPropagation();

    if (isAnimating || activeSide !== "player" || enemyTurnInProgress) {
      return;
    }

    void onUnitClick(unit);
  };

  marker.onmouseenter = (event) => {
    scheduleUnitHoverCard(unit, event);
  };

  marker.onmousemove = (event) => {
    if (hoverPreviewState.unitId === unit.id) {
      updateHoverCardPosition(event.clientX, event.clientY);
    }
  };

  marker.onmouseleave = () => {
    hideUnitHoverCard();
  };

  field.appendChild(marker);
}

function renderObjectives() {
  if (deploymentState && deploymentState.active) {
    return;
  }

  const field = document.getElementById("battlefield");

  objectives.forEach((objective) => {
    const marker = document.createElement("div");
    marker.classList.add("objective");
    marker.style.backgroundImage = `url('${OBJECTIVE_SPRITE_URL}')`;

    if (objective.owner === "player") {
      marker.classList.add("objective--player");
    } else if (objective.owner === "enemy") {
      marker.classList.add("objective--enemy");
    }

    marker.style.left = `${objective.xIn * PIXELS_PER_INCH}px`;
    marker.style.top = `${objective.yIn * PIXELS_PER_INCH}px`;
    marker.style.width = `${OBJECTIVE_DIAMETER_IN * PIXELS_PER_INCH}px`;
    marker.style.height = `${OBJECTIVE_DIAMETER_IN * PIXELS_PER_INCH}px`;
    marker.title = `Cel | owner: ${objective.owner || "neutral"}`;
    marker.onclick = (event) => {
      event.stopPropagation();
      onObjectiveClick(objective);
    };

    field.appendChild(marker);
  });
}

function renderObjectiveCaptureRanges() {
  if (deploymentState && deploymentState.active) {
    return;
  }

  if (actionMode !== "capture" || activeSide !== "player") {
    return;
  }

  const field = document.getElementById("battlefield");
  const captureCenterRange = OBJECTIVE_RADIUS_IN + OBJECTIVE_CAPTURE_RANGE_IN;
  const diameter = captureCenterRange * 2 * PIXELS_PER_INCH;

  objectives.forEach((objective) => {
    const ring = document.createElement("div");
    ring.classList.add("objective-range");
    ring.style.left = `${objective.xIn * PIXELS_PER_INCH}px`;
    ring.style.top = `${objective.yIn * PIXELS_PER_INCH}px`;
    ring.style.width = `${diameter}px`;
    ring.style.height = `${diameter}px`;
    field.appendChild(ring);
  });
}

function updateActionHud() {
  const leftPlayer = getAvailableUnitsForSide("player").length;
  const leftEnemy = getAvailableUnitsForSide("enemy").length;

  if (deploymentState && deploymentState.active) {
    const currentSide = deploymentState.side === "player" ? "Ty" : "Enemy";
    const currentUnit = getDeploymentQueueUnit(deploymentState.side);
    const currentLabel = currentUnit ? getUnitLabel(currentUnit) : "brak";
    document.getElementById("actionSummary").innerText = `Deployment | Strona ustawiajaca: ${currentSide} | Model: ${currentLabel} | Batch: ${deploymentState.batchPlaced}/${DEPLOY_BATCH_SIZE} | Zasieg od punktu: ${DEPLOY_RADIUS_IN}"`;
  } else {
    document.getElementById("actionSummary").innerText = `Strona: ${activeSide} | AP: ${actionState.apLeft}/3 | Move: ${actionState.moveUsed ? "used" : "ready"} | Bonus: ${actionState.bonusUsed ? "used" : "ready"} | Main: ${actionState.mainUsed ? "used" : "ready"} | Strzal: ${actionState.shootUsed ? "used" : "ready"} | Disengage lock: ${actionState.disengaged ? "TAK" : "nie"} | Tryb: ${actionMode} | Aktywacje: Ty ${leftPlayer} / Enemy ${leftEnemy}`;
  }

  const modeToButton = {
    move: "modeMoveBtn",
    dash: "modeDashBtn",
    capture: "modeCaptureBtn"
  };

  if (selected && selected.side === "player" && selectedActionWeaponId) {
    const chosenWeapon = getWeaponById(selected, selectedActionWeaponId);

    if (!chosenWeapon) {
      selectedActionWeaponId = null;
    }
  }

  const weaponActionRoot = document.getElementById("weaponActionButtons");
  const lock = activeSide !== "player" || enemyTurnInProgress || (deploymentState && deploymentState.active);

  if (weaponActionRoot) {
    if (!selected || selected.side !== "player" || lock) {
      weaponActionRoot.innerHTML = "";
    } else {
      const weaponButtons = getAllUnitWeapons(selected).map((weapon) => {
        const isRanged = (Number(weapon.range) || 1) > 1;
        const mode = isRanged ? "shoot" : "attack";
        const label = isRanged ? "Strzal" : "Atak main";
        const activeClass = actionMode === mode && selectedActionWeaponId === weapon.id ? " active" : "";
        return `<button class="action-btn weapon-action-btn${activeClass}" onclick="setWeaponActionMode('${weapon.id}')">${label}: ${weapon.name}</button>`;
      }).join("");

      weaponActionRoot.innerHTML = weaponButtons;
    }
  }

  Object.values(modeToButton).forEach((id) => {
    const el = document.getElementById(id);

    if (el) {
      el.classList.remove("active");
    }
  });

  const activeBtn = document.getElementById(modeToButton[actionMode]);

  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  Object.values(modeToButton).forEach((id) => {
    const el = document.getElementById(id);

    if (el) {
      el.disabled = lock;
    }
  });
}

function renderDeploymentZones() {
  if (!deploymentState || !deploymentState.active) {
    return;
  }

  const field = document.getElementById("battlefield");
  const diameterPx = DEPLOY_RADIUS_IN * 2 * PIXELS_PER_INCH;

  ["player", "enemy"].forEach((side) => {
    const anchor = getDeploymentAnchor(side);
    const zone = document.createElement("div");
    zone.classList.add("deploy-zone");

    if (deploymentState.side === side) {
      zone.classList.add("deploy-zone--active");
    }

    zone.style.width = `${diameterPx}px`;
    zone.style.height = `${diameterPx}px`;
    zone.style.left = `${anchor.xIn * PIXELS_PER_INCH}px`;
    zone.style.top = `${anchor.yIn * PIXELS_PER_INCH}px`;
    field.appendChild(zone);

    const anchorEl = document.createElement("div");
    anchorEl.classList.add("deploy-anchor", side === "player" ? "deploy-anchor--player" : "deploy-anchor--enemy");
    anchorEl.style.left = `${anchor.xIn * PIXELS_PER_INCH}px`;
    anchorEl.style.top = `${anchor.yIn * PIXELS_PER_INCH}px`;
    field.appendChild(anchorEl);
  });
}

function renderGroundOverlay() {
  if (!groundLayers || !groundLayers.overlayCss) {
    return;
  }

  const field = document.getElementById("battlefield");
  const overlay = document.createElement("div");
  overlay.className = "battlefield-layer battlefield-layer--grass";
  overlay.style.background = groundLayers.overlayCss;
  overlay.style.opacity = String(Math.max(0.82, groundLayers.overlayOpacity ?? 0.9));
  field.appendChild(overlay);

  if (battlefieldAtmosphere?.dirtMaskCss) {
    const dirt = document.createElement("div");
    dirt.className = "battlefield-layer battlefield-layer--dirttexture";
    dirt.style.background = groundLayers.baseCss;
    dirt.style.webkitMaskImage = battlefieldAtmosphere.dirtMaskCss;
    dirt.style.maskImage = battlefieldAtmosphere.dirtMaskCss;
    dirt.style.webkitMaskSize = "100% 100%";
    dirt.style.maskSize = "100% 100%";
    dirt.style.webkitMaskRepeat = "no-repeat";
    dirt.style.maskRepeat = "no-repeat";
    field.appendChild(dirt);
  }

  if (battlefieldAtmosphere?.veilCss) {
    const veil = document.createElement("div");
    veil.className = "battlefield-layer battlefield-layer--veil";
    veil.style.background = battlefieldAtmosphere.veilCss;
    field.appendChild(veil);
  }
}

function renderSectors() {
  const field = document.getElementById("battlefield");

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    const side = sideIndex === 0 ? "player" : "enemy";

    for (let sectorIndex = 0; sectorIndex < SECTORS_PER_SIDE; sectorIndex++) {
      const rect = getSectorRect(side, sectorIndex);
      const sectorEl = document.createElement("div");
      const label = document.createElement("div");

      sectorEl.classList.add("sector-cell");
      sectorEl.style.left = `${rect.xMin * PIXELS_PER_INCH}px`;
      sectorEl.style.top = `${rect.yMin * PIXELS_PER_INCH}px`;
      sectorEl.style.width = `${(rect.xMax - rect.xMin) * PIXELS_PER_INCH}px`;
      sectorEl.style.height = `${(rect.yMax - rect.yMin) * PIXELS_PER_INCH}px`;

      label.classList.add("sector-label");
      label.innerText = `${side === "player" ? "P" : "E"}-${sectorIndex + 1}`;
      sectorEl.appendChild(label);
      field.appendChild(sectorEl);
    }
  }
}

function renderTerrain() {
  const field = document.getElementById("battlefield");

  terrainFeatures.forEach((feature) => {
    const terrainEl = document.createElement("div");
    const renderSize = getFeatureRenderSize(feature);
    terrainEl.classList.add("terrain", `terrain--${feature.type}`);
    terrainEl.classList.add(feature.passability <= 0 ? "terrain--blocking" : "terrain--passable");
    terrainEl.style.left = `${feature.xIn * PIXELS_PER_INCH}px`;
    terrainEl.style.top = `${feature.yIn * PIXELS_PER_INCH}px`;
    terrainEl.style.width = `${renderSize.wIn * PIXELS_PER_INCH}px`;
    terrainEl.style.height = `${renderSize.hIn * PIXELS_PER_INCH}px`;

    if (terrainAssetsReady && window.TerrainAssets) {
      const visual = window.TerrainAssets.pickVisual(feature);

      if (visual) {
        if (visual.sourceAtlas === "split" && visual.spriteUrl) {
          terrainEl.style.backgroundImage = `url('${visual.spriteUrl}')`;
          const solidW = clamp(visual.solidWNorm ?? 1, 0.12, 1);
          const solidH = clamp(visual.solidHNorm ?? 1, 0.12, 1);
          const solidX = clamp(visual.solidXNorm ?? 0, 0, 1 - solidW);
          const solidY = clamp(visual.solidYNorm ?? 0, 0, 1 - solidH);
          const sizeX = 100 / solidW;
          const sizeY = 100 / solidH;
          const posX = solidW < 1 ? (solidX / (1 - solidW)) * 100 : 0;
          const posY = solidH < 1 ? (solidY / (1 - solidH)) * 100 : 0;
          terrainEl.style.backgroundSize = `${sizeX}% ${sizeY}%`;
          terrainEl.style.backgroundPosition = `${posX}% ${posY}%`;
          terrainEl.style.backgroundRepeat = "no-repeat";
        } else {
          terrainEl.style.backgroundImage = `url('${visual.atlasUrl}')`;
          // Atlas fallback: map chosen cut to current box.
          const sizeX = 100 / visual.cutWNorm;
          const sizeY = 100 / visual.cutHNorm;
          const posX = visual.cutWNorm < 1 ? (visual.cutXNorm / (1 - visual.cutWNorm)) * 100 : 0;
          const posY = visual.cutHNorm < 1 ? (visual.cutYNorm / (1 - visual.cutHNorm)) * 100 : 0;
          terrainEl.style.backgroundSize = `${sizeX}% ${sizeY}%`;
          terrainEl.style.backgroundPosition = `${posX}% ${posY}%`;
          terrainEl.style.backgroundRepeat = "no-repeat";
        }
      }
    }

    terrainEl.title = `${feature.name} | Przepustowosc ${feature.passability} | Value ${feature.value} | ${feature.usage}`;
    field.appendChild(terrainEl);

    if (feature.passability <= 0) {
      const hitboxEl = document.createElement("div");
      const footprint = getFeatureFootprint(feature);
      const offsetXIn = Number(feature.hitOffsetXIn) || 0;
      const offsetYIn = Number(feature.hitOffsetYIn) || 0;
      const centerX = (feature.xIn + offsetXIn) * PIXELS_PER_INCH;
      const centerY = (feature.yIn + offsetYIn) * PIXELS_PER_INCH;

      hitboxEl.classList.add("terrain-hitbox");

      if (feature.hitShape === "circle") {
        const radiusIn = Math.max(0.05, Number(feature.hitRadiusIn) || Math.min(footprint.wIn, footprint.hIn) * 0.5);
        const diameterPx = radiusIn * 2 * PIXELS_PER_INCH;
        hitboxEl.classList.add("terrain-hitbox--circle");
        hitboxEl.style.width = `${diameterPx}px`;
        hitboxEl.style.height = `${diameterPx}px`;
      } else {
        if (feature.hitShape === "ellipse") {
          hitboxEl.classList.add("terrain-hitbox--ellipse");
        } else {
          hitboxEl.classList.add("terrain-hitbox--box");
        }

        hitboxEl.style.width = `${footprint.wIn * PIXELS_PER_INCH}px`;
        hitboxEl.style.height = `${footprint.hIn * PIXELS_PER_INCH}px`;
      }

      hitboxEl.style.left = `${centerX}px`;
      hitboxEl.style.top = `${centerY}px`;
      field.appendChild(hitboxEl);
    }
  });
}

function renderTerrainSummary() {
  const playerTerrainPoints = getTerrainPoints("player");
  const enemyTerrainPoints = getTerrainPoints("enemy");
  const playerCounts = getTerrainCounts("player");
  const enemyCounts = getTerrainCounts("enemy");
  const matchupLabel = `Matchup ${terrainPathProfile.matchup} | Ty: ${getVariantLabel(terrainPathProfile.player)} | Enemy: ${getVariantLabel(terrainPathProfile.enemy)}`;
  const roomName = getActiveRoom()?.name || "Brak";
  document.getElementById("terrainSummary").innerText = `Pokoj: ${roomName} | Balans terenu: Ty L${playerCounts.large}/S${playerCounts.small}/D${playerCounts.decor} (Value ${playerTerrainPoints}) | Enemy L${enemyCounts.large}/S${enemyCounts.small}/D${enemyCounts.decor} (Value ${enemyTerrainPoints}) | ${matchupLabel} | Obiekty DB: ${terrainAssetDb.length}`;
}

function renderRangeRing() {
  if (!selected) {
    return;
  }

  const field = document.getElementById("battlefield");
  const ring = document.createElement("div");
  let rangeIn = selected.move;

  if (actionMode === "dash") {
    rangeIn = Math.max(1, Math.floor(selected.move / 2));
  } else if (actionMode === "shoot") {
    const selectedWeapon = getSelectedActionWeapon(selected);
    const rangedWeapon = selectedWeapon && (Number(selectedWeapon.range) || 1) > 1
      ? selectedWeapon
      : getRangedWeaponForUnit(selected);
    rangeIn = rangedWeapon ? rangedWeapon.range : 1;
  } else if (actionMode === "attack") {
    const selectedWeapon = getSelectedActionWeapon(selected);
    const meleeWeapon = selectedWeapon && (Number(selectedWeapon.range) || 1) <= 1
      ? selectedWeapon
      : getMeleeWeaponForUnit(selected);

    if (meleeWeapon && canAttemptChargeNow()) {
      rangeIn = selected.move + 2;
    } else if (meleeWeapon) {
      rangeIn = meleeWeapon.range;
    } else {
      rangeIn = 1;
    }
  }

  const diameterPx = rangeIn * 2 * PIXELS_PER_INCH;

  ring.classList.add("range-ring");
  ring.style.width = `${diameterPx}px`;
  ring.style.height = `${diameterPx}px`;
  ring.style.left = `${selected.xIn * PIXELS_PER_INCH}px`;
  ring.style.top = `${selected.yIn * PIXELS_PER_INCH}px`;

  field.appendChild(ring);
}

function getUnitLabel(unit) {
  if (unit.templateName) {
    return unit.templateName;
  }

  if (unit.type === "common") {
    return "Trooper";
  }

  if (unit.type === "rare") {
    return "Veteran";
  }

  if (unit.type === "elite") {
    return "Specialist";
  }

  if (unit.type === "heroic") {
    return "Leader";
  }

  return "Hostile";
}

function renderUnitCardsList() {
  const listRoot = document.getElementById("unitCardsList");

  if (!listRoot) {
    return;
  }

  if (deploymentState && deploymentState.active) {
    const playerQueue = deploymentState.queues.player;
    const selectedDeployId = deploymentState.selectedBySide.player;

    listRoot.innerHTML = playerQueue.map((unit) => {
      const placed = isDeploymentUnitPlaced("player", unit);
      const selectedDeploy = selectedDeployId === unit.id;
      const status = placed ? "Wystawiony" : "Do wystawienia";
      const cardClasses = ["unit-card"];

      if (selectedDeploy) {
        cardClasses.push("selected");
      }

      if (placed) {
        cardClasses.push("spent");
      }

      return `
        <article class="${cardClasses.join(" ")}" onclick="onUnitCardClick('${unit.id}')">
          <div class="unit-card-top">
            <div>
              <div class="unit-name">${getUnitLabel(unit)}</div>
              <div class="unit-type">${String(unit.type || "").toUpperCase()}</div>
            </div>
            <div class="wounds">${status}</div>
          </div>
          <div class="subline">M ${unit.move}" | APL ${unit.apl} | SV ${unit?.armor?.save ?? "-"}</div>
        </article>
      `;
    }).join("");

    return;
  }

  const playerUnits = units.filter((unit) => unit.side === "player" && unit.hp > 0);

  listRoot.innerHTML = playerUnits.map((unit) => {
    const selectedClass = selected && selected.id === unit.id ? " selected" : "";
    const spentClass = unit.activated ? " spent" : "";
    const currentModels = getUnitCurrentModels(unit);
    const maxModels = Math.max(1, Number(unit.squadSize) || 1);

    return `
      <article class="unit-card${selectedClass}${spentClass}" onclick="onUnitCardClick('${unit.id}')">
        <div class="unit-card-top">
          <div>
            <div class="unit-name">${getUnitLabel(unit)}</div>
            <div class="unit-type">${String(unit.type || "").toUpperCase()}</div>
          </div>
          <div class="wounds">W ${unit.hp}/${unit.maxHp}</div>
        </div>
        <div class="subline">Oddzial ${currentModels}/${maxModels} | M ${unit.move}" | SV ${unit?.armor?.save ?? "-"} | Bronie: ${getAllUnitWeapons(unit).map((entry) => entry.name).join(" + ")}</div>
      </article>
    `;
  }).join("");
}

function onUnitCardClick(unitId) {
  if (deploymentState && deploymentState.active) {
    const unit = deploymentState.queues.player.find((entry) => entry.id === unitId);

    if (!unit || isDeploymentUnitPlaced("player", unit)) {
      return;
    }

    setDeploymentSelection("player", unitId);
    setStatus(getDeploymentPrompt());
    render();
    return;
  }

  const unit = units.find((entry) => entry.id === unitId && entry.side === "player");

  if (!unit || unit.hp <= 0 || isAnimating || activeSide !== "player" || enemyTurnInProgress) {
    return;
  }

  void onUnitClick(unit);
}

function renderSelectedCard() {
  const cardRoot = document.getElementById("selectedUnitCard");

  if (!cardRoot) {
    return;
  }

  if (deploymentState && deploymentState.active) {
    const current = getDeploymentQueueUnit(deploymentState.side);
    const currentLabel = current ? getUnitLabel(current) : "brak";
    cardRoot.innerHTML = `<div class="hint-box">Deployment trwa. Tura: <strong>${deploymentState.side === "player" ? "GRACZ" : "ENEMY"}</strong>. Aktualnie wystawiany: <strong>${currentLabel}</strong>. Kliknij karte po lewej i ustaw model na planszy.</div>`;
    return;
  }

  if (!selected || selected.side !== "player") {
    cardRoot.innerHTML = '<div class="hint-box">Kliknij swojego operativa, aby aktywowac go na te ture. Jednostka aktywowana nie moze byc uzyta ponownie w tej rundzie.</div>';
    return;
  }

  cardRoot.innerHTML = buildDatasheetCardHtml(selected, { showSide: false });
}

function render() {
  const field = document.getElementById("battlefield");
  hideUnitHoverCard();
  field.innerHTML = "";

  renderGroundOverlay();

  if (SHOW_SECTOR_OVERLAY) {
    renderSectors();
  }

  renderTerrain();
  renderDeploymentZones();
  renderObjectiveCaptureRanges();
  renderObjectives();
  renderRangeRing();
  units.forEach((unit) => renderUnit(unit));
  renderUnitCardsList();
  renderSelectedCard();
  renderCombatLog();
  renderTerrainSummary();
  updateActionHud();

  if (!units.some((unit) => unit.side === "enemy")) {
    setStatus("Wszyscy przeciwnicy pokonani. Wygrana!");
  }
}

initRoomManager();


