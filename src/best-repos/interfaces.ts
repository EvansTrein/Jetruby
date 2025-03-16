export interface IGitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
}

export interface IGitHubResponse {
  total_count: number;
  incomplete_results: boolean;
  items: IGitHubRepo[];
}
