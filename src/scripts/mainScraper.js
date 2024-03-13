import * as cheerio from "cheerio";
import databases from "../data/databasesFandom.json";

export async function scrapeComic(comicURL, date) {
  const formattedToday = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const readDate = formattedToday;

  let database;

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
    case "DC Comics":
      return scrapeDCComic(comicTemplate, $);
    default:
      throw new Error("Invalid comic database");
  }
}

function scrapeMarvelComic(comicTemplate, $) {
  const title = $("h2.pi-title").text();

  if (title) comicTemplate.title = title;
  else
    throw new Error(
      "Title not found. Please check the URL, maybe it's not a comic book."
    );

  const collection = $("h2.pi-title a").text();
  comicTemplate.collection = collection;

  const imageURL = $("a.image-thumbnail").attr("href");
  comicTemplate.imageURL = imageURL ? imageURL : "";

  const event_arcData = $(".pi-data-value > span > a").toArray();
  const event_arcArray = Array.from(
    new Set(
      event_arcData.map((element) => {
        return element.attribs["title"];
      })
    )
  );
  comicTemplate.event_arc =
    event_arcArray.length && event_arcArray?.length <= 4 ? event_arcArray : "";

  const releaseDate = $("[data-source='ReleaseDate'] div").text();
  comicTemplate.releaseDate = releaseDate ? releaseDate : "";

  let coverDate = $(
    ".portable-infobox > div:contains('Cover Date') div"
  ).text();
  comicTemplate.coverDate = coverDate ? coverDate : "";

  const previousIssueData = $("[data-source='PreviousIssue'] a").toArray();
  const previousIssueArray = previousIssueData.map((element) => {
    return {
      title: element.attribs["title"],
      href: element.attribs["href"],
    };
  });
  comicTemplate.previousIssues = previousIssueArray ? previousIssueArray : "";

  const nextIssueData = $("[data-source='NextIssue'] a").toArray();
  const nextIssueArray = nextIssueData.map((element) => {
    return {
      title: element.attribs["title"],
      href: element.attribs["href"],
    };
  });
  comicTemplate.nextIssues = nextIssueArray ? nextIssueArray : "";

  const writersData = $("[data-source^='Writers'] div a").toArray();
  const writersArray = Array.from(
    new Set(writersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.writers = writersArray ? writersArray : "";

  const pencilersData = $("[data-source^='Pencilers'] div a").toArray();
  const pencilersArray = Array.from(
    new Set(pencilersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.pencilers = pencilersArray ? pencilersArray : "";

  const inkersData = $("[data-source^='Inkers'] div a").toArray();
  const inkersArray = Array.from(
    new Set(inkersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.inkers = inkersArray ? inkersArray : "";

  const coloristsData = $("[data-source^='Colorists'] div a").toArray();
  const coloristsArray = Array.from(
    new Set(coloristsData.map((element) => element.attribs["title"]))
  );
  comicTemplate.colorists = coloristsArray ? coloristsArray : "";

  const letterersData = $("[data-source^='Letterers'] div a").toArray();
  const letterersArray = Array.from(
    new Set(letterersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.letterers = letterersArray ? letterersArray : "";

  const editorsData = $("[data-source^='Editors'] div a").toArray();
  const editorsArray = Array.from(
    new Set(editorsData.map((element) => element.attribs["title"]))
  );
  comicTemplate.editors = editorsArray ? editorsArray : "";

  console.log(comicTemplate);
  return comicTemplate;
}

function scrapeDCComic(comicTemplate, $) {
  const title = $("h2[data-source='OneShot']").text();

  if (title) comicTemplate.title = title;
  else throw new Error("Title not found. Please check the comic URL.");

  const collection = $("h2[data-source='OneShot'] a").text();
  comicTemplate.collection = collection;

  const imageURL = $("a.image-thumbnail").attr("href");
  comicTemplate.imageURL = imageURL ? imageURL : "";

  const event_arcData = $(".pi-data-value > span > a").toArray();
  const event_arcArray = Array.from(
    new Set(
      event_arcData.map((element) => {
        return element.attribs["title"];
      })
    )
  );
  comicTemplate.event_arc =
    event_arcArray && event_arcArray?.length <= 4 ? event_arcArray : "";

  const releaseDateData = $(
    "div.mw-parser-output:contains('published')"
  ).text();
  const dateRegex = /[A-Z][a-z]+ [0-9]{1,2}, [0-9]{4}/;
  const releaseDate = releaseDateData
    ? releaseDateData.match(dateRegex)[0]
    : "";
  comicTemplate.releaseDate = releaseDate ? releaseDate : "";

  let coverDate = $("h2.pi-item:nth-of-type(3)").text();
  comicTemplate.coverDate = coverDate ? coverDate : "";

  const previousIssueData = $("[data-source='PreviousIssue'] a").toArray();
  const previousIssueArray = previousIssueData.map((element) => {
    return {
      title: element.attribs["title"],
      href: element.attribs["href"],
    };
  });
  comicTemplate.previousIssues = previousIssueArray ? previousIssueArray : "";

  const nextIssueData = $("[data-source='NextIssue'] a").toArray();
  const nextIssueArray = nextIssueData.map((element) => {
    return {
      title: element.attribs["title"],
      href: element.attribs["href"],
    };
  });
  comicTemplate.nextIssues = nextIssueArray ? nextIssueArray : "";

  const writersData = $("[data-source^='Writer'] li a").toArray();
  const writersArray = Array.from(
    new Set(writersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.writers = writersArray ? writersArray : "";

  const pencilersData = $("[data-source^='Penciler'] li a").toArray();
  const pencilersArray = Array.from(
    new Set(pencilersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.pencilers = pencilersArray ? pencilersArray : "";

  const inkersData = $("[data-source^='Inker'] li a").toArray();
  const inkersArray = Array.from(
    new Set(inkersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.inkers = inkersArray ? inkersArray : "";

  const coloristsData = $("[data-source^='Colorist'] li a").toArray();
  const coloristsArray = Array.from(
    new Set(coloristsData.map((element) => element.attribs["title"]))
  );
  comicTemplate.colorists = coloristsArray ? coloristsArray : "";

  const letterersData = $("[data-source^='Letterer'] li a").toArray();
  const letterersArray = Array.from(
    new Set(letterersData.map((element) => element.attribs["title"]))
  );
  comicTemplate.letterers = letterersArray ? letterersArray : "";

  const editorsData = $("[data-source^='Editor'] li a").toArray();
  const editorsArray = Array.from(
    new Set(editorsData.map((element) => element.attribs["title"]))
  );
  comicTemplate.editors = editorsArray ? editorsArray : "";

  console.log(comicTemplate);
  return comicTemplate;
}
