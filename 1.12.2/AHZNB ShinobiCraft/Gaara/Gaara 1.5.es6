//Globals
//STATS
var HP=800
var meleeDamage=0
var rangedDamage=0
//Transformation variables
var transformationName = "gaara_boss_stage_2"
var transformationCloneTab = 1
//Transformation
var transforming=false
var regenSpeed = 5 //ticks
var regenAmount = 3 //hp
var transformSound = "narutomod:shukaku_roar"
var attackBounceSound = "minecraft:entity.guardian.hurt" //sound that plays if the player tries to damage the npc while regenerating

//Functions
//Transformation
function transform(npc){
    transforming=true
    npc.getTempdata().put("lastTarget",npc.getAttackTarget())
    npc.world.playSoundAt(npc.getPos(),transformSound,1,1)
    npc.timers.forceStart(18,regenSpeed,true)
    npc.ai.setRetaliateType(3)
}

//NPC HOOKS
//Initial events
function init(t){
    //Stats initializer.
    t.npc.stats.setMaxHealth(HP)
    t.npc.setHealth(1)
    t.npc.stats.setAggroRange(32)
    t.npc.stats.melee.setStrength(meleeDamage)
    t.npc.stats.ranged.setStrength(rangedDamage)
    transform(t.npc)
}

function damaged(t){
    if(t.npc.timers.has(18)){
        t.npc.world.playSoundAt(t.npc.getPos(),attackBounceSound,1,1)
        t.setCanceled(true)
        return;
    }
}

//Timers/Temporizadores
function timer(t){
    //Transformation.
    if(t.id == 18){
        if(t.npc.getHealth() >= t.npc.stats.getMaxHealth()){
            t.npc.ai.setRetaliateType(0)
            if(useAbilityOnlyOnce)t.npc.getTempdata().put("skillUsed",1)
            t.npc.setAttackTarget(t.npc.getTempdata().get("lastTarget"))
            t.npc.timers.stop(18)
        }
        t.npc.setHealth(t.npc.getHealth()+regenAmount)
    }
    if(t.npc.getHealth()>=HP*0.70){
        t.API.clones.spawn(t.npc.x,t.npc.y,t.npc.z, transformationCloneTab,transformationName,t.npc.world)
        t.npc.despawn()
    }
    
}