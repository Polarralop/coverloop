export async function fetchWithRetries(url: string | URL, options?: RequestInit, retries: number = 2): Promise<Response> {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (retries > 0) {
            await new Promise ((resolve) => setTimeout(resolve, 300));
            return fetchWithRetries(url, options, retries - 1);
        }
        throw (err);
    }
}