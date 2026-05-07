export default async function handler(req, res) {
  const apiUrl = 'https://shinigami.to/links.json';
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Gagal memuat API: ${response.status}`);
    
    
    const data = await response.json();
    
    
    const targetItem = data.find(item => 
      (item.title && item.title.toLowerCase().includes('website')) || 
      (item.icon && item.icon === 'globe')
    );
    
    if (targetItem && targetItem.href) {
    
      res.redirect(302, targetItem.href);
    } else {
      res.status(404).send('Gagal menemukan objek link website utama di dalam data JSON.');
    }

  } catch (error) {
    res.status(500).send(`Terjadi kesalahan sistem: ${error.message}`);
  }
}