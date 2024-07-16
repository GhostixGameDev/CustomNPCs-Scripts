//Globals
//STATS
var HP=80000
var HPRegen=400
var startPoint=[1812,66,1218]
var meleeDamage=2000
var rangedDamage=20
//Transformation variables
var transformationName = "Yurin"
var transformationCloneTab = 1
//Stun
var hitsToStun = [5,9] //This is a range. So between 3-5 hits.
var stunDuration = 140 //ticks
var npcImmuneWhenNotStunned = true

var stunSound = "jinryuudragonbc:DBC2.strongpunch"

//Transformation
var transforming=false
var regenSpeed = 5 //ticks
var regenAmount = 3 //hp
var transformSound = "jinryuudragonbc:DBC.powerup"
var attackBounceSound = "jinryuudragonbc:DBC4.block2" //sound that plays if the player tries to damage the npc while regenering
var useAbilityOnlyOnce = true

//clones
var clone = "tienClone"
var cloneSound = "jinryuudragonbc:1610.sse"
var DoneAbility;
//Functions
//Transformation
function transform(npc){
    transforming=true
    npc.setTempData("LastTarget",npc.getAttackTarget())
    npc.executeCommand("playsound " + transformSound + " @p" + " 0 0 0 1 0 1")
    npc.timers.forceStart(18,regenSpeed,true)
    npc.setRetaliateType(3)
}
function makeClones(npc){
    for(var i=0; i<6; i++){
        npc.executeCommand("playsound " + cloneSound + " @p" + " 0 0 0 1 0 1")
        npc.executeCommand("kamkeel clone spawn" + clone + transformationCloneTab)
    }
}
//Stun and unstun.
function stun(npc){
    npc.executeCommand("playsound " + stunSound + " @p" + " 0 0 0 1 0 1")
    npc.timers.forceStart(17,stunDuration,false)
    npc.setRetaliateType(3)
}

function unStun(npc){
    npc.setRetaliateType(0)
}

//NPC Hooks

//Initial events
function init(t){
    //Stats initializer.
    t.npc.setHome(startPoint[0],startPoint[1],startPoint[2])
    t.npc.setPosition(startPoint[0],startPoint[1],startPoint[2])
    t.npc.setMaxHealth(HP)
    t.npc.setHealth(HP)
    t.npc.setHealthRegen(HPRegen)
    t.npc.setMeleeStrength(meleeDamage)
    t.npc.setRangedStrength(rangedDamage)
    //Shield and Skill
    t.npc.setTempData("shielded",1)
    t.npc.removeTempData("skillUsed")
    //Stun initializer
    t.npc.setTempData("hitsNeeded",Math.round(Math.random()*(hitsToStun[1]-hitsToStun[0]))+hitsToStun[0])
    t.npc.setTempData("hitsTaken",0)
    DoneAbility = false
}
//Events per tick
function tick(t){

    //AI
    if(t.npc.isAttacking()){
        var targ = t.npc.getAttackTarget()
        var ClosestPlayer
        if(targ.getType() != 1){
        ClosestPlayer = t.npc.world.getClosestEntity(t.npc.getPos(),t.npc.getAggroRange(),3)
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
    if(npcImmuneWhenNotStunned && !t.npc.timers.has(17) && transforming!=true){
        t.npc.executeCommand("playsound " + attackBounceSound + " " + t.getSource().getName() + " 0 0 0 1 0 1")
        t.setCanceled(true)
    }
    //Clone
    //Make a check for if the NPC health is low enough, AND the global variable for the ability is false
    if(t.npc.getHealth()-t.damage <= t.npc.getMaxHealth()*0.50 && !DoneAbility){
        DoneAbility = true
        makeClones(t.npc)
    }
    //Transform
    if(t.npc.hasTempData("skillUsed")) return;
    if(t.npc.timers.has(18)){
        t.npc.executeCommand("playsound " + attackBounceSound + " " + t.getSource().getName() + " 0 0 0 1 0 1")
        t.setCanceled(true)
        return;
    }
    if(t.npc.getHealth() - t.damage <= 0){
        t.damage = 0
        t.npc.setHealth(1)
        transform(t.npc)
    }
}

//Timers/Temporizadores
function timer(t){
    //Stun timer.
    if(t.id == 17 && transforming!=true){
        unStun(t.npc)}
    //Transformation.
    if(t.id == 18){
        t.npc.executeCommand("kamkeel clone spawn " + transformationName + " " + transformationCloneTab)
        t.npc.despawn()
    }
    //Enable this and disable the top code if you want the
    //Transformation in the same npc.
    //if(t.npc.getHealth() >= t.npc.getMaxHealth()){
        //t.npc.setRetaliateType(0)
        //if(useAbilityOnlyOnce)t.npc.setTempData("skillUsed",1)
        //t.npc.setAttackTarget(t.npc.getTempData("LastTarget"))
        //t.npc.timers.stop(18)}
    //t.npc.setHealth(t.npc.getHealth()+regenAmount)
    //}

    
}






