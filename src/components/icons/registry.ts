import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Baby, BadgeCheck, Bed, Briefcase, Building2, Cake, Calendar, CalendarCheck, Camera, Car, Check, ChartColumn, ChevronDown,
  Church, CircleCheck, CircleX, Clock, Cloud, Copy, Crown, ExternalLink, Facebook, Flower, Flower2, Gem, Gift, Globe, Heart, Hotel, House, Image, Instagram, Leaf,
  Link, Mail, MailCheck, Map, MapPin, Menu, MessageCircle, Mic, Minus, Music, Navigation, PartyPopper, Phone, Plane, Plus, Presentation, QrCode, Send, Share2, Shirt,
  Star, Ticket, User, Users, Wine, X, type LucideIcon,
} from "lucide-react";

// The icon vocabulary. Names follow "category-name" so they read the same in templates, the
// editor and the template generator. An entry is either a general-purpose icon (`lucide`) or a
// hand-drawn one from custom.tsx (`custom`, the same key).
export type IconCategory = "event" | "wedding" | "ceremony" | "party" | "baby" | "corporate" | "rsvp" | "nav";

export type IconDef = { category: IconCategory; label: string; lucide?: LucideIcon; custom?: true };

const L = (category: IconCategory, label: string, lucide: LucideIcon): IconDef => ({ category, label, lucide });
const C = (category: IconCategory, label: string): IconDef => ({ category, label, custom: true });

export const ICONS: Record<string, IconDef> = {
  // ---- event: the basics every invitation needs ----
  "event-calendar": L("event", "Date", Calendar),
  "event-calendar-check": L("event", "Add to calendar", CalendarCheck),
  "event-clock": L("event", "Time", Clock),
  "event-location": L("event", "Venue", MapPin),
  "event-map": L("event", "Map", Map),
  "event-navigation": L("event", "Directions", Navigation),
  "event-arrow": L("event", "Go", ArrowRight),
  "event-link": L("event", "Link", Link),
  "event-external": L("event", "Open in a new tab", ExternalLink),
  "event-share": L("event", "Share", Share2),
  "event-copy": L("event", "Copy link", Copy),
  "event-qrcode": L("event", "QR code", QrCode),
  "event-chevron": L("event", "Expand", ChevronDown),
  "event-check": L("event", "Confirmed", Check),
  "event-close": L("event", "Close", X),
  "event-ticket": L("event", "Ticket", Ticket),
  "event-badge": L("event", "Badge", BadgeCheck),
  "event-globe": L("event", "Worldwide", Globe),

  // ---- wedding ----
  "wedding-rings": C("wedding", "Rings"),
  "wedding-heart": L("wedding", "Love", Heart),
  "wedding-couple": C("wedding", "Couple"),
  "wedding-bride": C("wedding", "Bride"),
  "wedding-groom": C("wedding", "Groom"),
  "wedding-bouquet": C("wedding", "Bouquet"),
  "wedding-diamond": L("wedding", "Engagement", Gem),
  "wedding-champagne": C("wedding", "Toast"),
  "wedding-cake": L("wedding", "Cake", Cake),
  "wedding-dance": C("wedding", "Dance"),
  "wedding-music": L("wedding", "Music", Music),
  "wedding-camera": L("wedding", "Photography", Camera),
  "wedding-gallery": L("wedding", "Gallery", Image),
  "wedding-gift": L("wedding", "Gifts", Gift),
  "wedding-hotel": L("wedding", "Accommodation", Hotel),
  "wedding-stay": L("wedding", "Rooms", Bed),
  "wedding-plane": L("wedding", "Travel", Plane),
  "wedding-car": L("wedding", "Transport", Car),
  "wedding-dress": L("wedding", "Dress code", Shirt),
  "wedding-drink": L("wedding", "Drinks", Wine),

  // ---- ceremony: optional cultural assets. Offer them; never insert them because of someone's religion. ----
  "ceremony-ceremony": C("ceremony", "Generic ceremony"),
  "ceremony-temple": C("ceremony", "Temple"),
  "ceremony-church": L("ceremony", "Church", Church),
  "ceremony-mosque": C("ceremony", "Mosque"),
  "ceremony-mandala": C("ceremony", "Mandala"),
  "ceremony-floral": C("ceremony", "Floral"),
  "ceremony-lamp": C("ceremony", "Lamp"),
  "ceremony-leaf": L("ceremony", "Leaf", Leaf),
  "ceremony-arch": C("ceremony", "Arch"),
  "ceremony-star-crescent": C("ceremony", "Star and crescent"),
  "ceremony-cross": C("ceremony", "Cross"),
  "ceremony-lotus": C("ceremony", "Lotus"),
  "ceremony-flower": L("ceremony", "Flower", Flower),
  "ceremony-blossom": L("ceremony", "Blossom", Flower2),

  // ---- party ----
  "party-birthday": L("party", "Birthday", Cake),
  "party-party": L("party", "Party", PartyPopper),
  "party-balloon": C("party", "Balloon"),
  "party-confetti": C("party", "Confetti"),
  "party-cake": L("party", "Cake", Cake),
  "party-gift": L("party", "Gift", Gift),
  "party-crown": L("party", "Milestone", Crown),
  "party-fireworks": C("party", "Fireworks"),
  "party-mic": L("party", "Performance", Mic),
  "party-dj": C("party", "DJ"),

  // ---- baby and family ----
  "baby-baby": L("baby", "Baby", Baby),
  "baby-bottle": C("baby", "Bottle"),
  "baby-pacifier": C("baby", "Pacifier"),
  "baby-stroller": C("baby", "Stroller"),
  "baby-teddy": C("baby", "Teddy"),
  "baby-family": C("baby", "Family"),
  "baby-star": L("baby", "Star", Star),
  "baby-cloud": L("baby", "Cloud", Cloud),

  // ---- corporate ----
  "corporate-building": L("corporate", "Company", Building2),
  "corporate-briefcase": L("corporate", "Business", Briefcase),
  "corporate-microphone": L("corporate", "Speaker", Mic),
  "corporate-presentation": L("corporate", "Presentation", Presentation),
  "corporate-users": L("corporate", "Attendees", Users),
  "corporate-network": C("corporate", "Networking"),
  "corporate-ticket": L("corporate", "Ticket", Ticket),
  "corporate-badge": L("corporate", "Registration", BadgeCheck),
  "corporate-calendar-check": L("corporate", "Registration open", CalendarCheck),
  "corporate-chart": L("corporate", "Results", ChartColumn),
  "corporate-globe": L("corporate", "Global event", Globe),

  // ---- rsvp ----
  "rsvp-rsvp": L("rsvp", "RSVP", MailCheck),
  "rsvp-check-circle": L("rsvp", "Attending", CircleCheck),
  "rsvp-x-circle": L("rsvp", "Not attending", CircleX),
  "rsvp-user": L("rsvp", "Guest", User),
  "rsvp-users": L("rsvp", "Guests", Users),
  "rsvp-plus": L("rsvp", "Add", Plus),
  "rsvp-minus": L("rsvp", "Remove", Minus),
  "rsvp-mail": L("rsvp", "Email", Mail),
  "rsvp-phone": L("rsvp", "Phone", Phone),
  "rsvp-message": L("rsvp", "Message", MessageCircle),
  "rsvp-send": L("rsvp", "Send", Send),

  // ---- navigation and channels ----
  "nav-menu": L("nav", "Menu", Menu),
  "nav-home": L("nav", "Home", House),
  "nav-back": L("nav", "Back", ArrowLeft),
  "nav-forward": L("nav", "Forward", ArrowRight),
  "nav-up": L("nav", "Up", ArrowUp),
  "nav-down": L("nav", "Down", ArrowDown),
  "nav-chevron-down": L("nav", "More", ChevronDown),
  "nav-external": L("nav", "External link", ExternalLink),
  "nav-instagram": L("nav", "Instagram", Instagram),
  "nav-facebook": L("nav", "Facebook", Facebook),
  "nav-whatsapp": C("nav", "WhatsApp"),
  "nav-email": L("nav", "Email", Mail),
};

export type IconName = keyof typeof ICONS;
export const ICON_CATEGORIES: { key: IconCategory; label: string }[] = [
  { key: "event", label: "Event basics" },
  { key: "wedding", label: "Wedding" },
  { key: "ceremony", label: "Ceremony and culture" },
  { key: "party", label: "Birthday and party" },
  { key: "baby", label: "Baby and family" },
  { key: "corporate", label: "Corporate" },
  { key: "rsvp", label: "RSVP" },
  { key: "nav", label: "Navigation and channels" },
];
