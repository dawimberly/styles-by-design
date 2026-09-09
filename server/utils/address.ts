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
    streetName?: string;
    suffixType?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

type CensusResponse = {
  result?: { addressMatches?: CensusMatch[] };
};

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
  const street = input.street.trim();
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

  const params = new URLSearchParams({
    street,
    city,
    state,
    zip,
    benchmark: "Public_AR_Current",
    format: "json",
  });
  const census = await $fetch<CensusResponse>(
    `https://geocoding.geo.census.gov/geocoder/locations/address?${params.toString()}`,
  );
  const match = census.result?.addressMatches?.[0];
  const components = match?.addressComponents;
  if (!match || !components?.city || !components.state || !components.zip) {
    throw createError({
      statusCode: 400,
      statusMessage: "That street could not be verified for this city, state, and ZIP.",
    });
  }

  const number = components.fromAddress || "";
  const streetName = [components.streetName, components.suffixType].filter(Boolean).join(" ");
  const verifiedStreet = `${number} ${streetName}`.replace(/\s+/g, " ").trim();

  return {
    street: verifiedStreet || street,
    city: components.city,
    state: components.state,
    zip: components.zip,
    matched: match.matchedAddress || `${verifiedStreet}, ${components.city}, ${components.state} ${components.zip}`,
  };
}

export function formatShipTo(addr: ShipAddress) {
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
}
