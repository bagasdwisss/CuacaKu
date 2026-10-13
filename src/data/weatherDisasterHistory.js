// src/data/weatherDisasterHistory.js

/**
 * Basis Data Kilas Balik Peristiwa Bencana Cuaca, Iklim & Geologis Dunia
 * Berdasarkan tanggal kalender (MM-DD)
 */
export const WEATHER_DISASTER_HISTORY = {
  // --- JANUARI ---
  '01-01': {
    year: 2020,
    title: 'Banjir Bandang Jabodetabek (Indonesia)',
    desc: 'Curah hujan ekstrem tertinggi dalam 150 tahun terakhir (377 mm/hari) memicu banjir besar di Jakarta dan sekitarnya.',
    type: 'flood',
  },
  '01-12': {
    year: 2010,
    title: 'Gempa Bumi Dahsyat Haiti',
    desc: 'Gempa berkekuatan M 7.0 melanda dekat Port-au-Prince, menjadi salah satu bencana paling mematikan dalam sejarah modern.',
    type: 'earthquake',
  },
  '01-15': {
    year: 2022,
    title: 'Letusan Gunung Hunga Tonga & Tsunami Global',
    desc: 'Letusan gunung api bawah laut memicu gelombang tsunami yang melintasi Samudra Pasifik hingga pesisir Jepang dan Amerika.',
    type: 'volcano',
  },

  // --- FEBRUARI ---
  '02-06': {
    year: 2023,
    title: 'Gempa Dahsyat Turki & Suriah',
    desc: 'Gempa kembar M 7.8 dan M 7.5 mengguncang wilayah selatan Turki dan utara Suriah di tengah cuaca musim dingin ekstrem.',
    type: 'earthquake',
  },
  '02-15': {
    year: 2021,
    title: 'Badai Musim Dingin Uri (Texas, AS)',
    desc: 'Gelombang hawa dingin Arktik yang langka melumpuhkan jaringan listrik Texas dan membekukan wilayah selatan Amerika Serikat.',
    type: 'storm',
  },

  // --- MARET ---
  '03-11': {
    year: 2011,
    title: 'Gempa Tohoku & Megatsunami (Jepang)',
    desc: 'Gempa M 9.1 memicu tsunami setinggi lebih dari 10 meter yang menerjang pesisir timur laut Jepang dan PLTN Fukushima.',
    type: 'tsunami',
  },
  '03-14': {
    year: 2019,
    title: 'Siklon Tropis Idai (Mozambik & Zimbabwe)',
    desc: 'Salah satu siklon tropis paling menghancurkan di belahan bumi selatan, merendam kota pelabuhan Beira hingga 90%.',
    type: 'cyclone',
  },

  // --- APRIL ---
  '04-04': {
    year: 2021,
    title: 'Siklon Tropis Seroja (NTT, Indonesia)',
    desc: 'Siklon langka yang terbentuk di daratan memicu banjir bandang, longsor, dan angin badai dahsyat di Nusa Tenggara Timur.',
    type: 'cyclone',
  },
  '04-25': {
    year: 2015,
    title: 'Gempa Bumi Gorkha (Nepal)',
    desc: 'Gempa M 7.8 mengguncang Nepal dan memicu longsoran salju mematikan di Gunung Everest.',
    type: 'earthquake',
  },

  // --- MEI ---
  '05-02': {
    year: 2008,
    title: 'Siklon Tropis Nargis (Myanmar)',
    desc: 'Siklon kategori 4 menerjang delta Ayeyarwady dengan gelombang badai setinggi 4 meter yang menenggelamkan ribuan desa.',
    type: 'cyclone',
  },
  '05-27': {
    year: 2006,
    title: 'Gempa Bumi Yogyakarta & Bantul (Indonesia)',
    desc: 'Gempa M 5.9 tektonik dangkal merobohkan ratusan ribu rumah di wilayah Bantul dan DI Yogyakarta dalam hitungan detik.',
    type: 'earthquake',
  },

  // --- JUNI ---
  '06-16': {
    year: 2013,
    title: 'Banjir Bandang & Longsor Uttarakhand (Himalaya, India)',
    desc: 'Hujan monsun lebat yang datang lebih awal memicu mencairnya gletser dan banjir bandang dahsyat di lembah Kedarnath.',
    type: 'flood',
  },
  '06-28': {
    year: 2021,
    title: 'Kubah Panas Ekstrem Pasifik Barat Laut (Kanada & AS)',
    desc: 'Suhu tertinggi dalam sejarah Kanada (49.6°C di Lytton) memicu kebakaran hutan dahsyat akibat fenomena kubah panas (heat dome).',
    type: 'heat',
  },

  // --- JULI ---
  '07-14': {
    year: 2021,
    title: 'Banjir Bandang Bersejarah Eropa Barat (Jerman & Belgia)',
    desc: 'Sistem tekanan rendah "Bernd" menumpahkan curah hujan 100 tahunan yang meluapkan sungai Ahr dan meluluhlantakkan kota-kota bersejarah.',
    type: 'flood',
  },
  '07-17': {
    year: 2006,
    title: 'Gempa & Tsunami Pangandaran (Jawa Barat, Indonesia)',
    desc: 'Gempa bawah laut M 7.7 memicu gelombang tsunami setinggi 7 meter yang menyapu pesisir selatan Jawa Barat dan Jawa Tengah.',
    type: 'tsunami',
  },

  // --- AGUSTUS ---
  '08-08': {
    year: 2023,
    title: 'Badai Api & Kebakaran Hutan Maui (Hawaii, AS)',
    desc: 'Angin kencang dari Siklon Dora mempercepat kobaran api yang melahap kota bersejarah Lahaina di Hawaii.',
    type: 'fire',
  },
  '08-27': {
    year: 1883,
    title: 'Letusan Dahsyat Krakatau (Selat Sunda, Indonesia)',
    desc: 'Letusan kataklismik Krakatau memicu tsunami setinggi 30 meter dan dentuman suaranya terdengar hingga jarak 4.800 km.',
    type: 'volcano',
  },
  '08-29': {
    year: 2005,
    title: 'Badai Hurricane Katrina (New Orleans, AS)',
    desc: 'Badai Kategori 5 menjebol tanggul penahan air di New Orleans, menenggelamkan 80% wilayah kota di bawah air banjir.',
    type: 'hurricane',
  },

  // --- SEPTEMBER ---
  '09-10': {
    year: 2023,
    title: 'Badai Daniel & Runtuhnya Bendungan Derna (Libya)',
    desc: 'Badai mediterania ekstrem (Medicane) meruntuhkan dua bendungan utama, memicu tsunami darat yang menyapu seperempat kota Derna.',
    type: 'storm',
  },
  '09-28': {
    year: 2018,
    title: 'Gempa, Tsunami & Likuifaksi Palu-Donggala (Indonesia)',
    desc: 'Gempa M 7.5 memicu tsunami di Teluk Palu dan fenomena likuifaksi langka yang menelan permukiman Petobo dan Balaroa.',
    type: 'tsunami',
  },

  // --- OKTOBER ---
  '10-08': {
    year: 2005,
    title: 'Gempa Bumi Kashmir (Pakistan & India)',
    desc: 'Gempa berkekuatan M 7.6 memicu longsoran tebing raksasa yang mengubur ribuan desa di lereng pegunungan Himalaya.',
    type: 'earthquake',
  },
  '10-12': {
    year: 2019,
    title: 'Topan Raksasa Hagibis (Jepang)',
    desc: 'Salah satu topan paling basah dalam setengah abad di Jepang, menumpahkan lebih dari 900 mm hujan dan meluapkan puluhan sungai.',
    type: 'typhoon',
  },
  '10-13': {
    year: 1970,
    title: 'Siklon Tropis Bhola (Teluk Benggala / Bangladesh)',
    desc: 'Pusaran badai tropis paling mematikan dalam catatan sejarah dunia menerjang pesisir pantai delta dengan gelombang badai setinggi 10 meter.',
    type: 'cyclone',
  },
  '10-14': {
    year: 2013,
    title: 'Siklon Phailin (India)',
    desc: 'Siklon kategori super dengan kecepatan angin 260 km/j menghantam negara bagian Odisha, memicu evakuasi 1 juta penduduk.',
    type: 'cyclone',
  },
  '10-25': {
    year: 2010,
    title: 'Gempa & Tsunami Kepulauan Mentawai (Sumatera Barat, Indonesia)',
    desc: 'Gempa megathrust M 7.8 memicu gelombang tsunami lokal setinggi 3-7 meter yang menyapu pulau-pulau terluar Mentawai.',
    type: 'tsunami',
  },
  '10-29': {
    year: 2012,
    title: 'Badai Superstorm Sandy (New York & New Jersey, AS)',
    desc: 'Siklon raksasa berdiameter 1.800 km menerjang pesisir timur AS, membanjiri stasiun subway New York dan memadamkan kota metropolitan.',
    type: 'hurricane',
  },

  // --- NOVEMBER ---
  '11-08': {
    year: 2013,
    title: 'Topan Super Haiyan / Yolanda (Filipina)',
    desc: 'Salah satu siklon terkuat yang pernah mendarat di muka bumi dengan hembusan angin mencapai 315 km/j menghantam Tacloban.',
    type: 'typhoon',
  },
  '11-21': {
    year: 2022,
    title: 'Gempa Bumi Cianjur (Jawa Barat, Indonesia)',
    desc: 'Gempa kerak dangkal M 5.6 di sesar Cugenang merusak puluhan ribu rumah dan memicu tanah longsor yang memutus jalur Puncak.',
    type: 'earthquake',
  },

  // --- DESEMBER ---
  '12-22': {
    year: 2018,
    title: 'Tsunami Selat Sunda akibat Anak Krakatau (Indonesia)',
    desc: 'Longsoran lereng barat daya Gunung Anak Krakatau ke laut memicu tsunami senyap tanpa gempa yang menyapu pesisir Banten dan Lampung.',
    type: 'tsunami',
  },
  '12-26': {
    year: 2004,
    title: 'Gempa Megathrust & Tsunami Samudra Hindia (Aceh, Indonesia)',
    desc: 'Gempa raksasa M 9.1-9.3 memicu gelombang tsunami setinggi hingga 30 meter yang melintasi 14 negara di Samudra Hindia.',
    type: 'tsunami',
  },
};

/**
 * Cadangan peristiwa cuaca ekstrem dunia untuk tanggal-tanggal yang belum tercatat spesifik
 */
export const FALLBACK_HISTORICAL_EVENTS = [
  {
    year: 1970,
    title: 'Siklon Tropis Bhola (Teluk Benggala)',
    desc: 'Siklon tropis paling mematikan dalam sejarah bumi yang mengubah sistem mitigasi badai dunia.',
  },
  {
    year: 1991,
    title: 'Letusan Gunung Pinatubo (Filipina)',
    desc: 'Erupsi kolosal yang memuntahkan jutaan ton aerosol belerang dan menurunkan suhu global bumi hingga 0.5°C selama setahun.',
  },
  {
    year: 1815,
    title: 'Letusan Gunung Tambora (Sumbawa, Indonesia)',
    desc: 'Letusan gunung api terbesar dalam sejarah peradaban memicu "Tahun Tanpa Musim Panas" (Year Without a Summer) di seluruh dunia.',
  },
  {
    year: 1931,
    title: 'Banjir Sungai Yangtze (Tiongkok)',
    desc: 'Salah satu bencana banjir paling dahsyat akibat pencairan salju musim semi berpadu hujan monsun ekstrem.',
  },
];

/**
 * Mengambil peristiwa bencana cuaca/geologis bersejarah untuk tanggal tertentu
 * @param {Date|string} date 
 */
export const getHistoricalDisasterEvent = (date) => {
  const d = date ? new Date(date) : new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;

  if (WEATHER_DISASTER_HISTORY[key]) {
    return {
      dateFormatted: `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`,
      ...WEATHER_DISASTER_HISTORY[key],
    };
  }

  // Jika tanggal tersebut belum memiliki catatan presisi, ambil catatan berbobot berdasarkan hari dalam tahun
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const fallback = FALLBACK_HISTORICAL_EVENTS[dayOfYear % FALLBACK_HISTORICAL_EVENTS.length];

  return {
    dateFormatted: `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`,
    ...fallback,
  };
};
