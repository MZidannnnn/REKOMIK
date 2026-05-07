import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Ganti dengan URL halaman index utama
  const urlIndex = 'https://shinigami.to/'; 
  
  try {
    // 1. Ambil HTML mentah
    const response = await fetch(urlIndex, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) throw new Error(`Gagal memuat halaman utama: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 2. Cari lokasi file JavaScript utama
    // Mencari tag script yang memiliki /assets/index-
    const jsPath = $('script[type="module"][src*="assets/index"]').attr('src');
    
    if (!jsPath) {
      return res.status(404).send('Gagal menemukan file JavaScript utama di HTML.');
    }
    
    // 3. Gabungkan domain dengan path JS, lalu fetch isi file JS-nya
    const jsUrl = new URL(jsPath, urlIndex).href;
    const jsResponse = await fetch(jsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    const jsContent = await jsResponse.text();
    
    // 4. Gunakan Regex untuk mengekstrak URL tujuan.
    // Kode ini mencari URL berawalan https:// yang mengandung kata "shinigami"
    const urlRegex = /(https:\/\/[a-zA-Z0-9.-]*shinigami[a-zA-Z0-9.-]*\.[a-zA-Z]+)/i;
    const match = jsContent.match(urlRegex);
    
    if (match && match[0]) {
      const urlTujuan = match[0];
      // 5. Sukses! Langsung redirect ke domain komik
      res.redirect(302, urlTujuan);
    } else {
      res.status(404).send('URL komik tidak ditemukan di dalam file JavaScript.');
    }

  } catch (error) {
    res.status(500).send(`Terjadi kesalahan sistem: ${error.message}`);
  }
}