export interface HijriDateInfo {
  day: number;
  monthNumber: number;
  monthNameAr: string;
  monthNameEn: string;
  monthNameId: string;
  year: number;
  gregorianDateString: string;
  isOffline: boolean;
}

export interface IslamicHoliday {
  nameId: string;
  nameEn: string;
  hijriDate: string; // "DD-MM" format
  dateObj?: Date;
}

const HIJRI_MONTH_NAMES_ID = [
  "Muharram",
  "Safar",
  "Rabi'ul Awal",
  "Rabi'ul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

const HIJRI_MONTH_NAMES_EN = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qadah",
  "Dhu al-Hijjah",
];

const HIJRI_MONTH_NAMES_AR = [
  "المحرّم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

/**
 * Local mathematical calculation of Hijri date (Tabular Islamic Calendar)
 * Used as a zero-dependency offline fallback.
 */
export function calculateLocalHijri(date: Date, adjustment: number = -1): HijriDateInfo {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();

  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = Math.floor(a / 4);
  const c = 2 - a + b;
  const e = Math.floor(365.25 * (y + 4716));
  const f = Math.floor(30.6001 * (m + 1));
  const jd = c + d + e + f - 1524.5 + adjustment;

  const epoch = 1948439.5;
  const diff = jd - epoch;
  const cycle = Math.floor(diff / 10631);
  let rem = diff % 10631;
  
  let yearCycle = Math.floor(rem / 354.36667);
  rem = Math.round(rem - yearCycle * 354.36667);
  
  if (rem < 0) {
    yearCycle--;
    rem += 354;
  }

  const hYear = cycle * 30 + yearCycle + 1;
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  
  // Leap years in 30-year cycle
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  if (leapYears.includes(hYear % 30)) {
    monthLengths[11] = 30;
  }

  let hMonth = 1;
  let hDay = 1;
  let dayAccum = rem;

  for (let i = 0; i < 12; i++) {
    if (dayAccum < monthLengths[i]) {
      hMonth = i + 1;
      hDay = dayAccum + 1;
      break;
    }
    dayAccum -= monthLengths[i];
  }

  const formattedGregorian = `${d.toString().padStart(2, "0")}-${m.toString().padStart(2, "0")}-${y}`;

  return {
    day: hDay,
    monthNumber: hMonth,
    monthNameAr: HIJRI_MONTH_NAMES_AR[hMonth - 1],
    monthNameEn: HIJRI_MONTH_NAMES_EN[hMonth - 1],
    monthNameId: HIJRI_MONTH_NAMES_ID[hMonth - 1],
    year: hYear,
    gregorianDateString: formattedGregorian,
    isOffline: true,
  };
}

/**
 * Fetch Hijri date from api.aladhan.com with offline fallback
 */
export async function getHijriDate(date: Date): Promise<HijriDateInfo> {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  
  try {
    const response = await fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}`);
    if (!response.ok) throw new Error("API failed");
    
    const json = await response.json();
    const data = json.data;
    
    return {
      day: parseInt(data.hijri.day),
      monthNumber: data.hijri.month.number,
      monthNameAr: data.hijri.month.ar,
      monthNameEn: data.hijri.month.en,
      monthNameId: HIJRI_MONTH_NAMES_ID[data.hijri.month.number - 1],
      year: parseInt(data.hijri.year),
      gregorianDateString: data.gregorian.date,
      isOffline: false,
    };
  } catch (err) {
    console.warn("Hijri API fetch failed, falling back to local calculation:", err);
    return calculateLocalHijri(date);
  }
}

/**
 * Lists key Islamic holidays / important days for a Hijri year
 */
export function getIslamicHolidays(hijriYear: number): IslamicHoliday[] {
  return [
    { nameId: "Tahun Baru Islam (1 Muharram)", nameEn: "Islamic New Year (1 Muharram)", hijriDate: "01-01" },
    { nameId: "Hari Asyura (10 Muharram)", nameEn: "Ashura Day (10 Muharram)", hijriDate: "10-01" },
    { nameId: "Maulid Nabi Muhammad SAW (12 Rabi'ul Awal)", nameEn: "Mawlid al-Nabi (12 Rabi' al-Awwal)", hijriDate: "12-03" },
    { nameId: "Isra' Mi'raj (27 Rajab)", nameEn: "Isra' and Mi'raj (27 Rajab)", hijriDate: "27-07" },
    { nameId: "Awal Bulan Ramadhan (1 Ramadhan)", nameEn: "First Day of Ramadan (1 Ramadan)", hijriDate: "01-09" },
    { nameId: "Nuzulul Qur'an (17 Ramadhan)", nameEn: "Nuzul al-Quran (17 Ramadan)", hijriDate: "17-09" },
    { nameId: "Hari Raya Idul Fitri (1 Syawal)", nameEn: "Eid al-Fitr (1 Shawwal)", hijriDate: "01-10" },
    { nameId: "Hari Raya Idul Adha (10 Dzulhijjah)", nameEn: "Eid al-Adha (10 Dhu al-Hijjah)", hijriDate: "10-12" },
  ];
}
