import * as cheerio from "cheerio";
import databases from "../data/databasesFandom.json";

export async function scrapeComic(comicURL, date) {
  const formattedToday = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const readDate = formattedToday;

  let database = {};

  for (const element in databases) {
    if (comicURL.startsWith(databases[element].wikiURL)) {
      database = databases[element];
      break;
    }
  }

  const comicTemplate = {
    publisher: database,
    comicURL,
    readDate,
  };

  const html = await fetch(comicURL).then((response) => response.text());

  const $ = cheerio.load(html);

  switch (database.name) {
    case "Marvel Comics":
      return scrapeMarvelComic(comicTemplate, $);
    case "dc":
    //   return scrapeDCComic(comicURL, date);
    // default:
    // throw new Error("Invalid comic type");
  }
}

function scrapeMarvelComic(comicTemplate, $) {
  const title = $("h2.pi-title").text();

  if (title) comicTemplate.title = title;
  else throw new Error("Title not found. Please check the comic URL.");

  const imageURL = $("a.image-thumbnail").attr("href");
  comicTemplate.imageURL = imageURL ? imageURL : "";

  const event_arc = $(".pi-data-value span a").text();
  comicTemplate.event_arc = event_arc ? event_arc : "";

  const releaseDate = $("[data-source='ReleaseDate'] div").text();
  comicTemplate.releaseDate = releaseDate ? releaseDate : "";

  const coverDate = releaseDate
    ? $(".portable-infobox > div:nth-of-type(3) div").text()
    : $(".portable-infobox > div:nth-of-type(2) div").text();
  comicTemplate.coverDate = coverDate ? coverDate : "";

  const previousIssue = {
    title: $("[data-source='PreviousIssue'] a").text(),
    href: $("[data-source='PreviousIssue'] a").attr("href"),
  };
  previousIssue.href = previousIssue.href;
  comicTemplate.previousIssue = previousIssue ? previousIssue : "";

  const nextIssue = {
    title: $("[data-source='NextIssue'] a").text(),
    href: $("[data-source='NextIssue'] a").attr("href"),
  };
  nextIssue.href = nextIssue.href;
  comicTemplate.nextIssue = nextIssue ? nextIssue : "";

  const writersData = $("[data-source^='Writers'] div a").toArray();
  // console.log("MIAU", writersData);

  const writersArray = Array.from(
    new Set(writersData.map((element) => element.children[0]["data"]))
  );
  comicTemplate.writers = writersArray ? writersArray : "";

  const pencilersData = $("[data-source^='Pencilers'] div a").toArray();
  const pencilersArray = Array.from(
    new Set(pencilersData.map((element) => element.children[0]["data"]))
  );
  comicTemplate.pencilers = pencilersArray ? pencilersArray : "";

  const inkersData = $("[data-source^='Inkers'] div a").toArray();
  const inkersArray = Array.from(
    new Set(inkersData.map((element) => element.children[0]["data"]))
  );
  comicTemplate.inkers = inkersArray ? inkersArray : "";

  const coloristsData = $("[data-source^='Colorists'] div a").toArray();
  const coloristsArray = Array.from(
    new Set(coloristsData.map((element) => element.children[0]["data"]))
  );
  comicTemplate.colorists = coloristsArray ? coloristsArray : "";

  const letterersData = $("[data-source^='Letterers'] div a").toArray();
  const letterersArray = Array.from(
    new Set(letterersData.map((element) => element.children[0]["data"]))
  );
  comicTemplate.letterers = letterersArray ? letterersArray : "";

  const editorsData = $("[data-source^='Editors'] div a").toArray();
  const editorsArray = Array.from(
    new Set(editorsData.map((element) => element.children[0]["data"]))
  );
  comicTemplate.editors = editorsArray ? editorsArray : "";

  console.log(comicTemplate);
  return comicTemplate;
}
