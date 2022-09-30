import { Dataset, CheerioCrawler, log, LogLevel } from 'crawlee';

// Crawlers come with various utilities, e.g. for logging.
// Here we use debug level of logging to improve the debugging experience.
// This functionality is optional!
log.setLevel(LogLevel.DEBUG);

// Create an instance of the CheerioCrawler class - a crawler
// that automatically loads the URLs and parses their HTML using the cheerio library.
const crawler = new CheerioCrawler({
    // The crawler downloads and processes the web pages in parallel, with a concurrency
    // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
    // Here we define some hard limits for the concurrency.
  //  minConcurrency: 10,
//    maxConcurrency: 50,

    // On error, retry each page at most once.
   // maxRequestRetries: 1,

    // Increase the timeout for processing of each page.
   // requestHandlerTimeoutSecs: 30,

    // Limit to 10 requests per one crawl
   // maxRequestsPerCrawl: 10,

    // This function will be called for each URL to crawl.
    // It accepts a single parameter, which is an object with options as:
    // https://crawlee.dev/api/cheerio-crawler/interface/CheerioCrawlerOptions#requestHandler
    // We use for demonstration only 2 of them:
    // - request: an instance of the Request class with information such as the URL that is being crawled and HTTP method
    // - $: the cheerio object containing parsed HTML
    async requestHandler({ request, $ }) {
        log.debug(`Processing ${request.url}...`);

        // Extract data from the page using cheerio.
        const titles: { text: string }[] = [];
	$("a.result-title").each((index, el) => {
		titles.push({
			text: $(el).text(),
		});
	});
        const links: { text: string }[] = [];
        $('a.result-title').each((index, el) => {
            links.push({
                link: $(el).attr('href'),
            });
        });
	const mixed = titles.map(function(x,i){
return [x, links[i]]
});	
        // Store the results to the dataset. In local configuration,
        // the data will be stored as JSON files in ./storage/datasets/default
        await Dataset.pushData({
            url: request.url,
mixed,           
           
        })

    },

    // This function is called if the page processing failed more than maxRequestRetries + 1 times.
    failedRequestHandler({ request }) {
        log.debug(`Request ${request.url} failed twice.`);
    },
});
//function myFunction(item, index, arr) {
//  arr[index] = item + links[index];
//console.log(arr[index]);
//}
// Run the crawler and wait for it to finish.
await crawler.run([
    'https://portland.craigslist.org/search/zip',
]);

log.debug('Crawler finished.');
