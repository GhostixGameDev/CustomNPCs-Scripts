//Globals
//STATS
var HP=50000
var HPRegen=400
var startPoint=[1204, 72, 1038] //Change this to your npc starting point
var meleeDamage=1000
var rangedDamage=10
//Stun
var hitsToStun = [5,9] //This is a range. So between 3-5 hits.
var stunDuration = 140 //ticks
var npcImmuneWhenNotStunned = true
var stunSound = "jinryuudragonbc:DBC2.strongpunch"
var attackBounceSound = "jinryuudragonbc:DBC4.block2"
//Critical hits
var damageBoost = 5 
var criticSound = "jinryuudragonbc:DBC2.strongpunch"
var randomHitRange = [4,10]

//Functions
//Critics
function pickRandomNumberInRange(num1,num2){
    var range = [num1,num2]
    var num = (Math.round(Math.random()*(range[1]-range[0]))+range[0])
    return num;
}
//Stun and unstun.
function stun(npc){
    playSound(npc, cloneSound)
    npc.timers.forceStart(17,stunDuration,false)
}
function unStun(npc){
    npc.say("NO VENCERAS AL CAMPEON DEL MUNDO!")
}
//Utilities
function playSound(npc, sound){
    npc.getWorld().playSoundAtEntity(npc, sound, 1.0, 0.0)
}
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





//Initial events
function init(t){
    t.npc.timers.clear()
    //Stats initializer.
    t.npc.setHome(startPoint[0],startPoint[1],startPoint[2])
    t.npc.setPosition(startPoint[0],startPoint[1],startPoint[2])
    t.npc.setMaxHealth(HP)
    t.npc.setHealth(HP)
    t.npc.setHealthRegen(HPRegen)
    t.npc.setMeleeStrength(meleeDamage)
    t.npc.setRangedStrength(rangedDamage)
    //t.npc.setName("§fTienshinhan") Enable if u dont care about using it on quests.
    t.npc.setTitle("§2Campeon del Torneo§6")
    //Shield and Skill
    t.npc.setTempData("shielded",1)
    t.npc.removeTempData("skillUsed")
    //Stun initializer
    t.npc.setTempData("hitsNeeded",Math.round(Math.random()*(hitsToStun[1]-hitsToStun[0]))+hitsToStun[0])
    t.npc.setTempData("hitsTaken",0)
    doneAbility = false
    //Critics
    hitNumGoal = pickRandomNumberInRange(randomHitRange[0],randomHitRange[1])
    hitNum = 0;
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
function damaged(t){
    //uncomment this is you wanna know the damage type of something
    //t.npc.say(t.damageSource.getType())
    //Stun
    var taken = t.npc.getTempData("hitsTaken")
    var needed = t.npc.getTempData("hitsNeeded")
    taken = taken + 1
    if(taken >= needed ){
        stun(t.npc)
        t.npc.setTempData("hitsNeeded",(Math.round(Math.random()*(hitsToStun[1]-hitsToStun[0]))+hitsToStun[0]))
        taken = 0;
    }
    t.npc.setTempData("hitsTaken",taken)
    if(npcImmuneWhenNotStunned && !t.npc.timers.has(17)){
        
        playSound(t.npc, attackBounceSound)
        t.setCanceled(true)
    }
}

function target(t){
    //Stats adjuster
    partyStatsAdjuster(t.npc, 1)

}

function meleeAttack(t){
    //Critics
    hitNum = hitNum +1
    if(hitNum > hitNumGoal){
        playSound(t.npc, criticSound)
        t.npc.getWorld().spawnParticle("crit",t.target.x,t.target.y+1,t.target.z,0.3,0.3,0.3,0,15)
        t.damage = t.damage + damageBoost
        hitNumGoal = pickRandomNumberInRange(randomHitRange[0],randomHitRange[1])
        hitNum = 0
    }
}
//Timers/Temporizadores
function timer(t){
    //Stun timer.
    if(t.id == 17){
        unStun(t.npc)}
    
}

//Transformation.
function killed(t){
    t.npc.say("Me dolia el estomago...");
}








