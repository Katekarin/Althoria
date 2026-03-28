(function () {
  function pickNearest(fromUnit, candidates, getDistance) {
    if (!candidates.length) {
      return null;
    }

    let best = candidates[0];
    let bestDist = getDistance(fromUnit, best);

    for (let i = 1; i < candidates.length; i++) {
      const dist = getDistance(fromUnit, candidates[i]);

      if (dist < bestDist) {
        bestDist = dist;
        best = candidates[i];
      }
    }

    return best;
  }

  function pickObjective(unit, objectives, getDistance) {
    const targets = objectives.filter((obj) => obj.owner !== "enemy");

    if (!targets.length) {
      return null;
    }

    let best = targets[0];
    let bestDist = getDistance(unit, targets[0]);

    for (let i = 1; i < targets.length; i++) {
      const dist = getDistance(unit, targets[i]);

      if (dist < bestDist) {
        bestDist = dist;
        best = targets[i];
      }
    }

    return best;
  }

  async function runTurn(context) {
    const enemyUnits = context.getEnemyUnits();

    if (!enemyUnits.length) {
      return;
    }

    const enemy = enemyUnits[0];

    if (enemy.hp <= 0) {
      return;
    }

    let mainUsed = false;
    let moveUsed = false;
    let bonusUsed = false;

    const playerUnits = context.getPlayerUnits();

    if (!playerUnits.length) {
      context.markEnemyActivated(enemy);
      return;
    }

    let nearestPlayer = pickNearest(enemy, playerUnits, context.getDistanceBetweenUnits);

    if (nearestPlayer && !mainUsed) {
      const charged = await context.tryEnemyCharge(enemy, nearestPlayer);

      if (charged) {
        mainUsed = true;
        await context.delay(120);
      }
    }

    if (!mainUsed) {
      const objective = pickObjective(enemy, context.getObjectives(), context.getDistanceToObjective);

      if (objective) {
        const captured = context.tryEnemyCapture(enemy, objective);

        if (captured) {
          mainUsed = true;
          await context.delay(80);
        }
      }
    }

    nearestPlayer = pickNearest(enemy, context.getPlayerUnits(), context.getDistanceBetweenUnits);

    if (!moveUsed && nearestPlayer) {
      const moved = await context.tryEnemyMove(enemy, nearestPlayer.xIn, nearestPlayer.yIn, enemy.move);

      if (moved) {
        moveUsed = true;
        await context.delay(120);
      }
    }

    nearestPlayer = pickNearest(enemy, context.getPlayerUnits(), context.getDistanceBetweenUnits);

    if (!mainUsed && nearestPlayer) {
      const attackedAfterMove = context.tryEnemyAttack(enemy, nearestPlayer);

      if (attackedAfterMove) {
        mainUsed = true;
        await context.delay(120);
      }
    }

    if (!bonusUsed) {
      const objective = pickObjective(enemy, context.getObjectives(), context.getDistanceToObjective);
      const dashTarget = objective ? { xIn: objective.xIn, yIn: objective.yIn } : nearestPlayer;

      if (dashTarget) {
        const dashed = await context.tryEnemyMove(enemy, dashTarget.xIn, dashTarget.yIn, Math.max(1, Math.floor(enemy.move / 2)));

        if (dashed) {
          bonusUsed = true;
          await context.delay(100);
        }
      }
    }

    context.markEnemyActivated(enemy);
  }

  window.EnemyAI = {
    runTurn,
  };
})();
