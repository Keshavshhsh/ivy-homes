const BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-DC1469CB99F9';
export const DEMO_PASSWORD = 'd7676b417d';
export const DEMO_ACCOUNTS = [
  'demo1@ivy.homes',
  'demo2@ivy.homes',
  'demo3@ivy.homes'
];

let cachedListings = null;
let cachedRentals = null;
let cachedProjects = null;
let cachedStats = null;

const HOME_IMAGE_LIBRARY = {
  apartment: [
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
  ],
  villa: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509807-bca35d5f3d8d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472591-5a5df2c7dcb4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80'
  ],
  'independent house': [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
  ],
  'builder floor': [
    'https://images.unsplash.com/photo-1600573472591-5a5df2c7dcb4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509807-bca35d5f3d8d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80'
  ],
  plot: [
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472591-5a5df2c7dcb4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509807-bca35d5f3d8d?auto=format&fit=crop&w=1200&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80'
  ]
};

const normalizePropertyType = (propertyType) => {
  const normalized = (propertyType || '').toLowerCase().trim();

  if (['apartment', 'flat', 'studio apartment', 'penthouse'].includes(normalized)) {
    return 'apartment';
  }

  if (['villa', 'luxury villa'].includes(normalized)) {
    return 'villa';
  }

  if (['independent house', 'house', 'family house'].includes(normalized)) {
    return 'independent house';
  }

  if (['builder floor', 'builder-floor', 'townhouse'].includes(normalized)) {
    return 'builder floor';
  }

  if (['plot', 'land', 'plot land'].includes(normalized)) {
    return 'plot';
  }

  return 'default';
};

const enrichListingsWithImages = (listings = []) => {
  return listings.map((listing, index) => {
    if (listing.image) {
      return listing;
    }

    const propertyType = normalizePropertyType(listing.property_type);
    const sourcePool = HOME_IMAGE_LIBRARY[propertyType] || HOME_IMAGE_LIBRARY.default;
    const seed = Array.from(listing.listing_id || `${listing.apartment_name || 'listing'}-${index}`)
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const imageIndex = Math.abs(seed + (listing.price || 0) + index) % sourcePool.length;

    return {
      ...listing,
      image: sourcePool[imageIndex]
    };
  });
};

export const api = {
  // --- AUTH FLOWS ---
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid login credentials');
    }
    return res.json();
  },

  async refreshToken(refreshToken) {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      throw new Error('Token refresh failed');
    }
    return res.json();
  },

  async logout(token) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
    } catch {
      // Stateless tokens
    }
  },

  // --- USER METADATA ---
  async getProfile(token) {
    try {
      const res = await fetch(`${BASE_URL}/v1/me`, {
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) return res.json();
    } catch (e) {
      console.warn('Could not fetch /v1/me', e);
    }
    return null;
  },

  async getLocalities(token) {
    try {
      const res = await fetch(`${BASE_URL}/v1/localities`, {
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) return res.json();
    } catch (e) {
      console.warn('Could not fetch /v1/localities', e);
    }
    return null;
  },

  // --- SAVED / FAVOURITES ---
  async getSavedListings(token) {
    const res = await fetch(`${BASE_URL}/v1/saved`, {
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch saved listings');
    }
    return res.json();
  },

  async saveListing(token, listingId) {
    const res = await fetch(`${BASE_URL}/v1/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ listing_id: listingId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to save listing');
    }
    return res.json();
  },

  async unsaveListing(token, listingId) {
    const res = await fetch(`${BASE_URL}/v1/saved/${listingId}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to unsave listing');
    }
    return res.json();
  },

  // --- SINGLE RECORDS ---
  async getListingDetail(token, listingId) {
    // Try live API first at actual path /v1/listings/{id}
    try {
      const res = await fetch(`${BASE_URL}/v1/listings/${listingId}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) return res.json();
    } catch {
      // Fall back to local data
    }
    const listings = await this.getAllListings();
    return listings.find(l => l.listing_id === listingId) || null;
  },

  // --- DATASET LOADERS ---
  async getAllListings() {
    if (cachedListings) return cachedListings;
    const res = await fetch('/data/listings.json');
    const rawListings = await res.json();
    cachedListings = enrichListingsWithImages(rawListings);
    return cachedListings;
  },

  async getAllRentals() {
    if (cachedRentals) return cachedRentals;
    const res = await fetch('/data/rentals.json');
    cachedRentals = await res.json();
    return cachedRentals;
  },

  async getAllProjects() {
    if (cachedProjects) return cachedProjects;
    const res = await fetch('/data/projects.json');
    cachedProjects = await res.json();
    return cachedProjects;
  },

  async getMarketStats() {
    if (cachedStats) return cachedStats;
    const res = await fetch('/data/market_stats.json');
    cachedStats = await res.json();
    return cachedStats;
  }
};
