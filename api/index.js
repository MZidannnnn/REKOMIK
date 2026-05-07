import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  //  URL domain utama website index komik 
  const urlIndex = 'https://shinigami.to'; 
  
  try {
    const response = await fetch(urlIndex, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat halaman: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Mengekstrak link dari elemen <a> 
    let urlTujuan = $('a:contains("Link Website")').attr('href'); 
    
    // Alternatif pencarian
    if (!urlTujuan) {
        urlTujuan = $('a.group.relative.flex.w-full').attr('href');
    }
    
    if (urlTujuan) {
      res.redirect(302, urlTujuan);
    } else {
      res.status(404).send('URL tujuan komik tidak ditemukan di dalam struktur HTML.');
    }

  } catch (error) {
    res.status(500).send(`Terjadi kesalahan sistem: ${error.message}`);
  }
}