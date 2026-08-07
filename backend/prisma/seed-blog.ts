import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blogs = [
  {
    id: 'seed-blog-1',
    slug: 'cara-membuat-website-profesional-untuk-bisnis',
    title: {
      id: 'Cara Membuat Website Profesional untuk Bisnis Anda',
      en: 'How to Build a Professional Website for Your Business',
    },
    content: {
      id: `<h2>Mengapa Website Profesional Penting?</h2>
<p>Di era digital saat ini, website bukan lagi sekadar pelengkap — melainkan fondasi utama kehadiran bisnis Anda secara online. Lebih dari 80% konsumen mencari informasi produk atau jasa melalui internet sebelum memutuskan untuk membeli.</p>

<h2>1. Tentukan Tujuan Website Anda</h2>
<p>Langkah pertama sebelum membangun website adalah menentukan tujuan yang jelas. Apakah website Anda untuk:</p>
<ul>
<li>Menampilkan profil perusahaan (Company Profile)</li>
<li>Menjual produk secara online (E-Commerce)</li>
<li>Menghasilkan leads dari calon pelanggan (Landing Page)</li>
<li>Berbagi konten dan membangun komunitas (Blog/Portal)</li>
</ul>

<h2>2. Pilih Teknologi yang Tepat</h2>
<p>Pemilihan teknologi sangat berpengaruh pada performa dan skalabilitas website. Beberapa pilihan populer:</p>
<ul>
<li><strong>WordPress</strong> — cocok untuk blog dan website sederhana</li>
<li><strong>React + Node.js</strong> — ideal untuk website dinamis dan aplikasi web</li>
<li><strong>Next.js</strong> — sempurna untuk SEO dan performa optimal</li>
</ul>

<h2>3. Desain yang Responsif dan User-Friendly</h2>
<p>Website yang baik harus tampil sempurna di semua perangkat — desktop, tablet, maupun smartphone. Gunakan prinsip <em>mobile-first design</em> untuk memastikan pengalaman pengguna yang optimal.</p>

<h2>4. Optimalkan untuk SEO</h2>
<p>Website yang bagus tapi tidak ditemukan di Google tidak ada gunanya. Pastikan website Anda memiliki:</p>
<ul>
<li>Meta title dan meta description yang relevan</li>
<li>URL yang bersih dan deskriptif</li>
<li>Kecepatan loading yang cepat (di bawah 3 detik)</li>
<li>Konten berkualitas yang menjawab pertanyaan pengguna</li>
</ul>

<h2>Kesimpulan</h2>
<p>Membangun website profesional memang membutuhkan perencanaan yang matang. Namun dengan teknologi yang tepat dan tim yang berpengalaman seperti ViviDev.id, proses ini bisa berjalan dengan lancar dan hasil yang memuaskan.</p>`,
      en: `<h2>Why Does a Professional Website Matter?</h2>
<p>In today's digital era, a website is no longer just a complement — it's the main foundation of your business's online presence. More than 80% of consumers search for product or service information online before making a purchase decision.</p>

<h2>1. Define Your Website Goals</h2>
<p>The first step before building a website is defining clear goals. Is your website for:</p>
<ul>
<li>Showcasing your company profile</li>
<li>Selling products online (E-Commerce)</li>
<li>Generating leads from potential customers (Landing Page)</li>
<li>Sharing content and building a community (Blog/Portal)</li>
</ul>

<h2>2. Choose the Right Technology</h2>
<p>Technology choice greatly impacts website performance and scalability. Popular options include React + Node.js for dynamic websites and Next.js for optimal SEO and performance.</p>

<h2>3. Responsive and User-Friendly Design</h2>
<p>A good website must look perfect on all devices. Use mobile-first design principles to ensure an optimal user experience.</p>

<h2>Conclusion</h2>
<p>Building a professional website requires careful planning. With the right technology and an experienced team like ViviDev.id, the process can run smoothly with satisfying results.</p>`,
    },
    excerpt: {
      id: 'Pelajari langkah-langkah penting dalam membangun website profesional yang modern, cepat, dan mudah ditemukan di Google untuk bisnis Anda.',
      en: 'Learn the key steps to building a modern, fast, and Google-friendly professional website for your business.',
    },
    metaTitle: {
      id: 'Cara Membuat Website Profesional untuk Bisnis — ViviDev.id',
      en: 'How to Build a Professional Website for Your Business — ViviDev.id',
    },
    metaDesc: {
      id: 'Panduan lengkap membuat website profesional: mulai dari menentukan tujuan, memilih teknologi, desain responsif, hingga optimasi SEO.',
      en: 'Complete guide to building a professional website: from defining goals, choosing technology, responsive design, to SEO optimization.',
    },
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    published: true,
    publishedAt: new Date('2026-01-15'),
  },
  {
    id: 'seed-blog-2',
    slug: 'tips-meningkatkan-kecepatan-website-untuk-seo',
    title: {
      id: '7 Tips Meningkatkan Kecepatan Website untuk SEO yang Lebih Baik',
      en: '7 Tips to Improve Website Speed for Better SEO',
    },
    content: {
      id: `<h2>Mengapa Kecepatan Website Penting untuk SEO?</h2>
<p>Google secara resmi menjadikan kecepatan halaman sebagai salah satu faktor pemeringkatan sejak tahun 2010. Website yang lambat tidak hanya merusak pengalaman pengguna, tetapi juga menurunkan peringkat di mesin pencari.</p>

<h2>1. Optimalkan Gambar</h2>
<p>Gambar yang tidak dioptimalkan adalah penyebab utama website lambat. Gunakan format modern seperti <strong>WebP</strong> atau <strong>AVIF</strong> yang ukurannya 30-50% lebih kecil dari JPEG/PNG tanpa mengorbankan kualitas.</p>

<h2>2. Gunakan Content Delivery Network (CDN)</h2>
<p>CDN mendistribusikan file statis website Anda ke server di seluruh dunia, sehingga pengguna mengakses file dari server terdekat. Ini secara signifikan mengurangi latensi.</p>

<h2>3. Aktifkan Browser Caching</h2>
<p>Dengan mengatur browser caching, browser pengunjung akan menyimpan file statis seperti CSS, JavaScript, dan gambar secara lokal. Kunjungan berikutnya akan jauh lebih cepat.</p>

<h2>4. Minify CSS, JavaScript, dan HTML</h2>
<p>Hapus whitespace, komentar, dan karakter yang tidak diperlukan dari kode Anda. Tools seperti Terser (JavaScript) dan cssnano (CSS) dapat melakukan ini secara otomatis.</p>

<h2>5. Implementasikan Lazy Loading</h2>
<p>Dengan lazy loading, gambar dan video hanya dimuat ketika pengguna menggulir ke bagian tersebut. Ini mengurangi beban awal halaman secara drastis.</p>

<h2>6. Kurangi Jumlah Request HTTP</h2>
<p>Setiap file yang dimuat (CSS, JS, gambar) membutuhkan satu request HTTP. Gabungkan file-file tersebut dan hapus yang tidak diperlukan untuk mengurangi total request.</p>

<h2>7. Gunakan HTTP/2 atau HTTP/3</h2>
<p>HTTP/2 memungkinkan multiple request dalam satu koneksi (multiplexing), sedangkan HTTP/3 menggunakan protokol QUIC yang lebih cepat dan andal.</p>

<h2>Kesimpulan</h2>
<p>Kecepatan website bukan hanya tentang teknis — ini langsung berdampak pada konversi bisnis Anda. Setiap 1 detik perlambatan dapat mengurangi konversi hingga 7%.</p>`,
      en: `<h2>Why Website Speed Matters for SEO?</h2>
<p>Google officially made page speed a ranking factor since 2010. A slow website not only damages user experience but also lowers rankings in search engines.</p>

<h2>1. Optimize Images</h2>
<p>Unoptimized images are the main cause of slow websites. Use modern formats like WebP or AVIF which are 30-50% smaller than JPEG/PNG without sacrificing quality.</p>

<h2>2. Use a Content Delivery Network (CDN)</h2>
<p>A CDN distributes your website's static files to servers worldwide, so users access files from the nearest server, significantly reducing latency.</p>

<h2>3. Enable Browser Caching</h2>
<p>With browser caching, visitors' browsers store static files like CSS, JavaScript, and images locally. Subsequent visits will be much faster.</p>

<h2>Conclusion</h2>
<p>Website speed isn't just technical — it directly impacts your business conversions. Every 1 second of slowdown can reduce conversions by up to 7%.</p>`,
    },
    excerpt: {
      id: 'Kecepatan website adalah faktor krusial untuk SEO dan konversi. Pelajari 7 tips praktis untuk membuat website Anda lebih cepat dan ramah Google.',
      en: 'Website speed is a crucial factor for SEO and conversions. Learn 7 practical tips to make your website faster and Google-friendly.',
    },
    metaTitle: {
      id: '7 Tips Meningkatkan Kecepatan Website untuk SEO — ViviDev.id',
      en: '7 Tips to Improve Website Speed for Better SEO — ViviDev.id',
    },
    metaDesc: {
      id: 'Panduan praktis optimasi kecepatan website: optimasi gambar, CDN, browser caching, minify kode, lazy loading, dan HTTP/2.',
      en: 'Practical guide to website speed optimization: image optimization, CDN, browser caching, code minification, lazy loading, and HTTP/2.',
    },
    coverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=80',
    published: true,
    publishedAt: new Date('2026-02-03'),
  },
  {
    id: 'seed-blog-3',
    slug: 'perbedaan-website-statis-dan-dinamis',
    title: {
      id: 'Perbedaan Website Statis dan Dinamis: Mana yang Tepat untuk Bisnis Anda?',
      en: 'Static vs Dynamic Websites: Which One is Right for Your Business?',
    },
    content: {
      id: `<h2>Apa itu Website Statis?</h2>
<p>Website statis adalah website yang kontennya tetap dan tidak berubah kecuali developer secara manual mengubah file HTML, CSS, atau JavaScript-nya. Setiap pengguna yang mengakses halaman yang sama akan melihat konten yang identik.</p>

<h3>Keunggulan Website Statis:</h3>
<ul>
<li><strong>Sangat cepat</strong> — tidak ada proses di server, file langsung dikirim ke browser</li>
<li><strong>Keamanan tinggi</strong> — tidak ada database atau server-side processing yang bisa dieksploitasi</li>
<li><strong>Biaya hosting murah</strong> — bisa di-host di GitHub Pages, Netlify, atau Vercel secara gratis</li>
<li><strong>Mudah di-deploy</strong> — cukup upload file ke hosting</li>
</ul>

<h3>Kekurangan Website Statis:</h3>
<ul>
<li>Sulit diperbarui tanpa pengetahuan teknis</li>
<li>Tidak bisa menampilkan konten yang dipersonalisasi untuk setiap pengguna</li>
<li>Tidak cocok untuk website dengan banyak halaman yang sering berubah</li>
</ul>

<h2>Apa itu Website Dinamis?</h2>
<p>Website dinamis menghasilkan konten secara real-time berdasarkan data dari database atau input pengguna. Setiap request bisa menghasilkan halaman yang berbeda.</p>

<h3>Keunggulan Website Dinamis:</h3>
<ul>
<li><strong>Konten yang mudah diperbarui</strong> melalui CMS (Content Management System)</li>
<li><strong>Personalisasi</strong> — setiap pengguna bisa mendapatkan pengalaman yang berbeda</li>
<li><strong>Fitur interaktif</strong> seperti login, komentar, keranjang belanja</li>
<li><strong>Skalabel</strong> untuk website dengan ribuan halaman</li>
</ul>

<h2>Mana yang Cocok untuk Anda?</h2>
<p>Pilih website statis jika Anda membutuhkan landing page, portfolio sederhana, atau website yang jarang diperbarui. Pilih website dinamis jika Anda membutuhkan e-commerce, blog yang aktif, atau platform dengan fitur interaktif.</p>

<p>Di ViviDev.id, kami berpengalaman membangun keduanya. Konsultasikan kebutuhan Anda dengan tim kami untuk mendapatkan rekomendasi terbaik.</p>`,
      en: `<h2>What is a Static Website?</h2>
<p>A static website has fixed content that doesn't change unless a developer manually modifies the HTML, CSS, or JavaScript files. Every user accessing the same page will see identical content.</p>

<h2>What is a Dynamic Website?</h2>
<p>A dynamic website generates content in real-time based on database data or user input. Each request can produce a different page, enabling features like user authentication, e-commerce, and personalization.</p>

<h2>Which One is Right for You?</h2>
<p>Choose a static website for landing pages, simple portfolios, or rarely updated websites. Choose dynamic for e-commerce, active blogs, or platforms with interactive features.</p>`,
    },
    excerpt: {
      id: 'Bingung memilih antara website statis atau dinamis? Pelajari perbedaan, keunggulan, dan kelemahan masing-masing untuk menentukan pilihan terbaik bagi bisnis Anda.',
      en: 'Confused about choosing between static or dynamic websites? Learn the differences, advantages, and disadvantages of each to make the best choice for your business.',
    },
    metaTitle: {
      id: 'Perbedaan Website Statis vs Dinamis untuk Bisnis — ViviDev.id',
      en: 'Static vs Dynamic Websites for Business — ViviDev.id',
    },
    metaDesc: {
      id: 'Panduan lengkap memilih antara website statis dan dinamis: perbandingan kecepatan, keamanan, biaya, dan fitur untuk bisnis Anda.',
      en: 'Complete guide to choosing between static and dynamic websites: comparison of speed, security, cost, and features for your business.',
    },
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    published: true,
    publishedAt: new Date('2026-02-20'),
  },
  {
    id: 'seed-blog-4',
    slug: 'mengenal-react-framework-terpopuler-2026',
    title: {
      id: 'Mengenal React: Framework JavaScript Terpopuler di 2026',
      en: 'Understanding React: The Most Popular JavaScript Framework in 2026',
    },
    content: {
      id: `<h2>Apa itu React?</h2>
<p>React adalah library JavaScript open-source yang dikembangkan oleh Meta (Facebook) untuk membangun antarmuka pengguna (UI). Sejak diluncurkan pada 2013, React telah menjadi salah satu teknologi frontend paling populer di dunia.</p>

<h2>Konsep Utama React</h2>

<h3>1. Component-Based Architecture</h3>
<p>React memecah UI menjadi komponen-komponen kecil yang dapat digunakan kembali. Bayangkan sebuah halaman web sebagai kumpulan LEGO — setiap komponen adalah satu blok LEGO yang bisa disusun ulang.</p>

<pre><code>function Button({ label, onClick }) {
  return (
    &lt;button onClick={onClick} className="btn-primary"&gt;
      {label}
    &lt;/button&gt;
  );
}</code></pre>

<h3>2. Virtual DOM</h3>
<p>React menggunakan Virtual DOM — representasi JavaScript dari DOM asli. Ketika ada perubahan, React membandingkan Virtual DOM baru dengan yang lama dan hanya memperbarui bagian yang berubah. Ini membuat React sangat efisien.</p>

<h3>3. Hooks</h3>
<p>Hooks seperti <code>useState</code> dan <code>useEffect</code> memungkinkan komponen fungsional memiliki state dan side effects tanpa perlu menggunakan class component.</p>

<h2>Mengapa React Masih Relevan di 2026?</h2>
<ul>
<li><strong>Ekosistem yang matang</strong> — ribuan library dan tools tersedia</li>
<li><strong>Komunitas besar</strong> — mudah menemukan solusi dan talent</li>
<li><strong>React Server Components</strong> — fitur terbaru yang menggabungkan keunggulan SSR dan CSR</li>
<li><strong>Next.js</strong> — framework berbasis React yang mendominasi pasar</li>
</ul>

<h2>React vs Vue vs Angular</h2>
<p>Ketiga framework ini memiliki keunggulan masing-masing. React unggul dalam fleksibilitas dan ekosistem, Vue dalam kemudahan belajar, dan Angular dalam struktur yang ketat untuk enterprise.</p>

<p>Di ViviDev.id, kami menggunakan React sebagai teknologi utama frontend karena fleksibilitas dan performanya yang luar biasa.</p>`,
      en: `<h2>What is React?</h2>
<p>React is an open-source JavaScript library developed by Meta (Facebook) for building user interfaces. Since its launch in 2013, React has become one of the most popular frontend technologies in the world.</p>

<h2>Key React Concepts</h2>
<p>React's component-based architecture breaks UI into small, reusable pieces. Combined with Virtual DOM for efficient updates and Hooks for state management, React provides a powerful and flexible development experience.</p>

<h2>Why React is Still Relevant in 2026</h2>
<p>With a mature ecosystem, large community, React Server Components, and Next.js dominance, React remains the go-to choice for modern web development.</p>`,
    },
    excerpt: {
      id: 'React tetap menjadi pilihan utama para developer di 2026. Pelajari konsep dasar React, keunggulannya, dan mengapa teknologi ini masih sangat relevan untuk membangun website modern.',
      en: 'React remains the top choice for developers in 2026. Learn React core concepts, its advantages, and why this technology is still highly relevant for building modern websites.',
    },
    metaTitle: {
      id: 'Mengenal React: Framework JavaScript Terpopuler 2026 — ViviDev.id',
      en: 'Understanding React: Most Popular JavaScript Framework 2026 — ViviDev.id',
    },
    metaDesc: {
      id: 'Pengenalan lengkap React JS: component-based architecture, Virtual DOM, Hooks, dan mengapa React tetap relevan di 2026.',
      en: 'Complete introduction to React JS: component-based architecture, Virtual DOM, Hooks, and why React remains relevant in 2026.',
    },
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&q=80',
    published: true,
    publishedAt: new Date('2026-03-10'),
  },
  {
    id: 'seed-blog-5',
    slug: 'panduan-lengkap-seo-on-page-untuk-pemula',
    title: {
      id: 'Panduan Lengkap SEO On-Page untuk Pemula di 2026',
      en: 'Complete On-Page SEO Guide for Beginners in 2026',
    },
    content: {
      id: `<h2>Apa itu SEO On-Page?</h2>
<p>SEO On-Page adalah praktik mengoptimalkan elemen-elemen di dalam halaman website Anda untuk meningkatkan peringkat di mesin pencari. Berbeda dengan SEO Off-Page (backlink, social signals), SEO On-Page sepenuhnya dalam kendali Anda.</p>

<h2>Elemen SEO On-Page yang Wajib Dioptimalkan</h2>

<h3>1. Title Tag (Meta Title)</h3>
<p>Title tag adalah elemen HTML yang mendefinisikan judul halaman web. Ini muncul di tab browser dan sebagai headline di hasil pencarian Google.</p>
<ul>
<li>Panjang ideal: 50-60 karakter</li>
<li>Sertakan kata kunci utama di awal</li>
<li>Buat unik untuk setiap halaman</li>
</ul>

<h3>2. Meta Description</h3>
<p>Meta description adalah ringkasan singkat konten halaman yang muncul di bawah title di hasil pencarian. Meskipun tidak secara langsung mempengaruhi ranking, meta description yang baik meningkatkan Click-Through Rate (CTR).</p>
<ul>
<li>Panjang ideal: 150-160 karakter</li>
<li>Sertakan kata kunci utama secara natural</li>
<li>Buat menarik dan menggugah rasa ingin tahu</li>
</ul>

<h3>3. Struktur Heading (H1, H2, H3)</h3>
<p>Gunakan heading secara hierarkis. Setiap halaman harus memiliki tepat satu H1 yang mengandung kata kunci utama. H2 dan H3 digunakan untuk sub-topik.</p>

<h3>4. URL yang Bersih</h3>
<p>URL yang bersih dan deskriptif membantu Google dan pengguna memahami isi halaman.</p>
<p>Contoh buruk: <code>website.com/p?id=1234</code></p>
<p>Contoh baik: <code>website.com/cara-membuat-website-profesional</code></p>

<h3>5. Konten Berkualitas</h3>
<p>Google semakin canggih dalam mengevaluasi kualitas konten. Fokus pada:</p>
<ul>
<li>Menjawab pertanyaan pengguna secara komprehensif</li>
<li>Menggunakan kata kunci secara natural (jangan keyword stuffing)</li>
<li>Panjang konten minimal 800-1000 kata untuk topik kompetitif</li>
<li>Update konten secara berkala</li>
</ul>

<h3>6. Optimasi Gambar</h3>
<ul>
<li>Gunakan nama file yang deskriptif (bukan <code>img001.jpg</code>)</li>
<li>Isi alt text dengan deskripsi yang akurat dan mengandung kata kunci</li>
<li>Kompres gambar untuk kecepatan loading</li>
</ul>

<h2>Alat SEO yang Direkomendasikan</h2>
<ul>
<li><strong>Google Search Console</strong> — gratis, dari Google langsung</li>
<li><strong>Google Analytics 4</strong> — analisis traffic dan perilaku pengguna</li>
<li><strong>Ahrefs / Semrush</strong> — riset kata kunci dan analisis kompetitor</li>
<li><strong>Yoast SEO / RankMath</strong> — plugin SEO untuk WordPress</li>
</ul>

<h2>Kesimpulan</h2>
<p>SEO On-Page adalah investasi jangka panjang. Hasilnya tidak instan, tapi dengan konsistensi dan konten berkualitas, website Anda akan semakin kuat di mesin pencari dari waktu ke waktu.</p>`,
      en: `<h2>What is On-Page SEO?</h2>
<p>On-Page SEO is the practice of optimizing elements within your website pages to improve search engine rankings. Unlike Off-Page SEO (backlinks, social signals), On-Page SEO is entirely within your control.</p>

<h2>Key On-Page SEO Elements</h2>
<p>The most important elements include: Title Tag (50-60 chars with main keyword), Meta Description (150-160 chars), proper Heading structure (H1-H3), clean URLs, high-quality content, and optimized images with descriptive alt text.</p>

<h2>Conclusion</h2>
<p>On-Page SEO is a long-term investment. Results aren't instant, but with consistency and quality content, your website will grow stronger in search engines over time.</p>`,
    },
    excerpt: {
      id: 'Kuasai teknik SEO On-Page dari dasar: title tag, meta description, struktur heading, URL, konten berkualitas, hingga optimasi gambar. Panduan praktis untuk pemula.',
      en: 'Master On-Page SEO techniques from scratch: title tags, meta descriptions, heading structure, URLs, quality content, and image optimization. A practical guide for beginners.',
    },
    metaTitle: {
      id: 'Panduan Lengkap SEO On-Page untuk Pemula 2026 — ViviDev.id',
      en: 'Complete On-Page SEO Guide for Beginners 2026 — ViviDev.id',
    },
    metaDesc: {
      id: 'Pelajari teknik SEO On-Page dari dasar: optimasi title tag, meta description, heading, URL, konten, dan gambar untuk meningkatkan peringkat di Google.',
      en: 'Learn On-Page SEO techniques from scratch: optimize title tags, meta descriptions, headings, URLs, content, and images to improve Google rankings.',
    },
    coverImage: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&q=80',
    published: true,
    publishedAt: new Date('2026-04-05'),
  },
];

async function main() {
  console.log('Seeding blog posts...');

  for (const blog of blogs) {
    await prisma.post.upsert({
      where: { id: blog.id },
      update: {},
      create: blog,
    });
    console.log(`✓ Created: ${blog.title.id}`);
  }

  console.log(`\nDone! ${blogs.length} blog posts seeded.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
