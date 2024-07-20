//Globals
//STATS
var HP=200000
var HPRegen=10
var meleeDamage=10000
var rangedDamage=5000


//Functions
function getSurroundingPlayers(npc){
    var surroundingPlayers = npc.getSurroundingEntities(npc.getAggroRange(), 1)
    npc.setTempData("lastSurroundingPlayers", surroundingPlayers)
    return surroundingPlayers;
}
//Adjust stats by surrounding players amount
function partyStatsAdjuster(npc, multiplier) {
    // Ensure HP and other relevant stats are defined and valid numbers
    if (typeof HP !== 'number' || isNaN(HP) || HP <= 0) {
        return; // Exit if HP is not valid
    }
    if (typeof HPRegen !== 'number' || isNaN(HPRegen) || HPRegen < 0) {
        return; // Exit if HPRegen is not valid
    }
    if (typeof meleeDamage !== 'number' || isNaN(meleeDamage) || meleeDamage < 0) {
        return; // Exit if meleeDamage is not valid
    }
    if (typeof rangedDamage !== 'number' || isNaN(rangedDamage) || rangedDamage < 0) {
        return; // Exit if rangedDamage is not valid
    }

    var surroundingPlayers = getSurroundingPlayers(npc);
    var surroundingPlayersAmount = surroundingPlayers.length;

    // Update stats only if the number of surrounding players is greater than 1
    if (surroundingPlayersAmount > 1) {
        var newMaxHealth = HP * surroundingPlayersAmount * multiplier;
        var newHealthRegen = HPRegen * surroundingPlayersAmount * (multiplier - 0.5);
        var newMeleeStrength = meleeDamage * surroundingPlayersAmount * (multiplier - 0.5);
        var newRangedStrength = rangedDamage * surroundingPlayersAmount * (multiplier - 0.5);

        if (!isNaN(newMaxHealth) && !isNaN(newHealthRegen) && !isNaN(newMeleeStrength) && !isNaN(newRangedStrength)) {
            var currentHealth = npc.getHealth();
            var maxHealth = npc.getMaxHealth();

            // Proportionally adjust current health
            var newCurrentHealth = (currentHealth / maxHealth) * newMaxHealth;

            npc.setMaxHealth(newMaxHealth);
            npc.setHealth(newCurrentHealth);
            npc.setHealthRegen(newHealthRegen);
            npc.setMeleeStrength(newMeleeStrength);
            npc.setRangedStrength(newRangedStrength);
            npc.setTempData("statsAdjustedToPlayers", 1);
        }
    } else {
        // Reset to default stats if only one player is around
        var currentHealth = npc.getHealth();
        var maxHealth = npc.getMaxHealth();

        // Proportionally adjust current health
        var newCurrentHealth = (currentHealth / maxHealth) * HP;

        npc.setMaxHealth(HP);
        npc.setHealth(newCurrentHealth);
        npc.setHealthRegen(HPRegen);
        npc.setMeleeStrength(meleeDamage);
        npc.setRangedStrength(rangedDamage);
        npc.removeTempData("statsAdjustedToPlayers");
    }

    // Update the last surrounding players amount
    npc.setTempData("lastSurroundingPlayers", surroundingPlayersAmount);
}


//HOOKS

//Initial events
function init(t){
    t.npc.setMaxHealth(HP)
    t.npc.setHealth(HP)
    t.npc.setHealthRegen(HPRegen)
    t.npc.setMeleeStrength(meleeDamage)
    t.npc.setRangedStrength(rangedDamage)
    t.npc.setName("§fTienshinhan")
    t.npc.setTitle("§2Clon§4")
}
//Events per tick
function tick(t){

    //AI
    if(t.npc.isAttacking()){
        var targ = t.npc.getAttackTarget()
        var ClosestPlayer
        if(targ.getType() != 1){
        ClosestPlayer = t.npc.world.getClosestVulnerablePlayer(t.npc.getPos(),t.npc.getAggroRange(),3)
        if(targ != ClosestPlayer){
            //t.npc.say("Changing target to:"+ClosestPlayer)
            t.npc.setAttackTarget(ClosestPlayer)
            }
        }
    }
}
function target(t){
    //Stats adjuster
    partyStatsAdjuster(t.npc, 1)
    //Flying
    t.npc.setFly(1)
    t.npc.setFlyHeightLimit(600)
    t.npc.setFlySpeed(5.0)
    t.npc.setFlyGravity(0.9)
}