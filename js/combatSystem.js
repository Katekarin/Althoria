(function () {
  const DEBUG_COMBAT_LOGS = true;

  function parseHitValue(hitText) {
    return Number(String(hitText).replace("+", ""));
  }

  function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function rollPool(pool, threshold, options = {}) {
    const { rerollOnes = false } = options;
    const rolls = [];
    let successes = 0;

    for (let i = 0; i < pool; i++) {
      let roll = rollD6();

      if (rerollOnes && roll === 1) {
        roll = rollD6();
      }

      rolls.push(roll);

      if (roll >= threshold) {
        successes += 1;
      }
    }

    return { rolls, successes, threshold };
  }

  function formatRollDebug(label, result) {
    return `${label}: [${result.rolls.join(", ")}] vs ${result.threshold}+ => ${result.successes} sukcesow`;
  }

  function debugFightConsole(attacker, defender, debug) {
    if (!DEBUG_COMBAT_LOGS) {
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

  function isRangedWeapon(weapon) {
    return (Number(weapon?.range) || 1) > 1;
  }

  function getAbilityStrings(option) {
    if (!option || !Array.isArray(option.abilities)) {
      return [];
    }

    return option.abilities
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  }

  function getAbilityValue(option, key) {
    const abilities = getAbilityStrings(option);
    const pattern = new RegExp(`^${key}\\s+(\\d+)\\+?$`, "i");

    for (const ability of abilities) {
      const match = ability.match(pattern);

      if (match) {
        return Number(match[1]) || 0;
      }
    }

    return 0;
  }

  function hasAbility(option, key) {
    const abilities = getAbilityStrings(option);
    return abilities.some((ability) => ability.toLowerCase() === key.toLowerCase());
  }

  function getEntityAbilities(entity) {
    if (!entity || !Array.isArray(entity.abilities)) {
      return [];
    }

    return entity.abilities.map((entry) => String(entry || "").trim()).filter(Boolean);
  }

  function hasEntityAbility(entity, key) {
    const abilities = getEntityAbilities(entity);
    return abilities.some((ability) => ability.toLowerCase() === key.toLowerCase());
  }

  function getCritThreshold(weapon) {
    const lethal = getAbilityValue(weapon, "Lethal");
    const critical = getAbilityValue(weapon, "Critical");

    if (lethal > 0 && critical > 0) {
      return Math.min(lethal, critical);
    }

    if (lethal > 0) {
      return lethal;
    }

    if (critical > 0) {
      return critical;
    }

    return 0;
  }

  function getWeaponUsageRecord(unit) {
    if (!unit) {
      return null;
    }

    if (!unit.weaponUsage || typeof unit.weaponUsage !== "object") {
      unit.weaponUsage = {};
    }

    return unit.weaponUsage;
  }

  function getSaveProfile(unit) {
    const armor = unit?.armor;
    const dodge = Math.max(0, getAbilityValue(armor, "Dodge"));
    const block = Math.max(0, getAbilityValue(armor, "Block"));
    const endurance = Math.max(0, getAbilityValue(armor, "Endurance"));
    const ceaseless = hasAbility(armor, "Ceaseless") || getAbilityValue(armor, "Ceaseless") > 0;

    return { dodge, block, endurance, ceaseless };
  }

  function getUnitActiveModels(unit) {
    const maxModels = Math.max(1, Number(unit?.squadSize) || 1);
    const modelHp = Math.max(1, Number(unit?.modelHp) || Math.ceil((Number(unit?.maxHp) || maxModels) / maxModels));
    const hp = Math.max(0, Number(unit?.hp) || 0);

    if (hp <= 0) {
      return 0;
    }

    return Math.max(1, Math.min(maxModels, Math.ceil(hp / modelHp)));
  }

  function getWeaponAttackDiceForUnit(unit, weapon) {
    const baseAttacks = Math.max(1, Number(weapon?.attacks) || 1);
    const activeModels = getUnitActiveModels(unit);

    if (activeModels <= 1) {
      return baseAttacks;
    }

    return Math.max(1, Math.ceil(baseAttacks / 2)) * activeModels;
  }

  function applyDamageToUnit(unit, incomingDamage) {
    const damage = Math.max(0, Number(incomingDamage) || 0);
    const activeModelsBefore = getUnitActiveModels(unit);
    const modelHp = Math.max(1, Number(unit?.modelHp) || Math.ceil((Number(unit?.maxHp) || 1) / Math.max(1, Number(unit?.squadSize) || 1)));

    if (damage <= 0) {
      return { appliedDamage: 0, activeModelsBefore, activeModelsAfter: activeModelsBefore };
    }

    unit.hp = Math.max(0, (Number(unit.hp) || 0) - damage);
    const activeModelsAfter = getUnitActiveModels(unit);
    const recoverCapAfterDamage = Math.max(0, activeModelsAfter * modelHp);
    const currentRecoverCap = Math.max(0, Number(unit.maxRecoverableHp) || Number(unit.maxHp) || 0);
    unit.maxRecoverableHp = Math.min(currentRecoverCap || recoverCapAfterDamage, recoverCapAfterDamage);
    unit.currentModels = activeModelsAfter;

    return {
      appliedDamage: damage,
      activeModelsBefore,
      activeModelsAfter,
    };
  }

  function pickWeaponForAttack(unit, options = {}) {
    const { requireRanged = false, requireMelee = false, preferredWeaponId = null } = options;
    const candidates = [];

    if (unit?.weapon) {
      candidates.push(unit.weapon);
    }

    if (Array.isArray(unit?.secondaryWeapons)) {
      candidates.push(...unit.secondaryWeapons);
    }

    if (!candidates.length) {
      return null;
    }

    if (preferredWeaponId) {
      const preferredWeapon = candidates.find((weapon) => weapon?.id === preferredWeaponId);

      if (!preferredWeapon) {
        return null;
      }

      if (requireRanged && (Number(preferredWeapon?.range) || 1) <= 1) {
        return null;
      }

      if (requireMelee && (Number(preferredWeapon?.range) || 1) > 1) {
        return null;
      }

      return preferredWeapon;
    }

    if (requireRanged) {
      return candidates.find((weapon) => (Number(weapon?.range) || 1) > 1) || null;
    }

    if (requireMelee) {
      return candidates.find((weapon) => (Number(weapon?.range) || 1) <= 1) || null;
    }

    return candidates[0];
  }

  function getShieldValue(unit) {
    return getAbilityValue(unit?.armor, "Shield") + getAbilityValue(unit?.weapon, "Shield") + getAbilityValue(unit, "Shield");
  }

  function getCritBonusDamage(unit) {
    const classType = String(unit?.classType || unit?.type || "").toLowerCase();

    if (classType === "elite" || classType === "heroic" || classType === "hero") {
      return 2;
    }

    // Common and rare tier units: +1 damage per crit.
    return 1;
  }

  function countCriticalHits(rollResult, hitThreshold, criticalThreshold) {
    if (!criticalThreshold) {
      return 0;
    }

    let crits = 0;

    for (const roll of rollResult.rolls) {
      if (roll >= hitThreshold && roll >= criticalThreshold) {
        crits += 1;
      }
    }

    return crits;
  }

  function findCleaveTarget(attacker, primaryTarget) {
    return units.find((unit) => {
      if (!unit || unit.hp <= 0 || unit.side !== primaryTarget.side || unit === primaryTarget) {
        return false;
      }

      const nearPrimary = getDistanceInches(unit, primaryTarget) <= MELEE_RANGE_IN + 0.6;
      const nearAttacker = getDistanceInches(unit, attacker) <= Math.max(MELEE_RANGE_IN + 0.6, (Number(attacker?.weapon?.range) || 1) + 0.2);
      return nearPrimary && nearAttacker;
    }) || null;
  }

  function resolveFightExchange(attacker, defender, modifiers = {}) {
    const {
      attackBonusDice = 0,
      defenderSavePenalty = 0,
      counterHitPenalty = 0,
      allowCounter = true,
    } = modifiers;

    const logs = [allowCounter
      ? "Fight: atak -> save obroncy -> kontra za nietrafione ataki (jesli obronca przezyje)."
      : "Strzal: atak -> save obroncy (bez kontry na dystansie)."];

    const attackerHpBefore = attacker.hp;
    const defenderHpBefore = defender.hp;

    const isRanged = isRangedWeapon(attacker.weapon);
    const precise = Math.max(0, getAbilityValue(attacker.weapon, "Precise"));
    const accurate = Math.max(0, getAbilityValue(attacker.weapon, "Accurate"));
    const attackerHitTarget = Math.max(2, parseHitValue(attacker.weapon.hit) - precise);
    const defenderShield = getShieldValue(defender);
    const attackerShield = getShieldValue(attacker);
    const defenderSaveProfile = getSaveProfile(defender);
    const attackerSaveProfile = getSaveProfile(attacker);
    const attackerActiveModels = Math.max(1, getUnitActiveModels(attacker));
    const defenderActiveModels = Math.max(1, getUnitActiveModels(defender));
    const strength = Math.max(0, getAbilityValue(attacker.weapon, "Strength"));
    const defenderSaveTarget = Math.max(2, Math.min(6, parseHitValue(defender.armor.save) - defenderShield + strength - defenderSaveProfile.endurance - defenderSaveProfile.block));
    const attackerSaveTarget = Math.max(2, Math.min(6, parseHitValue(attacker.armor.save) - attackerShield - attackerSaveProfile.endurance - attackerSaveProfile.block));
    const penetrate = Math.max(0, getAbilityValue(attacker.weapon, "Penetrate"));
    const armourPiercing = isRanged ? Math.max(0, getAbilityValue(attacker.weapon, "Armour Piercing")) : 0;
    const brutal = Math.max(0, getAbilityValue(attacker.weapon, "Brutal"));
    const ferocious = Math.max(0, getAbilityValue(attacker.weapon, "Ferocious"));
    const volley = isRanged ? Math.max(0, getAbilityValue(attacker.weapon, "Volley")) : 0;
    const ceaseless = hasAbility(attacker.weapon, "Ceaseless");
    const rending = hasAbility(attacker.weapon, "Rending");
    const criticalThreshold = getCritThreshold(attacker.weapon);
    const critBonusDamage = getCritBonusDamage(attacker);
    const baseAttackerDicePool = getWeaponAttackDiceForUnit(attacker, attacker.weapon);
    const attackerDicePool = Math.max(0, baseAttackerDicePool + attackBonusDice + ferocious + volley);
    const automaticHits = Math.min(accurate, attackerDicePool);
    const rolledDicePool = Math.max(0, attackerDicePool - automaticHits);
    const attackRoll = rollPool(rolledDicePool, attackerHitTarget, { rerollOnes: ceaseless });
    const rendingBonusHit = rending && criticalThreshold > 0 && countCriticalHits(attackRoll, attackerHitTarget, criticalThreshold) > 0 ? 1 : 0;
    const attackHits = attackRoll.successes + automaticHits;
    const criticalHits = countCriticalHits(attackRoll, attackerHitTarget, criticalThreshold);
    const defenderSavePenaltyTotal = Math.max(0, defenderSavePenalty) + penetrate + armourPiercing + brutal;
    const defenderSaveBasePool = defenderActiveModels * 2;
    const defenderSavePool = Math.max(0, defenderSaveBasePool - defenderSavePenaltyTotal);
    const defenderAutoSaves = Math.min(defenderSavePool, defenderSaveProfile.dodge);
    const defenderSaveRoll = rollPool(Math.max(0, defenderSavePool - defenderAutoSaves), defenderSaveTarget, { rerollOnes: defenderSaveProfile.ceaseless });
    const defenderSaveSuccess = defenderSaveRoll.successes + defenderAutoSaves;
    const blockedByDefender = Math.min(attackHits, defenderSaveSuccess);
    const damageHits = Math.max(0, attackHits - blockedByDefender);
    const critDamageBonus = criticalHits * critBonusDamage;
    const rendingBonusDamage = rendingBonusHit * attacker.weapon.damage;
    const damageToDefender = damageHits * attacker.weapon.damage + critDamageBonus + rendingBonusDamage;

    const defenderDamage = applyDamageToUnit(defender, damageToDefender);

    logs.push(`Atakujacy rzuca ${rolledDicePool} kosci (+${automaticHits} auto-hit) i trafia ${attackHits}x [${attackRoll.rolls.join(", ")}].`);

    if (criticalThreshold > 0) {
      logs.push(`Critical ${criticalThreshold}+: ${criticalHits} krytow (+${critDamageBonus} dmg).`);
    }

    if (ceaseless) {
      logs.push("Ceaseless: przerzuty wszystkich wynikow 1 na kosciach ataku.");
    }

    if (precise > 0) {
      logs.push(`Precise ${precise}: latwiejsze trafienie (${attackerHitTarget}+).`);
    }

    if (accurate > 0) {
      logs.push(`Accurate ${accurate}: czesc trafien wchodzi automatycznie.`);
    }

    if (ferocious > 0) {
      logs.push(`Ferocious ${ferocious}: +${ferocious} kosci ataku.`);
    }

    if (volley > 0) {
      logs.push(`Volley ${volley}: dodatkowe kosci dla ataku dystansowego.`);
    }

    if (Math.max(1, Number(attacker?.squadSize) || 1) > 1) {
      logs.push(`Oddzial atakuje pelnym skladem: A/model ${attacker.weapon.attacks}, efektywnie ${Math.max(1, Math.ceil(attacker.weapon.attacks / 2))} na model x ${attackerActiveModels} modeli = ${baseAttackerDicePool} kosci bazowych.`);
    }

    if (penetrate > 0) {
      logs.push(`Penetrate ${penetrate}: obronca rzuca mniej kosci save.`);
    }

    if (armourPiercing > 0) {
      logs.push(`Armour Piercing ${armourPiercing}: dodatkowe oslabienie obrony celu dystansowo.`);
    }

    if (brutal > 0) {
      logs.push(`Brutal ${brutal}: obronca rzuca mniej kosci save.`);
    }

    if (strength > 0) {
      logs.push(`Strength ${strength}: save celu pogorszony do ${defenderSaveTarget}+.`);
    }

    if (rendingBonusHit > 0) {
      logs.push("Rending: kryt dodaje 1 dodatkowe trafienie bez dodatkowych save i bez wplywu na kontre.");
    }

    if (defenderShield > 0) {
      logs.push(`Shield ${defenderShield}: save obroncy ulepszony do ${defenderSaveTarget}+.`);
    }

    if (defenderSaveProfile.block > 0) {
      logs.push(`Block ${defenderSaveProfile.block}: save obroncy dodatkowo ulepszony.`);
    }

    if (defenderSaveProfile.endurance > 0) {
      logs.push(`Endurance ${defenderSaveProfile.endurance}: obronca latwiej zdaje save.`);
    }

    if (defenderSaveProfile.dodge > 0) {
      logs.push(`Dodge ${defenderSaveProfile.dodge}: automatyczne obrony ${defenderAutoSaves}.`);
    }

    if (defenderSaveProfile.ceaseless) {
      logs.push("Ceaseless: przerzuty jedynek na kosciach save obroncy.");
    }

    if (defenderActiveModels > 1) {
      logs.push(`Oddzial obroncy: 2 save/model x ${defenderActiveModels} modeli = ${defenderSaveBasePool} puli save (po modyfikatorach ${defenderSavePool}).`);
    }

    logs.push(`Obronca rzuca ${defenderSavePool} save (${defenderSaveTarget}+) i broni ${blockedByDefender} trafien [${defenderSaveRoll.rolls.join(", ")}].`);
    logs.push(`Przechodzi ${damageHits} trafien za ${defenderDamage.appliedDamage} obrazen.`);

    if (Math.max(1, Number(defender?.squadSize) || 1) > 1) {
      logs.push(`Oddzial obroncy ma wspolna pule HP: ${defender.hp > 0 ? "walczy dalej pelnym skladem" : "pula HP spadla do 0 - caly oddzial wyeliminowany"}.`);
    }

    const debug = {
      attackerHpBefore,
      defenderHpBefore,
      attackRoll,
      defenderSaveRoll,
      defenderSaveSuccess,
      blockedByDefender,
      damageHits,
      damageToDefender,
      counterRoll: { rolls: [], successes: 0, threshold: 0 },
      attackerSaveRoll: { rolls: [], successes: 0, threshold: 0 },
      attackerSaveSuccess: 0,
      blockedByAttacker: 0,
      counterDamageHits: 0,
      damageToAttacker: 0,
    };

    if (defender.hp <= 0) {
      debugFightConsole(attacker, defender, debug);
      logs.push("Obronca zostal wyeliminowany.");
      return logs;
    }

    if (!allowCounter) {
      debugFightConsole(attacker, defender, debug);
      return logs;
    }

    const missedAttacks = Math.max(0, attackerDicePool - attackHits);

    if (missedAttacks <= 0) {
      debugFightConsole(attacker, defender, debug);
      logs.push("Brak nietrafionych atakow, wiec brak kontry.");
      return logs;
    }

    const riposte = Math.max(0, getAbilityValue(defender.weapon, "Riposte"));
    const counterDice = missedAttacks + riposte;
    const counterHitTarget = Math.max(2, Math.min(6, parseHitValue(defender.weapon.hit) + Math.max(0, counterHitPenalty)));
    const counterRoll = rollPool(counterDice, counterHitTarget);
    const counterHits = counterRoll.successes;
    const attackerSaveBasePool = attackerActiveModels * 2;
    const attackerSavePool = attackerSaveBasePool;
    const attackerAutoSaves = Math.min(attackerSavePool, attackerSaveProfile.dodge);
    const attackerSaveRoll = rollPool(Math.max(0, attackerSavePool - attackerAutoSaves), attackerSaveTarget, { rerollOnes: attackerSaveProfile.ceaseless });
    const attackerSaveSuccess = attackerSaveRoll.successes + attackerAutoSaves;
    const blockedByAttacker = Math.min(counterHits, attackerSaveSuccess);
    const counterDamageHits = Math.max(0, counterHits - blockedByAttacker);
    const damageToAttacker = counterDamageHits * defender.weapon.damage;
    const attackerDamage = applyDamageToUnit(attacker, damageToAttacker);

    logs.push(`Kontra: obronca atakuje ${counterDice} koscmi (za nietrafione ataki atakujacego) i trafia ${counterHits}x [${counterRoll.rolls.join(", ")}].`);

    if (riposte > 0) {
      logs.push(`Riposte ${riposte}: dodatkowe kosci kontry obroncy.`);
    }

    if (counterHits > 0) {
      if (attackerActiveModels > 1) {
        logs.push(`Oddzial atakujacego: 2 save/model x ${attackerActiveModels} modeli = ${attackerSaveBasePool} puli save na kontre.`);
      }

      logs.push(`Atakujacy rzuca ${attackerSavePool} save (${attackerSaveTarget}+) i ma ${attackerSaveSuccess} sukcesow [${attackerSaveRoll.rolls.join(", ")}], broni ${blockedByAttacker} trafien.`);
    } else {
      logs.push("Kontra nie trafia, wiec atakujacy nie rzuca save.");
    }

    if (attackerSaveProfile.block > 0) {
      logs.push(`Block ${attackerSaveProfile.block}: save atakujacego dodatkowo ulepszony.`);
    }

    if (attackerSaveProfile.endurance > 0) {
      logs.push(`Endurance ${attackerSaveProfile.endurance}: atakujacy latwiej zdaje save.`);
    }

    if (attackerSaveProfile.dodge > 0) {
      logs.push(`Dodge ${attackerSaveProfile.dodge}: automatyczne obrony ${attackerAutoSaves} na kontrze.`);
    }

    if (attackerSaveProfile.ceaseless) {
      logs.push("Ceaseless: przerzuty jedynek na kosciach save atakujacego.");
    }

    logs.push(`Wchodzi ${counterDamageHits} trafien kontry za ${attackerDamage.appliedDamage} obrazen.`);

    if (Math.max(1, Number(attacker?.squadSize) || 1) > 1) {
      logs.push(`Oddzial atakujacego ma wspolna pule HP: ${attacker.hp > 0 ? "walczy dalej pelnym skladem" : "pula HP spadla do 0 - caly oddzial wyeliminowany"}.`);
    }
    logs.push("Na kontrze nie ma dalszej kontry, tylko save.");

    debug.counterRoll = counterRoll;
    debug.attackerSaveRoll = attackerSaveRoll;
    debug.attackerSaveSuccess = attackerSaveSuccess;
    debug.blockedByAttacker = blockedByAttacker;
    debug.counterDamageHits = counterDamageHits;
    debug.damageToAttacker = damageToAttacker;
    debugFightConsole(attacker, defender, debug);

    if (attacker.hp <= 0) {
      logs.push("Atakujacy zostal wyeliminowany.");
    }

    if (defender.hp <= 0) {
      logs.push("Obronca zostal wyeliminowany.");
    }

    return logs;
  }

  function findDirectChargePosition(attacker, target) {
    const dx = target.xIn - attacker.xIn;
    const dy = target.yIn - attacker.yIn;
    const dist = Math.hypot(dx, dy);

    if (dist <= 0.001) {
      return null;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    const xIn = Math.max(UNIT_RADIUS_IN, Math.min(BOARD_WIDTH_IN - UNIT_RADIUS_IN, target.xIn - nx * MELEE_RANGE_IN));
    const yIn = Math.max(UNIT_RADIUS_IN, Math.min(BOARD_HEIGHT_IN - UNIT_RADIUS_IN, target.yIn - ny * MELEE_RANGE_IN));

    return { xIn, yIn };
  }

  function findChargePosition(attacker, target, allowTurn) {
    const direct = findDirectChargePosition(attacker, target);

    if (direct) {
      const blocked = units.some((unit) => {
        if (unit === attacker || unit === target) {
          return false;
        }

        return Math.hypot(unit.xIn - direct.xIn, unit.yIn - direct.yIn) < MIN_GAP_IN;
      });

      if (!blocked && !isPointBlockedByTerrain(direct.xIn, direct.yIn, UNIT_RADIUS_IN * 0.6)) {
        return direct;
      }
    }

    if (!allowTurn) {
      return null;
    }

    const baseAngle = Math.atan2(attacker.yIn - target.yIn, attacker.xIn - target.xIn);

    for (let step = 0; step < 24; step++) {
      const offset = (Math.PI / 12) * step;
      const candidates = step === 0 ? [baseAngle] : [baseAngle + offset, baseAngle - offset];

      for (const angle of candidates) {
        const xIn = Math.max(UNIT_RADIUS_IN, Math.min(BOARD_WIDTH_IN - UNIT_RADIUS_IN, target.xIn + Math.cos(angle) * MELEE_RANGE_IN));
        const yIn = Math.max(UNIT_RADIUS_IN, Math.min(BOARD_HEIGHT_IN - UNIT_RADIUS_IN, target.yIn + Math.sin(angle) * MELEE_RANGE_IN));

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

  async function performChargeAttack(attacker, target, options = {}) {
    const { consumeMainAction = false, allowOnlyPlayer = false, weaponId = null } = options;

    if (allowOnlyPlayer && attacker.side !== "player") {
      setStatus("Tylko gracz moze wykonac ta akcje szarzy.");
      return false;
    }

    const initialDistance = getDistanceInches(attacker, target);
    const chargeDistance = Math.max(0, initialDistance - MELEE_RANGE_IN);
    const chargeRangeMax = attacker.move + 2;

    if (chargeDistance > chargeRangeMax) {
      setStatus(`Cel jest za daleko na szarze. Maksymalny dystans to ${chargeRangeMax}\".`);
      return false;
    }

    const allowTurn = hasEntityAbility(attacker, "Charge Turn");

    const chargePoint = findChargePosition(attacker, target, allowTurn);

    if (!chargePoint) {
      const turnNote = allowTurn
        ? "Nawet z mozliwoscia skretu brak legalnej pozycji kontaktu."
        : "Szarza wymaga ruchu po linii prostej; brak legalnej pozycji kontaktu.";
      setStatus(turnNote);
      return false;
    }

    const weaponForCharge = pickWeaponForAttack(attacker, { requireMelee: true, preferredWeaponId: weaponId });

    if (!weaponForCharge) {
      setStatus(weaponId ? "Wybrana bron nie nadaje sie do szarzy." : "Brak broni melee do wykonania szarzy.");
      return false;
    }

    const originalWeapon = attacker.weapon;
    attacker.weapon = weaponForCharge;

    if (hasAbility(attacker.weapon, "Limited")) {
      const usage = getWeaponUsageRecord(attacker);
      const key = `limited:${attacker.weapon.id}`;

      if (usage && usage[key]) {
        setStatus(`Limited: ${attacker.weapon.name} mozna uzyc tylko raz na bitwe.`);
        attacker.weapon = originalWeapon;
        return false;
      }
    }

    const chargePath = getPathBlockInfo(attacker.xIn, attacker.yIn, chargePoint.xIn, chargePoint.yIn, [attacker, target]);

    if (chargePath.blocked) {
      setStatus("Szarza zablokowana: droga do celu jest zaslonieta.");
      attacker.weapon = originalWeapon;
      return false;
    }

    await animateUnitMovement(attacker, chargePoint.xIn, chargePoint.yIn);

    const activeModels = Math.max(1, getUnitActiveModels(attacker));
    const chargeAttackBonus = activeModels;
    const logs = [
      `Szarza: +${chargeAttackBonus} kosci ataku (${activeModels} modeli), obronca ma -1 kosc save, a kontra obroncy ma hit gorszy o 1.`,
    ];

    logs.push(...resolveFightExchange(attacker, target, {
      attackBonusDice: chargeAttackBonus,
      defenderSavePenalty: 1,
      counterHitPenalty: 1,
      allowCounter: true,
    }));

    if (hasAbility(attacker.weapon, "Limited")) {
      const usage = getWeaponUsageRecord(attacker);
      const key = `limited:${attacker.weapon.id}`;

      if (usage) {
        usage[key] = true;
        logs.push("Limited: bron zostala zuzyta na te bitwe.");
      }
    }

    cleanupDeadUnits();

    if (consumeMainAction) {
      spendAction("main");
    }

    const attackerLabel = getUnitLabel(attacker);
    const defenderLabel = getUnitLabel(target);
    pushCombatLog(logs, `Szarza: ${attackerLabel} -> ${defenderLabel}`, "combat");
    setStatus(`Szarza wykonana: ${attackerLabel} -> ${defenderLabel}. Szczegoly w Raporcie Walki.`);
    attacker.weapon = originalWeapon;
    render();
    return true;
  }

  function performStandardAttack(attacker, target, options = {}) {
    const {
      consumeMainAction = false,
      consumeActionChannel = "main",
      allowOnlyPlayer = false,
      requireRanged = false,
      requireMelee = false,
      weaponId = null,
      movementState = null,
      maxRangeIn = Number(attacker?.weapon?.range) || Number(STANDARD_ATTACK_RANGE_IN) || 1,
    } = options;

    if (allowOnlyPlayer && attacker.side !== "player") {
      setStatus("Tylko gracz moze wykonac ten atak.");
      return false;
    }

    const pickedWeapon = pickWeaponForAttack(attacker, { requireRanged, requireMelee, preferredWeaponId: weaponId });

    if (!pickedWeapon) {
      if (weaponId) {
        setStatus("Wybrana bron nie jest dostepna dla tej akcji.");
      } else if (requireRanged) {
        setStatus("Ta jednostka nie ma broni dystansowej.");
      } else if (requireMelee) {
        setStatus("Ta jednostka nie ma broni melee.");
      } else {
        setStatus("Brak dostepnej broni do ataku.");
      }
      return false;
    }

    const originalWeapon = attacker.weapon;
    attacker.weapon = pickedWeapon;
    const distance = getDistanceInches(attacker, target);
    const effectiveRange = Number(pickedWeapon.range) || maxRangeIn;

    if (distance > effectiveRange) {
      setStatus(`Cel poza zasiegiem ${pickedWeapon.name}: ${effectiveRange}\".`);
      attacker.weapon = originalWeapon;
      return false;
    }

    const ranged = isRangedWeapon(attacker.weapon);

    if (ranged && hasAbility(attacker.weapon, "Heavy")) {
      const state = movementState || {};
      const blockedByHeavy = Boolean(state.moved || state.charged || state.fellBack);

      if (blockedByHeavy && !state.dashed) {
        setStatus(`Heavy: ${attacker.weapon.name} nie moze strzelac po Move/Charge/Fall Back.`);
        attacker.weapon = originalWeapon;
        return false;
      }
    }

    if (hasAbility(attacker.weapon, "Limited")) {
      const usage = getWeaponUsageRecord(attacker);
      const key = `limited:${attacker.weapon.id}`;

      if (usage && usage[key]) {
        setStatus(`Limited: ${attacker.weapon.name} mozna uzyc tylko raz na bitwe.`);
        attacker.weapon = originalWeapon;
        return false;
      }
    }

    if (ranged) {
      const enemyTooClose = units.some((unit) => {
        if (!unit || unit.hp <= 0 || unit.side === attacker.side) {
          return false;
        }

        return getDistanceInches(attacker, unit) <= 2;
      });

      if (enemyTooClose) {
        setStatus("Nie mozna strzelac: przeciwnik jest w odleglosci 2\" lub blizej.");
        attacker.weapon = originalWeapon;
        return false;
      }
    }

    if (requireRanged && !ranged) {
      setStatus("Do tej akcji wymagana jest bron dystansowa.");
      attacker.weapon = originalWeapon;
      return false;
    }

    if (requireMelee && ranged) {
      setStatus("Do tej akcji wymagana jest bron melee.");
      attacker.weapon = originalWeapon;
      return false;
    }

    if (ranged && typeof hasClearLineOfFire === "function" && !hasClearLineOfFire(attacker, target)) {
      setStatus(`Brak czystej linii strzalu dla ${attacker.weapon.name}.`);
      attacker.weapon = originalWeapon;
      return false;
    }

    const logs = [ranged
      ? `Atak dystansowy (${attacker.weapon.name}) na dystansie ${distance.toFixed(1)}".`
      : `Atak zwykly (bez szarzy) na dystansie ${distance.toFixed(1)}".`];

    logs.push(...resolveFightExchange(attacker, target, { allowCounter: !ranged }));

    if (hasAbility(attacker.weapon, "Limited")) {
      const usage = getWeaponUsageRecord(attacker);
      const key = `limited:${attacker.weapon.id}`;

      if (usage) {
        usage[key] = true;
        logs.push("Limited: bron zostala zuzyta na te bitwe.");
      }
    }

    const blastRange = Math.max(0, getAbilityValue(attacker.weapon, "Blast"));

    if (blastRange > 0) {
      const blastTargets = units.filter((unit) => {
        if (!unit || unit.hp <= 0 || unit === attacker || unit === target) {
          return false;
        }

        return getDistanceInches(unit, target) <= blastRange;
      });

      if (blastTargets.length) {
        logs.push(`Blast ${blastRange}: fala uderza ${blastTargets.length} dodatkowych celow.`);

        blastTargets.forEach((blastTarget) => {
          logs.push(`Blast trafia: ${getUnitLabel(blastTarget)}.`);
          logs.push(...resolveFightExchange(attacker, blastTarget, { allowCounter: !ranged }));
        });
      } else {
        logs.push(`Blast ${blastRange}: brak dodatkowych celow w zasiegu eksplozji.`);
      }
    }

    if (!ranged && hasAbility(attacker.weapon, "Cleave")) {
      const cleaveTarget = findCleaveTarget(attacker, target);

      if (cleaveTarget) {
        logs.push(`Cleave: dodatkowy cel ${getUnitLabel(cleaveTarget)} obok glownego celu.`);
        logs.push(...resolveFightExchange(attacker, cleaveTarget, { allowCounter: true }));
      } else {
        logs.push("Cleave: brak drugiego celu w sasiedztwie.");
      }
    }

    cleanupDeadUnits();

    if (consumeMainAction) {
      spendAction(consumeActionChannel);
    }

    const attackerLabel = getUnitLabel(attacker);
    const defenderLabel = getUnitLabel(target);
    const title = ranged ? `Strzal: ${attackerLabel} -> ${defenderLabel}` : `Atak: ${attackerLabel} -> ${defenderLabel}`;

    pushCombatLog(logs, title, "combat");
    setStatus(`Atak wykonany: ${attackerLabel} -> ${defenderLabel}. Szczegoly w Raporcie Walki.`);
    attacker.weapon = originalWeapon;
    render();
    return true;
  }

  window.CombatSystem = {
    resolveFightExchange,
    performChargeAttack,
    performStandardAttack,
  };
})();
