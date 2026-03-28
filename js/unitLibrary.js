(function () {
  window.FACTION_UNIT_LIBRARY = {
  kingdoms: [
    {
      id: "conscript",
      name: "Poborowy",
      classType: "common",
      base: { hp: 13, move: 6, apl: 2, ga: 1, df: 2, cost: 3 },
      armorOptions: [
        { id: "cons-none", name: "Brak zbroi", save: "6+", hpBonus: 0, moveMod: 0, cost: 0 },
        { id: "cons-rags", name: "Lachmany i skora", save: "6+", hpBonus: 1, moveMod: 0, cost: 1 },
        { id: "cons-rust", name: "Zardzewiala oslona", save: "5+", hpBonus: 2, moveMod: -1, cost: 2 }
      ],
      weaponOptions: [
        { id: "cons-fork", name: "Widly", attacks: 4, hit: "5+", damage: 2, range: 1, cost: 1, abilities: ["Critical 6+"] },
        { id: "cons-club", name: "Maczuga", attacks: 5, hit: "5+", damage: 2, range: 1, cost: 1 },
        { id: "cons-knife", name: "Noz gospodarski", attacks: 5, hit: "5+", damage: 1, range: 1, cost: 0 },
        { id: "cons-hatchet", name: "Toporek roboczy", attacks: 4, hit: "5+", damage: 3, range: 1, cost: 2 },
        { id: "cons-sling", name: "Proca", attacks: 3, hit: "6+", damage: 1, range: 8, cost: 1, abilities: ["Critical 6+"] }
      ]
    },
    {
      id: "zoldak",
      name: "Zoldak",
      classType: "common",
      base: { hp: 17, move: 6, apl: 2, ga: 1, df: 3, cost: 6 },
      armorOptions: [
        { id: "merc-cloth", name: "Pikowana kurtka", save: "5+", hpBonus: 1, moveMod: 0, cost: 1 },
        { id: "merc-leather", name: "Skorzana kamizela", save: "5+", hpBonus: 2, moveMod: 0, cost: 2 },
        { id: "merc-mail", name: "Stara kolczuga", save: "4+", hpBonus: 3, moveMod: -1, cost: 3 }
      ],
      weaponOptions: [
        { id: "zoldak-spear", name: "Wlocznia straznicza", attacks: 5, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "zoldak-sword", name: "Miecz najemny", attacks: 5, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "zoldak-mace", name: "Buzdygan", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "zoldak-axe", name: "Topor piechura", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "zoldak-bow", name: "Luk graniczny", attacks: 4, hit: "5+", damage: 2, range: 11, cost: 3 }
      ]
    },
    {
      id: "soldier",
      name: "Zolnierz",
      classType: "common",
      base: { hp: 21, move: 6, apl: 2, ga: 1, df: 3, cost: 9 },
      armorOptions: [
        { id: "sold-leather", name: "Wzmacniana skora", save: "5+", hpBonus: 2, moveMod: 0, cost: 2 },
        { id: "sold-mail", name: "Kolczuga liniowa", save: "4+", hpBonus: 4, moveMod: -1, cost: 4 },
        { id: "sold-brig", name: "Brygantyna", save: "4+", hpBonus: 5, moveMod: -1, cost: 5 }
      ],
      weaponOptions: [
        { id: "sold-sword", name: "Miecz liniowy", attacks: 6, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "sold-halberd", name: "Halabarda", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "sold-hammer", name: "Mlot bojowy", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "sold-shield", name: "Tarcza i palasz", attacks: 5, hit: "4+", damage: 2, range: 1, cost: 3, abilities: ["Shield 1"] },
        { id: "sold-crossbow", name: "Kusza polowa", attacks: 3, hit: "4+", damage: 4, range: 10, cost: 4, abilities: ["Penetrate 1"] }
      ]
    },
    {
      id: "mercenary",
      name: "Najemnik",
      classType: "elite",
      base: { hp: 24, move: 6, apl: 3, ga: 1, df: 3, cost: 13 },
      armorOptions: [
        { id: "merc-elite-coat", name: "Skora i stal", save: "5+", hpBonus: 3, moveMod: 0, cost: 2 },
        { id: "merc-elite-mail", name: "Pancerz kompanii", save: "4+", hpBonus: 4, moveMod: -1, cost: 4 },
        { id: "merc-elite-mix", name: "Lamellar najemny", save: "4+", hpBonus: 5, moveMod: -1, cost: 5 }
      ],
      weaponOptions: [
        { id: "merc-elite-sword", name: "Dlugi miecz", attacks: 5, hit: "3+", damage: 3, range: 1, cost: 3 },
        { id: "merc-elite-axe", name: "Topor kontraktowy", attacks: 5, hit: "3+", damage: 3, range: 1, cost: 3 },
        { id: "merc-elite-pike", name: "Pika szturmowa", attacks: 5, hit: "3+", damage: 3, range: 1, cost: 4 },
        { id: "merc-elite-crossbow", name: "Ciezka kusza", attacks: 3, hit: "3+", damage: 3, range: 13, cost: 4, abilities: ["Penetrate 1"] },
        { id: "merc-elite-dual", name: "Dwa ostrza", attacks: 6, hit: "4+", damage: 2, range: 1, cost: 3 }
      ]
    },
    {
      id: "knight",
      name: "Knight",
      classType: "elite",
      base: { hp: 32, move: 6, apl: 3, ga: 1, df: 4, cost: 21 },
      armorOptions: [
        { id: "kni-mail", name: "Kolczuga rycerska", save: "4+", hpBonus: 5, moveMod: 0, cost: 4 },
        { id: "kni-plate", name: "Plyta rycerska", save: "3+", hpBonus: 7, moveMod: -1, cost: 7 },
        { id: "kni-oath", name: "Plyta przysiegi", save: "2+", hpBonus: 8, moveMod: -1, cost: 9, abilities: ["Shield 1"] }
      ],
      weaponOptions: [
        { id: "kni-longsword", name: "Miecz rycerski", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "kni-morningstar", name: "Morgenstern", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "kni-poleaxe", name: "Topor drzewcowy", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "kni-greatsword", name: "Miecz dwureczny", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 5, abilities: ["Cleave", "Critical 6+"] },
        { id: "kni-shieldblade", name: "Tarcza i ostrze", attacks: 4, hit: "3+", damage: 3, range: 1, cost: 3, abilities: ["Shield 1"] }
      ]
    },
    {
      id: "bull",
      name: "Bull",
      classType: "elite",
      abilities: ["Charge Turn"],
      base: { hp: 34, move: 7, apl: 3, ga: 1, df: 2, cost: 24 },
      armorOptions: [
        { id: "bull-chain", name: "Kolczuga szturmowa", save: "4+", hpBonus: 4, moveMod: 0, cost: 3 },
        { id: "bull-halfplate", name: "Polplyta przelamania", save: "4+", hpBonus: 6, moveMod: -1, cost: 5 },
        { id: "bull-heavy", name: "Pancerz przelewowy", save: "3+", hpBonus: 8, moveMod: -1, cost: 7 }
      ],
      weaponOptions: [
        { id: "bull-maul", name: "Mlot dwureczny", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "bull-breaker", name: "Lamacz tarcz", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 5, abilities: ["Penetrate 1"] },
        { id: "bull-cleaver", name: "Tasak przelamania", attacks: 6, hit: "4+", damage: 3, range: 1, cost: 4 },
        { id: "bull-greataxe", name: "Topor kata", attacks: 5, hit: "3+", damage: 5, range: 1, cost: 6 },
        { id: "bull-chainflail", name: "Cep lancuchowy", attacks: 6, hit: "4+", damage: 4, range: 1, cost: 5 }
      ]
    },
    {
      id: "king-custom",
      name: "Krol (Heroic Custom)",
      classType: "heroic",
      base: { hp: 30, move: 6, apl: 3, ga: 1, df: 3, cost: 16 },
      armorOptions: [
        { id: "king-travel", name: "Lekka zbroja podrozna", save: "4+", hpBonus: 3, moveMod: 0, cost: 3 },
        { id: "king-line", name: "Plyta liniowa", save: "3+", hpBonus: 5, moveMod: -1, cost: 6 },
        { id: "king-fortress", name: "Pancerz twierdzy", save: "2+", hpBonus: 7, moveMod: -1, cost: 9, abilities: ["Shield 1"] },
        { id: "king-rider", name: "Kirys rajdowy", save: "4+", hpBonus: 2, moveMod: 1, cost: 5 }
      ],
      weaponOptions: [
        { id: "king-blade", name: "Miecz korony", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "king-warhammer", name: "Mlot wojenny", attacks: 5, hit: "3+", damage: 5, range: 1, cost: 5 },
        { id: "king-polearm", name: "Drzewiec monarchy", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "king-dual", name: "Dwa ostrza", attacks: 6, hit: "4+", damage: 3, range: 1, cost: 4 },
        { id: "king-command-bow", name: "Luk dowodcy", attacks: 3, hit: "4+", damage: 3, range: 14, cost: 4 },
        { id: "king-repeater", name: "Kusza powtarzalna", attacks: 4, hit: "4+", damage: 2, range: 11, cost: 5, abilities: ["Critical 6+"] }
      ]
    }
  ],
  althoria: [
    {
      id: "atherias-peasant",
      name: "Atherias Wiesniak",
      classType: "common",
      base: { hp: 12, move: 6, apl: 2, ga: 1, df: 2, cost: 2 },
      armorOptions: [
        { id: "ath-peasant-cloth", name: "Plocienne odzienie", save: "6+", hpBonus: 0, moveMod: 0, cost: 0 },
        { id: "ath-peasant-hide", name: "Skora lowcy", save: "6+", hpBonus: 1, moveMod: 0, cost: 1 },
        { id: "ath-peasant-wood", name: "Drewniane oslony", save: "5+", hpBonus: 2, moveMod: -1, cost: 2 }
      ],
      weaponOptions: [
        { id: "ath-peasant-fork", name: "Widly", attacks: 4, hit: "5+", damage: 2, range: 1, cost: 1 },
        { id: "ath-peasant-stick", name: "Kij strugany", attacks: 5, hit: "5+", damage: 1, range: 1, cost: 0 },
        { id: "ath-peasant-hatchet", name: "Toporek drwala", attacks: 4, hit: "5+", damage: 3, range: 1, cost: 2 },
        { id: "ath-peasant-sling", name: "Proca bagienna", attacks: 3, hit: "6+", damage: 1, range: 8, cost: 1, abilities: ["Critical 6+"] },
        { id: "ath-peasant-spear", name: "Wlocznia zylkowa", attacks: 4, hit: "5+", damage: 2, range: 1, cost: 1 }
      ]
    },
    {
      id: "atherias-aspirant",
      name: "Atherias Aspirant",
      classType: "common",
      base: { hp: 14, move: 6, apl: 2, ga: 1, df: 2, cost: 4 },
      armorOptions: [
        { id: "ath-asp-leather", name: "Skora patrolowa", save: "5+", hpBonus: 1, moveMod: 0, cost: 1 },
        { id: "ath-asp-brig", name: "Lacona brygantyna", save: "5+", hpBonus: 2, moveMod: 0, cost: 2 },
        { id: "ath-asp-mail", name: "Kolczuga sektora", save: "4+", hpBonus: 3, moveMod: -1, cost: 3 }
      ],
      weaponOptions: [
        { id: "ath-asp-sword", name: "Miecz aspiranta", attacks: 5, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "ath-asp-spear", name: "Wlocznia dowodzaca", attacks: 5, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "ath-asp-mace", name: "Buzdygan", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "ath-asp-bow", name: "Luk lesny", attacks: 4, hit: "5+", damage: 2, range: 11, cost: 3 },
        { id: "ath-asp-crossbow", name: "Kusza nadzorcy", attacks: 3, hit: "4+", damage: 3, range: 10, cost: 3 }
      ]
    },
    {
      id: "atherias-commander",
      name: "Dowodca Atherias",
      classType: "elite",
      base: { hp: 26, move: 6, apl: 3, ga: 1, df: 3, cost: 15 },
      armorOptions: [
        { id: "ath-cmd-coat", name: "Kirys dowodcy", save: "4+", hpBonus: 3, moveMod: 0, cost: 3 },
        { id: "ath-cmd-mail", name: "Plyta urzedowa", save: "3+", hpBonus: 5, moveMod: -1, cost: 5 },
        { id: "ath-cmd-guard", name: "Pancerz rady", save: "3+", hpBonus: 6, moveMod: -1, cost: 6, abilities: ["Shield 1"] }
      ],
      weaponOptions: [
        { id: "ath-cmd-sword", name: "Miecz dowodcy", attacks: 5, hit: "3+", damage: 3, range: 1, cost: 3 },
        { id: "ath-cmd-spear", name: "Wlocznia sygnalowa", attacks: 5, hit: "3+", damage: 3, range: 1, cost: 3 },
        { id: "ath-cmd-mace", name: "Mlot urzedowy", attacks: 4, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ath-cmd-longbow", name: "Luk sektorowy", attacks: 3, hit: "4+", damage: 3, range: 13, cost: 4 },
        { id: "ath-cmd-crossbow", name: "Kusza dowodzenia", attacks: 3, hit: "4+", damage: 3, range: 11, cost: 4, abilities: ["Penetrate 1"] }
      ]
    },
    {
      id: "atherias-knight",
      name: "Rycerz Atherias",
      classType: "elite",
      base: { hp: 31, move: 6, apl: 3, ga: 1, df: 3, cost: 21 },
      armorOptions: [
        { id: "ath-kni-mail", name: "Kolczuga rycerska", save: "4+", hpBonus: 5, moveMod: 0, cost: 4 },
        { id: "ath-kni-plate", name: "Plyta graniczna", save: "3+", hpBonus: 7, moveMod: -1, cost: 7 },
        { id: "ath-kni-gothic", name: "Plyta gotycka", save: "3+", hpBonus: 8, moveMod: -1, cost: 8 }
      ],
      weaponOptions: [
        { id: "ath-kni-longsword", name: "Miecz poltorareczny", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ath-kni-halberd", name: "Halabarda", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ath-kni-warhammer", name: "Mlot bojowy", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ath-kni-greatbow", name: "Wielki luk", attacks: 3, hit: "4+", damage: 4, range: 15, cost: 5 },
        { id: "ath-kni-heavy-crossbow", name: "Ciezka kusza", attacks: 2, hit: "3+", damage: 5, range: 12, cost: 5, abilities: ["Penetrate 1"] }
      ]
    },
    {
      id: "atherias-guard-knight",
      name: "Rycerz Gwardyjski",
      classType: "elite",
      base: { hp: 36, move: 5, apl: 3, ga: 1, df: 4, cost: 29 },
      armorOptions: [
        { id: "ath-gk-plate", name: "Plyta gwardyjska", save: "3+", hpBonus: 7, moveMod: -1, cost: 7, abilities: ["Shield 1"] },
        { id: "ath-gk-fort", name: "Forteczna plyta", save: "2+", hpBonus: 9, moveMod: -1, cost: 9, abilities: ["Shield 1"] },
        { id: "ath-gk-wall", name: "Mur stolicy", save: "2+", hpBonus: 10, moveMod: -2, cost: 10, abilities: ["Shield 2"] }
      ],
      weaponOptions: [
        { id: "ath-gk-sword", name: "Miecz gwardii", attacks: 6, hit: "3+", damage: 4, range: 1, cost: 4, abilities: ["Shield 1"] },
        { id: "ath-gk-halberd", name: "Halabarda gwardii", attacks: 6, hit: "3+", damage: 4, range: 1, cost: 5, abilities: ["Shield 1"] },
        { id: "ath-gk-spear", name: "Wlocznia muru", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4, abilities: ["Shield 1"] },
        { id: "ath-gk-axe", name: "Topor stolicy", attacks: 5, hit: "3+", damage: 5, range: 1, cost: 5, abilities: ["Shield 1"] },
        { id: "ath-gk-bastion", name: "Tarcza bastionowa", attacks: 5, hit: "3+", damage: 3, range: 1, cost: 3, abilities: ["Shield 2"] }
      ]
    },
    {
      id: "atherias-willheim",
      name: "Willheim StrongWood",
      classType: "heroic",
      base: { hp: 37, move: 6, apl: 3, ga: 1, df: 4, cost: 31 },
      armorOptions: [
        { id: "ath-willheim-field", name: "Pancerz strategiczny", save: "3+", hpBonus: 6, moveMod: 0, cost: 6, abilities: ["Shield 1"] },
        { id: "ath-willheim-royal", name: "Plyta starej rady", save: "2+", hpBonus: 8, moveMod: -1, cost: 8, abilities: ["Shield 1"] },
        { id: "ath-willheim-bastion", name: "Bastion osobisty", save: "2+", hpBonus: 9, moveMod: -1, cost: 9, abilities: ["Shield 2"] }
      ],
      weaponOptions: [
        { id: "ath-willheim-sword", name: "Miecz poltorareczny StrongWooda", attacks: 6, hit: "3+", damage: 4, range: 1, cost: 5, abilities: ["Shield 1"] },
        { id: "ath-willheim-tactical", name: "Ostrze taktyka", attacks: 6, hit: "3+", damage: 4, range: 1, cost: 5, abilities: ["Critical 6+", "Shield 1"] },
        { id: "ath-willheim-halberd", name: "Halabarda sztabowa", attacks: 5, hit: "3+", damage: 5, range: 1, cost: 6, abilities: ["Shield 1"] },
        { id: "ath-willheim-command", name: "Miecz i tarcza dowodcy", attacks: 5, hit: "2+", damage: 4, range: 1, cost: 6, abilities: ["Shield 2"] },
        { id: "ath-willheim-crossbow", name: "Kusza oficerska", attacks: 3, hit: "3+", damage: 4, range: 11, cost: 5, abilities: ["Penetrate 1"] }
      ]
    }
  ],
  wastes: [
    {
      id: "ash-gatherer",
      name: "Zbieracz",
      classType: "common",
      base: { hp: 20, move: 7, apl: 2, ga: 1, df: 3, cost: 7 },
      armorOptions: [
        { id: "ash-gather-rags", name: "Lachmany i skora", save: "5+", hpBonus: 2, moveMod: 0, cost: 1 },
        { id: "ash-gather-bones", name: "Plytki z kosci", save: "4+", hpBonus: 3, moveMod: 0, cost: 3 },
        { id: "ash-gather-wing", name: "Skora skrzydlowa", save: "4+", hpBonus: 4, moveMod: -1, cost: 4 }
      ],
      weaponOptions: [
        { id: "ash-gather-hook", name: "Hak popielny", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 2 },
        { id: "ash-gather-cleaver", name: "Tasak zbieracza", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 2 },
        { id: "ash-gather-spear", name: "Wlocznia cierniowa", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "ash-gather-sling", name: "Proca siarkowa", attacks: 4, hit: "5+", damage: 2, range: 9, cost: 2 },
        { id: "ash-gather-axe", name: "Topor zlomiarza", attacks: 4, hit: "4+", damage: 4, range: 1, cost: 3 }
      ]
    },
    {
      id: "ash-seeker",
      name: "Poszukiwacz",
      classType: "common",
      base: { hp: 22, move: 8, apl: 2, ga: 1, df: 3, cost: 9 },
      armorOptions: [
        { id: "ash-seek-hide", name: "Skora wedrowca", save: "5+", hpBonus: 2, moveMod: 0, cost: 1 },
        { id: "ash-seek-scale", name: "Luski wyprawowe", save: "4+", hpBonus: 3, moveMod: 0, cost: 3 },
        { id: "ash-seek-bamboo", name: "Lamela bambusowa", save: "4+", hpBonus: 4, moveMod: -1, cost: 4 }
      ],
      weaponOptions: [
        { id: "ash-seek-knives", name: "Noze szlaku", attacks: 6, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "ash-seek-javelin", name: "Dzida tropiciela", attacks: 4, hit: "4+", damage: 3, range: 10, cost: 3 },
        { id: "ash-seek-bow", name: "Luk czarnej trawy", attacks: 4, hit: "4+", damage: 3, range: 12, cost: 4 },
        { id: "ash-seek-net", name: "Siec i ostrze", attacks: 5, hit: "4+", damage: 2, range: 1, cost: 2 },
        { id: "ash-seek-claw", name: "Pazur wiwerny", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 }
      ]
    },
    {
      id: "ash-guardian",
      name: "Straznik",
      classType: "rare",
      base: { hp: 25, move: 6, apl: 2, ga: 1, df: 3, cost: 13 },
      armorOptions: [
        { id: "ash-guard-hide", name: "Skora muru", save: "4+", hpBonus: 3, moveMod: 0, cost: 2 },
        { id: "ash-guard-bones", name: "Plyty kostne", save: "3+", hpBonus: 5, moveMod: -1, cost: 5 },
        { id: "ash-guard-wall", name: "Pancerz bastionowy", save: "3+", hpBonus: 6, moveMod: -1, cost: 6, abilities: ["Shield 1"] }
      ],
      weaponOptions: [
        { id: "ash-guard-spear", name: "Wlocznia mrowiska", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "ash-guard-sword", name: "Miecz straznika", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "ash-guard-halberd", name: "Halabarda popielna", attacks: 5, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "ash-guard-shield", name: "Tarcza i ostrze", attacks: 4, hit: "4+", damage: 3, range: 1, cost: 3, abilities: ["Shield 1"] },
        { id: "ash-guard-bow", name: "Luk redutowy", attacks: 3, hit: "4+", damage: 3, range: 11, cost: 4 }
      ]
    },
    {
      id: "ash-warrior",
      name: "Wojownik",
      classType: "rare",
      base: { hp: 27, move: 7, apl: 2, ga: 1, df: 3, cost: 15 },
      armorOptions: [
        { id: "ash-war-hide", name: "Skora bestii", save: "4+", hpBonus: 4, moveMod: 0, cost: 3 },
        { id: "ash-war-lamella", name: "Lamela lowow", save: "3+", hpBonus: 5, moveMod: -1, cost: 5 },
        { id: "ash-war-plate", name: "Plyta z wraku", save: "3+", hpBonus: 6, moveMod: -1, cost: 6 }
      ],
      weaponOptions: [
        { id: "ash-war-axe", name: "Topor wojownika", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-war-maul", name: "Mlot gruzowy", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-war-chain", name: "Lancuch bojowy", attacks: 6, hit: "4+", damage: 3, range: 1, cost: 3 },
        { id: "ash-war-cleaver", name: "Tasak wiwerni", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-war-crossbow", name: "Kusza lowcy", attacks: 3, hit: "4+", damage: 3, range: 10, cost: 4 }
      ]
    },
    {
      id: "ash-nomad",
      name: "Nomada",
      classType: "elite",
      base: { hp: 30, move: 8, apl: 3, ga: 1, df: 3, cost: 18 },
      armorOptions: [
        { id: "ash-nomad-hide", name: "Skora nomady", save: "4+", hpBonus: 4, moveMod: 0, cost: 3 },
        { id: "ash-nomad-scale", name: "Luski wyprawowe", save: "3+", hpBonus: 5, moveMod: -1, cost: 5 },
        { id: "ash-nomad-storm", name: "Pancerz burzowy", save: "3+", hpBonus: 6, moveMod: -1, cost: 6 }
      ],
      weaponOptions: [
        { id: "ash-nomad-saber", name: "Szabla wydmowa", attacks: 6, hit: "3+", damage: 3, range: 1, cost: 4 },
        { id: "ash-nomad-spear", name: "Wlocznia stepowa", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-nomad-bow", name: "Luk nomadow", attacks: 4, hit: "3+", damage: 3, range: 13, cost: 4 },
        { id: "ash-nomad-javelins", name: "Dzidy lotne", attacks: 4, hit: "3+", damage: 3, range: 10, cost: 3 },
        { id: "ash-nomad-whip", name: "Bicz kolcowy", attacks: 6, hit: "4+", damage: 3, range: 1, cost: 3 }
      ]
    },
    {
      id: "ash-stepper",
      name: "Stepownik",
      classType: "elite",
      base: { hp: 32, move: 8, apl: 3, ga: 1, df: 3, cost: 20 },
      armorOptions: [
        { id: "ash-step-hide", name: "Skora przeleczy", save: "4+", hpBonus: 4, moveMod: 0, cost: 3 },
        { id: "ash-step-lamellar", name: "Lamela stepowa", save: "3+", hpBonus: 5, moveMod: -1, cost: 5 },
        { id: "ash-step-bone", name: "Kosci drapieznika", save: "3+", hpBonus: 6, moveMod: -1, cost: 6 }
      ],
      weaponOptions: [
        { id: "ash-step-poleaxe", name: "Topor drzewcowy", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-step-greatbow", name: "Wielki luk stepu", attacks: 4, hit: "3+", damage: 4, range: 14, cost: 5 },
        { id: "ash-step-heavycross", name: "Ciezka kusza", attacks: 3, hit: "3+", damage: 5, range: 12, cost: 5, abilities: ["Penetrate 1"] },
        { id: "ash-step-spear", name: "Wlocznia przeleczy", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-step-blade", name: "Ostrze stepowe", attacks: 6, hit: "4+", damage: 3, range: 1, cost: 4 }
      ]
    },
    {
      id: "ash-hunter",
      name: "Lowca",
      classType: "elite",
      base: { hp: 31, move: 7, apl: 3, ga: 1, df: 3, cost: 22 },
      armorOptions: [
        { id: "ash-hunt-hide", name: "Skora wiwerni", save: "4+", hpBonus: 5, moveMod: 0, cost: 4 },
        { id: "ash-hunt-bone", name: "Pancerz lowow", save: "3+", hpBonus: 6, moveMod: -1, cost: 6 },
        { id: "ash-hunt-chief", name: "Plyta trofeow", save: "3+", hpBonus: 7, moveMod: -1, cost: 7 }
      ],
      weaponOptions: [
        { id: "ash-hunt-harpoon", name: "Harpun lowcy", attacks: 4, hit: "3+", damage: 4, range: 12, cost: 5 },
        { id: "ash-hunt-spear", name: "Wlocznia wiwernia", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 4 },
        { id: "ash-hunt-axes", name: "Topory obozowe", attacks: 6, hit: "4+", damage: 3, range: 1, cost: 4 },
        { id: "ash-hunt-cleaver", name: "Rzeznik bestii", attacks: 5, hit: "3+", damage: 4, range: 1, cost: 5, abilities: ["Cleave"] },
        { id: "ash-hunt-bow", name: "Luk czerwonej mgly", attacks: 4, hit: "3+", damage: 4, range: 14, cost: 5 }
      ]
    },
    {
      id: "ash-local-hero",
      name: "Local Hero",
      classType: "heroic",
      base: { hp: 36, move: 7, apl: 3, ga: 1, df: 3, cost: 28 },
      armorOptions: [
        { id: "ash-local-hide", name: "Pancerz czolowego lowcy", save: "3+", hpBonus: 6, moveMod: 0, cost: 6 },
        { id: "ash-local-bone", name: "Kosci pradawnych", save: "2+", hpBonus: 8, moveMod: -1, cost: 8 },
        { id: "ash-local-iron", name: "Czarne zelazo", save: "2+", hpBonus: 9, moveMod: -1, cost: 9 }
      ],
      weaponOptions: [
        { id: "ash-local-sword", name: "Miecz bohatera", attacks: 6, hit: "3+", damage: 4, range: 1, cost: 5 },
        { id: "ash-local-axe", name: "Topor bohatera", attacks: 6, hit: "3+", damage: 5, range: 1, cost: 6 },
        { id: "ash-local-spear", name: "Wlocznia bohatera", attacks: 6, hit: "3+", damage: 4, range: 1, cost: 5 },
        { id: "ash-local-bow", name: "Luk bohatera", attacks: 4, hit: "3+", damage: 4, range: 14, cost: 5 },
        { id: "ash-local-dual", name: "Podwojne ostrza", attacks: 7, hit: "4+", damage: 3, range: 1, cost: 5 }
      ]
    },
    {
      id: "ash-general",
      name: "General mrowiska",
      classType: "heroic",
      base: { hp: 42, move: 7, apl: 3, ga: 1, df: 4, cost: 34 },
      armorOptions: [
        { id: "ash-gen-plate", name: "Plyta dowodcy", save: "3+", hpBonus: 7, moveMod: 0, cost: 7, abilities: ["Shield 1"] },
        { id: "ash-gen-royal", name: "Plyta mrowiska", save: "2+", hpBonus: 9, moveMod: -1, cost: 9, abilities: ["Shield 1"] },
        { id: "ash-gen-bastion", name: "Pancerz bastionowy", save: "2+", hpBonus: 10, moveMod: -1, cost: 10, abilities: ["Shield 2"] }
      ],
      weaponOptions: [
        { id: "ash-gen-sword", name: "Miecz generala", attacks: 6, hit: "3+", damage: 5, range: 1, cost: 6 },
        { id: "ash-gen-halberd", name: "Halabarda sztabowa", attacks: 6, hit: "3+", damage: 5, range: 1, cost: 6 },
        { id: "ash-gen-hammer", name: "Mlot szturmowy", attacks: 6, hit: "3+", damage: 5, range: 1, cost: 6 },
        { id: "ash-gen-crossbow", name: "Kusza oficerska", attacks: 4, hit: "3+", damage: 4, range: 12, cost: 5, abilities: ["Penetrate 1"] },
        { id: "ash-gen-shield", name: "Tarcza i miecz", attacks: 5, hit: "2+", damage: 4, range: 1, cost: 6, abilities: ["Shield 2"] }
      ]
    },
    {
      id: "ash-crimson",
      name: "Karmazynowy",
      classType: "heroic",
      base: { hp: 48, move: 6, apl: 3, ga: 1, df: 4, cost: 42 },
      armorOptions: [
        { id: "ash-crimson-core", name: "Czerwony pancerz", save: "2+", hpBonus: 10, moveMod: 0, cost: 10, abilities: ["Shield 1"] },
        { id: "ash-crimson-bastion", name: "Karmazynowy bastion", save: "2+", hpBonus: 12, moveMod: -1, cost: 12, abilities: ["Shield 2"] },
        { id: "ash-crimson-legend", name: "Legenda popieliska", save: "2+", hpBonus: 14, moveMod: -1, cost: 14, abilities: ["Shield 2"] }
      ],
      weaponOptions: [
        { id: "ash-crimson-sword", name: "Miecz karmazynowy", attacks: 6, hit: "2+", damage: 6, range: 1, cost: 7, abilities: ["Critical 5+"] },
        { id: "ash-crimson-halberd", name: "Halabarda krwi", attacks: 6, hit: "2+", damage: 6, range: 1, cost: 7 },
        { id: "ash-crimson-maul", name: "Mlot popielny", attacks: 6, hit: "2+", damage: 7, range: 1, cost: 8 },
        { id: "ash-crimson-axe", name: "Topor egzekutora", attacks: 6, hit: "2+", damage: 6, range: 1, cost: 7 },
        { id: "ash-crimson-shield", name: "Tarcza miazdzaca", attacks: 5, hit: "2+", damage: 5, range: 1, cost: 6, abilities: ["Shield 2"] }
      ]
    }
  ]
};
})();

