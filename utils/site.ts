export const SITE = {
  name: "Styles by Design",
  city: "San Antonio, TX",
  phone: "(210) 436-9117",
  phoneHref: "tel:+12104369117",
  email: "Jon@TheFlipFixer.com",
  url: "https://styles-by-design.vercel.app",
  tagline: "Interior design for kitchens, baths, and whole homes",
  /** External install partner — do not display the brand name on the public site. */
  preferredContractorUrl: "https://theflipfixer.com",
  preferredContractorCta: "Preferred contractor",
  preferredContractorOffer: "Use our preferred contractor for a 10% discount.",
};

export const AREAS = [
  "Alamo Heights",
  "Boerne",
  "Bulverde",
  "Canyon Lake",
  "Cibolo",
  "Fair Oaks Ranch",
  "Helotes",
  "New Braunfels",
  "San Antonio",
  "Schertz",
  "Shavano Park",
  "Stone Oak",
];

export const PHOTO_CREDIT = "Cabinet photography courtesy of Northville Cabinetry.";

export const CLOSET_FINISH = "Closet · White or Oak";

/** Northville door + kitchen photos keyed to catalog finish names. */
export const FINISH_PHOTOS: Record<string, { door: string; room: string }> = {
  "Elegant White (Shaker)": {
    door: "/images/northville/door-elegant-white.jpg",
    room: "/images/northville/kitchen-hero.jpg",
  },
  "Grey Shaker": {
    door: "/images/northville/door-grey-shaker.jpg",
    room: "/images/northville/kitchen-grey.jpg",
  },
  "Espresso Shaker": {
    door: "/images/northville/door-espresso-shaker.jpg",
    room: "/images/northville/kitchen-espresso.jpg",
  },
  "Value Espresso": {
    door: "/images/northville/door-value-espresso.jpg",
    room: "/images/northville/kitchen-espresso.jpg",
  },
  "Blue Shaker": {
    door: "/images/northville/door-blue-shaker.jpg",
    room: "/images/northville/kitchen-blue.jpg",
  },
  "Metallic Shaker": {
    door: "/images/northville/door-metallic-shaker.jpg",
    room: "/images/northville/kitchen-metallic.jpg",
  },
  "Antique White (Raised Panel)": {
    door: "/images/northville/door-antique-white.jpg",
    room: "/images/northville/kitchen-antique.jpg",
  },
  "Midnight Espresso (Raised Panel)": {
    door: "/images/northville/door-midnight-espresso.jpg",
    room: "/images/northville/kitchen-midnight-2.jpg",
  },
  "Cognac (Raised Panel)": {
    door: "/images/northville/door-cognac.jpg",
    room: "/images/northville/kitchen-cognac.jpg",
  },
  "Closet · White or Oak": {
    door: "/images/northville/closet.jpg",
    room: "/images/northville/closet.jpg",
  },
};

export function finishPhotos(finish: string) {
  return (
    FINISH_PHOTOS[finish] || {
      door: "/images/northville/door-elegant-white.jpg",
      room: "/images/northville/kitchen-hero.jpg",
    }
  );
}

export const PHOTOS = {
  kitchen: "/images/northville/kitchen-glossy.jpg",
  kitchenAfter: "/images/work/after.jpg",
  kitchenBefore: "/images/work/before.jpg",
  kitchenHero: "/images/northville/kitchen-hero.jpg",
  bath: "/images/northville/bath-grey.jpg",
  bathDetail: "/images/northville/vanity-antique.jpg",
  cabinets: "/images/northville/kitchen-grey.jpg",
  office: "/images/northville/closet.jpg",
  living: "/images/northville/kitchen-midnight-2.jpg",
  stone: "/images/northville/kitchen-wood.jpg",
  cream: "/images/northville/kitchen-cream.jpg",
  greyIsland: "/images/northville/kitchen-grey-island.jpg",
  blue: "/images/northville/kitchen-blue.jpg",
  espresso: "/images/northville/kitchen-espresso.jpg",
  cognac: "/images/northville/kitchen-cognac.jpg",
  metallic: "/images/northville/kitchen-metallic.jpg",
  antique: "/images/northville/kitchen-antique.jpg",
  portrait: "/images/jon.jpg",
};
