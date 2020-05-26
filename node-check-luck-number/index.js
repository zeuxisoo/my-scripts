const axios = require("axios");
const cheerio = require("cheerio");
const chalk = require("chalk");
const config = require("./config");

const log = message => console.log(message);

function colorizeData(data) {
    return {
        cNumber : chalk.blue.bold(data.number),
        cFirst3 : chalk.yellow(data.first3),
        cFirst1 : chalk.green(data.first1),
        cSecond3: chalk.yellow(data.second3),
        cSecond1: chalk.green(data.second1),
        cPrice  : chalk.cyan(data.price),
    };
}

function isEmptyPage(html) {
    const $ = cheerio.load(html);
    const pageInfo = $("#divSearchResult > div:nth-child(1) > div.clsRecord").text();
    const number = pageInfo.match(/.*\s([0-9]+)\s.*/)[1] * 1;

    return number <= 0;
}

function parsePageInfo(html) {
    const $ = cheerio.load(html);

    const pageInfo = $("#divSearchResult > div:nth-child(1) > div:nth-child(2) > table:nth-child(1) > tbody > tr > td:nth-child(1)").text();
    const [, current, total] = pageInfo.match(/([0-9]+)\s\/\s([0-9]+)\s.*/);

    log(chalk`{bold PageInfo}`);
    log(chalk`=> {cyan current}: ${current}, {cyan total}: ${total}`);

    return { current, total };
}

function parseSearchResult(html) {
    const $ = cheerio.load(html);

    const result = {
        all    : [],
        prefect: [],
    };

    log(chalk`{bold SearchResult}`);

    $("table#tblSearchResult tr:not(:first-child)[attr]").each((index, element) => {
        const number = $(element).find("td.clsListNumber:nth-child(3)").text();
        const price  = $(element).find("td.clsListPrice").text();

        const [, first3, first1, second3, second1] = number.match(/((?:[0-9]+){3})((?:[0-9]+){1})\s((?:[0-9]+){3})((?:[0-9]+){1})/);

        // Rule for find match
        const isMatch     = first3 === second3;
        const isFullMatch = isMatch && (first1 - second1 === 1 || second1 - first1 === 1);

        // Store the match data and create marks emoji
        const marks = [];
        const data  = { number, first3, first1, second3, second1, price, isMatch, isFullMatch };

        const tapMark = (matchState, category) => {
            let color = "red";
            let mark  = "✗";

            if (matchState) {
                color = "green";
                mark  = "✔";

                result[category].push(data);
            }

            return chalk[color](mark);
        }

        marks.push(tapMark(isMatch, "all"));
        marks.push(tapMark(isFullMatch, "prefect"));

        // Output data to log
        // - first1, second1 will not colorize when parse search html
        const { cNumber, cFirst3, cSecond3, cPrice } = colorizeData({ number, first3, second3, price });

        log(chalk`=> ${cNumber} => ${cFirst3}${first1} {gray ::} ${cSecond3}${second1} => ${marks.join(" - ")} (${cPrice})`);
    });

    return result;
}

async function makeRequest(agent, pageNumber, luckNumber) {
    const response = await agent.get(config.pageUrl, {
        params: {
            ...config.pageQueryString,
            page: pageNumber || 1,
        }
    });

    const html = response.data;

    // Check current fetched page is or not empty page/no record
    if (isEmptyPage(html)) {
        log(chalk.bgRed.bold("Empty page, no record found"));
        process.exit(0);
    }

    // Parse fetched page content and show the matched result in console
    const page   = parsePageInfo(html);
    const result = parseSearchResult(html);

    const showResultByCategory = (subject, category) => {
        log(chalk`{bold ${subject}}`);

        if (result[category].length <= 0) {
            log(chalk.magenta`=> No match result found`);
            return;
        }

        result[category].forEach(data => {
            const { cFirst3, cFirst1, cSecond3, cSecond1, cPrice } = colorizeData(data);

            log(`=> ${cFirst3}${cFirst1} ${cSecond3}${cSecond1} => ${cPrice}`);
        });

        luckNumber[category] = [...luckNumber[category], ...result[category]];
    }

    showResultByCategory("Basic match", "all");
    showResultByCategory("Prefect match", "prefect");

    // Recursive read each page to find luck number
    const currentPageNumber = page.current * 1;
    const totalPageNumber   = page.total * 1;

    if (currentPageNumber < totalPageNumber) {
        log(chalk.bgMagenta.white("\nStaring to fetch next page ....\n"))

        await makeRequest(agent, currentPageNumber + 1, luckNumber);
    }
}

async function main() {
    const agent = axios.create({
        baseURL: config.siteUrl,
        timeout: 3000,
        responseType: "text",
    });

    const luckNumber = {
        all    : [],
        prefect: [],
    };

    await makeRequest(agent, 1, luckNumber);

    log(chalk`{bold Luck Number}`);

    luckNumber.prefect.forEach(data => {
        let { first3, first1, second3, second1, price } = data;

        first1  = chalk.bgGreen.black(first1);
        second1 = chalk.bgGreen.black(second1);

        log(`=> ${first3}${first1} ${second3}${second1} => ${price}`);
    });
}

main();
