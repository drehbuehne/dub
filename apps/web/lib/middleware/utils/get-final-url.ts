import { NextRequest } from "next/server";

export const getFinalUrl = (
  url: string,
  { req, clickId }: { req: NextRequest; clickId?: string },
) => {
  // query is the query string (e.g. d.to/github?utm_source=twitter -> ?utm_source=twitter)
  const searchParams = req.nextUrl.searchParams;

  // get the query params of the target url
  const urlObj = new URL(url);

  if (clickId) {
    // add clickId to the final url if it exists
    urlObj.searchParams.set("dub_id", clickId);
  }

  // if there are no query params, then return the target url as is (no need to parse it)
  // @ts-ignore – until https://github.com/microsoft/TypeScript/issues/54466 is fixed
  if (searchParams.size === 0) return urlObj.toString();

  // if searchParams (type: `URLSearchParams`) has the same key as target url, then overwrite it
  for (const [key, value] of searchParams) {
    urlObj.searchParams.set(key, value);
  }

  if (urlObj.searchParams.get("qr") === "1") {
    // remove qr param from the final url if the value is "1" (only used for detectQr function)
    urlObj.searchParams.delete("qr");
  }

  return urlObj.toString();
};

// Only add query params to the final URL if they are not in this list
const blockedQueryParams = [
  "fbclid",
  "dub_id",
  "dclid",
  "gclid",
  "gclsrc",
  "trk",
];

// Get final cleaned url for storing in TB
export const getFinalUrlForRecordClick = ({
  req,
  url,
}: {
  req: NextRequest;
  url: string;
}) => {
  const searchParams = req.nextUrl.searchParams;
  const urlObj = new URL(url);

  // Filter out query params that are in the blocked list
  if (searchParams.size > 0) {
    for (const [key, value] of searchParams) {
      if (!blockedQueryParams.includes(key)) {
        urlObj.searchParams.set(key, value);
      }
    }
  }

  return urlObj.toString();
};
