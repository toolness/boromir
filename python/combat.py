import random
import time
import grammar

pierce_verbs_light = [ "scrape[s]", "scratch[es]", "graze[s]", "minorly wound[s]" ]
pierce_verbs_medium = [ "cut[s] into", "wound[s]", "maul[s]" ]
pierce_verbs_heavy = [ "tear[s] into", "rip[s] into", "drive[s] %(his)s %(weapon)s into", \
  "thrust[s] %(his)s %(weapon)s into" ]

slash_verbs_light = [ "scrape[s]", "scratch[es]", "graze[s]", "head-butt[s]", "punch[es]", "kick[s]" ]
slash_verbs_medium = [ "cut[s] into", "wound[s]", "slash[es]", "slice[s]", "stab[s]" ]
slash_verbs_heavy = [ "tear[s] into", "drive[s] %(his)s %(weapon)s into", \
  "thrust[s] %(his)s %(weapon)s into", "skewer[s]", "run[s] %(his)s %(weapon)s through"]

bludgeon_verbs_light = [ "strike[s]", "glance[s]", "slap[s]" ]
bludgeon_verbs_medium = [ "pound[s]", "beat[s]", "batter[s]", "hammer[s]", "slug[s]" ]
bludgeon_verbs_heavy = [ "hurl[s] %(his)s %(weapon)s into", "hammer[s] %(his)s %(weapon)s into", "drive[s] %(his)s %(weapon)s into" ]

pierce_words = [ pierce_verbs_light, pierce_verbs_medium, pierce_verbs_heavy ]
slash_words = [ slash_verbs_light, slash_verbs_medium, slash_verbs_heavy ]
bludgeon_words = [ bludgeon_verbs_light, bludgeon_verbs_medium, bludgeon_verbs_heavy ]

fatal_misses = [ "%(o_name)s tr<ies|y> to anticipate %(name_pos)s attack, but miscalculate<s>...", \
  "%(o_name)s <is|are> caught off-guard for a moment...!", \
  "%(o_name)s tr<ies|y> to dodge %(name_pos)s attack, but stumble<s>...", \
  "Weary from battle, %(o_name)s stagger<s> for a moment...", \
  "%(name)s trip[s] %(o_name)s and %(o_he)s fall<s> to the ground!", \
  "%(name)s launch[es] %(himself)s at %(o_name)s!" ]

fatal_misses_2 = [ "%(o_name)s make<s> a feeble attempt to block %(name_pos)s next attack...", \
  "%(o_name)s moan<s>...", \
  "%(o_name)s reel<s> from the shock...", \
  "%(o_name)s stagger<s>...", \
  "%(o_name)s fall<s> to %(o_his)s knees!", \
  "%(name)s trip[s] %(o_name)s and %(o_he)s fall<s> to the ground!" ]

weapon_list = [
    [ "mace and chain",  12,  "1d8", 0, 2, 12, "b", bludgeon_words ],
    [ "warhammer",       12,  "1d8", 0, 3,  8, "b", bludgeon_words],
    [ "greatsword",      50,  "2d6", 1, 2, 15, "s", slash_words],
    [ "longsword",       15,  "1d8", 1, 2,  4, "s", slash_words],
    [ "dagger",           2,  "1d4", 1, 2,  1, "p", pierce_words],
    [ "battleaxe",       10,  "1d8", 0, 3,  7, "s", slash_words]
]

armor_list = [
    [ "cloth",            0,  0,  8,   1 ],
    [ "padded",           5,  1,  8,  10 ],
    [ "leather",         10,  2,  6,  15 ],
    [ "chain shirt",    100,  4,  4,  25 ],
    [ "chainmail",      150,  5,  2,  40 ],
    [ "splint mail",    200,  6,  0,  45 ],
    [ "half plate",     600,  7,  0,  50 ],
    [ "full plate",    1500,  8,  1,  50 ]
    ]

human_parts_light = [ "fingers", "hand", "shoulder", "arm", "foot", "leg" ]
human_parts_medium = [ "right arm", "left arm", "right leg", "left leg", "side", "flank" ]
human_parts_heavy = [ "thigh", "stomach", "knee", "midsection", "torso", "ribcage", "back" ]
human_parts_fatal = [ "chest", "head", "neck", "spine", "skull", "eyes" ]

human_parts = [ human_parts_light, human_parts_medium, human_parts_heavy, human_parts_fatal ]

# attacks per round for fighter classes, 3rd ed PHB pg. 36
attacks_per_round = [ \
    [1], [2], [3], [4], [5], [6,1], [7,2], [8,3], [9,4], \
    [10,5], [11,6,1], [12,7,2], [13,8,3], [14,9,4], \
    [15,10,5], [16,11,6,1], [17,12,7,2], [18,13,8,3], \
    [19,14,9,4], [20,15,10,5] ]

def make_dict(listy):
    dicty = {}
    for i in listy:
        dicty[i[0]] = i
    return dicty

weapons = make_dict(weapon_list)
armors = make_dict(armor_list)

def make_weapon(weapon, new_name=None):
    if new_name != None:
        new_weapon = [new_name]
        for i in weapons[weapon][1:]:
            new_weapon.append(i)
        return Weapon(*new_weapon)
    else:
        return Weapon(*weapons[weapon])

def make_armor(armor):
    return Armor(*armors[armor])

def die(num, sides):
    sum = 0
    for i in range(num):
        sum += random.randint(1, sides)
    return sum

def die_str(num, sides, plus=0):
    dmg = "%dd%d" % (num, sides)
    if plus != 0:
        dmg += "+%d" % plus
    return dmg

def weight_str(weight):
    if weight == 1:
        return "1 lb."
    else:
        return "%d lbs." % weight
    
def calc_ability_mod(score):
    if score == 1: return -5
    mod = ((score-2)/2) - 4
    return mod
    
class Thing:
    def __init__(self, name, weight, is_unique=1):
        self.name = name
        self.weight = weight
        self.is_unique = is_unique

    def get_indef_name(self):
        if not self.is_unique:
            for i in 'aeiou':
                if self.name[0] == i:
                    return "an " + self.name
            return "a " + self.name
        else:
            return self.name

    def get_def_name(self):
        if not self.is_unique:
            return "the " + self.name
        else:
            return self.name
        
    def get_name(self):
        return self.name

    def get_weight(self):
        return self.weight

class Equippable(Thing):
    def __init__(self, name, weight):
        Thing.__init__(self, name, weight)
        self.wearer = None

    def set_wearer(self, wearer):
        self.wearer = wearer
        
class Weapon(Equippable):
    def __init__(self, name, price, damage_str, crit_range, crit_multiply, weight, type, words):
        Equippable.__init__(self, name, weight)
        self.price = price

        damage = damage_str.split("d")
        self.die_num = int(damage[0])
        
        plus = damage[1].split("+")
        self.die_sides = int(plus[0])
        if (len(plus) == 2):
            self.die_plus = int(plus[1])
        else:
            self.die_plus = 0

        self.crit_range = crit_range
        self.crit_multiply = crit_multiply
        self.type = type
        self.words = words

    def get_words(self):
        return self.words
    
    def is_attack_roll_critical(self, attack_roll):
        return attack_roll >= 20-self.crit_range
    
    def damage_roll(self, attack_roll):
        if self.is_attack_roll_critical(attack_roll):
            num_times = self.crit_multiply
        else:
            num_times = 1
        damage = 0
        for i in range(num_times):
            # TODO: assuming melee here, which is bad
            damage += die(self.die_num, self.die_sides) + self.die_plus + self.wearer.get_str_mod()
        return damage

    def get_info(self):
        dmg_str = die_str(self.die_num, self.die_sides, self.die_plus)
        return "%s (%s, %s)" % (self.get_name(), dmg_str, weight_str(self.get_weight()))

class Armor(Equippable):
    def __init__(self, name, price, armor_bonus, max_dex_bonus, weight):
        Equippable.__init__(self, name, weight)        
        self.price = price
        self.armor_bonus = armor_bonus
        self.max_dex_bonus = max_dex_bonus

    def get_armor_bonus(self):
        return self.armor_bonus

    def get_info(self):
        return "%s (AC %+d, %s)" % (self.get_name(), self.get_armor_bonus(), \
                                    weight_str(self.get_weight()))

class CreatureDeath(Exception):
    """Exception thrown when a creature dies."""
    pass

class Creature(Thing):
    def __init__(self, name, level, sex, weight, \
                 str, int, wis, dex, con, chr, hp, parts, is_unique=1):
        Thing.__init__(self, name, weight, is_unique)
        self.level = level
        self.str = str
        self.int = int
        self.wis = wis
        self.dex = dex
        self.con = con
        self.chr = chr
        self.max_base_hp = hp
        self.fully_heal()
        self.sex = sex
        self.parts = parts

    def equip_weapon(self, weapon):
        weapon.set_wearer(self)        
        self.weapon = weapon

    def equip_armor(self, armor):
        armor.set_wearer(self)        
        self.armor = armor
        
    def get_dex(self):
        return self.dex

    def get_dex_mod(self):
        return calc_ability_mod(self.get_dex())

    def dex_check_roll(self):
        return die(1, 20) + self.get_dex_mod()

    def get_str(self):
        return self.str

    def get_str_mod(self):
        return calc_ability_mod(self.get_str())

    def str_check_roll(self):
        return die(1, 20) + self.get_str_mod()

    def get_con(self):
        return self.con

    def get_con_mod(self):
        return calc_ability_mod(self.get_con())

    def con_check_roll(self):
        return die(1, 20) + self.get_con_mod()

    def get_chr(self):
        return self.chr

    def get_chr_mod(self):
        return calc_ability_mod(self.get_chr())

    def chr_check_roll(self):
        return die(1, 20) + self.get_chr_mod()

    def get_wis(self):
        return self.wis

    def get_wis_mod(self):
        return calc_ability_mod(self.get_wis())

    def wis_check_roll(self):
        return die(1, 20) + self.get_wis_mod()

    def get_int(self):
        return self.int

    def get_int_mod(self):
        return calc_ability_mod(self.get_int())

    def int_check_roll(self):
        return die(1, 20) + self.get_int_mod()
    
    def initiative_roll(self):
        return self.dex_check_roll()

    def get_base_attack_bonus(self):
        return attacks_per_round[self.level-1]

    def get_armor_class(self):
        return 10 + self.armor.get_armor_bonus() + self.get_dex_mod()

    def get_sex(self):
        return self.sex

    def get_max_hp(self):
        return self.max_base_hp + self.get_con_mod()*self.level

    def fully_heal(self):
        self.hp = self.get_max_hp()
        
    def get_hp(self):
        return self.hp

    def lose_hp(self, hp):
        self.hp -= hp
        if self.hp <= 0: raise CreatureDeath

    def is_dead(self):
        return self.hp <= 0

    def get_parts(self):
        return self.parts
    
    def get_weapon(self):
        return self.weapon

    def get_level(self):
        return self.level
    
    def get_info(self):
        o = ""
        o += "name: %s    " % self.get_name()
        o += "gender: %s    " % self.get_sex()
        o += "weight: %s\n" % weight_str(self.get_weight())
        o += "level: %d    " % (self.get_level())
        o += "hp: %d/%d    " % (self.get_hp(), self.get_max_hp())
        o += "ac: %d\n\n" % (self.get_armor_class())
        
        o += "str: %d (%+d)    " % (self.get_str(), self.get_str_mod())
        o += "int: %d (%+d)\n" % (self.get_int(), self.get_int_mod())
        o += "wis: %d (%+d)    " % (self.get_wis(), self.get_wis_mod())
        o += "dex: %d (%+d)\n" % (self.get_dex(), self.get_dex_mod())
        o += "con: %d (%+d)    " % (self.get_con(), self.get_con_mod())
        o += "chr: %d (%+d)\n\n" % (self.get_chr(), self.get_chr_mod())
        
        o += "weapon: %s\n" % self.weapon.get_info()
        o += "armor: %s\n" % self.armor.get_info()
        return o        
    
class MeleeAttack:
    def __init__(self, attacker, defender, view):
        self.attacker = attacker
        self.defender = defender
        self.view = view
        self.dicty = self.view.make_grammar_dict(self.attacker, self.defender)
        self.dicty['weapon'] = self.attacker.get_weapon().get_name()
        self.dicty['o_weapon'] = self.defender.get_weapon().get_name()
    
    def print_damage_string(self, damage, attack_roll, round_num):
        weapon = self.attacker.get_weapon()
        percent = float(damage) / self.defender.get_hp()

        part = None
        if (percent < 0.15):
            phrase = random.choice(weapon.get_words()[0])
            #part = random.choice(self.attacker.get_parts()[0])
        elif (percent < 0.5):
            phrase = random.choice(weapon.get_words()[1])
            #if (random.randint(1,10) > 5):
            #    part = random.choice(self.attacker.get_parts()[1])
        else:
            phrase = random.choice(weapon.get_words()[2])
            if (percent < 1.0):
                part = random.choice(self.attacker.get_parts()[2])
            else:
                part = random.choice(self.attacker.get_parts()[3])
        
        if (self.attacker.get_weapon().is_attack_roll_critical(attack_roll)) or \
          percent >= 0.8:
            if round_num == 1:
                miss_str = random.choice(fatal_misses)
            else:
                miss_str = random.choice(fatal_misses_2)
            miss_str = self.view.parse_grammar_string(miss_str, self.dicty)
            print "  " + miss_str
            time.sleep(1)

        if part != None:
            phrase = "  %(name)s " + phrase + " %(o_name_pos)s " + part
        else:
            phrase = "  %(name)s " + phrase + " %(o_name)s"

        phrase += " for %d damage!" % damage
        phrase = self.view.parse_grammar_string(phrase, self.dicty)
        print phrase

    def execute(self):
        attacks = self.attacker.get_base_attack_bonus()
        self.one_attack(attacks[0], 1)
        if len(attacks) > 1:
            for i in attacks[1:]:
                time.sleep(2)
                self.one_attack(i, 2)
                
    def one_attack(self, base_attack_bonus, round_num):
        attack_roll = die(1,20)
        attack = attack_roll + base_attack_bonus + self.attacker.get_str_mod()
        defense = self.defender.get_armor_class()        
        if attack >= defense:
            damage = self.attacker.get_weapon().damage_roll(attack_roll)
            
            self.print_damage_string(damage, attack_roll, round_num)
            self.defender.lose_hp( damage )
        else:
            phrase = "%(name)s misses %(o_name)s!"
            phrase = self.view.parse_grammar_string(phrase, self.dicty)

            print "  " + phrase

def combat(p1, p2, view):
    print "%s and %s close in and begin to fight!" % (p1.get_def_name(), p2.get_def_name())

    m = [ [p1,p2], [p2,p1] ]

    # calculate initiative
    if (m[0][0].initiative_roll() < m[0][1].initiative_roll):
        m.reverse()

    while 1:
        print "(%s: %d/%d HP   %s: %d/%d HP)\n" % (\
            m[0][0].get_name(), m[0][0].get_hp(), m[0][0].get_max_hp(),
            m[0][1].get_name(), m[0][1].get_hp(), m[0][1].get_max_hp()
            )
        for i in m:
            try:
                MeleeAttack(i[0], i[1], view).execute()
            except CreatureDeath, cd:
                print "%s has been killed!" % i[1].get_def_name()
                if (random.random() < 0.7) and (i[0].get_hp() > (i[0].get_hp()/2)
                    print "%s blows the Horn of Gondor! BWOOM! BWOOM! BWOOM!" % i[0].get_def_name()
                return
            print
            time.sleep(3)

def fight():
    boro = Creature("Boromir", 15, "male", 190, \
      str=17, int=12, wis=12, dex=17, con=13, chr=18, hp=104, parts=human_parts)

    boro.equip_weapon(make_weapon("longsword", "longsword"))
    boro.equip_armor(make_armor("chain shirt"))

    print boro.get_info()

    view = grammar.View(None)

    count = 0
    
    while 1:
        skel = Creature("orc", 4, "male", 30, \
          str=15, int=3, wis=3, dex=12, con=8, chr=3, hp=30, parts=human_parts,
          is_unique=0)
        wep = make_weapon(random.choice(weapons.keys()))
        skel.equip_weapon(wep)
        skel.equip_armor(make_armor("cloth"))
        print "%s wielding a %s approaches!" % (skel.get_indef_name(), wep.get_name())
        combat(boro, skel, view)
        if boro.is_dead():
            break
        else:
            count += 1
            print
            time.sleep(3)
    print
    print "After killing %d %ss, %s died.\n" % (count, skel.get_name(), boro.get_name())
    print "Press enter to continue."
    raw_input()

if __name__ == '__main__': fight()
