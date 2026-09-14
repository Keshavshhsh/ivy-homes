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
    cachedListings = await res.json();
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
