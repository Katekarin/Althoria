(function () {
  // Slownik keywordow do opisu i dokumentacji balansu.
  window.WH40_KEYWORD_DATABASE = {
    weapon: {
      "Accurate": "Automatyczne trafienia lub stabilniejsze trafianie.",
      "Armour Piercing": "Utrudnia rzuty save celu.",
      "Blast": "Moze trafic dodatkowe cele obok glownego.",
      "Brutal": "Ogranicza obrone celu i wzmacnia nacisk w walce.",
      "Ceaseless": "Przerzuty 1 na ataku lub obronie.",
      "Cleave": "Mozliwosc zahaczenia drugiego celu w zwarciu.",
      "Critical": "Efekt krytyczny po przekroczeniu progu.",
      "Ferocious": "Dodatkowe kosci ataku w zwarciu.",
      "Heavy": "Bron ciezka, zwykle z ograniczeniem po ruchu.",
      "Lethal": "Krytyczne trafienia na nizszym progu.",
      "Limited": "Ograniczona liczba uzyc w bitwie.",
      "Penetrate": "Przebija obrone i redukuje save pool.",
      "Precise": "Lepszy prog trafienia.",
      "Rending": "Kryty wzmacniaja output obrazen.",
      "Riposte": "Wzmacnia kontre obroncy.",
      "Shield": "Wzmacnia obronnosc przy walce tarcza.",
      "Strength": "Podnosi presje obrazen i utrudnia save celu.",
      "Volley": "Wzmacnia bron dystansowa salwa atakow.",
    },
    armor: {
      "Block": "Lepszy prog obrony save.",
      "Ceaseless": "Przerzuty 1 na save.",
      "Dodge": "Czesc obron wchodzi automatycznie.",
      "Endurance": "Twardsza jednostka pod ostrzalem.",
      "Heavy": "Wysoka ochrona kosztem mobilnosci.",
      "Shield": "Dodatkowe wsparcie save i tankowania.",
    },
  };

  // Basowe profile archetypow broni podzielone na tiery jednostek.
  window.WEAPON_ARCHETYPE_BASELINES = {
    toporowate: {
      common: { attacks: 4, hit: "4+", damage: 3, range: 1, abilities: ["Brutal 1"] },
      rare: { attacks: 5, hit: "4+", damage: 3, range: 1, abilities: ["Brutal 1"] },
      elite: { attacks: 5, hit: "3+", damage: 4, range: 1, abilities: ["Brutal 1", "Rending"] },
      heroic: { attacks: 6, hit: "3+", damage: 5, range: 1, abilities: ["Brutal 1", "Rending", "Lethal 5+"] },
    },
    drzewcowe: {
      common: { attacks: 4, hit: "4+", damage: 2, range: 2, abilities: ["Strength 1"] },
      rare: { attacks: 5, hit: "4+", damage: 3, range: 2, abilities: ["Strength 1"] },
      elite: { attacks: 5, hit: "3+", damage: 4, range: 3, abilities: ["Strength 1", "Ceaseless"] },
      heroic: { attacks: 6, hit: "3+", damage: 4, range: 3, abilities: ["Strength 1", "Ceaseless", "Lethal 5+"] },
    },
    miecze: {
      common: { attacks: 5, hit: "4+", damage: 2, range: 1, abilities: ["Ceaseless"] },
      rare: { attacks: 5, hit: "3+", damage: 3, range: 1, abilities: ["Ceaseless"] },
      elite: { attacks: 6, hit: "3+", damage: 3, range: 1, abilities: ["Ceaseless", "Rending"] },
      heroic: { attacks: 6, hit: "2+", damage: 4, range: 1, abilities: ["Ceaseless", "Rending", "Lethal 5+"] },
    },
    obuchowe: {
      common: { attacks: 4, hit: "4+", damage: 3, range: 1, abilities: ["Rending"] },
      rare: { attacks: 4, hit: "4+", damage: 4, range: 1, abilities: ["Rending"] },
      elite: { attacks: 5, hit: "3+", damage: 4, range: 1, abilities: ["Rending", "Brutal 1"] },
      heroic: { attacks: 5, hit: "3+", damage: 5, range: 1, abilities: ["Rending", "Brutal 1", "Lethal 5+"] },
    },
    luki: {
      common: { attacks: 4, hit: "5+", damage: 2, range: 10, abilities: ["Volley 1"] },
      rare: { attacks: 4, hit: "4+", damage: 2, range: 12, abilities: ["Volley 1"] },
      elite: { attacks: 4, hit: "3+", damage: 3, range: 13, abilities: ["Volley 1", "Precise 1"] },
      heroic: { attacks: 5, hit: "3+", damage: 3, range: 14, abilities: ["Volley 1", "Precise 1", "Lethal 5+"] },
    },
    kusze: {
      common: { attacks: 3, hit: "3+", damage: 3, range: 9, abilities: ["Armour Piercing 1", "Heavy"] },
      rare: { attacks: 3, hit: "3+", damage: 4, range: 10, abilities: ["Armour Piercing 1", "Heavy"] },
      elite: { attacks: 4, hit: "2+", damage: 4, range: 11, abilities: ["Armour Piercing 1", "Heavy", "Precise 1"] },
      heroic: { attacks: 4, hit: "2+", damage: 4, range: 12, abilities: ["Armour Piercing 1", "Heavy", "Precise 1", "Lethal 5+"] },
    },
    tarcze: {
      common: { attacks: 4, hit: "4+", damage: 2, range: 1, abilities: ["Shield 1"] },
      rare: { attacks: 4, hit: "4+", damage: 2, range: 1, abilities: ["Shield 1", "Ceaseless"] },
      elite: { attacks: 5, hit: "3+", damage: 3, range: 1, abilities: ["Shield 1", "Ceaseless"] },
      heroic: { attacks: 5, hit: "2+", damage: 3, range: 1, abilities: ["Shield 2", "Ceaseless"] },
    },
  };

  // Bazowe profile pancerza pod tier (punkt orientacyjny do balansu).
  window.ARMOR_ARCHETYPE_BASELINES = {
    common: { save: "5+", hpBonus: 2, moveMod: 0 },
    rare: { save: "4+", hpBonus: 4, moveMod: 0 },
    elite: { save: "3+", hpBonus: 6, moveMod: -1 },
    heroic: { save: "2+", hpBonus: 8, moveMod: -1 },
  };

  window.getWeaponArchetypeBaseline = function getWeaponArchetypeBaseline(archetypeId, tier) {
    const normalizedTier = String(tier || "common").toLowerCase();
    const archetype = window.WEAPON_ARCHETYPE_BASELINES[String(archetypeId || "").toLowerCase()];

    if (!archetype) {
      return null;
    }

    return archetype[normalizedTier] || archetype.common || null;
  };
})();
