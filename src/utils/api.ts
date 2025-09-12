// src/app/utils/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem("pi_token");
    const ssoUser = localStorage.getItem("sso_user");

    let headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (ssoUser) {
      // For SSO, send the user data in headers with timestamp
      const userData = JSON.parse(ssoUser);
      const ssoData = {
        username: userData.username,
        projectCodes: userData.projects,
        timestamp: Date.now(), // Add fresh timestamp
      };
      headers["X-SSO-User"] = JSON.stringify(ssoData);
    }

    return headers;
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Keep SSO method for specific endpoints
  async postWithSSO(endpoint: string, data: any) {
    const ssoUser = localStorage.getItem("sso_user");
    if (ssoUser) {
      const userData = JSON.parse(ssoUser);
      data = {
        ...data,
        username: userData.username,
        projectCodes: userData.projects,
      };
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const api = new ApiClient();
