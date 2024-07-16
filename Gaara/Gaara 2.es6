//Globals
//STATS
var HP=2000
var meleeDamage=20
var rangedDamage=40
//Default aggro range
var DefaultRange = 3
var CombatRange = 64
//Transformation variables
var transformationName = "Sabaku No Gaara"
var transformationCloneTab = 1
//Shield of sand or other invulnerabilitys.
var invulnerableToTypes=["ninjutsu_damage","mob","arrow"]
//Stun
var HitsToStun = [5,9] //This is a range. So between 3-5 hits.
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
//Initial sound.
function roar(npc){
    npc.world.playSoundAt(npc.getPos(),transformSound,1,1)
}
//Transformation
function transform(npc){
    transforming=true
    npc.getTempdata().put("LastTarget",npc.getAttackTarget())
    npc.world.playSoundAt(npc.getPos(),transformSound,1,1)
    npc.timers.forceStart(18,RegenSpeed,true)
    npc.ai.setRetaliateType(3)
}
//Stun and unstun.
function Stun(npc){
    npc.world.playSoundAt(npc.getPos(),StunSound,1,1)
    npc.timers.forceStart(17,StunDuration,false)
    npc.ai.setRetaliateType(3)
}
    
function UnStun(npc){
    npc.ai.setRetaliateType(0)
}    


//NPC Hooks

//Initial events
function init(t){
    //Initial sound
    roar(t.npc)
    //Stats initializer.
    t.npc.stats.setMaxHealth(HP)
    t.npc.stats.melee.setStrength(meleeDamage)
    t.npc.stats.ranged.setStrength(rangedDamage)
    //Default aggro range
    t.npc.stats.setAggroRange(DefaultRange)
    //Shield and Skill
    t.npc.getTempdata().put("shielded",1)
    t.npc.getTempdata().remove("skillUsed")
    //Stun initializer
    t.npc.getTempdata().put("hitsNeeded",Math.round(Math.random()*(HitsToStun[1]-HitsToStun[0]))+HitsToStun[0])
    t.npc.getTempdata().put("hitsTaken",0)
}

//Start of combat events
function target(t){
    //Auto aggro range when attacking
    t.npc.stats.setAggroRange(CombatRange)
    t.npc.timers.forceStart(10,20,true)
}


//Events per tick
function tick(t){
    //AI
    if(t.npc.isAttacking()){
        var targ = t.npc.getAttackTarget()
        var ClosestPlayer
        if(targ.getType() != 1){
            ClosestPlayer = t.npc.world.getClosestEntity(t.npc.getPos(),t.npc.stats.getAggroRange(),3)
            if(targ != ClosestPlayer){
                t.npc.setAttackTarget(ClosestPlayer)
            }
        }
    }
}

function damaged(t){
    //Auto aggro range
    if(!t.npc.isAttacking() && t.source){
        t.npc.stats.setAggroRange(CombatRange)
        t.npc.timers.forceStart(10,20,true)
        t.npc.setAttackTarget(t.source)
    }

    //Projectiles shield
    if(t.npc.getTempdata().get("shielded") == 1){
        if(t.damageSource.getType()==invulnerableToTypes[0] || t.damageSource.getType()==invulnerableToTypes[1] || t.damageSource.getType()==invulnerableToTypes[2]){
            t.npc.world.spawnParticle("crit",t.npc.x,t.npc.y+1,t.npc.z,0.3,0.2,0.3,0.01,120)
            t.setCanceled(true)
        }
    }
    
    //Stun
    var taken = t.npc.getTempdata().get("hitsTaken")
    var needed = t.npc.getTempdata().get("hitsNeeded")
    taken = taken + 1
    if(taken >= needed ){
        Stun(t.npc)
        t.npc.getTempdata().put("hitsNeeded",(Math.round(Math.random()*(HitsToStun[1]-HitsToStun[0]))+HitsToStun[0]))
        taken = 0;
    }
    t.npc.getTempdata().put("hitsTaken",taken)
    if(NpcImmuneWhenNotStunned && !t.npc.timers.has(17) && transforming!=true){
        t.npc.world.playSoundAt(t.npc.getPos(),NoDamageSound,1,0.8)
        t.setCanceled(true)
    }    
    //Transform
    if(t.npc.getTempdata().has("skillUsed"))return;
    if(t.npc.timers.has(18)){
        t.npc.world.playSoundAt(t.npc.getPos(),AttackBounceSound,1,1)
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
    //Automatic aggro range
    if(t.id == 10){
        if(!t.npc.isAttacking()){
            t.npc.timers.stop(10)
            t.npc.stats.setAggroRange(DefaultRange)
        }
    }
    //Stun timer.
    if(t.id == 17 && transforming!=true){
        UnStun(t.npc)
    }
    //Transformation.
    if(t.id == 18){
        t.API.clones.spawn(t.npc.x,t.npc.y,t.npc.z,transformationCloneTab,transformationName,t.npc.world)
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
        var angle = dr;var pitch = (dp)*Math.PI/180
    }
    var dx = -Math.sin(angle*Math.PI/180)*(distance*Math.cos(pitch))
    var dy = Math.sin(pitch)*distance
    var dz = Math.cos(angle*Math.PI/180)*(distance*Math.cos(pitch))
    return [dx,dy,dz]
}