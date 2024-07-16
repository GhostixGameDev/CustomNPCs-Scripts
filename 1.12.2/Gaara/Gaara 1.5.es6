//Globals
//STATS
var HP=800
var meleeDamage=0
var rangedDamage=0
//Transformation variables
var transformationName = "Sabaku No Gaara 2"
var transformationCloneTab = 1
//Shield of sand or other invulnerabilitys.
var invulnerableToTypes=["ninjutsu_damage","mob","arrow","senjutsu","fall"]
var StunDuration = 90 //ticks
var NpcImmuneWhenNotStunned = true
var NoDamageSound = "minecraft:block.anvil.land"
var StunSound = "minecraft:entity.zombie.attack_iron_door"
//Transformation
var transforming=false
var RegenSpeed = 5 //ticks
var RegenAmount = 3 //hp
var transformSound = "narutomod:shukaku_roar"
var AttackBounceSound = "minecraft:entity.guardian.hurt" //sound that plays if the player tries to damage the npc while regenering
var UseAbilityOnlyOnce = true

//Functions
//Transformation
function transform(npc){
    transforming=true
    npc.getTempdata().put("LastTarget",npc.getAttackTarget())
    npc.world.playSoundAt(npc.getPos(),transformSound,1,1)
    npc.timers.forceStart(18,RegenSpeed,true)
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
    //Shield and Skill
    t.npc.getTempdata().put("shielded",1)
    t.npc.getTempdata().remove("skillUsed")
    transform(t.npc)
}

function damaged(t){
    //Projectiles shield
    if(t.npc.getTempdata().get("shielded") == 1){if(t.damageSource.getType()==invulnerableToTypes[0] || t.damageSource.getType()==invulnerableToTypes[1] || t.damageSource.getType()==invulnerableToTypes[2]){
        t.npc.world.spawnParticle("crit",t.npc.x,t.npc.y+1,t.npc.z,0.3,0.2,0.3,0.01,120)
        t.setCanceled(true)}
    }
    //Transform
    if(t.npc.getTempdata().has("skillUsed"))return;
    if(t.npc.timers.has(18)){
        t.npc.world.playSoundAt(t.npc.getPos(),AttackBounceSound,1,1)
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
            if(UseAbilityOnlyOnce)t.npc.getTempdata().put("skillUsed",1)
            t.npc.setAttackTarget(t.npc.getTempdata().get("LastTarget"))
            t.npc.timers.stop(18)
        }
        t.npc.setHealth(t.npc.getHealth()+RegenAmount)
    }
    if(t.npc.getHealth()>=HP*0.70){
        t.API.clones.spawn(t.npc.x,t.npc.y,t.npc.z, transformationCloneTab,transformationName,t.npc.world)
        t.npc.despawn()
    }
    
}

//Projectile detector
function FrontVectors(entity,dr,dp,distance,mode){
    if(!mode)mode=0
    if(mode == 1){
        var angle = dr + entity.getRotation();var pitch = (-entity.getPitch()+dp)*Math.PI/180;
        if(dp==0){
            pitch=0;
        }
    }
    if(mode == 0){
        var angle = dr;
        var pitch = (dp)*Math.PI/180
    }
    var dx = -Math.sin(angle*Math.PI/180)*(distance*Math.cos(pitch))
    var dy = Math.sin(pitch)*distance
    var dz = Math.cos(angle*Math.PI/180)*(distance*Math.cos(pitch))
    return [dx,dy,dz]
}