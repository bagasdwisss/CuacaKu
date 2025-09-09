
<h1><b>CuacaKu 🌦️</b></h1>
<p>Aplikasi prakiraan cuaca canggih yang dibangun dengan React, Vite, dan Tailwind CSS.</p>

<p>
<a href="#✨-fitur-utama"><strong>Fitur Utama</strong></a> ·
<a href="#🛠️-teknologi-yang-digunakan"><strong>Teknologi</strong></a> ·
<a href="#🚀-menjalankan-secara-lokal"><strong>Instalasi</strong></a> ·
<a href="#📄-lisensi"><strong>Lisensi</strong></a>
</p>
</div>

<div align="center">
<a href="https://cuaca-ku-sevens.vercel.app/" target="_blank">
<img src="URL_SCREENSHOT_ATAU_GIF_DEMO_ANDA.gif" alt="Demo Aplikasi CuacaKu" />
<br/>
<strong>🚀 Lihat Demo Langsung 🚀</strong>
</a>
</div>

CuacaKu adalah aplikasi web prakiraan cuaca modern yang kaya fitur. Aplikasi ini tidak hanya menampilkan data cuaca dasar, tetapi juga memberikan wawasan cerdas, animasi tematik yang imersif, dan pengalaman pengguna yang dipersonalisasi.

✨ Fitur Utama
Aplikasi ini dirancang untuk menjadi lebih dari sekadar aplikasi cuaca standar, dengan fitur-fitur unggulan seperti:

📊 Data Cuaca Lengkap: Informasi real-time (suhu, kelembapan, angin, UV), prakiraan 7 hari, dan grafik suhu per jam.

🎨 Animasi Tematik: Latar belakang dan animasi partikel (hujan, awan bergerak) yang berubah secara dinamis sesuai kondisi cuaca dan waktu.

🧠 Wawasan Cerdas:

Ringkasan Harian: Narasi cuaca harian seperti seorang penyiar berita.

Indeks Aktivitas: Rekomendasi apakah hari ini baik untuk olahraga, menjemur pakaian, atau melihat bintang.

Peringatan Cerdas: Notifikasi relevan untuk menggunakan sunscreen, membawa payung, atau peringatan angin kencang.

📱 Pengalaman Pengguna Modern:

Pencarian Akurat: Menggunakan Geocoding API untuk memastikan hasil pencarian selalu sesuai.

Deteksi Lokasi & Favorit: Tombol "Gunakan Lokasi Saya" dan kemampuan menyimpan hingga 5 kota favorit.

PWA (Progressive Web App): Bisa di-"install" di layar utama ponsel untuk pengalaman seperti aplikasi native.

Desain Responsif: Tampilan yang dioptimalkan untuk desktop maupun perangkat mobile.

🛠️ Teknologi yang Digunakan
Frontend: React.js, Vite

Styling: Tailwind CSS (dengan plugin tailwind-scrollbar)

Animasi: react-tsparticles (untuk hujan), Animasi CSS Kustom

Grafik: recharts

Manajemen State: React Hooks (useState, useEffect, useCallback)

Deployment: Vercel

🔌 Sumber Data (API)
Aplikasi ini mengintegrasikan tiga API berbeda untuk mendapatkan data yang paling akurat:

Cuaca Umum: Visual Crossing API

Indeks Kualitas Udara (AQI): World Air Quality Index (WAQI) Project API

Geocoding (Pencarian Lokasi): Geoapify API

🚀 Menjalankan Secara Lokal
Untuk menjalankan proyek ini di komputer Anda, ikuti langkah-langkah berikut:

Clone repository ini:

git clone [https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git](https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git)
cd cuacaku-app

Install semua dependensi:

npm install

Siapkan Environment Variables:

Buat sebuah file bernama .env.local di direktori utama proyek.

Isi dengan format berikut:

VITE_VISUALCROSSING_API_KEY=key_anda_di_sini
VITE_AQI_API_KEY=token_anda_di_sini
VITE_GEOAPIFY_API_KEY=key_anda_di_sini

Dapatkan API key gratis dari Visual Crossing, WAQI, dan Geoapify.

Jalankan server development:

npm run dev

Aplikasi akan berjalan di http://localhost:5173.

🤝 Kontribusi
Kontribusi, isu, dan permintaan fitur sangat diterima! Jangan ragu untuk membuka issue baru untuk mendiskusikan perubahan yang ingin Anda buat.

📄 Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file LICENSE untuk detailnya.
