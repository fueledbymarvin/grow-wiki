export const API_BASE_URL =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews";

export interface ArticleListResponse {
  items: {
    articles: {
      article: string;
      views_ceil: number;
    }[];
  }[];
}

export interface CountryListResponse {
  items: {
    countries: {
      country: string;
    }[];
  }[];
}
