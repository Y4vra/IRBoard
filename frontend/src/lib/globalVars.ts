const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

if (!API_DOMAIN) {
  console.warn("WARNING: VITE_API_DOMAIN undefined in enviroment variables");
}

export const API_BASE_URL = `http://${API_DOMAIN}/v1`;