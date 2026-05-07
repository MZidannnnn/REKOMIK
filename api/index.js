import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const urlIndex = 'https://shinigami.to/'; // Ganti ke URL asli
  
  try {
    const response = await fetch(urlIndex, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    if (!response.ok) throw new Error(`Gagal memuat halaman: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const jsPath = $('script[type="module"][src*="assets/index"]').attr('src');
    if (!jsPath) return res.status(404).send('Gagal menemukan JS');
    
    const jsUrl = new URL(jsPath, urlIndex).href;
    const jsResponse = await fetch(jsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const jsContent = await jsResponse.text();
    
    // Tangkap SEMUA jenis URL (http/https) yang tertulis di dalam file JS
    const allUrls = jsContent.match(/https?:\/\/[^\s"'`<>]+/g) || [];
    // Buang URL yang duplikat
    const uniqueUrls = [...new Set(allUrls)];
    
    // Cari yang mengandung kata shinigami secara spesifik
    const targetUrl = uniqueUrls.find(url => url.toLowerCase().includes('shinigami') && !url.includes('w3.org'));
    
    if (targetUrl) {
      res.redirect(302, targetUrl);
    } else {
      // Tampilkan semua URL yang berhasil ditemukan untuk kita analisis
      res.status(404).send(`
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: red;">Gagal: Link komik tidak tertulis utuh di JS.</h2>
          <p>Berikut adalah daftar semua link yang Vercel temukan di dalam sistem mereka:</p>
          <ul style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
            ${uniqueUrls.length > 0 ? uniqueUrls.map(u => `<li>${u}</li>`).join('') : '<li>Tidak ada satupun URL ditemukan di JS.</li>'}
          </ul>
          <p><strong>Kesimpulan:</strong> Jika link komiknya tidak ada di daftar atas, berarti website ini memuat link tersebut melalui pemanggilan <b>API (XHR/Fetch)</b> secara dinamis.</p>
        </div>
      `);
    }

  } catch (error) {
    res.status(500).send(`Error sistem: ${error.message}`);
  }
}