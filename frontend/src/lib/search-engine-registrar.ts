export async function registerSiteToSearchEngines(slug: string): Promise<void> {
  const domain = `${slug}.adready.kr`
  // TODO: Google Search Console API
  // TODO: Naver Search Advisor API
  // TODO: Bing Webmaster Tools API
  console.log(`[SearchEngine] ${domain} 등록 요청`)
}
