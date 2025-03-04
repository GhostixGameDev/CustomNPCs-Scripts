//REMEMBER TO USE THIS SCRIPT WITH CNPC EPIC FIGHT INTEGRATION AND IT RESPECTIVE DATAPACK AND BEHAVIOR.

// Configurable animations
var animations = {
    hold: "epicfight:biped/living/hold_greatsword",
    knockout: "epicfight:biped/living/kneel"
};
var knockedOut = false;


function init(t){
    t.npc.playEFAnimation(animations.hold);
}
function update(t){
    t.npc.playEFAnimation(animations.hold);
}

function target(t){
    if (knockedOut) { 
        t.setCanceled(t)
        return;
    };
}
function attack(t){
    if (knockedOut){
        t.setCanceled(true);
    }
}
function died(t){
    knockout(t);
}

function damaged(t){
    if (knockedOut){
        t.setCanceled(true);
    }
    if(t.npc.getHealth() - t.damage <= 1){
        t.damage = 0
        knockout(t);
    }
}


function knockout(t){
        t.npc.setHealth(1)
        knockedOut = true;
        t.npc.setAttackTarget(null);
        t.npc.ai.setRetaliateType(3);
        t.npc.playEFAnimation(animations.knockout);
        t.npc.ai.setReturnsHome(false);
        t.npc.timers.forceStart(1, 20, true)
}

function timer(t){
    if (t.id == 1){
        if(t.npc.getHealth() > t.npc.getMaxHealth()*0.8){
            knockedOut = false;
            t.npc.ai.setRetaliateType(0);
            t.npc.ai.setReturnsHome(true);
            t.npc.timers.stop(1);
        }else{
            t.npc.playEFAnimation(animations.knockout);
            t.npc.setAttackTarget(null);
            t.npc.ai.setRetaliateType(3);
            t.npc.setHealth(t.npc.getHealth() + t.npc.getStats().getHealthRegen()*0.3);
        }
   }
 }


