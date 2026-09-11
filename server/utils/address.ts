import { digitsZip, isUsState } from "~/utils/us-states";

export type ShipAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

type ZippoPlace = { "place name": string; "state abbreviation": string };
type Zippo = { places?: ZippoPlace[] };

type CensusMatch = {
  matchedAddress?: string;
  addressComponents?: {
    fromAddress?: string;
    toAddress?: string;
    streetName?: string;
    preType?: string;
    preDirection?: string;
    suffixType?: string;
    suffixDirection?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

type CensusResponse = {
  result?: { addressMatches?: CensusMatch[] };
};

/** Expand common USPS street abbreviations so Census is more likely to match. */
function normalizeStreet(street: string) {
  return street
    .trim()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(ln|lane)\b/gi, "Ln")
    .replace(/\b(st|street)\b/gi, "St")
    .replace(/\b(ave|avenue)\b/gi, "Ave")
    .replace(/\b(rd|road)\b/gi, "Rd")
    .replace(/\b(dr|drive)\b/gi, "Dr")
    .replace(/\b(ct|court)\b/gi, "Ct")
    .replace(/\b(cir|circle)\b/gi, "Cir")
    .replace(/\b(blvd|boulevard)\b/gi, "Blvd")
    .replace(/\b(pkwy|parkway)\b/gi, "Pkwy")
    .replace(/\b(hwy|highway)\b/gi, "Hwy");
}

/**
 * Census `fromAddress` / `toAddress` are the street-segment range, NOT the house number.
 * Always prefer the house number from `matchedAddress` (e.g. "120 HUNT LN, SAN ANTONIO, TX, 78245").
 */
function streetFromCensusMatch(match: CensusMatch, inputStreet: string) {
  const matchedStreet = (match.matchedAddress || "").split(",")[0]?.trim();
  if (matchedStreet) return matchedStreet;

  const c = match.addressComponents;
  const house = (inputStreet.match(/^\d+[A-Za-z]?/) || [])[0] || "";
  const name = [c?.preDirection, c?.preType, c?.streetName, c?.suffixType, c?.suffixDirection]
    .filter(Boolean)
    .join(" ")
    .trim();
  const rebuilt = `${house} ${name}`.replace(/\s+/g, " ").trim();
  return rebuilt || inputStreet;
}

async function censusLookup(params: URLSearchParams) {
  return $fetch<CensusResponse>(`https://geocoding.geo.census.gov/geocoder/locations/address?${params.toString()}`);
}

async function censusOneline(address: string) {
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    format: "json",
  });
  return $fetch<CensusResponse>(
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params.toString()}`,
  );
}

export async function lookupZip(zip: string): Promise<{ city: string; state: string; zip: string }> {
  const code = digitsZip(zip);
  if (code.length !== 5) {
    throw createError({ statusCode: 400, statusMessage: "Enter a 5-digit US ZIP." });
  }
  let data: Zippo;
  try {
    data = await $fetch<Zippo>(`https://api.zippopotam.us/us/${code}`);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "That ZIP is not a valid US postal code." });
  }
  const place = data.places?.[0];
  if (!place?.["place name"] || !place["state abbreviation"]) {
    throw createError({ statusCode: 400, statusMessage: "That ZIP is not a valid US postal code." });
  }
  return { city: place["place name"], state: place["state abbreviation"], zip: code };
}

export async function verifyShipAddress(input: ShipAddress): Promise<ShipAddress & { matched: string }> {
  const zip = digitsZip(input.zip);
  const state = input.state.trim().toUpperCase();
  const street = normalizeStreet(input.street);
  const city = input.city.trim();
  if (!street || !city || !isUsState(state) || zip.length !== 5) {
    throw createError({ statusCode: 400, statusMessage: "Street, city, state, and a 5-digit ZIP are required." });
  }

  const postal = await lookupZip(zip);
  if (postal.state !== state) {
    throw createError({
      statusCode: 400,
      statusMessage: `ZIP ${zip} is in ${postal.state}, not ${state}.`,
    });
  }

  const attempts: Array<() => Promise<CensusResponse>> = [
    () =>
      censusLookup(
        new URLSearchParams({
          street,
          city,
          state,
          zip,
          benchmark: "Public_AR_Current",
          format: "json",
        }),
      ),
    // ZIP mismatch / new construction: retry without ZIP
    () =>
      censusLookup(
        new URLSearchParams({
          street,
          city,
          state,
          benchmark: "Public_AR_Current",
          format: "json",
        }),
      ),
    () => censusOneline(`${street}, ${city}, ${state} ${zip}`),
    () => censusOneline(`${street}, ${city}, ${state}`),
  ];

  let match: CensusMatch | undefined;
  for (const run of attempts) {
    try {
      const census = await run();
      const hit = census.result?.addressMatches?.[0];
      if (hit?.addressComponents?.city && hit.addressComponents.state && hit.addressComponents.zip) {
        match = hit;
        break;
      }
    } catch {
      // try next strategy
    }
  }

  const components = match?.addressComponents;
  if (!match || !components?.city || !components.state || !components.zip) {
    throw createError({
      statusCode: 400,
      statusMessage: "That street could not be verified for this city, state, and ZIP.",
    });
  }

  const verifiedStreet = streetFromCensusMatch(match, street);

  return {
    street: verifiedStreet,
    city: components.city,
    state: components.state,
    zip: components.zip,
    matched: match.matchedAddress || `${verifiedStreet}, ${components.city}, ${components.state} ${components.zip}`,
  };
}

export function formatShipTo(addr: ShipAddress) {
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
}
