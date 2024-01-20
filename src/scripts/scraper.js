import * as cheerio from "cheerio";

export async function scrapeComic(comicURL, date, type = "marvel") {
  const today = new Date(date);
  const formattedToday = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const readDate = formattedToday;

  const html = await fetch(comicURL).then((response) => response.text());

  const $ = cheerio.load(html);

  switch (type) {
    case "marvel":
      return scrapeMarvelComic(comicURL, readDate, $);
    // case "dc":
    //   return scrapeDCComic(comicURL, date);
    // default:
    // throw new Error("Invalid comic type");
  }
}

function scrapeMarvelComic(comicURL, readDate, $) {
  const title = $("h2.pi-title").text();

  const imageURL = $("a.image-thumbnail").toArray()[0].attribs["href"];

  const releaseDate = $("[data-source='ReleaseDate'] div a").toArray()[0]
    .children[0]["data"];

  const writersData = $("[data-source^='Writers'] div a").toArray();
  const writersArray = Array.from(
    new Set(writersData.map((element) => element.children[0]["data"]))
  );

  const pencilersData = $("[data-source^='Pencilers'] div a").toArray();
  const pencilersArray = Array.from(
    new Set(pencilersData.map((element) => element.children[0]["data"]))
  );

  const inkersData = $("[data-source^='Inkers'] div a").toArray();
  const inkersArray = Array.from(
    new Set(inkersData.map((element) => element.children[0]["data"]))
  );
  const coloristsData = $("[data-source^='Colorists'] div a").toArray();
  const coloristsArray = Array.from(
    new Set(coloristsData.map((element) => element.children[0]["data"]))
  );

  return {
    comicURL,
    title,
    imageURL,
    releaseDate,
    readDate,
    writers: writersArray,
    pencilers: pencilersArray,
    inkers: inkersArray,
    colorists: coloristsArray,
  };
}
