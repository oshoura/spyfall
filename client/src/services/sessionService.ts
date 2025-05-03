import { ref } from 'vue';

function getStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage && window.sessionStorage) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal ? window.sessionStorage : window.localStorage;
  }
  return window.localStorage;
}

class SessionService {
  private sessionToken = ref<string | null>(null);
  private readonly SESSION_KEY = 'spyfall_session_token';

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    this.sessionToken.value = getStorage().getItem(this.SESSION_KEY);
  }

  public getSessionToken(): string | null {
    return this.sessionToken.value;
  }

  public generateNewSession(): string {
    const token = crypto.randomUUID();
    this.sessionToken.value = token;
    getStorage().setItem(this.SESSION_KEY, token);
    return token;
  }

  public clearSession() {
    this.sessionToken.value = null;
    getStorage().removeItem(this.SESSION_KEY);
  }

  public hasSession(): boolean {
    return this.sessionToken.value !== null;
  }
}

export default new SessionService(); 