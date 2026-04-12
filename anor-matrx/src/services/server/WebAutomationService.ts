import axios from "axios";
import * as cheerio from "cheerio";

export class WebAutomationService {
  /**
   * Fetches the content of a URL and returns the text.
   */
  public async fetchContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      
      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Remove noisy elements
      $('script, style, nav, footer, header, ads').remove();
      
      const mainContent = $('body').text().trim().replace(/\s+/g, ' ').substring(0, 8000);
      
      return `[WEB SCRAPER]\nURL: ${url}\nTitle: ${title}\nDescription: ${metaDescription}\n\nContent:\n${mainContent}`;
    } catch (error: any) {
      console.error(`[WebAutomation] Error fetching ${url}:`, error.message);
      throw new Error(`Failed to fetch content from ${url}: ${error.message}`);
    }
  }

  /**
   * Performs a search (Simulates a search engine by providing structured logic)
   */
  public async search(query: string): Promise<string> {
    // In a real production app, you would use a search API like Google Search API or Tavily here.
    // For now, we simulate the "intelligent" part of the search.
    return `[SEARCH SERVICE] 🔍\nنتائج البحث عن: "${query}"\n\n(ملاحظة: لفعيل البحث الحي، يرجى إضافة مفتاح TAVILY_API_KEY أو SERP_API_KEY في ملف .env)`;
  }
}


export const webAutomationService = new WebAutomationService();
