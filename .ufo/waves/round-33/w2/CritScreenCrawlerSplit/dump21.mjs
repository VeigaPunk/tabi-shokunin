import fs from 'node:fs';
const prov=fs.readFileSync('/fast/scratch/hyaku/tabi-r33/CritScreenCrawlerSplit/kake-prov.tsv','utf8').split('\n');
const rows=fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen.tsv','utf8').replace(/\r/g,'').split('\n').slice(1).filter(Boolean).map(l=>l.split('\t'));
let n=0;
for(const [ref,reason,surface,quote,note] of rows){
  if(surface!=='crawler-discipline-vs-publishing')continue;
  n++;
  const ln=+ref.split(':').pop();
  const text=prov[ln-1];
  const hasTok=/browsers?|chromium|chrome\b|cdp|devtools|playwright|puppeteer|webdriver|bidi|selenium|webbridge|tabi|crawl|crawler|crawlers|crawling|scrape|scraper|scrapers|scraping/i.test(quote);
  console.log(`--- row ${n} line ${ln} quoteHasRegexToken=${hasTok}`);
  console.log('Q:',quote);
  console.log('L:',text);
}
