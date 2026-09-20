// Every visible label on the invitation comes from `config.labels`. A language pick
// seeds them from the sets below; hosts can then edit any label in any language.

export type BaseLabels = {
  invited: string; // "You are invited"
  forGuest: string; // "For {name}"
  openHint: string;
  soundHint: string; // "Tap the seal to open."
  musicOn: string;
  musicOff: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  today: string; // "Today is the day."
  scheduleMany: string; // "The days"
  scheduleOne: string; // "The plan"
  timesNote: string; // "All times are {tz}"
  when: string;
  where: string;
  wear: string;
  onwards: string;
  to: string;
  addToCalendar: string;
  venue: string;
  openMaps: string;
  gettingThere: string;
  stayingOver: string;
  moments: string;
  rsvp: string;
  rsvpTitle: string;
  rsvpTicketTitle: string;
  rsvpNote: string;
  rsvpTicketNote: string;
  yourName: string;
  willYouJoin: string;
  accept: string;
  decline: string;
  company: string;
  email: string;
  howMany: string;
  whichDays: string;
  anythingElse: string;
  anythingElsePlaceholder: string;
  sendReply: string;
  confirmTicket: string;
  sending: string;
  sendWhatsApp: string;
  orWhatsApp: string;
  orEmail: string;
  replyBy: string; // "Please reply by {date}."
  thanksYes: string;
  thanksNo: string;
  admitOne: string;
  showAtDoor: string;
  checkedIn: string;
  backToInvite: string;
};

export type SectionLabels = {
  stay: string;
  stayHeading: string;
  travel: string;
  travelHeading: string;
  faq: string;
  faqHeading: string;
  party: string;
  partyHeading: string;
  viewHotel: string;
  lostCall: string;
  payUpi: string;
  deleteReply: string;
  replyDeleted: string;
  deleting: string;
  deleteConfirm: string;
};
export type Labels = BaseLabels & SectionLabels;

export type Language = {
  code: string;
  label: string;
  dir: "ltr" | "rtl";
  locale: string; // for date formatting
  script?: { family: string; google: string }; // an extra Google font that covers the script
};

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", dir: "ltr", locale: "en-IN" },
  { code: "ml", label: "മലയാളം (Malayalam)", dir: "ltr", locale: "ml-IN", script: { family: "Noto Serif Malayalam", google: "family=Noto+Serif+Malayalam:wght@400;500" } },
  { code: "hi", label: "हिन्दी (Hindi)", dir: "ltr", locale: "hi-IN", script: { family: "Noto Serif Devanagari", google: "family=Noto+Serif+Devanagari:wght@400;500" } },
  { code: "ta", label: "தமிழ் (Tamil)", dir: "ltr", locale: "ta-IN", script: { family: "Noto Serif Tamil", google: "family=Noto+Serif+Tamil:wght@400;500" } },
  { code: "te", label: "తెలుగు (Telugu)", dir: "ltr", locale: "te-IN", script: { family: "Noto Serif Telugu", google: "family=Noto+Serif+Telugu:wght@400;500" } },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)", dir: "ltr", locale: "kn-IN", script: { family: "Noto Serif Kannada", google: "family=Noto+Serif+Kannada:wght@400;500" } },
  { code: "ar", label: "العربية (Arabic)", dir: "rtl", locale: "ar", script: { family: "Noto Naskh Arabic", google: "family=Noto+Naskh+Arabic:wght@400;500" } },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)", dir: "ltr", locale: "pa-IN", script: { family: "Noto Sans Gurmukhi", google: "family=Noto+Sans+Gurmukhi:wght@400;500" } },
  { code: "ur", label: "اردو (Urdu)", dir: "rtl", locale: "ur", script: { family: "Noto Nastaliq Urdu", google: "family=Noto+Nastaliq+Urdu:wght@400;500" } },
  { code: "he", label: "עברית (Hebrew)", dir: "rtl", locale: "he", script: { family: "Noto Serif Hebrew", google: "family=Noto+Serif+Hebrew:wght@400;500" } },
  { code: "es", label: "Español", dir: "ltr", locale: "es" },
  { code: "fr", label: "Français", dir: "ltr", locale: "fr" },
  { code: "de", label: "Deutsch", dir: "ltr", locale: "de" },
  { code: "pt", label: "Português", dir: "ltr", locale: "pt" },
  { code: "other", label: "Another language (edit every label yourself)", dir: "ltr", locale: "en" },
];

export function language(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

const en: BaseLabels = {
  invited: "You are invited",
  forGuest: "For {name}",
  openHint: "Tap the seal to open. Sound on.",
  soundHint: "Tap the seal to open.",
  musicOn: "Music on",
  musicOff: "Music off",
  days: "days",
  hours: "hours",
  minutes: "minutes",
  seconds: "seconds",
  today: "Today is the day.",
  scheduleMany: "The days",
  scheduleOne: "The plan",
  timesNote: "All times are {tz}",
  when: "When",
  where: "Where",
  wear: "Wear",
  onwards: "onwards",
  to: "to",
  addToCalendar: "Add to calendar",
  venue: "The venue",
  openMaps: "Open in Maps",
  gettingThere: "Getting there",
  stayingOver: "Staying over",
  moments: "Moments",
  rsvp: "RSVP",
  rsvpTitle: "Tell us you’re coming",
  rsvpTicketTitle: "Reserve your seat",
  rsvpNote: "One reply per household is plenty.",
  rsvpTicketNote: "Confirm and your QR ticket appears right here.",
  yourName: "Your name",
  willYouJoin: "Will you join us?",
  accept: "Joyfully accept",
  decline: "Regretfully decline",
  company: "Company",
  email: "Email",
  howMany: "How many of you",
  whichDays: "Which days",
  anythingElse: "Anything we should know",
  anythingElsePlaceholder: "Allergies, access needs, a song request",
  sendReply: "Send reply",
  confirmTicket: "Confirm & get ticket",
  sending: "Sending",
  sendWhatsApp: "Send on WhatsApp",
  orWhatsApp: "or reply on WhatsApp",
  orEmail: "or send by email",
  replyBy: "Please reply by {date}.",
  thanksYes: "Thank you. We’ll see you there.",
  thanksNo: "Thank you for letting us know. We’ll miss you.",
  admitOne: "Admit one",
  showAtDoor: "Show this at the door. A screenshot works.",
  checkedIn: "Checked in",
  backToInvite: "Back to the invitation",
};

const ml: BaseLabels = {
  ...en,
  invited: "നിങ്ങളെ ക്ഷണിക്കുന്നു",
  forGuest: "{name}-ന്",
  openHint: "തുറക്കാൻ മുദ്രയിൽ തൊടുക. ശബ്ദം ഓൺ ചെയ്യുക.",
  soundHint: "തുറക്കാൻ മുദ്രയിൽ തൊടുക.",
  musicOn: "സംഗീതം ഓൺ",
  musicOff: "സംഗീതം ഓഫ്",
  days: "ദിവസം",
  hours: "മണിക്കൂർ",
  minutes: "മിനിറ്റ്",
  seconds: "സെക്കൻഡ്",
  today: "ഇന്നാണ് ആ ദിവസം.",
  scheduleMany: "ചടങ്ങുകൾ",
  scheduleOne: "ചടങ്ങ്",
  timesNote: "എല്ലാ സമയവും {tz}",
  when: "എപ്പോൾ",
  where: "എവിടെ",
  wear: "വസ്ത്രം",
  onwards: "മുതൽ",
  to: "മുതൽ",
  addToCalendar: "കലണ്ടറിൽ ചേർക്കുക",
  venue: "വേദി",
  openMaps: "മാപ്പിൽ കാണുക",
  gettingThere: "എങ്ങനെ എത്താം",
  stayingOver: "താമസം",
  moments: "നിമിഷങ്ങൾ",
  rsvp: "മറുപടി",
  rsvpTitle: "വരുന്നുണ്ടെന്ന് അറിയിക്കുക",
  rsvpTicketTitle: "സീറ്റ് ഉറപ്പാക്കുക",
  rsvpNote: "ഒരു കുടുംബത്തിന് ഒരു മറുപടി മതി.",
  rsvpTicketNote: "സ്ഥിരീകരിച്ചാൽ QR ടിക്കറ്റ് ഇവിടെ ലഭിക്കും.",
  yourName: "നിങ്ങളുടെ പേര്",
  willYouJoin: "നിങ്ങൾ വരുമോ?",
  accept: "സന്തോഷത്തോടെ വരുന്നു",
  decline: "ക്ഷമിക്കണം, വരാൻ കഴിയില്ല",
  company: "സ്ഥാപനം",
  email: "ഇമെയിൽ",
  howMany: "എത്ര പേർ",
  whichDays: "ഏതെല്ലാം ദിവസങ്ങൾ",
  anythingElse: "ഞങ്ങൾ അറിയേണ്ടതെന്തെങ്കിലും",
  anythingElsePlaceholder: "അലർജി, പ്രത്യേക ആവശ്യങ്ങൾ, ഒരു പാട്ട്",
  sendReply: "മറുപടി അയയ്ക്കുക",
  confirmTicket: "സ്ഥിരീകരിച്ച് ടിക്കറ്റ് നേടുക",
  sending: "അയയ്ക്കുന്നു",
  sendWhatsApp: "വാട്ട്‌സ്ആപ്പിൽ അയയ്ക്കുക",
  orWhatsApp: "അല്ലെങ്കിൽ വാട്ട്‌സ്ആപ്പിൽ മറുപടി നൽകുക",
  orEmail: "അല്ലെങ്കിൽ ഇമെയിൽ അയയ്ക്കുക",
  replyBy: "{date}-ന് മുമ്പ് മറുപടി നൽകുക.",
  thanksYes: "നന്ദി. അവിടെ കാണാം.",
  thanksNo: "അറിയിച്ചതിന് നന്ദി. നിങ്ങളെ മിസ് ചെയ്യും.",
  admitOne: "ഒരാൾക്ക് പ്രവേശനം",
  showAtDoor: "പ്രവേശന കവാടത്തിൽ ഇത് കാണിക്കുക. സ്ക്രീൻഷോട്ട് മതി.",
  checkedIn: "ചെക്ക്-ഇൻ ചെയ്തു",
  backToInvite: "ക്ഷണക്കത്തിലേക്ക് മടങ്ങുക",
};

const hi: BaseLabels = {
  ...en,
  invited: "आप आमंत्रित हैं",
  forGuest: "{name} के लिए",
  openHint: "खोलने के लिए मुहर छुएँ। आवाज़ चालू रखें।",
  soundHint: "खोलने के लिए मुहर छुएँ।",
  musicOn: "संगीत चालू",
  musicOff: "संगीत बंद",
  days: "दिन",
  hours: "घंटे",
  minutes: "मिनट",
  seconds: "सेकंड",
  today: "आज ही वह दिन है।",
  scheduleMany: "कार्यक्रम",
  scheduleOne: "कार्यक्रम",
  timesNote: "सभी समय {tz} के अनुसार",
  when: "कब",
  where: "कहाँ",
  wear: "पहनावा",
  onwards: "से",
  to: "से",
  addToCalendar: "कैलेंडर में जोड़ें",
  venue: "स्थान",
  openMaps: "मैप में खोलें",
  gettingThere: "पहुँचने का रास्ता",
  stayingOver: "ठहरने की व्यवस्था",
  moments: "यादें",
  rsvp: "उत्तर दें",
  rsvpTitle: "बताइए, आप आ रहे हैं",
  rsvpTicketTitle: "अपनी सीट पक्की करें",
  rsvpNote: "एक परिवार से एक उत्तर काफ़ी है।",
  rsvpTicketNote: "पुष्टि करें, आपका QR टिकट यहीं दिखेगा।",
  yourName: "आपका नाम",
  willYouJoin: "क्या आप आएँगे?",
  accept: "सहर्ष स्वीकार",
  decline: "खेद है, नहीं आ पाएँगे",
  company: "संस्था",
  email: "ईमेल",
  howMany: "कितने लोग",
  whichDays: "किन दिनों",
  anythingElse: "कुछ और जो हमें जानना चाहिए",
  anythingElsePlaceholder: "एलर्जी, विशेष ज़रूरत, कोई गाना",
  sendReply: "उत्तर भेजें",
  confirmTicket: "पुष्टि करें और टिकट पाएँ",
  sending: "भेजा जा रहा है",
  sendWhatsApp: "WhatsApp पर भेजें",
  orWhatsApp: "या WhatsApp पर उत्तर दें",
  orEmail: "या ईमेल करें",
  replyBy: "कृपया {date} तक उत्तर दें।",
  thanksYes: "धन्यवाद। वहाँ मिलते हैं।",
  thanksNo: "बताने के लिए धन्यवाद। आपकी कमी खलेगी।",
  admitOne: "एक व्यक्ति के लिए प्रवेश",
  showAtDoor: "प्रवेश द्वार पर यह दिखाएँ। स्क्रीनशॉट भी चलेगा।",
  checkedIn: "चेक-इन हो गया",
  backToInvite: "निमंत्रण पर वापस जाएँ",
};

const ta: BaseLabels = {
  ...en,
  invited: "உங்களை அழைக்கிறோம்",
  forGuest: "{name} அவர்களுக்கு",
  openHint: "திறக்க முத்திரையைத் தொடவும். ஒலியை இயக்கவும்.",
  soundHint: "திறக்க முத்திரையைத் தொடவும்.",
  musicOn: "இசை இயக்கம்",
  musicOff: "இசை நிறுத்தம்",
  days: "நாட்கள்",
  hours: "மணி",
  minutes: "நிமிடம்",
  seconds: "வினாடி",
  today: "இன்றே அந்த நாள்.",
  scheduleMany: "நிகழ்வுகள்",
  scheduleOne: "நிகழ்வு",
  timesNote: "அனைத்து நேரமும் {tz}",
  when: "எப்போது",
  where: "எங்கே",
  wear: "உடை",
  onwards: "முதல்",
  to: "முதல்",
  addToCalendar: "காலெண்டரில் சேர்க்க",
  venue: "இடம்",
  openMaps: "வரைபடத்தில் காண",
  gettingThere: "வழி",
  stayingOver: "தங்குமிடம்",
  moments: "நினைவுகள்",
  rsvp: "பதில்",
  rsvpTitle: "வருகிறீர்கள் என்று சொல்லுங்கள்",
  rsvpTicketTitle: "இருக்கையை உறுதி செய்யுங்கள்",
  rsvpNote: "ஒரு குடும்பத்திற்கு ஒரு பதில் போதும்.",
  rsvpTicketNote: "உறுதி செய்தால் QR டிக்கெட் இங்கே தோன்றும்.",
  yourName: "உங்கள் பெயர்",
  willYouJoin: "வருவீர்களா?",
  accept: "மகிழ்ச்சியுடன் வருகிறேன்",
  decline: "மன்னிக்கவும், வர இயலாது",
  company: "நிறுவனம்",
  email: "மின்னஞ்சல்",
  howMany: "எத்தனை பேர்",
  whichDays: "எந்த நாட்கள்",
  anythingElse: "நாங்கள் அறிய வேண்டியது",
  anythingElsePlaceholder: "ஒவ்வாமை, சிறப்புத் தேவைகள், ஒரு பாடல்",
  sendReply: "பதில் அனுப்பு",
  confirmTicket: "உறுதி செய்து டிக்கெட் பெறு",
  sending: "அனுப்புகிறது",
  sendWhatsApp: "WhatsApp-இல் அனுப்பு",
  orWhatsApp: "அல்லது WhatsApp-இல் பதிலளிக்க",
  orEmail: "அல்லது மின்னஞ்சல் அனுப்ப",
  replyBy: "{date}-க்குள் பதிலளிக்கவும்.",
  thanksYes: "நன்றி. அங்கே சந்திப்போம்.",
  thanksNo: "தெரிவித்ததற்கு நன்றி. உங்களை மிஸ் செய்வோம்.",
  admitOne: "ஒருவருக்கு அனுமதி",
  showAtDoor: "நுழைவாயிலில் இதைக் காட்டவும். ஸ்கிரீன்ஷாட் போதும்.",
  checkedIn: "செக்-இன் ஆனது",
  backToInvite: "அழைப்பிதழுக்குத் திரும்ப",
};

const ar: BaseLabels = {
  ...en,
  invited: "أنتم مدعوون",
  forGuest: "إلى {name}",
  openHint: "المس الختم للفتح. شغّل الصوت.",
  soundHint: "المس الختم للفتح.",
  musicOn: "الموسيقى تعمل",
  musicOff: "الموسيقى متوقفة",
  days: "أيام",
  hours: "ساعات",
  minutes: "دقائق",
  seconds: "ثوانٍ",
  today: "اليوم هو الموعد.",
  scheduleMany: "البرنامج",
  scheduleOne: "البرنامج",
  timesNote: "جميع الأوقات بتوقيت {tz}",
  when: "متى",
  where: "أين",
  wear: "الزي",
  onwards: "فصاعدًا",
  to: "إلى",
  addToCalendar: "أضف إلى التقويم",
  venue: "المكان",
  openMaps: "افتح في الخرائط",
  gettingThere: "كيفية الوصول",
  stayingOver: "الإقامة",
  moments: "لحظات",
  rsvp: "تأكيد الحضور",
  rsvpTitle: "أخبرونا بحضوركم",
  rsvpTicketTitle: "احجز مقعدك",
  rsvpNote: "رد واحد لكل عائلة يكفي.",
  rsvpTicketNote: "أكّد وستظهر تذكرة QR هنا.",
  yourName: "اسمك",
  willYouJoin: "هل ستنضمون إلينا؟",
  accept: "نقبل بسرور",
  decline: "نعتذر عن الحضور",
  company: "الشركة",
  email: "البريد الإلكتروني",
  howMany: "كم عددكم",
  whichDays: "أي الأيام",
  anythingElse: "أي شيء يجب أن نعرفه",
  anythingElsePlaceholder: "حساسية، احتياجات خاصة، أغنية مفضلة",
  sendReply: "أرسل الرد",
  confirmTicket: "أكّد واحصل على التذكرة",
  sending: "جارٍ الإرسال",
  sendWhatsApp: "أرسل عبر واتساب",
  orWhatsApp: "أو الرد عبر واتساب",
  orEmail: "أو عبر البريد الإلكتروني",
  replyBy: "يرجى الرد قبل {date}.",
  thanksYes: "شكرًا لكم. نراكم هناك.",
  thanksNo: "شكرًا لإخبارنا. سنفتقدكم.",
  admitOne: "دخول لشخص واحد",
  showAtDoor: "أظهر هذا عند الباب. لقطة الشاشة تكفي.",
  checkedIn: "تم تسجيل الدخول",
  backToInvite: "العودة إلى الدعوة",
};

const es: BaseLabels = {
  ...en,
  invited: "Estás invitado",
  forGuest: "Para {name}",
  openHint: "Toca el sello para abrir. Activa el sonido.",
  soundHint: "Toca el sello para abrir.",
  musicOn: "Música activada",
  musicOff: "Música apagada",
  days: "días",
  hours: "horas",
  minutes: "minutos",
  seconds: "segundos",
  today: "Hoy es el día.",
  scheduleMany: "Los días",
  scheduleOne: "El plan",
  timesNote: "Todos los horarios en {tz}",
  when: "Cuándo",
  where: "Dónde",
  wear: "Vestimenta",
  onwards: "en adelante",
  to: "a",
  addToCalendar: "Añadir al calendario",
  venue: "El lugar",
  openMaps: "Abrir en Maps",
  gettingThere: "Cómo llegar",
  stayingOver: "Alojamiento",
  moments: "Momentos",
  rsvp: "Confirmar",
  rsvpTitle: "Dinos que vienes",
  rsvpTicketTitle: "Reserva tu asiento",
  rsvpNote: "Basta una respuesta por familia.",
  rsvpTicketNote: "Confirma y tu entrada QR aparecerá aquí.",
  yourName: "Tu nombre",
  willYouJoin: "¿Nos acompañas?",
  accept: "Acepto con alegría",
  decline: "Lamento no poder ir",
  company: "Empresa",
  email: "Correo",
  howMany: "Cuántos sois",
  whichDays: "Qué días",
  anythingElse: "Algo que debamos saber",
  anythingElsePlaceholder: "Alergias, accesibilidad, una canción",
  sendReply: "Enviar respuesta",
  confirmTicket: "Confirmar y obtener entrada",
  sending: "Enviando",
  sendWhatsApp: "Enviar por WhatsApp",
  orWhatsApp: "o responder por WhatsApp",
  orEmail: "o enviar por correo",
  replyBy: "Responde antes del {date}.",
  thanksYes: "Gracias. Nos vemos allí.",
  thanksNo: "Gracias por avisar. Te echaremos de menos.",
  admitOne: "Entrada individual",
  showAtDoor: "Muestra esto en la puerta. Vale una captura.",
  checkedIn: "Registrado",
  backToInvite: "Volver a la invitación",
};

const fr: BaseLabels = {
  ...en,
  invited: "Vous êtes invité",
  forGuest: "Pour {name}",
  openHint: "Touchez le sceau pour ouvrir. Activez le son.",
  soundHint: "Touchez le sceau pour ouvrir.",
  musicOn: "Musique activée",
  musicOff: "Musique coupée",
  days: "jours",
  hours: "heures",
  minutes: "minutes",
  seconds: "secondes",
  today: "C’est aujourd’hui.",
  scheduleMany: "Le programme",
  scheduleOne: "Le programme",
  timesNote: "Heures en {tz}",
  when: "Quand",
  where: "Où",
  wear: "Tenue",
  onwards: "et après",
  to: "à",
  addToCalendar: "Ajouter au calendrier",
  venue: "Le lieu",
  openMaps: "Ouvrir dans Maps",
  gettingThere: "S’y rendre",
  stayingOver: "Hébergement",
  moments: "Moments",
  rsvp: "Répondre",
  rsvpTitle: "Dites-nous que vous venez",
  rsvpTicketTitle: "Réservez votre place",
  rsvpNote: "Une réponse par foyer suffit.",
  rsvpTicketNote: "Confirmez et votre billet QR s’affiche ici.",
  yourName: "Votre nom",
  willYouJoin: "Serez-vous des nôtres ?",
  accept: "Avec plaisir",
  decline: "Avec regret, non",
  company: "Société",
  email: "E-mail",
  howMany: "Combien serez-vous",
  whichDays: "Quels jours",
  anythingElse: "À savoir",
  anythingElsePlaceholder: "Allergies, accessibilité, une chanson",
  sendReply: "Envoyer",
  confirmTicket: "Confirmer et obtenir le billet",
  sending: "Envoi",
  sendWhatsApp: "Envoyer sur WhatsApp",
  orWhatsApp: "ou répondre sur WhatsApp",
  orEmail: "ou par e-mail",
  replyBy: "Merci de répondre avant le {date}.",
  thanksYes: "Merci. À très vite.",
  thanksNo: "Merci de nous l’avoir dit. Vous nous manquerez.",
  admitOne: "Une personne",
  showAtDoor: "Présentez ceci à l’entrée. Une capture d’écran suffit.",
  checkedIn: "Enregistré",
  backToInvite: "Retour à l’invitation",
};

const SETS: Record<string, BaseLabels> = { en, ml, hi, ta, ar, es, fr };

// Wording for the newer sections (stay, travel, Q & A, wedding party) and for deleting a reply.
// Written for review by a native speaker before launch: see docs/AUDIT.md.
const SECTION: Record<string, SectionLabels> = {
  en: { stay: "Where to stay", stayHeading: "Rooms near the venue", travel: "Travel", travelHeading: "Getting here", faq: "Q & A", faqHeading: "Good to know", party: "Wedding party", partyHeading: "The people beside us", viewHotel: "View the hotel", lostCall: "Lost on the way? Call us", payUpi: "Pay with UPI", deleteReply: "Delete my reply", replyDeleted: "Your reply has been deleted.", deleting: "Deleting", deleteConfirm: "Delete your reply? The hosts will no longer see it." },
  ml: { stay: "താമസം", stayHeading: "വേദിക്കടുത്തുള്ള മുറികൾ", travel: "യാത്ര", travelHeading: "ഇവിടെ എത്താൻ", faq: "ചോദ്യങ്ങൾ", faqHeading: "അറിയേണ്ടത്", party: "വിവാഹ സംഘം", partyHeading: "ഞങ്ങൾക്കൊപ്പമുള്ളവർ", viewHotel: "ഹോട്ടൽ കാണുക", lostCall: "വഴി തെറ്റിയോ? വിളിക്കൂ", payUpi: "UPI വഴി അയയ്ക്കാം", deleteReply: "എന്റെ മറുപടി ഇല്ലാതാക്കുക", replyDeleted: "നിങ്ങളുടെ മറുപടി ഇല്ലാതാക്കി.", deleting: "ഇല്ലാതാക്കുന്നു", deleteConfirm: "മറുപടി ഇല്ലാതാക്കണോ? ആതിഥേയർക്ക് ഇനി ഇത് കാണാനാകില്ല." },
  hi: { stay: "ठहरने की जगह", stayHeading: "स्थल के पास कमरे", travel: "यात्रा", travelHeading: "यहाँ कैसे पहुँचें", faq: "प्रश्न और उत्तर", faqHeading: "जानने योग्य बातें", party: "विवाह मंडली", partyHeading: "हमारे अपने लोग", viewHotel: "होटल देखें", lostCall: "रास्ता भटक गए? हमें फ़ोन करें", payUpi: "UPI से भेजें", deleteReply: "मेरा उत्तर हटाएँ", replyDeleted: "आपका उत्तर हटा दिया गया है।", deleting: "हटाया जा रहा है", deleteConfirm: "उत्तर हटाएँ? मेज़बान इसे फिर नहीं देख पाएँगे।" },
  ta: { stay: "தங்குமிடம்", stayHeading: "மண்டபத்திற்கு அருகிலுள்ள அறைகள்", travel: "பயணம்", travelHeading: "இங்கே வருவது எப்படி", faq: "கேள்வி பதில்", faqHeading: "தெரிந்து கொள்ள", party: "திருமணக் குழு", partyHeading: "எங்களுடன் இருப்பவர்கள்", viewHotel: "ஹோட்டலைப் பார்க்க", lostCall: "வழி தெரியவில்லையா? அழையுங்கள்", payUpi: "UPI மூலம் அனுப்ப", deleteReply: "என் பதிலை நீக்கு", replyDeleted: "உங்கள் பதில் நீக்கப்பட்டது.", deleting: "நீக்குகிறது", deleteConfirm: "பதிலை நீக்கவா? விருந்தினர் அழைப்பாளர்கள் இனி இதைப் பார்க்க முடியாது." },
  ar: { stay: "الإقامة", stayHeading: "غرف قريبة من القاعة", travel: "السفر", travelHeading: "كيف تصلون إلينا", faq: "أسئلة وأجوبة", faqHeading: "معلومات مفيدة", party: "مرافقو العروسين", partyHeading: "من يقفون بجانبنا", viewHotel: "عرض الفندق", lostCall: "ضللتم الطريق؟ اتصلوا بنا", payUpi: "الدفع عبر UPI", deleteReply: "حذف ردي", replyDeleted: "تم حذف ردك.", deleting: "جارٍ الحذف", deleteConfirm: "هل تريد حذف ردك؟ لن يراه المضيفون بعد الآن." },
  es: { stay: "Alojamiento", stayHeading: "Habitaciones cerca del lugar", travel: "Viaje", travelHeading: "Cómo llegar", faq: "Preguntas y respuestas", faqHeading: "Es bueno saber", party: "Cortejo nupcial", partyHeading: "Quienes nos acompañan", viewHotel: "Ver el hotel", lostCall: "¿Perdidos? Llámenos", payUpi: "Pagar con UPI", deleteReply: "Eliminar mi respuesta", replyDeleted: "Tu respuesta ha sido eliminada.", deleting: "Eliminando", deleteConfirm: "¿Eliminar tu respuesta? Los anfitriones ya no la verán." },
  fr: { stay: "Hébergement", stayHeading: "Chambres près du lieu", travel: "Voyage", travelHeading: "Comment venir", faq: "Questions et réponses", faqHeading: "Bon à savoir", party: "Cortège", partyHeading: "Ceux qui nous entourent", viewHotel: "Voir l'hôtel", lostCall: "Perdus ? Appelez-nous", payUpi: "Payer avec UPI", deleteReply: "Supprimer ma réponse", replyDeleted: "Votre réponse a été supprimée.", deleting: "Suppression", deleteConfirm: "Supprimer votre réponse ? Les hôtes ne la verront plus." },
  te: { stay: "బస", stayHeading: "వేదికకు దగ్గరలో గదులు", travel: "ప్రయాణం", travelHeading: "ఇక్కడికి ఎలా రావాలి", faq: "ప్రశ్నలు - సమాధానాలు", faqHeading: "తెలుసుకోవాల్సినవి", party: "పెళ్లి బృందం", partyHeading: "మాతో ఉన్నవారు", viewHotel: "హోటల్ చూడండి", lostCall: "దారి తప్పారా? మాకు కాల్ చేయండి", payUpi: "UPI ద్వారా పంపండి", deleteReply: "నా సమాధానాన్ని తొలగించు", replyDeleted: "మీ సమాధానం తొలగించబడింది.", deleting: "తొలగిస్తోంది", deleteConfirm: "సమాధానాన్ని తొలగించాలా? ఆతిథ్యులకు ఇది ఇక కనిపించదు." },
  kn: { stay: "ವಾಸ್ತವ್ಯ", stayHeading: "ಸ್ಥಳದ ಬಳಿ ಕೊಠಡಿಗಳು", travel: "ಪ್ರಯಾಣ", travelHeading: "ಇಲ್ಲಿಗೆ ಹೇಗೆ ಬರುವುದು", faq: "ಪ್ರಶ್ನೆ ಉತ್ತರ", faqHeading: "ತಿಳಿಯಬೇಕಾದದ್ದು", party: "ಮದುವೆ ತಂಡ", partyHeading: "ನಮ್ಮೊಂದಿಗಿರುವವರು", viewHotel: "ಹೋಟೆಲ್ ನೋಡಿ", lostCall: "ದಾರಿ ತಪ್ಪಿದ್ದೀರಾ? ನಮಗೆ ಕರೆ ಮಾಡಿ", payUpi: "UPI ಮೂಲಕ ಕಳುಹಿಸಿ", deleteReply: "ನನ್ನ ಉತ್ತರವನ್ನು ಅಳಿಸಿ", replyDeleted: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಅಳಿಸಲಾಗಿದೆ.", deleting: "ಅಳಿಸುತ್ತಿದೆ", deleteConfirm: "ಉತ್ತರವನ್ನು ಅಳಿಸಬೇಕೇ? ಆತಿಥೇಯರಿಗೆ ಇದು ಇನ್ನು ಕಾಣಿಸುವುದಿಲ್ಲ." },
  ur: { stay: "قیام", stayHeading: "مقام کے قریب کمرے", travel: "سفر", travelHeading: "یہاں کیسے پہنچیں", faq: "سوال و جواب", faqHeading: "جاننے کی باتیں", party: "ہمراہی", partyHeading: "ہمارے ساتھ کھڑے لوگ", viewHotel: "ہوٹل دیکھیں", lostCall: "راستہ بھول گئے؟ ہمیں کال کریں", payUpi: "UPI سے بھیجیں", deleteReply: "میرا جواب حذف کریں", replyDeleted: "آپ کا جواب حذف کر دیا گیا ہے۔", deleting: "حذف ہو رہا ہے", deleteConfirm: "جواب حذف کریں؟ میزبان اسے مزید نہیں دیکھ سکیں گے۔" },
  he: { stay: "לינה", stayHeading: "חדרים ליד האולם", travel: "נסיעה", travelHeading: "איך מגיעים", faq: "שאלות ותשובות", faqHeading: "טוב לדעת", party: "המלווים", partyHeading: "מי שלצדנו", viewHotel: "לצפייה במלון", lostCall: "הלכתם לאיבוד? התקשרו אלינו", payUpi: "תשלום ב-UPI", deleteReply: "מחקו את התגובה שלי", replyDeleted: "התגובה שלך נמחקה.", deleting: "מוחק", deleteConfirm: "למחוק את התגובה? המארחים לא יראו אותה יותר." },
  pa: { stay: "ਠਹਿਰਨ ਦੀ ਥਾਂ", stayHeading: "ਸਥਾਨ ਦੇ ਨੇੜੇ ਕਮਰੇ", travel: "ਸਫ਼ਰ", travelHeading: "ਇੱਥੇ ਕਿਵੇਂ ਪਹੁੰਚਣਾ ਹੈ", faq: "ਸਵਾਲ ਅਤੇ ਜਵਾਬ", faqHeading: "ਜਾਣਨ ਵਾਲੀਆਂ ਗੱਲਾਂ", party: "ਵਿਆਹ ਦੀ ਟੋਲੀ", partyHeading: "ਸਾਡੇ ਨਾਲ ਖੜ੍ਹੇ ਲੋਕ", viewHotel: "ਹੋਟਲ ਵੇਖੋ", lostCall: "ਰਾਹ ਭੁੱਲ ਗਏ? ਸਾਨੂੰ ਫ਼ੋਨ ਕਰੋ", payUpi: "UPI ਰਾਹੀਂ ਭੇਜੋ", deleteReply: "ਮੇਰਾ ਜਵਾਬ ਮਿਟਾਓ", replyDeleted: "ਤੁਹਾਡਾ ਜਵਾਬ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।", deleting: "ਮਿਟਾ ਰਹੇ ਹਾਂ", deleteConfirm: "ਜਵਾਬ ਮਿਟਾਉਣਾ ਹੈ? ਮੇਜ਼ਬਾਨ ਇਸਨੂੰ ਹੁਣ ਨਹੀਂ ਵੇਖ ਸਕਣਗੇ।" },
  de: { stay: "Unterkunft", stayHeading: "Zimmer in der Nähe", travel: "Anreise", travelHeading: "So kommen Sie zu uns", faq: "Fragen und Antworten", faqHeading: "Gut zu wissen", party: "Hochzeitsgesellschaft", partyHeading: "Die Menschen an unserer Seite", viewHotel: "Hotel ansehen", lostCall: "Verlaufen? Rufen Sie uns an", payUpi: "Mit UPI bezahlen", deleteReply: "Meine Antwort löschen", replyDeleted: "Ihre Antwort wurde gelöscht.", deleting: "Wird gelöscht", deleteConfirm: "Antwort löschen? Die Gastgeber sehen sie dann nicht mehr." },
  pt: { stay: "Hospedagem", stayHeading: "Quartos perto do local", travel: "Viagem", travelHeading: "Como chegar", faq: "Perguntas e respostas", faqHeading: "Bom saber", party: "Padrinhos", partyHeading: "Quem está ao nosso lado", viewHotel: "Ver o hotel", lostCall: "Perdido? Ligue para nós", payUpi: "Pagar com UPI", deleteReply: "Excluir minha resposta", replyDeleted: "Sua resposta foi excluída.", deleting: "Excluindo", deleteConfirm: "Excluir sua resposta? Os anfitriões não a verão mais." },
};

export function labelsFor(code: string): Labels {
  return { ...(SETS[code] ?? en), ...(SECTION[code] ?? SECTION.en) };
}

export function fill(s: string, vars: Record<string, string>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}
