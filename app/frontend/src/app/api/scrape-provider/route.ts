import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint para scraping de información de proveedores
 *
 * POST /api/scrape-provider
 * Body: { url: string }
 *
 * Returns: ScrapedProviderData
 */

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Scraping provider: ${url}`);

    // Fetch the website with more robust headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      const errorMsg = `Failed to fetch website: ${response.status} ${response.statusText}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    const html = await response.text();
    console.log(`✅ Fetched ${html.length} characters from ${url}`);

    // Extract information from HTML
    const scrapedData = await extractProviderInfo(html, url);
    console.log(`✅ Extracted data:`, {
      businessName: scrapedData.businessName,
      email: scrapedData.contact.email,
      phone: scrapedData.contact.phone,
      imagesCount: scrapedData.images.all.length,
    });

    return NextResponse.json(scrapedData);

  } catch (error) {
    console.error('❌ Error scraping provider:', error);

    // More detailed error message
    let errorMessage = 'Failed to scrape provider';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common errors
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - website took too long to respond';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Failed to connect to website - check URL and network connection';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Extract structured provider information from HTML
 */
async function extractProviderInfo(html: string, url: string) {
  // Basic extraction using regex and string manipulation
  // For a more robust solution, consider using a proper HTML parser

  const data = {
    businessName: extractBusinessName(html, url),
    website: url,
    description: extractDescription(html),
    category: extractCategory(html),

    contact: {
      email: extractEmail(html),
      phone: extractPhone(html),
      whatsapp: extractWhatsApp(html),
      address: extractAddress(html),
    },

    social: {
      instagram: extractInstagram(html),
      facebook: extractFacebook(html),
      twitter: extractTwitter(html),
      youtube: extractYouTube(html),
      tiktok: extractTikTok(html),
    },

    offerings: extractOfferings(html),
    images: extractImages(html, url),

    metadata: {
      operatingHours: extractOperatingHours(html),
      location: extractLocation(html),
      features: extractFeatures(html),
      languages: extractLanguages(html),
      paymentMethods: extractPaymentMethods(html),
      bookingInfo: extractBookingInfo(html),
    },

    rawData: {
      extractedAt: new Date().toISOString(),
      url: url,
      notes: 'Extracted automatically. Please review and validate all information.',
    },
  };

  return data;
}

// Extraction helper functions

function extractBusinessName(html: string, url: string): string {
  // Try meta tags first
  const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
  if (ogTitle) {
    const cleaned = cleanText(ogTitle);
    // Split on common delimiters and take first part
    const parts = cleaned.split(/[\|–—\-]/);
    return parts[0].trim();
  }

  // Try title tag
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  if (title) {
    const cleaned = cleanText(title);
    // Split on common delimiters and take first part
    const parts = cleaned.split(/[\|–—\-]/);
    return parts[0].trim();
  }

  // Fallback to domain name
  const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function extractDescription(html: string): string {
  const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
  if (ogDesc) return cleanText(ogDesc);

  const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
  if (metaDesc) return cleanText(metaDesc);

  return 'No description found';
}

function extractCategory(html: string): string {
  const categories = ['tour', 'hotel', 'restaurant', 'artisan', 'marketplace', 'service'];

  const lowerHtml = html.toLowerCase();

  if (lowerHtml.includes('tour') || lowerHtml.includes('excursion') || lowerHtml.includes('visita')) {
    return 'tour-operator';
  }
  if (lowerHtml.includes('hotel') || lowerHtml.includes('hospedaje') || lowerHtml.includes('alojamiento')) {
    return 'accommodation';
  }
  if (lowerHtml.includes('restaurant') || lowerHtml.includes('comida') || lowerHtml.includes('gastronomía')) {
    return 'restaurant';
  }
  if (lowerHtml.includes('artesanía') || lowerHtml.includes('artisan') || lowerHtml.includes('handmade')) {
    return 'artisan';
  }

  return 'general';
}

function extractEmail(html: string): string | undefined {
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch?.[0];
}

function extractPhone(html: string): string | undefined {
  // Match phone patterns including +56 (Chile)
  const phonePatterns = [
    /\+56\s*9\s*\d{4}\s*\d{4}/,
    /\+56\s*\d{9}/,
    /\(\+56\)\s*\d{9}/,
    /\d{9}/,
  ];

  for (const pattern of phonePatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0].replace(/\s+/g, ' ').trim();
    }
  }

  return undefined;
}

function extractWhatsApp(html: string): string | undefined {
  const waMatch = html.match(/wa\.me\/(\d+)/i) || html.match(/whatsapp.*?(\+?\d{10,15})/i);
  return waMatch?.[1];
}

function extractAddress(html: string): string | undefined {
  // Try to find address patterns
  const addressMatch = html.match(/dirección[:\s]*([^<\n]{10,100})/i) ||
                      html.match(/address[:\s]*([^<\n]{10,100})/i) ||
                      html.match(/ubicación[:\s]*([^<\n]{10,100})/i);

  if (addressMatch) {
    const addr = cleanText(addressMatch[1]);
    // Filter out if it looks like HTML/CSS (has lots of commas or weird chars)
    if (addr.includes(',') && addr.split(',').length > 5) {
      return 'San Pedro de Atacama'; // Fallback for Atacama businesses
    }
    return addr;
  }

  // Fallback to San Pedro de Atacama if nothing found
  if (html.toLowerCase().includes('san pedro de atacama') ||
      html.toLowerCase().includes('atacama')) {
    return 'San Pedro de Atacama';
  }

  return undefined;
}

function extractInstagram(html: string): string | undefined {
  const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
  return igMatch ? `@${igMatch[1]}` : undefined;
}

function extractFacebook(html: string): string | undefined {
  const fbMatch = html.match(/facebook\.com\/([a-zA-Z0-9.]+)/i);
  return fbMatch ? fbMatch[1] : undefined;
}

function extractTwitter(html: string): string | undefined {
  const twMatch = html.match(/twitter\.com\/([a-zA-Z0-9_]+)/i);
  return twMatch ? `@${twMatch[1]}` : undefined;
}

function extractYouTube(html: string): string | undefined {
  const ytMatch = html.match(/youtube\.com\/(channel|c|user)\/([a-zA-Z0-9_-]+)/i);
  return ytMatch ? ytMatch[2] : undefined;
}

function extractTikTok(html: string): string | undefined {
  const ttMatch = html.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/i);
  return ttMatch ? `@${ttMatch[1]}` : undefined;
}

function extractOfferings(html: string): Array<{
  name: string;
  description: string;
  price?: number;
  currency?: string;
  duration?: string;
  capacity?: string;
  features?: string[];
}> {
  // This is a simplified extraction
  // For more accurate results, consider using a proper HTML parser
  const offerings: Array<{
    name: string;
    description: string;
    price?: number;
    currency?: string;
    duration?: string;
    capacity?: string;
    features?: string[];
  }> = [];

  // Try to find price patterns
  const priceMatches = html.matchAll(/\$\s*(\d{1,3}(?:[.,]\d{3})*)/g);
  const prices: number[] = [];

  for (const match of priceMatches) {
    const priceStr = match[1].replace(/[.,]/g, '');
    const price = parseInt(priceStr, 10);
    if (price > 1000 && price < 1000000) {
      prices.push(price);
    }
  }

  // If we found prices, create basic offerings
  if (prices.length > 0) {
    prices.forEach((price, i) => {
      offerings.push({
        name: `Service ${i + 1}`,
        description: 'Extracted from website - please review and update',
        price: price,
        currency: 'CLP',
      });
    });
  }

  return offerings;
}

function extractImages(html: string, baseUrl: string): {
  logo?: string;
  hero?: string[];
  gallery?: string[];
  all: string[];
} {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    let imgUrl = match[1];

    // Convert relative URLs to absolute
    if (imgUrl.startsWith('/')) {
      const urlObj = new URL(baseUrl);
      imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
    } else if (!imgUrl.startsWith('http')) {
      continue; // Skip data URLs and other non-http images
    }

    // Filter out tiny images, icons, and tracking pixels
    if (!imgUrl.includes('icon') &&
        !imgUrl.includes('logo') &&
        !imgUrl.includes('pixel') &&
        !imgUrl.includes('tracker')) {
      images.push(imgUrl);
    }
  }

  // Also check for Open Graph images
  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
  if (ogImage && !images.includes(ogImage)) {
    images.unshift(ogImage);
  }

  return {
    hero: images.slice(0, 3),
    gallery: images.slice(3),
    all: images,
  };
}

function extractOperatingHours(html: string): string | undefined {
  const hoursMatch = html.match(/horario[:\s]*([^<\n]{10,100})/i) ||
                    html.match(/hours[:\s]*([^<\n]{10,100})/i);
  return hoursMatch ? cleanText(hoursMatch[1]) : undefined;
}

function extractLocation(html: string): string | undefined {
  if (html.toLowerCase().includes('san pedro de atacama')) {
    return 'San Pedro de Atacama';
  }
  return undefined;
}

function extractFeatures(html: string): string[] {
  const features: string[] = [];
  const featureKeywords = ['incluye', 'includes', 'características', 'features'];

  for (const keyword of featureKeywords) {
    const regex = new RegExp(`${keyword}[:\\s]*([^<]{20,200})`, 'i');
    const match = html.match(regex);
    if (match) {
      const items = match[1].split(/[,•\n]/).map(s => cleanText(s)).filter(s => s.length > 3);
      features.push(...items);
    }
  }

  return [...new Set(features)]; // Remove duplicates
}

function extractLanguages(html: string): string[] {
  const languages: string[] = [];
  const langMap = {
    'español': 'Español',
    'spanish': 'Español',
    'inglés': 'Inglés',
    'english': 'Inglés',
    'português': 'Português',
    'portuguese': 'Português',
    'francés': 'Francés',
    'french': 'Francés',
  };

  const lowerHtml = html.toLowerCase();
  for (const [key, value] of Object.entries(langMap)) {
    if (lowerHtml.includes(key)) {
      languages.push(value);
    }
  }

  return [...new Set(languages)];
}

function extractPaymentMethods(html: string): string[] {
  const methods: string[] = [];
  const methodKeywords = ['efectivo', 'cash', 'transferencia', 'transfer', 'tarjeta', 'card', 'paypal', 'mercadopago'];

  const lowerHtml = html.toLowerCase();
  for (const keyword of methodKeywords) {
    if (lowerHtml.includes(keyword)) {
      methods.push(keyword);
    }
  }

  return methods;
}

function extractBookingInfo(html: string): string | undefined {
  const bookingMatch = html.match(/reserv[a-z]*[:\s]*([^<\n]{20,200})/i);
  return bookingMatch ? cleanText(bookingMatch[1]) : undefined;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
