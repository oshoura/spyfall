import { ref } from 'vue';

class SessionService {
  private sessionToken = ref<string | null>(null);
  private readonly SESSION_KEY = 'spyfall_session_token';

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    this.sessionToken.value = localStorage.getItem(this.SESSION_KEY);
  }

  public getSessionToken(): string | null {
    return this.sessionToken.value;
  }

  public generateNewSession(): string {
    const token = crypto.randomUUID();
    this.sessionToken.value = token;
    localStorage.setItem(this.SESSION_KEY, token);
    return token;
  }

  public clearSession() {
    this.sessionToken.value = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  public hasSession(): boolean {
    return this.sessionToken.value !== null;
  }
}

export default new SessionService(); 