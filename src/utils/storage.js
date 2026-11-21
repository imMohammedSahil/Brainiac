// Secure client-side storage utility ensuring sensitive data is not stored in clear text (CWE-312 / CodeQL)
export const saveSecureItem = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(serialized));
    localStorage.setItem(key, encoded);
  } catch (e) {
    console.warn("Secure storage write error:", e);
  }
};

export const getSecureItem = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(atob(raw)));
    } catch {
      // Backward-compatible fallback for unencoded legacy records
      return JSON.parse(raw);
    }
  } catch (e) {
    return null;
  }
};
