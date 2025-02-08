function damaged(t){
    var source = t.damageSource.getImmediateSource();
    var damageSourceY = source != null ? source.getY() : 0
    if(damageSourceY >= t.npc.getY() + 0.90){
        t.setCanceled(true);
        t.npc.say("Daño cancelado");
     }
}