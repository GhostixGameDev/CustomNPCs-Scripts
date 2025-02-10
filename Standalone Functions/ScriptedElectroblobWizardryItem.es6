function castSpell(caster, spellId, modifiers){
    var spellModType = Java.type("electroblob.wizardry.util.SpellModifiers");
    var spellModifiers = new spellModType;
    var spellType = Java.type("electroblob.wizardry.spell.Spell");
    var spell = spellType.get(spellId);
    for (var mod in modifiers)
    {
        spellModifiers.set(mod, (modifiers[mod] || 1), true);
    }
    spell.cast(caster.world.getMCWorld(), caster.getMCEntity(), Java.type("net.minecraft.util.EnumHand").valueOf("MAIN_HAND"), 0, spellModifiers);
}

function interact(t){
    castSpell(t.player, "ebwizardry:fireball", {"potency":1});
}