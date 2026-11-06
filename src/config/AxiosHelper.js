export const baseUrl =
    typeof window !== "undefined" && window.location.origin.includes("antideploy.app")
        ? window.location.origin
        : (import.meta.env.VITE_API_URL || "http://localhost:8080");

class HttpClient {
    constructor(base) {
        this.baseURL = base;
    }

    async request(method, path, body = null, options = {}) {
        const url = path.startsWith("http") ? path : `${this.baseURL}${path}`;
        const headers = { ...(options.headers || {}) };

        let reqBody = body;
        if (body !== null && typeof body === "object" && !(body instanceof FormData)) {
            if (!headers["Content-Type"]) {
                headers["Content-Type"] = "application/json";
            }
            reqBody = JSON.stringify(body);
        }

        const response = await fetch(url, {
            method,
            headers,
            body: reqBody,
        });

        const contentType = response.headers.get("content-type") || "";
        let data;
        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const error = new Error(`Request failed with status ${response.status}`);
            error.status = response.status;
            error.response = { status: response.status, data };
            throw error;
        }

        return { status: response.status, data };
    }

    get(path, options) {
        return this.request("GET", path, null, options);
    }

    post(path, body, options) {
        return this.request("POST", path, body, options);
    }

    delete(path, options) {
        return this.request("DELETE", path, null, options);
    }
}

export const httpClient = new HttpClient(baseUrl);
