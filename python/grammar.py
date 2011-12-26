import re

class View:
    def __init__(self, viewer):
        self.viewer = viewer
        
    def make_grammar_dict(self, subject, object):
        d = {}

        d["__subject"] = subject
        d["__object"] = object
        
        if subject == self.viewer:
            d.update(make_pronoun_dict("you"))
            d["name"] = "you"
            d["name_pos"] = "your"
        else:
            d.update(make_pronoun_dict(subject.get_sex()))
            d["name"] = subject.get_def_name()
            d["name_pos"] = make_name_posessive(d["name"])
            
        if object == self.viewer:
            d.update(make_pronoun_dict("you", "o_"))
            d["o_name"] = "you"
            d["o_name_pos"] = "your"            
        else:
            d.update(make_pronoun_dict(object.get_sex(), "o_"))
            d["o_name"] = object.get_def_name()
            d["o_name_pos"] = make_name_posessive(d["o_name"])
        return d
    
    def parse_grammar_string(self, stringy, grammar_dict):
        if grammar_dict["__subject"] == self.viewer:
            is_plural_1 = 1
        else:
            is_plural_1 = 0

        if grammar_dict["__object"] == self.viewer:
            is_plural_2 = 1
        else:
            is_plural_2 = 0

        stringy = parse_grammar_string(stringy, is_plural_1, is_plural_2)
        return stringy % grammar_dict

def make_name_posessive(name):
    if name[-1] == 's':
        return name + "'"
    else:
        return name + "'s"

def make_pronoun_dict(gender, prefix=None):
    if prefix == None:
        prefix = ""
    dicty = {}
    if gender == "male":
        himself = "himself"
        his = "his"
        him = "him"
        he = "he"
    elif gender == "female":
        himself = "herself"
        his = "her"
        him = "her"
        he = "she"
    elif gender == "neuter":
        himself = "itself"
        his = "its"
        him = "it"
        he = "it"
    elif gender == "you":
        himself = "yourself"
        his = "your"
        him = "you"
        he = "you"
    else:
        raise Exception, "Not a valid gender type."

    dicty['%shimself' % prefix] = himself
    dicty['%shis' % prefix] = his
    dicty['%shim' % prefix] = him
    dicty['%she' % prefix] = he
    
    return dicty

def parse_grammar_string(stringy, is_plural_1=0, is_plural_2=0):
    def parse_helper(stringy, restr, is_singular):
        match_obj = re.match(restr, stringy)
        if match_obj == None: return None
        if is_singular:
            stringy = match_obj.expand("\g<begin>\g<singular>\g<end>")
        else:
            if match_obj.group('plural') == None:
                stringy = match_obj.expand("\g<begin>\g<end>")
            else:
                stringy = match_obj.expand("\g<begin>\g<plural>\g<end>")
        return stringy

    # process first grammars (with []'s)
    restr = r"(?P<begin>.*)(\[(?P<singular>.*?)(\|(?P<plural>.+))?\])(?P<end>.*)"
    while 1:
        new_stringy = parse_helper(stringy, restr, not is_plural_1)
        if new_stringy == None:
            break
        else:
            stringy = new_stringy

    # process second grammars (with <>'s)
    restr = r"(?P<begin>.*)(\<(?P<singular>.*?)(\|(?P<plural>.+))?\>)(?P<end>.*)"
    while 1:
        new_stringy = parse_helper(stringy, restr, not is_plural_2)
        if new_stringy == None:
            break
        else:
            stringy = new_stringy
    
    return stringy
