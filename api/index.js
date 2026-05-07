import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Pastikan URL di bawah ini sudah benar
  const urlIndex = 'https://shinigami.to/'; 
  
  try {
    const response = await fetch(urlIndex, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Coba beberapa variasi selector
    let urlTujuan = $('a:contains("Link Website")').attr('href'); 
    
    if (!urlTujuan) {
        urlTujuan = $('a.group.relative.flex.w-full').attr('href');
    }
    
    if (urlTujuan) {
      res.redirect(302, urlTujuan);
    } else {
      // DEBUG MODE: Tampilkan HTML yang ditangkap oleh Vercel
      const pageTitle = $('title').text() || 'Tidak ada judul halaman';
      
      res.status(404).send(`
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: red;">Gagal: Tombol komik tidak ditemukan!</h2>
            <p><strong>Judul halaman yang didapat Vercel:</strong> ${pageTitle}</p>
            <p>Bisa jadi Vercel terblokir Cloudflare atau web menggunakan JavaScript render. Coba cek isi HTML di bawah ini, apakah struktur aslinya ada atau isinya malah halaman Cloudflare/Captcha:</p>
            <textarea style="width: 100%; height: 500px; font-family: monospace; background: #f4f4f4;">${html}</textarea>
        </div>
      `);
    }

  } catch (error) {
    res.status(500).send(`Terjadi kesalahan sistem: ${error.message}`);
  }
}