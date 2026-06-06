// Asmaul Husna - 99 Beautiful Names of Allah
// Data with multiple language support

export interface AsmaulHusnaName {
  number: number;
  arabic: string;       // Arabic script
  transliteration: string; // Latin transliteration
  meanings: {
    id: string;   // Indonesian
    en: string;   // English
    tr: string;   // Turkish
    ur: string;   // Urdu (romanized)
  };
  benefits: {
    id: string;   // Benefit/virtue in Indonesian
    en: string;   // Benefit/virtue in English
  };
  quranRef?: string; // Optional Quran reference
}

export const ASMAUL_HUSNA: AsmaulHusnaName[] = [
  {
    number: 1,
    arabic: "ٱللَّهُ",
    transliteration: "Allah",
    meanings: { id: "Allah – Nama yang mencakup semua sifat kesempurnaan", en: "Allah – The Greatest Name encompassing all divine attributes", tr: "Allah – Bütün ilahi özellikleri kapsayan en büyük isim", ur: "Allah – Tamam ilahi sifaat ka jami naam" },
    benefits: { id: "Membaca nama ini memperkuat iman dan mendekatkan diri kepada Allah", en: "Reciting this name strengthens faith and brings one closer to Allah" },
    quranRef: "Al-Ikhlas 112:1"
  },
  {
    number: 2,
    arabic: "ٱلرَّحْمَـٰنُ",
    transliteration: "Ar-Rahman",
    meanings: { id: "Yang Maha Pengasih (untuk semua makhluk)", en: "The Most Gracious (for all creation)", tr: "Çok Merhametli (tüm yaratıklar için)", ur: "Nihayet Meharban (tamam makhluqaat ke liye)" },
    benefits: { id: "Membaca 100 kali setelah shalat Subuh menguatkan daya ingat", en: "Reading 100 times after Fajr prayer strengthens memory" },
    quranRef: "Al-Fatihah 1:3"
  },
  {
    number: 3,
    arabic: "ٱلرَّحِيمُ",
    transliteration: "Ar-Rahim",
    meanings: { id: "Yang Maha Penyayang (khusus bagi orang beriman)", en: "The Most Merciful (especially for the believers)", tr: "Çok Şefkatli (özellikle inananlar için)", ur: "Nihayet Raheem (khaas momineen ke liye)" },
    benefits: { id: "Memberikan kedamaian hati dan perlindungan dari sifat-sifat keras", en: "Gives peace of heart and protection from harsh traits" },
    quranRef: "Al-Fatihah 1:3"
  },
  {
    number: 4,
    arabic: "ٱلْمَلِكُ",
    transliteration: "Al-Malik",
    meanings: { id: "Yang Maha Merajai", en: "The King, The Absolute Ruler", tr: "Mutlak Hükümdar", ur: "Mutlaq Badshah" },
    benefits: { id: "Membaca nama ini memperkokoh wibawa dan kepemimpinan", en: "Reciting this name strengthens dignity and leadership" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 5,
    arabic: "ٱلْقُدُّوسُ",
    transliteration: "Al-Quddus",
    meanings: { id: "Yang Maha Suci dari segala kekurangan", en: "The Most Pure, The Most Holy", tr: "Her eksiklikten münezzeh olan", ur: "Har naqsaan se pak" },
    benefits: { id: "Membersihkan hati dari kegelisahan dan kotoran batin", en: "Purifies the heart from anxiety and inner impurities" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 6,
    arabic: "ٱلسَّلَامُ",
    transliteration: "As-Salam",
    meanings: { id: "Yang Maha Sejahtera dan Pemberi Keselamatan", en: "The Source of Peace, The Giver of Peace", tr: "Barış Kaynağı, Güvenlik Veren", ur: "Amn o Salaamti dene wala" },
    benefits: { id: "Memberikan perlindungan dari bencana dan menyembuhkan penyakit", en: "Provides protection from calamity and heals illness" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 7,
    arabic: "ٱلْمُؤْمِنُ",
    transliteration: "Al-Mu'min",
    meanings: { id: "Yang Maha Memberikan Keamanan", en: "The Guardian of Faith, The Grantor of Security", tr: "Güven Veren, İman Bağışlayan", ur: "Amaan dene wala" },
    benefits: { id: "Membaca 630 kali memberikan perlindungan dari rasa takut", en: "Reciting 630 times gives protection from fear" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 8,
    arabic: "ٱلْمُهَيْمِنُ",
    transliteration: "Al-Muhaymin",
    meanings: { id: "Yang Maha Memelihara dan Mengawasi", en: "The Protector, The Guardian, The Overseer", tr: "Koruyan, Gözetleyen", ur: "Nigehbaan, Hifazat karne wala" },
    benefits: { id: "Memberikan batin yang jernih dan penjagaan dari bahaya", en: "Grants clear inner vision and protection from harm" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 9,
    arabic: "ٱلْعَزِيزُ",
    transliteration: "Al-Aziz",
    meanings: { id: "Yang Maha Perkasa dan Tidak Terkalahkan", en: "The Almighty, The Invincible", tr: "Çok Güçlü, Yenilmez", ur: "Ghaalib, Maaghloob na hone wala" },
    benefits: { id: "Membaca nama ini membangkitkan rasa hormat dan wibawa", en: "Reciting this name cultivates dignity and commands respect" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 10,
    arabic: "ٱلْجَبَّارُ",
    transliteration: "Al-Jabbar",
    meanings: { id: "Yang Maha Kuasa dan Memaksa", en: "The Compeller, The Restorer", tr: "Zorlayan, Onaran", ur: "Jabr karne wala, Tarmiim karne wala" },
    benefits: { id: "Membaca nama ini melindungi dari para tiran dan orang zalim", en: "Reciting this name protects from tyrants and oppressors" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 11,
    arabic: "ٱلْمُتَكَبِّرُ",
    transliteration: "Al-Mutakabbir",
    meanings: { id: "Yang Memiliki Keagungan Tertinggi", en: "The Supreme, The Majestic", tr: "En Büyük, Yüce", ur: "Sab se Azeem" },
    benefits: { id: "Membaca nama ini membantu melepaskan kesombongan dari hati", en: "Reciting this name helps release arrogance from the heart" },
    quranRef: "Al-Hashr 59:23"
  },
  {
    number: 12,
    arabic: "ٱلْخَالِقُ",
    transliteration: "Al-Khaliq",
    meanings: { id: "Yang Maha Pencipta dari ketiadaan", en: "The Creator, The Originator", tr: "Yaratıcı, Yoktan Var Eden", ur: "Paida karne wala, Khaaliq" },
    benefits: { id: "Membaca nama ini menumbuhkan kreativitas dan inovasi", en: "Reciting this name nurtures creativity and innovation" },
    quranRef: "Al-Hashr 59:24"
  },
  {
    number: 13,
    arabic: "ٱلْبَارِئُ",
    transliteration: "Al-Bari'",
    meanings: { id: "Yang Maha Mengadakan dari tiada", en: "The Evolver, The Originator of all things", tr: "Her şeyi Evrimleştiren", ur: "Ibtida karne wala" },
    benefits: { id: "Membaca nama ini memberikan kekuatan untuk bangkit dari keterpurukan", en: "Reciting this name gives strength to rise from hardship" },
    quranRef: "Al-Hashr 59:24"
  },
  {
    number: 14,
    arabic: "ٱلْمُصَوِّرُ",
    transliteration: "Al-Musawwir",
    meanings: { id: "Yang Maha Membentuk Rupa", en: "The Shaper of Beauty, The Fashioner", tr: "Şekil Veren, Biçimlendiren", ur: "Soorat banane wala" },
    benefits: { id: "Membaca nama ini saat hamil membantu perkembangan bayi yang sehat", en: "Reciting during pregnancy is said to help healthy baby development" },
    quranRef: "Al-Hashr 59:24"
  },
  {
    number: 15,
    arabic: "ٱلْغَفَّارُ",
    transliteration: "Al-Ghaffar",
    meanings: { id: "Yang Maha Pengampun dan sering memaafkan", en: "The Repeatedly Forgiving, The All-Forgiving", tr: "Çok Affeden", ur: "Bahut zyada maaf karne wala" },
    benefits: { id: "Membaca nama ini memohon ampunan atas dosa-dosa", en: "Reciting this name invokes forgiveness of sins" },
    quranRef: "Az-Zumar 39:5"
  },
  {
    number: 16,
    arabic: "ٱلْقَهَّارُ",
    transliteration: "Al-Qahhar",
    meanings: { id: "Yang Maha Menundukkan dan Mengalahkan", en: "The Subduer, The Ever-Dominating", tr: "Her şeyi Boyunduruk Altına Alan", ur: "Sab ko qaabu karne wala" },
    benefits: { id: "Membaca nama ini membantu menundukkan nafsu dan godaan setan", en: "Reciting this name helps subdue desires and Shaytan's temptations" },
    quranRef: "Az-Zumar 39:4"
  },
  {
    number: 17,
    arabic: "ٱلْوَهَّابُ",
    transliteration: "Al-Wahhab",
    meanings: { id: "Yang Maha Pemberi Karunia tanpa henti", en: "The Bestower, The Giver of All Gifts", tr: "Her şeyi Bağışlayan", ur: "Be hisaab dene wala" },
    benefits: { id: "Membaca nama ini membuka pintu rezeki dan anugerah", en: "Reciting this name opens doors of provision and blessings" },
    quranRef: "Ali-Imran 3:8"
  },
  {
    number: 18,
    arabic: "ٱلرَّزَّاقُ",
    transliteration: "Ar-Razzaq",
    meanings: { id: "Yang Maha Pemberi Rezeki", en: "The All-Provider, The Sustainer", tr: "Her şeyi Rızıklandıran", ur: "Rizq dene wala" },
    benefits: { id: "Membaca nama ini meluaskan rezeki dan menghilangkan kemiskinan", en: "Reciting this name expands provision and removes poverty" },
    quranRef: "Adh-Dhariyat 51:58"
  },
  {
    number: 19,
    arabic: "ٱلْفَتَّاحُ",
    transliteration: "Al-Fattah",
    meanings: { id: "Yang Maha Pembuka segala urusan", en: "The Opener, The Victory Giver", tr: "Her şeyi Açan, Fetih Veren", ur: "Kholne wala, Fath dene wala" },
    benefits: { id: "Membaca nama ini memudahkan penyelesaian pekerjaan dan urusan", en: "Reciting this name eases completion of work and affairs" },
    quranRef: "Saba 34:26"
  },
  {
    number: 20,
    arabic: "ٱلْعَلِيمُ",
    transliteration: "Al-Alim",
    meanings: { id: "Yang Maha Mengetahui segalanya", en: "The All-Knowing, The Omniscient", tr: "Her şeyi Bilen", ur: "Sab kuch jaanne wala" },
    benefits: { id: "Membaca nama ini meningkatkan ilmu pengetahuan dan kecerdasan", en: "Reciting this name enhances knowledge and intelligence" },
    quranRef: "Al-Baqarah 2:29"
  },
  {
    number: 21,
    arabic: "ٱلْقَابِضُ",
    transliteration: "Al-Qabidh",
    meanings: { id: "Yang Maha Menyempitkan (sebagai ujian)", en: "The Constrictor, The Withholder", tr: "Daraltan, Tutan", ur: "Rokne wala, Tang karne wala" },
    benefits: { id: "Membaca nama ini membantu menerima ujian dengan sabar", en: "Reciting this name helps accept trials with patience" },
    quranRef: "Al-Baqarah 2:245"
  },
  {
    number: 22,
    arabic: "ٱلْبَاسِطُ",
    transliteration: "Al-Basit",
    meanings: { id: "Yang Maha Melapangkan (rezeki dan hati)", en: "The Expander, The Reliever", tr: "Genişleten, Ferahlatan", ur: "Wasaa'at dene wala" },
    benefits: { id: "Membaca nama ini membuka kelapangan hati dan rezeki", en: "Reciting this name opens expansiveness of heart and provision" },
    quranRef: "Al-Baqarah 2:245"
  },
  {
    number: 23,
    arabic: "ٱلْخَافِضُ",
    transliteration: "Al-Khafidh",
    meanings: { id: "Yang Maha Merendahkan (orang yang sombong)", en: "The Abaser, The Humiliator of the arrogant", tr: "Alçaltan", ur: "Past karne wala" },
    benefits: { id: "Membaca nama ini melindungi dari musuh yang sombong", en: "Reciting this name protects from arrogant enemies" }
  },
  {
    number: 24,
    arabic: "ٱلرَّافِعُ",
    transliteration: "Ar-Rafi'",
    meanings: { id: "Yang Maha Meninggikan (derajat orang beriman)", en: "The Exalter, The Elevator of the righteous", tr: "Yükselten, Derecelendiren", ur: "Buland karne wala" },
    benefits: { id: "Membaca nama ini meningkatkan derajat dan kedudukan", en: "Reciting this name elevates one's status and rank" }
  },
  {
    number: 25,
    arabic: "ٱلْمُعِزُّ",
    transliteration: "Al-Mu'izz",
    meanings: { id: "Yang Maha Memberi Kemuliaan", en: "The Honourer, The Bestower of Honor", tr: "İzzet Veren", ur: "Izzat dene wala" },
    benefits: { id: "Membaca nama ini memberikan rasa hormat dan kemuliaan", en: "Reciting this name grants respect and honor" },
    quranRef: "Ali-Imran 3:26"
  },
  {
    number: 26,
    arabic: "ٱلْمُذِلُّ",
    transliteration: "Al-Mudhill",
    meanings: { id: "Yang Maha Menghinakan (orang zalim)", en: "The Dishonorer, The Humiliator of the oppressors", tr: "Zelil Eden", ur: "Zillat dene wala (zaalimon ko)" },
    benefits: { id: "Membaca nama ini memberikan perlindungan dari musuh yang zalim", en: "Reciting this name provides protection from oppressive enemies" },
    quranRef: "Ali-Imran 3:26"
  },
  {
    number: 27,
    arabic: "ٱلسَّمِيعُ",
    transliteration: "As-Sami'",
    meanings: { id: "Yang Maha Mendengar", en: "The All-Hearing, The Ever-Listening", tr: "Her şeyi İşiten", ur: "Sab kuch sunne wala" },
    benefits: { id: "Membaca nama ini memperkuat doa dan harapan kita kepada Allah", en: "Reciting this name strengthens our prayers and hopes in Allah" },
    quranRef: "Al-Baqarah 2:127"
  },
  {
    number: 28,
    arabic: "ٱلْبَصِيرُ",
    transliteration: "Al-Basir",
    meanings: { id: "Yang Maha Melihat", en: "The All-Seeing, The All-Perceiving", tr: "Her şeyi Gören", ur: "Sab kuch dekhne wala" },
    benefits: { id: "Membaca nama ini menajamkan penglihatan batin dan lahir", en: "Reciting this name sharpens inner and outer vision" },
    quranRef: "Al-Isra 17:1"
  },
  {
    number: 29,
    arabic: "ٱلْحَكَمُ",
    transliteration: "Al-Hakam",
    meanings: { id: "Yang Maha Memutuskan Hukum", en: "The Judge, The Arbitrator", tr: "Hükmeden, Karar Veren", ur: "Faislah karne wala" },
    benefits: { id: "Membaca nama ini membantu menemukan solusi yang adil", en: "Reciting this name helps find just solutions" },
    quranRef: "Al-An'am 6:114"
  },
  {
    number: 30,
    arabic: "ٱلْعَدْلُ",
    transliteration: "Al-'Adl",
    meanings: { id: "Yang Maha Adil", en: "The Just, The Equitable", tr: "Adil olan", ur: "Aadil" },
    benefits: { id: "Membaca nama ini membantu berlaku adil dalam setiap keputusan", en: "Reciting this name helps one be just in every decision" }
  },
  {
    number: 31,
    arabic: "ٱللَّطِيفُ",
    transliteration: "Al-Latif",
    meanings: { id: "Yang Maha Lembut dan Halus", en: "The Subtle, The Most Gentle", tr: "En Nazik, En Ince", ur: "Narm dil, Nazuk" },
    benefits: { id: "Membaca nama ini mendatangkan kasih sayang dan kelembutan", en: "Reciting this name brings compassion and gentleness" },
    quranRef: "Al-An'am 6:103"
  },
  {
    number: 32,
    arabic: "ٱلْخَبِيرُ",
    transliteration: "Al-Khabir",
    meanings: { id: "Yang Maha Mengetahui yang Tersembunyi", en: "The All-Aware, The Well-Acquainted", tr: "Her şeyden Haberdar olan", ur: "Baakhabar, Khabirdar" },
    benefits: { id: "Membaca nama ini memberikan kepekaan terhadap hal-hal yang tersembunyi", en: "Reciting this name gives sensitivity to hidden matters" },
    quranRef: "Al-An'am 6:18"
  },
  {
    number: 33,
    arabic: "ٱلْحَلِيمُ",
    transliteration: "Al-Halim",
    meanings: { id: "Yang Maha Penyantun dan Penyabar", en: "The Forbearing, The Clement", tr: "Yumuşak Huylu, Sabırlı", ur: "Burdbaar, Haleem" },
    benefits: { id: "Membaca nama ini mengembangkan kesabaran dan ketabahan", en: "Reciting this name develops patience and forbearance" },
    quranRef: "Al-Baqarah 2:235"
  },
  {
    number: 34,
    arabic: "ٱلْعَظِيمُ",
    transliteration: "Al-Azim",
    meanings: { id: "Yang Maha Agung", en: "The Magnificent, The Great", tr: "Azamet sahibi, Büyük", ur: "Azeem, Barhaa" },
    benefits: { id: "Membaca nama ini menumbuhkan rasa kagum dan tawadhu", en: "Reciting this name cultivates awe and humility" },
    quranRef: "Al-Baqarah 2:255"
  },
  {
    number: 35,
    arabic: "ٱلْغَفُورُ",
    transliteration: "Al-Ghafur",
    meanings: { id: "Yang Maha Pengampun", en: "The All-Forgiving", tr: "Çok Bağışlayan", ur: "Bahut bakshne wala" },
    benefits: { id: "Membaca nama ini membuka pintu taubat dan ampunan Allah", en: "Reciting this name opens the door of repentance and divine forgiveness" },
    quranRef: "Al-Baqarah 2:173"
  },
  {
    number: 36,
    arabic: "ٱلشَّكُورُ",
    transliteration: "Ash-Shakur",
    meanings: { id: "Yang Maha Mensyukuri (membalas kebaikan hamba)", en: "The Most Appreciative, The Rewarder of Good", tr: "Şükreden, İyiliği Ödüllendiren", ur: "Shukr guzaar, Nek badla dene wala" },
    benefits: { id: "Membaca nama ini mengembangkan sifat syukur yang tulus", en: "Reciting this name develops genuine gratitude" },
    quranRef: "Fatir 35:30"
  },
  {
    number: 37,
    arabic: "ٱلْعَلِيُّ",
    transliteration: "Al-'Aliyy",
    meanings: { id: "Yang Maha Tinggi dan Luhur", en: "The Most High, The Exalted", tr: "En Yüce", ur: "Buland tareen" },
    benefits: { id: "Membaca nama ini mengangkat status spiritual kita", en: "Reciting this name elevates our spiritual status" },
    quranRef: "Al-Baqarah 2:255"
  },
  {
    number: 38,
    arabic: "ٱلْكَبِيرُ",
    transliteration: "Al-Kabir",
    meanings: { id: "Yang Maha Besar dalam segala hal", en: "The Most Great, The Incomparably Great", tr: "Çok Büyük", ur: "Sabse barhaa" },
    benefits: { id: "Membaca nama ini memberikan rasa rendah hati di hadapan Allah", en: "Reciting this name instills humility before Allah" },
    quranRef: "Ar-Ra'd 13:9"
  },
  {
    number: 39,
    arabic: "ٱلْحَفِيظُ",
    transliteration: "Al-Hafiz",
    meanings: { id: "Yang Maha Menjaga dan Memelihara", en: "The Preserver, The Protector", tr: "Koruyan, Muhafaza Eden", ur: "Hifazat karne wala" },
    benefits: { id: "Membaca nama ini memberikan perlindungan dari bahaya dan musibah", en: "Reciting this name provides protection from danger and calamity" },
    quranRef: "Hud 11:57"
  },
  {
    number: 40,
    arabic: "ٱلْمُقِيتُ",
    transliteration: "Al-Muqit",
    meanings: { id: "Yang Maha Pemberi Kekuatan dan Makanan", en: "The Sustainer, The Nourisher", tr: "Güç Veren, Besleyen", ur: "Taaqat dene wala" },
    benefits: { id: "Membaca nama ini menguatkan tubuh dan jiwa", en: "Reciting this name strengthens body and soul" },
    quranRef: "An-Nisa 4:85"
  },
  {
    number: 41,
    arabic: "ٱلْحَسِيبُ",
    transliteration: "Al-Hasib",
    meanings: { id: "Yang Maha Membuat Perhitungan", en: "The Reckoner, The Sufficient", tr: "Hesap Soran, Yeterli olan", ur: "Hisaab lene wala" },
    benefits: { id: "Membaca nama ini memberikan perlindungan dari orang yang jahat", en: "Reciting this name gives protection from evil people" },
    quranRef: "An-Nisa 4:6"
  },
  {
    number: 42,
    arabic: "ٱلْجَلِيلُ",
    transliteration: "Al-Jalil",
    meanings: { id: "Yang Maha Mulia dan Agung", en: "The Majestic, The Sublime", tr: "Yüce ve Azamet Sahibi", ur: "Baland Maqaam, Barhaa" },
    benefits: { id: "Membaca nama ini menumbuhkan rasa hormat dan ketakziman kepada Allah", en: "Reciting this name cultivates reverence and awe of Allah" }
  },
  {
    number: 43,
    arabic: "ٱلْكَرِيمُ",
    transliteration: "Al-Karim",
    meanings: { id: "Yang Maha Mulia dan Dermawan", en: "The Generous, The Bountiful", tr: "Cömert, Generous", ur: "Kareem, Sakhee" },
    benefits: { id: "Membaca nama ini melapangkan rezeki dan menumbuhkan kedermawanan", en: "Reciting this name expands provision and nurtures generosity" },
    quranRef: "Al-Infitar 82:6"
  },
  {
    number: 44,
    arabic: "ٱلرَّقِيبُ",
    transliteration: "Ar-Raqib",
    meanings: { id: "Yang Maha Mengawasi segala sesuatu", en: "The Watchful, The Ever-Observant", tr: "Her şeyi Gözetleyen", ur: "Nigehban, Haar waqt dekhne wala" },
    benefits: { id: "Membaca nama ini membantu kita untuk selalu merasa diawasi Allah", en: "Reciting this name helps us always feel watched by Allah" },
    quranRef: "An-Nisa 4:1"
  },
  {
    number: 45,
    arabic: "ٱلْمُجِيبُ",
    transliteration: "Al-Mujib",
    meanings: { id: "Yang Maha Mengabulkan Doa", en: "The Responsive, The Answerer of Prayers", tr: "Dualara Cevap Veren", ur: "Dua qabool karne wala" },
    benefits: { id: "Membaca nama ini mempercepat pengabulan doa", en: "Reciting this name hastens the answering of prayers" },
    quranRef: "Hud 11:61"
  },
  {
    number: 46,
    arabic: "ٱلْوَاسِعُ",
    transliteration: "Al-Wasi'",
    meanings: { id: "Yang Maha Luas Ilmu dan Rahmat-Nya", en: "The All-Embracing, The Vast", tr: "Her şeyi Kuşatan, Geniş olan", ur: "Wase'a, Har jagah maujood" },
    benefits: { id: "Membaca nama ini meluaskan pikiran dan mengembangkan wawasan", en: "Reciting this name broadens the mind and expands perspective" },
    quranRef: "Al-Baqarah 2:115"
  },
  {
    number: 47,
    arabic: "ٱلْحَكِيمُ",
    transliteration: "Al-Hakim",
    meanings: { id: "Yang Maha Bijaksana", en: "The All-Wise, The Most Wise", tr: "En Hikmetli, En Bilge", ur: "Hakeemana, Sab se daanamand" },
    benefits: { id: "Membaca nama ini mengembangkan kecerdasan dan kebijaksanaan", en: "Reciting this name develops wisdom and sound judgment" },
    quranRef: "Al-Baqarah 2:32"
  },
  {
    number: 48,
    arabic: "ٱلْوَدُودُ",
    transliteration: "Al-Wadud",
    meanings: { id: "Yang Maha Mencintai (hamba-hamba-Nya)", en: "The Most Loving, The Affectionate", tr: "En Seven, Sevgi Dolu", ur: "Mohabbat karne wala" },
    benefits: { id: "Membaca nama ini menumbuhkan cinta kasih dalam hubungan sosial", en: "Reciting this name nurtures love in social relationships" },
    quranRef: "Hud 11:90"
  },
  {
    number: 49,
    arabic: "ٱلْمَجِيدُ",
    transliteration: "Al-Majid",
    meanings: { id: "Yang Maha Mulia dalam Perbuatan-Nya", en: "The Most Glorious, The All-Glorious", tr: "En Şanlı, En Muhteşem", ur: "Azim, Baland Shaan" },
    benefits: { id: "Membaca nama ini meningkatkan kemuliaan akhlak dan karakter", en: "Reciting this name elevates the nobility of character" },
    quranRef: "Hud 11:73"
  },
  {
    number: 50,
    arabic: "ٱلْبَاعِثُ",
    transliteration: "Al-Ba'ith",
    meanings: { id: "Yang Maha Membangkitkan (dari kematian)", en: "The Resurrector, The Raiser from Death", tr: "Diriltici, Yeniden Canlandıran", ur: "Uthane wala" },
    benefits: { id: "Membaca nama ini mengingatkan kita akan kehidupan setelah mati", en: "Reciting this name reminds us of life after death" }
  },
  {
    number: 51,
    arabic: "ٱلشَّهِيدُ",
    transliteration: "Ash-Shahid",
    meanings: { id: "Yang Maha Menyaksikan", en: "The All-Witnessing, The Witness", tr: "Her şeye Şahit olan", ur: "Gawaah, Har cheez dekhne wala" },
    benefits: { id: "Membaca nama ini menguatkan niat dan kejujuran kita", en: "Reciting this name strengthens our intention and honesty" },
    quranRef: "Al-Ma'idah 5:117"
  },
  {
    number: 52,
    arabic: "ٱلْحَقُّ",
    transliteration: "Al-Haqq",
    meanings: { id: "Yang Maha Benar dan Nyata", en: "The Truth, The Real", tr: "Gerçek olan, Hak olan", ur: "Haq, Saccha" },
    benefits: { id: "Membaca nama ini memperkuat komitmen kita pada kebenaran", en: "Reciting this name strengthens our commitment to truth" },
    quranRef: "Al-Hajj 22:62"
  },
  {
    number: 53,
    arabic: "ٱلْوَكِيلُ",
    transliteration: "Al-Wakil",
    meanings: { id: "Yang Maha Pemelihara dan Penjamin Urusan", en: "The Trustee, The Disposer of Affairs", tr: "İşleri İdare Eden, Vekil", ur: "Wakeel, Zimmedaar" },
    benefits: { id: "Membaca nama ini mengajarkan tawakkal yang sempurna kepada Allah", en: "Reciting this name teaches perfect reliance on Allah" },
    quranRef: "Ali-Imran 3:173"
  },
  {
    number: 54,
    arabic: "ٱلْقَوِيُّ",
    transliteration: "Al-Qawiyy",
    meanings: { id: "Yang Maha Kuat", en: "The All-Strong, The Possessor of all strength", tr: "En Güçlü", ur: "Sab se taaqatwar" },
    benefits: { id: "Membaca nama ini memberikan kekuatan spiritual dan fisik", en: "Reciting this name grants spiritual and physical strength" },
    quranRef: "Al-Hajj 22:40"
  },
  {
    number: 55,
    arabic: "ٱلْمَتِينُ",
    transliteration: "Al-Matin",
    meanings: { id: "Yang Maha Kokoh dan Teguh", en: "The Firm, The Steadfast", tr: "Sağlam, Metanetli", ur: "Mazboot, Pakka" },
    benefits: { id: "Membaca nama ini memberikan keteguhan iman dalam cobaan", en: "Reciting this name gives steadfast faith during trials" },
    quranRef: "Adh-Dhariyat 51:58"
  },
  {
    number: 56,
    arabic: "ٱلْوَلِيُّ",
    transliteration: "Al-Waliyy",
    meanings: { id: "Yang Maha Melindungi dan Menolong", en: "The Protector, The Patron", tr: "Koruyucu, Dost olan", ur: "Wali, Madadgar" },
    benefits: { id: "Membaca nama ini memberikan perlindungan ilahi dan bimbingan Allah", en: "Reciting this name provides divine protection and Allah's guidance" },
    quranRef: "Ash-Shura 42:28"
  },
  {
    number: 57,
    arabic: "ٱلْحَمِيدُ",
    transliteration: "Al-Hamid",
    meanings: { id: "Yang Maha Terpuji", en: "The Praiseworthy, The Commendable", tr: "Her türlü Hamd ve Şükre Layık olan", ur: "Tarif ke laayeq" },
    benefits: { id: "Membaca nama ini menumbuhkan sifat bersyukur dan memuji Allah", en: "Reciting this name cultivates gratitude and praising Allah" },
    quranRef: "Ibrahim 14:1"
  },
  {
    number: 58,
    arabic: "ٱلْمُحْصِي",
    transliteration: "Al-Muhsi",
    meanings: { id: "Yang Maha Menghitung segala sesuatu", en: "The All-Enumerating, The Counter", tr: "Her şeyi Sayan", ur: "Sab kuch ginne wala" },
    benefits: { id: "Membaca nama ini meningkatkan ketelitian dan kerapian kita", en: "Reciting this name improves accuracy and orderliness" }
  },
  {
    number: 59,
    arabic: "ٱلْمُبْدِئُ",
    transliteration: "Al-Mubdi'",
    meanings: { id: "Yang Maha Memulai Penciptaan", en: "The Originator, The Producer", tr: "Her şeyi Başlatan", ur: "Ibtida karne wala" },
    benefits: { id: "Membaca nama ini menginspirasi kita untuk memulai hal-hal baru yang baik", en: "Reciting this name inspires us to start new good things" }
  },
  {
    number: 60,
    arabic: "ٱلْمُعِيدُ",
    transliteration: "Al-Mu'id",
    meanings: { id: "Yang Maha Mengembalikan (menghidupkan kembali)", en: "The Restorer, The Reinstater", tr: "Her şeyi Geri Getiren", ur: "Wapas laane wala" },
    benefits: { id: "Membaca nama ini mengingatkan akan kebangkitan di hari kiamat", en: "Reciting this name reminds of resurrection on the Day of Judgment" }
  },
  {
    number: 61,
    arabic: "ٱلْمُحْيِي",
    transliteration: "Al-Muhyi",
    meanings: { id: "Yang Maha Menghidupkan", en: "The Giver of Life, The Reviver", tr: "Hayat Veren", ur: "Zindagi dene wala" },
    benefits: { id: "Membaca nama ini menghidupkan semangat yang padam", en: "Reciting this name revives the spirit that has dimmed" }
  },
  {
    number: 62,
    arabic: "ٱلْمُمِيتُ",
    transliteration: "Al-Mumit",
    meanings: { id: "Yang Maha Mematikan", en: "The Bringer of Death, The Destroyer", tr: "Ölüm Veren", ur: "Maut dene wala" },
    benefits: { id: "Membaca nama ini mengajarkan kesiapan menghadapi kematian", en: "Reciting this name teaches readiness to face death" }
  },
  {
    number: 63,
    arabic: "ٱلْحَيُّ",
    transliteration: "Al-Hayy",
    meanings: { id: "Yang Maha Hidup dan Kekal", en: "The Ever-Living, The Eternal Life", tr: "Sonsuza dek Yaşayan", ur: "Hamesha zinda rehne wala" },
    benefits: { id: "Membaca nama ini memberikan kehidupan spiritual yang kuat", en: "Reciting this name grants strong spiritual life" },
    quranRef: "Al-Baqarah 2:255"
  },
  {
    number: 64,
    arabic: "ٱلْقَيُّومُ",
    transliteration: "Al-Qayyum",
    meanings: { id: "Yang Maha Berdiri Sendiri dan Mengurus segala sesuatu", en: "The Self-Existing, The Sustainer of All", tr: "Kendi Kendine Var olan", ur: "Khud se qaim, Sabka qawam" },
    benefits: { id: "Membaca nama ini memperkuat kemandirian dan keteguhan jiwa", en: "Reciting this name strengthens self-reliance and soul steadfastness" },
    quranRef: "Al-Baqarah 2:255"
  },
  {
    number: 65,
    arabic: "ٱلْوَاجِدُ",
    transliteration: "Al-Wajid",
    meanings: { id: "Yang Maha Menemukan dan Mampu segalanya", en: "The Perceiver, The Finder", tr: "Her şeyi Bulan", ur: "Paane wala" },
    benefits: { id: "Membaca nama ini membantu menemukan solusi yang tersembunyi", en: "Reciting this name helps find hidden solutions" }
  },
  {
    number: 66,
    arabic: "ٱلْمَاجِدُ",
    transliteration: "Al-Majid",
    meanings: { id: "Yang Maha Mulia dengan Sifat Kesempurnaan", en: "The All-Glorious, The Magnificent", tr: "Şanlı ve Yüce olan", ur: "Azeem ul shaan" },
    benefits: { id: "Membaca nama ini mengembangkan kemuliaan akhlak yang luhur", en: "Reciting this name develops noble character and morality" }
  },
  {
    number: 67,
    arabic: "ٱلْوَاحِدُ",
    transliteration: "Al-Wahid",
    meanings: { id: "Yang Maha Esa, Tunggal", en: "The One, The Unique", tr: "Bir olan, Tek olan", ur: "Ek, Wahid" },
    benefits: { id: "Membaca nama ini memperkuat keyakinan tauhid", en: "Reciting this name strengthens the conviction of monotheism" },
    quranRef: "Al-Baqarah 2:163"
  },
  {
    number: 68,
    arabic: "ٱلْأَحَدُ",
    transliteration: "Al-Ahad",
    meanings: { id: "Yang Maha Tunggal tanpa tandingan", en: "The One, The Uniquely One", tr: "Eşsiz Tek olan", ur: "Bilkul akela, Wahid ul wahid" },
    benefits: { id: "Membaca nama ini memperkokoh iman tauhid dan menjauhkan syirik", en: "Reciting this name strengthens monotheism and keeps one away from shirk" },
    quranRef: "Al-Ikhlas 112:1"
  },
  {
    number: 69,
    arabic: "ٱلصَّمَدُ",
    transliteration: "As-Samad",
    meanings: { id: "Yang Maha Dibutuhkan semua makhluk", en: "The Eternal, The Absolute, The Self-Sufficient", tr: "Hiçbir şeye Muhtaç olmayan, Herkesin Muhtaç olduğu", ur: "Behniyaaz, Sabka muhtaj" },
    benefits: { id: "Membaca nama ini mengajarkan kita hanya bergantung kepada Allah", en: "Reciting this name teaches us to depend only on Allah" },
    quranRef: "Al-Ikhlas 112:2"
  },
  {
    number: 70,
    arabic: "ٱلْقَادِرُ",
    transliteration: "Al-Qadir",
    meanings: { id: "Yang Maha Kuasa atas segala sesuatu", en: "The All-Capable, The Powerful", tr: "Her şeye Gücü Yeten", ur: "Qaadir, Sab par qaboo rakhne wala" },
    benefits: { id: "Membaca nama ini memperkuat keyakinan bahwa Allah Mahakuasa", en: "Reciting this name strengthens belief in Allah's absolute power" },
    quranRef: "Al-Baqarah 2:20"
  },
  {
    number: 71,
    arabic: "ٱلْمُقْتَدِرُ",
    transliteration: "Al-Muqtadir",
    meanings: { id: "Yang Maha Menentukan Kekuatan", en: "The All-Determining, The Dominant", tr: "Gücü Belirleyen", ur: "Quwwat ka maalik" },
    benefits: { id: "Membaca nama ini menguatkan kepercayaan pada kekuasaan Allah", en: "Reciting this name strengthens confidence in Allah's power" },
    quranRef: "Al-Kahf 18:45"
  },
  {
    number: 72,
    arabic: "ٱلْمُقَدِّمُ",
    transliteration: "Al-Muqaddim",
    meanings: { id: "Yang Maha Mendahulukan", en: "The Expediter, The Promoter", tr: "Öne Alan", ur: "Aage karne wala" },
    benefits: { id: "Membaca nama ini membantu memprioritaskan hal-hal yang penting", en: "Reciting this name helps prioritize what is important" }
  },
  {
    number: 73,
    arabic: "ٱلْمُؤَخِّرُ",
    transliteration: "Al-Mu'akhkhir",
    meanings: { id: "Yang Maha Mengakhirkan", en: "The Delayer, The Retarder", tr: "Geri Bırakan", ur: "Peechhe karne wala" },
    benefits: { id: "Membaca nama ini mengajarkan kita tentang hikmah dalam penundaan takdir", en: "Reciting this name teaches wisdom in the delay of destiny" }
  },
  {
    number: 74,
    arabic: "ٱلْأَوَّلُ",
    transliteration: "Al-Awwal",
    meanings: { id: "Yang Pertama, tidak ada sebelum-Nya", en: "The First, No beginning before Him", tr: "İlk olan, Önce olan", ur: "Pehle, Isse pehle koi nahi" },
    benefits: { id: "Membaca nama ini mengingatkan akan keazalian Allah", en: "Reciting this name reminds us of Allah's eternity without beginning" },
    quranRef: "Al-Hadid 57:3"
  },
  {
    number: 75,
    arabic: "ٱلْآخِرُ",
    transliteration: "Al-Akhir",
    meanings: { id: "Yang Terakhir, tidak ada setelah-Nya", en: "The Last, No end after Him", tr: "Son olan, Sonrası olmayan", ur: "Aakhir, Iske baad koi nahi" },
    benefits: { id: "Membaca nama ini mengingatkan akan keabadian Allah", en: "Reciting this name reminds us of Allah's eternal existence" },
    quranRef: "Al-Hadid 57:3"
  },
  {
    number: 76,
    arabic: "ٱلظَّاهِرُ",
    transliteration: "Az-Zahir",
    meanings: { id: "Yang Maha Nyata dan Jelas tanda-tanda-Nya", en: "The Manifest, The Evident", tr: "Açık olan, Görünür olan", ur: "Zaahir, Aashkaar" },
    benefits: { id: "Membaca nama ini membantu mengenali tanda-tanda kebesaran Allah", en: "Reciting this name helps recognize the signs of Allah's greatness" },
    quranRef: "Al-Hadid 57:3"
  },
  {
    number: 77,
    arabic: "ٱلْبَاطِنُ",
    transliteration: "Al-Batin",
    meanings: { id: "Yang Maha Tersembunyi dari jangkauan makhluk", en: "The Hidden, The Inner", tr: "Gizli olan, İç olan", ur: "Baatin, Chupi hui haqeeqat" },
    benefits: { id: "Membaca nama ini mengingatkan akan kerahasiaan ilmu Allah", en: "Reciting this name reminds of the hidden knowledge of Allah" },
    quranRef: "Al-Hadid 57:3"
  },
  {
    number: 78,
    arabic: "ٱلْوَالِي",
    transliteration: "Al-Wali",
    meanings: { id: "Yang Maha Mengurus segala urusan alam", en: "The Governor, The Master of All", tr: "Her şeyi Yöneten", ur: "Waali, Haakm" },
    benefits: { id: "Membaca nama ini memberikan keyakinan bahwa Allah mengurus semua urusan kita", en: "Reciting this name gives confidence that Allah manages all our affairs" }
  },
  {
    number: 79,
    arabic: "ٱلْمُتَعَالِي",
    transliteration: "Al-Muta'ali",
    meanings: { id: "Yang Maha Tinggi melampaui segala sesuatu", en: "The Most Exalted, The Self-Exalting", tr: "Her şeyden Yüce olan", ur: "Sab se buland, Sabse aala" },
    benefits: { id: "Membaca nama ini mengingatkan akan keagungan Allah yang tak terbatas", en: "Reciting this name reminds of Allah's limitless majesty" },
    quranRef: "Ar-Ra'd 13:9"
  },
  {
    number: 80,
    arabic: "ٱلْبَرُّ",
    transliteration: "Al-Barr",
    meanings: { id: "Yang Maha Baik dan Berbuat Baik", en: "The Source of All Goodness, The Most Kind and Righteous", tr: "Çok İyilik Eden", ur: "Bhala karne wala" },
    benefits: { id: "Membaca nama ini menumbuhkan sifat-sifat kebaikan dalam diri", en: "Reciting this name cultivates qualities of goodness within" },
    quranRef: "At-Tur 52:28"
  },
  {
    number: 81,
    arabic: "ٱلتَّوَّابُ",
    transliteration: "At-Tawwab",
    meanings: { id: "Yang Maha Penerima Taubat", en: "The Ever-Pardoning, The Acceptor of Repentance", tr: "Tövbeleri Kabul Eden", ur: "Tawbah qabool karne wala" },
    benefits: { id: "Membaca nama ini membuka pintu taubat nasuha kepada Allah", en: "Reciting this name opens the door of sincere repentance to Allah" },
    quranRef: "Al-Baqarah 2:37"
  },
  {
    number: 82,
    arabic: "ٱلْمُنْتَقِمُ",
    transliteration: "Al-Muntaqim",
    meanings: { id: "Yang Maha Menghukum atas kejahatan", en: "The Avenger, The Inflictor of Retribution", tr: "İntikam Alan", ur: "Inteqam lene wala" },
    benefits: { id: "Membaca nama ini memperingatkan akan balasan Allah bagi para penjahat", en: "Reciting this name warns of Allah's retribution for wrongdoers" },
    quranRef: "As-Sajdah 32:22"
  },
  {
    number: 83,
    arabic: "ٱلْعَفُوُّ",
    transliteration: "Al-'Afuww",
    meanings: { id: "Yang Maha Pemaaf", en: "The Pardoner, The Effacer", tr: "Affeden", ur: "Maaf karne wala" },
    benefits: { id: "Membaca nama ini mendatangkan ampunan atas dosa-dosa kecil dan besar", en: "Reciting this name brings pardon for small and large sins" },
    quranRef: "An-Nisa 4:99"
  },
  {
    number: 84,
    arabic: "ٱلرَّءُوفُ",
    transliteration: "Ar-Ra'uf",
    meanings: { id: "Yang Maha Pengasih dan penuh rasa kasih", en: "The Ever-Compassionate, The Clement", tr: "Çok Şefkatli", ur: "Bahut shafeeq" },
    benefits: { id: "Membaca nama ini mengembangkan sifat belas kasih kepada sesama", en: "Reciting this name cultivates compassion towards others" },
    quranRef: "Al-Baqarah 2:207"
  },
  {
    number: 85,
    arabic: "مَالِكُ ٱلْمُلْكِ",
    transliteration: "Maliku'l-Mulk",
    meanings: { id: "Yang Maha Merajai Kerajaan Abadi", en: "The Owner of All Sovereignty", tr: "Mutlak Mülkün Sahibi", ur: "Mamlekat ka maalik" },
    benefits: { id: "Membaca nama ini memberikan keyakinan bahwa segala sesuatu milik Allah", en: "Reciting this name gives conviction that everything belongs to Allah" },
    quranRef: "Ali-Imran 3:26"
  },
  {
    number: 86,
    arabic: "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ",
    transliteration: "Dhu'l-Jalali wa'l-Ikram",
    meanings: { id: "Yang Memiliki Keagungan dan Kemuliaan", en: "The Lord of Majesty and Bounty", tr: "Azamet ve İkram Sahibi", ur: "Azmat aur Ikraam ka maalik" },
    benefits: { id: "Membaca nama ini memberikan rasa keagungan dan penghormatan kepada Allah", en: "Reciting this name gives a sense of Allah's majesty and reverence" },
    quranRef: "Ar-Rahman 55:27"
  },
  {
    number: 87,
    arabic: "ٱلْمُقْسِطُ",
    transliteration: "Al-Muqsit",
    meanings: { id: "Yang Maha Adil dan berlaku seadil-adilnya", en: "The Equitable, The Just", tr: "Her şeyde Adil olan", ur: "Insaaf wala" },
    benefits: { id: "Membaca nama ini membantu berlaku adil kepada semua orang", en: "Reciting this name helps one be fair to everyone" }
  },
  {
    number: 88,
    arabic: "ٱلْجَامِعُ",
    transliteration: "Al-Jami'",
    meanings: { id: "Yang Maha Mengumpulkan segala sesuatu", en: "The Gatherer, The Unifier", tr: "Her şeyi Toplayan", ur: "Sab kuch ikhatta karne wala" },
    benefits: { id: "Membaca nama ini membantu menyatukan yang terpisah", en: "Reciting this name helps unify what is separated" },
    quranRef: "Ali-Imran 3:9"
  },
  {
    number: 89,
    arabic: "ٱلْغَنِيُّ",
    transliteration: "Al-Ghaniyy",
    meanings: { id: "Yang Maha Kaya dari segala kebutuhan", en: "The Self-Sufficient, The Richest", tr: "Her şeyden Zengin olan", ur: "Sab se Ghani, Maaldar" },
    benefits: { id: "Membaca nama ini membuka pintu kekayaan dan menghilangkan kemiskinan", en: "Reciting this name opens the door of wealth and removes poverty" },
    quranRef: "Al-Baqarah 2:263"
  },
  {
    number: 90,
    arabic: "ٱلْمُغْنِي",
    transliteration: "Al-Mughni",
    meanings: { id: "Yang Maha Memberi Kekayaan kepada hamba-Nya", en: "The Enricher, The Emancipator", tr: "Zenginleştiren", ur: "Ghani karne wala" },
    benefits: { id: "Membaca nama ini mendatangkan kecukupan dan rezeki yang baik", en: "Reciting this name brings sufficiency and good provision" }
  },
  {
    number: 91,
    arabic: "ٱلْمَانِعُ",
    transliteration: "Al-Mani'",
    meanings: { id: "Yang Maha Mencegah bahaya dan keburukan", en: "The Preventer of Harm, The Withholder", tr: "Zarar ve kötülüğü Önleyen", ur: "Rokne wala, Naqsaan se bachane wala" },
    benefits: { id: "Membaca nama ini memberikan perlindungan dari kejahatan dan penyakit", en: "Reciting this name provides protection from evil and illness" }
  },
  {
    number: 92,
    arabic: "ٱلضَّارُّ",
    transliteration: "Ad-Darr",
    meanings: { id: "Yang Maha Mendatangkan Mudharat (sebagai ujian)", en: "The Distresser, The Afflicator", tr: "Zarar Veren (imtihan olarak)", ur: "Nuqsaan dene wala (imtahan ke taur par)" },
    benefits: { id: "Membaca nama ini mengajarkan bahwa semua musibah adalah dari Allah", en: "Reciting this name teaches that all afflictions come from Allah" }
  },
  {
    number: 93,
    arabic: "ٱلنَّافِعُ",
    transliteration: "An-Nafi'",
    meanings: { id: "Yang Maha Memberi Manfaat", en: "The Benefiter, The Propitious", tr: "Fayda Veren", ur: "Faida dene wala" },
    benefits: { id: "Membaca nama ini mendatangkan kebaikan dan manfaat bagi diri sendiri dan orang lain", en: "Reciting this name brings goodness and benefit to oneself and others" }
  },
  {
    number: 94,
    arabic: "ٱلنُّورُ",
    transliteration: "An-Nur",
    meanings: { id: "Yang Maha Pemberi Cahaya", en: "The Light, The Illuminator", tr: "Nur olan, Aydınlatan", ur: "Noor, Roshan karne wala" },
    benefits: { id: "Membaca nama ini menerangi hati dengan cahaya hidayah", en: "Reciting this name illuminates the heart with the light of guidance" },
    quranRef: "An-Nur 24:35"
  },
  {
    number: 95,
    arabic: "ٱلْهَادِي",
    transliteration: "Al-Hadi",
    meanings: { id: "Yang Maha Pemberi Hidayah dan Petunjuk", en: "The Guide, The Director", tr: "Doğru yolu Gösteren", ur: "Hidayat dene wala" },
    benefits: { id: "Membaca nama ini memohon hidayah dan petunjuk menuju jalan yang benar", en: "Reciting this name invokes guidance and direction to the right path" },
    quranRef: "Al-Furqan 25:31"
  },
  {
    number: 96,
    arabic: "ٱلْبَدِيعُ",
    transliteration: "Al-Badi'",
    meanings: { id: "Yang Maha Pencipta hal-hal yang baru dan unik", en: "The Incomparable, The Originator of the New", tr: "Eşsiz yaratıcı, Yeni şeyler icad eden", ur: "Naye andaaz se banane wala" },
    benefits: { id: "Membaca nama ini menginspirasi kreativitas dan inovasi", en: "Reciting this name inspires creativity and innovation" },
    quranRef: "Al-Baqarah 2:117"
  },
  {
    number: 97,
    arabic: "ٱلْبَاقِي",
    transliteration: "Al-Baqi",
    meanings: { id: "Yang Maha Kekal dan tidak akan pernah binasa", en: "The Everlasting, The Eternal", tr: "Sonsuza dek var olan", ur: "Hamesha baqi rehne wala" },
    benefits: { id: "Membaca nama ini mengingatkan akan kefanaan dunia dan kekekalan akhirat", en: "Reciting this name reminds of the transience of the world and eternity of the hereafter" }
  },
  {
    number: 98,
    arabic: "ٱلْوَارِثُ",
    transliteration: "Al-Warith",
    meanings: { id: "Yang Maha Mewarisi segala sesuatu", en: "The Inheritor of All, The Heir", tr: "Her şeyin Varisi olan", ur: "Sab kuch ka waarith" },
    benefits: { id: "Membaca nama ini memberikan kesadaran bahwa semua harta akan kembali kepada Allah", en: "Reciting this name gives awareness that all wealth will return to Allah" },
    quranRef: "Al-Hijr 15:23"
  },
  {
    number: 99,
    arabic: "ٱلرَّشِيدُ",
    transliteration: "Ar-Rashid",
    meanings: { id: "Yang Maha Pandai dan Bijaksana dalam mengarahkan", en: "The Guide to the Right Path, The Righteous Teacher", tr: "Doğru yola Yönelten", ur: "Seedhe raaste par laane wala" },
    benefits: { id: "Membaca nama ini menambah kecerdasan dan kemampuan mengelola urusan", en: "Reciting this name increases intelligence and ability to manage affairs" }
  }
];

// Category mappings for filtering
export const ASMAUL_HUSNA_CATEGORIES = {
  all: { id: "Semua", en: "All Names" },
  mercy: { id: "Kasih Sayang", en: "Mercy & Compassion" },
  power: { id: "Kekuasaan", en: "Power & Might" },
  knowledge: { id: "Ilmu & Kebijaksanaan", en: "Knowledge & Wisdom" },
  creation: { id: "Penciptaan", en: "Creation" },
  guidance: { id: "Hidayah", en: "Guidance" },
  forgiveness: { id: "Ampunan", en: "Forgiveness" },
  provision: { id: "Rezeki", en: "Provision" },
  protection: { id: "Perlindungan", en: "Protection" }
};

export const NAME_CATEGORIES: Record<number, keyof typeof ASMAUL_HUSNA_CATEGORIES> = {
  1: "all",
  2: "mercy", 3: "mercy", 33: "mercy", 48: "mercy", 84: "mercy",
  4: "power", 9: "power", 10: "power", 11: "power", 54: "power", 55: "power", 70: "power", 71: "power",
  20: "knowledge", 28: "knowledge", 29: "knowledge", 30: "knowledge", 47: "knowledge", 32: "knowledge",
  12: "creation", 13: "creation", 14: "creation", 59: "creation", 60: "creation", 96: "creation",
  95: "guidance", 99: "guidance", 26: "guidance",
  15: "forgiveness", 35: "forgiveness", 36: "forgiveness", 81: "forgiveness", 83: "forgiveness",
  18: "provision", 89: "provision", 90: "provision", 22: "provision", 17: "provision",
  6: "protection", 7: "protection", 8: "protection", 39: "protection", 53: "protection", 56: "protection"
};
