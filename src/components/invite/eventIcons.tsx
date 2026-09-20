import { Cake, Church, Flower2, Gem, Heart, House, Music, PartyPopper, Presentation, Sparkles, Sun, Users, Utensils, Wine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// A small icon for a ceremony, chosen from words in its key or title.
const RULES: [RegExp, LucideIcon][] = [
  [/mehnd|mehend|henna|haldi|turmeric|mangal snan/i, Flower2],
  [/sangeet|music|dance|dj|band|qawwali/i, Music],
  [/engag|betroth|ring|nischay|sagai|roka/i, Gem],
  [/church|mass|liturg|blessing|prayer|puja|pooja|pravesh|gurdwara|anand|nikah|mosque/i, Church],
  [/house|home|griha|gruha/i, House],
  [/birthday|cake|party/i, Cake],
  [/lunch|dinner|sadya|feast|walima|reception|banquet|food/i, Utensils],
  [/cocktail|drinks|toast/i, Wine],
  [/keynote|talk|session|conference|summit|registration|workshop/i, Presentation],
  [/network|meet|mixer/i, Users],
  [/sunrise|morning|muhurat|muhurtham|thali/i, Sun],
  [/wedding|vivah|kalyan|marriage|ceremony/i, Heart],
];

export function eventIcon(key: string, title: string): LucideIcon {
  const s = `${key} ${title}`;
  for (const [re, Icon] of RULES) if (re.test(s)) return Icon;
  return s.length % 2 ? Sparkles : PartyPopper;
}
