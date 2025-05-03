/**
 * Game locations organized into multiple packs.
 *
 * Changes made:
 * - Added two Basic packs (basic1 and basic2) based on your provided list.
 * - Retained and integrated the earlier expanded packs: advanced, tourism, extreme, fantasy, and sci_fi.
 */
const locationPacks = {
  basic1: {
    name: "Basic Pack 1",
    description: "Straightforward, everyday locations for classic gameplay.",
    locations: [
      "Airplane",
      "Bank",
      "Beach",
      "Broadway Theater",
      "Casino",
      "Cathedral",
      "Circus Tent",
      "Corporate Party",
      "Crusader Army",
      "Day Spa",
      "Embassy",
      "Hospital",
      "Hotel",
      "Military Base",
      "Movie Studio",
      "Ocean Liner",
      "Passenger Train",
      "Pirate Ship",
      "Polar Station",
      "Police Station",
      "Restaurant",
      "School",
      "Service Station",
      "Space Station",
      "Submarine",
      "Supermarket"
    ]
  },
  basic2: {
    name: "Basic Pack 2",
    description: "A mix of public, entertainment, and unique settings for varied gameplay.",
    locations: [
      "University",
      "Amusement Park",
      "Art Museum",
      "Candy Factory",
      "Cat Show",
      "Cemetery",
      "Coal Mine",
      "Construction Site",
      "Gaming Convention",
      "Gas Station",
      "Harbor Docks",
      "Ice Hockey Stadium",
      "Jail",
      "Jazz Club",
      "Library",
      "Night Club",
      "Race Track",
      "Retirement Home",
      "Rock Concert",
      "Sightseeing Bus",
      "Stadium",
      "Subway",
      "The U.N.",
      "Vineyard",
      "Wedding",
      "Zoo"
    ]
  },
  advanced: {
    name: "Advanced Locations",
    description: "More unique and challenging locations",
    locations: [
      "Space Station",
      "Submarine",
      "Aircraft Carrier",
      "Nuclear Power Plant",
      "Circus",
      "Casino",
      "Prison",
      "Oil Rig",
      "Ski Resort",
      "Cruise Ship",
      "Amusement Park",
      "Zoo",
      "Underwater Research Lab",
      "Deserted Island Resort",
      "Underground Bunker",
      "Space Elevator",
      "High-Speed Train Depot"
    ]
  },
  tourism: {
    name: "Tourist Attractions",
    description: "Famous landmarks and tourist destinations",
    locations: [
      "Eiffel Tower",
      "Great Wall of China",
      "Pyramids of Giza",
      "Colosseum",
      "Taj Mahal",
      "Statue of Liberty",
      "Grand Canyon",
      "Machu Picchu",
      "Stonehenge",
      "Sydney Opera House",
      "Niagara Falls",
      "Mount Everest Base Camp",
      "Louvre Museum",
      "Big Ben",
      "Burj Khalifa",
      "Times Square",
      "Red Square"
    ]
  },
  extreme: {
    name: "Extreme Locations",
    description: "High-risk, dangerous, or unconventional spots",
    locations: [
      "Volcano Observatory",
      "Antarctic Research Station",
      "Chernobyl Exclusion Zone",
      "Arctic Base",
      "Deep Sea Trench",
      "Active Volcano",
      "Edge of a Black Hole Observatory",
      "Lightning Storm Tower",
      "Desert Wasteland Outpost",
      "Extreme Mountain Summit"
    ]
  },
  fantasy: {
    name: "Fantasy & Fictional Locations",
    description: "Mythical, magical, and fictional worlds",
    locations: [
      "Hogwarts School",
      "Mordor",
      "Narnia",
      "Westeros",
      "Middle-Earth",
      "Atlantis",
      "Pandora (Avatar)",
      "Camelot",
      "Neverland",
      "Asgard",
      "The Shire",
      "Emerald City",
      "Oz",
      "Rivendell",
      "Lothlórien",
      "Wonderland"
    ]
  },
  sci_fi: {
    name: "Sci-Fi & Futuristic Locations",
    description: "Advanced, futuristic, and high-tech environments",
    locations: [
      "Mars Colony",
      "Moon Base",
      "Orbital Station",
      "Intergalactic Spaceport",
      "Quantum Research Lab",
      "Cyber City",
      "Virtual Reality Realm",
      "Terraforming Facility",
      "Futuristic Megacity",
      "Time Travel Hub",
      "Galactic Senate Chamber",
      "Stellar Research Outpost"
    ]
  }
};

module.exports = locationPacks;
