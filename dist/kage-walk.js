/* Bean to cup — sticky canvas sequence. One still at a time. No overlapping plates. */
(function () {
  "use strict";

  var STORAGE_LANG = "ckm-lang";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrow = window.matchMedia("(max-width: 768px)").matches;

  var BEATS = [
    {
      id: "saint",
      src: "assets/bean-to-cup/story-00-baba-budan.webp",
      act: "I",
      lore: false,
      en: {
        k: "00 · The saint",
        h: "Baba Budan, the name on this ridge",
        p1: "Coffee did not arrive in this district as a cup. It arrived as a story about a Sufi: seven Mocha seeds, carried home and set in courtyard earth on Chandra Drona.",
        p2: "The years disagree. The ridge does not. This page is not a shop. Two acts: first the saint, then the crop as it is still grown and drunk here.",
        cap: "Companion still of Baba Budan. No period portrait is known.",
      },
      kn: {
        k: "೦೦ · ಸಂತ",
        h: "ಬಾಬಾ ಬುದನ್, ಈ ಬೆಟ್ಟದ ಹೆಸರು",
        p1: "ಕಾಫಿ ಈ ಜಿಲ್ಲೆಗೆ ಕಪ್‌ನಿಂದ ಬರಲಿಲ್ಲ. ಸೂಫಿ ಸಂತನ ಕಥೆಯಿಂದ ಬಂತು: ಯೆಮೆನಿನ ಮೋಚಾದಿಂದ ಏಳು ಬೀಜ, ಚಂದ್ರ ದ್ರೋಣದ ಆಶ್ರಮದ ಅಂಗಳದಲ್ಲಿ ನೆಟ್ಟದು.",
        p2: "ವರ್ಷಗಳು ಒಪ್ಪುವುದಿಲ್ಲ. ಬೆಟ್ಟ ಒಪ್ಪುತ್ತದೆ. ಈ ಪುಟ ಅಂಗಡಿ ಅಲ್ಲ. ಎರಡು ಅಂಕ: ಮೊದಲು ಸಂತ, ನಂತರ ಬೆಳೆ.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ಬಾಬಾ ಬುದನ್, ಏಳು ಮೋಚಾ ಬೀಜ. ಇತಿಹಾಸದ ಭಾವಚಿತ್ರವಲ್ಲ.",
      },
    },
    {
      id: "plant",
      src: "assets/bean-to-cup/story-01-plant.webp",
      act: "I",
      lore: false,
      en: {
        k: "01 · The plant",
        h: "A shrub that liked mist",
        p1: "Before it was a cup on the Hassan bus, coffee was a red cherry in highland weather — a shrub that preferred cloud to open sun.",
        p2: "What took root on Chandra Drona is still that same highland thing: shade-hungry, slow, and particular about rain.",
        cap: "Companion still — wild arabica in highland mist. Imagined landscape, not a field survey of Ethiopia.",
      },
      kn: {
        k: "೦೧ · ಗಿಡ",
        h: "ಮಂಜು ಇಷ್ಟಪಡುವ ಪೊದೆ",
        p1: "ಕಪ್ ಆಗುವ ಮೊದಲು ಕಾಫಿ ಕೆಂಪು ಹಣ್ಣು. ಮೋಡ ಇಷ್ಟ, ಬಿಸಿಲು ಅಲ್ಲ. ಆ ಗಿಡ ಈ ಘಟ್ಟಕ್ಕೆ ಬರುವ ಮೊದಲು ಬಹು ದೂರ ನಡೆದಿತ್ತು.",
        p2: "ಚಂದ್ರ ದ್ರೋಣದಲ್ಲಿ ಬೇರು ಬಿಟ್ಟದ್ದು ಇನ್ನೂ ಅದೇ ಗಿಡ: ನೆರಳು ಬೇಕು, ಮಳೆ ನಿಧಾನ, ಸಮಯ ಬೇಕು.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ಮಂಜಿನಲ್ಲಿ ಅರಬಿಕಾ. ಇಥಿಯೋಪಿಯಾ ಸಮೀಕ್ಷೆಯಲ್ಲ.",
      },
    },
    {
      id: "mocha",
      src: "assets/bean-to-cup/story-02-mocha.webp",
      act: "I",
      lore: false,
      en: {
        k: "02 · Mocha",
        h: "The harbour that sold the cup",
        p1: "On the Yemeni shore, Mocha became the name people used when they meant coffee itself. The city sold the roasted drink freely enough. Live seed was another matter.",
        p2: "Keep the tree at home, and the world stays a customer. What left that harbour as cargo was meant to be drunk, not planted.",
        cap: "Companion still — Mocha harbour, dhows, and sacks of cherry. Not a historical survey of the port.",
      },
      kn: {
        k: "೦೨ · ಮೋಚಾ",
        h: "ಕಪ್ ಮಾರಿದ ಬಂದರು",
        p1: "ಯೆಮೆನ್ ತೀರದಲ್ಲಿ ಮೋಚಾ ಎಂದರೆ ಕಾಫಿ ಎಂದೇ ಆಯಿತು. ಹುರಿದ ಕುಡಿಯುವುದನ್ನು ಮಾರಿದರು. ಜೀವಂತ ಬೀಜ ಬೇರೆ ಮಾತು.",
        p2: "ಗಿಡ ಮನೆಯಲ್ಲಿ ಉಳಿದರೆ ಜಗತ್ತು ಗ್ರಾಹಕ. ಆ ಬಂದರಿನಿಂದ ಹೊರಟದ್ದು ಕುಡಿಯಲು, ನೆಡಲು ಅಲ್ಲ.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ಮೋಚಾ ಬಂದರು. ಐತಿಹಾಸಿಕ ಸಮೀಕ್ಷೆಯಲ್ಲ.",
      },
    },
    {
      id: "seeds",
      src: "assets/bean-to-cup/story-03-seeds.webp",
      act: "I",
      lore: false,
      en: {
        k: "03 · Seven seeds",
        h: "A courtyard on this ridge",
        p1: "Then a Sufi from these hills is said to have come home with seven Mocha seeds and set them in the courtyard of his hermitage on Baba Budan Giri. Some tellings put that planting near 1600. Others nearer 1670.",
        p2: "The years argue. The ridge does not. It still carries his name, and the trees still like the same mist.",
        cap: "Companion still — seven Mocha seeds in courtyard earth. Not a reconstruction of a dated planting.",
      },
      kn: {
        k: "೦೩ · ಏಳು ಬೀಜ",
        h: "ಈ ಬೆಟ್ಟದ ಅಂಗಳ",
        p1: "ಈ ಬೆಟ್ಟದ ಸೂಫಿ ಏಳು ಮೋಚಾ ಬೀಜ ತಂದು ಬಾಬಾ ಬುದನ್ ಗಿರಿಯ ಆಶ್ರಮದ ಅಂಗಳದಲ್ಲಿ ನೆಟ್ಟನೆಂದು ಹೇಳುತ್ತಾರೆ. ಕೆಲವು ಕಥೆಗಳು ಸುಮಾರು ೧೬೦೦. ಮತ್ತೆ ಕೆಲವು ಹಜ್‌ನಿಂದ ೧೬೭೦ರ ಹತ್ತಿರ.",
        p2: "ವರ್ಷಗಳು ವಾದ. ಬೆಟ್ಟ ವಾದವಲ್ಲ. ಅದು ಇನ್ನೂ ಅವನ ಹೆಸರು ಹೊತ್ತಿದೆ. ಗಿಡಗಳು ಇನ್ನೂ ಅದೇ ಮಂಜು ಇಷ್ಟಪಡುತ್ತವೆ.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ಏಳು ಬೀಜ ನೆಡುವುದು. ದಿನಾಂಕದ ಪುನರ್ನಿರ್ಮಾಣವಲ್ಲ.",
      },
    },
    {
      id: "voyage",
      src: "assets/bean-to-cup/story-04-voyage.webp",
      act: "I",
      lore: true,
      en: {
        k: "04 · The Hajj lore",
        h: "What the hills still tell",
        p1: "The story that travels with the seeds is a smuggler's story: seven raw beans, because seven is sacred, tucked away so a port would not notice a future forest leaving in a pilgrim's clothes.",
        p2: "No ship's book confirms it. The district tells it anyway. Believe the slope. Treat the beard as lore.",
        cap: "Companion still of the voyage lore. Not a reconstruction of a dated crossing. Lore.",
      },
      kn: {
        k: "೦೪ · ಹಜ್ ಕಥೆ",
        h: "ಬೆಟ್ಟ ಇನ್ನೂ ಹೇಳುವುದು",
        p1: "ಬೀಜಗಳೊಂದಿಗೆ ನಡೆಯುವ ಕಥೆ ಕಳ್ಳಸಾಗಣೆಯದು: ಏಳು ಕಚ್ಚಾ ಬೀನ್, ಏಳು ಪವಿತ್ರ, ಗಡ್ಡದಲ್ಲಿ ಅಥವಾ ಬಟ್ಟೆಯಲ್ಲಿ — ಬಂದರು ಕಾಡು ಹೊರಡುವುದನ್ನು ನೋಡದಂತೆ.",
        p2: "ಯಾವುದೇ ಹಡಗಿನ ಪುಸ್ತಕ ಇದನ್ನು ದೃಢಪಡಿಸುವುದಿಲ್ಲ. ಜಿಲ್ಲೆ ಹೇಳುತ್ತಲೇ ಇದೆ. ಬೆಟ್ಟ ನಂಬಿ. ಗಡ್ಡವನ್ನು ಕಥೆಯೆಂದು ಇರಿಸಿ.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ದೋಣಿ, ಬಟ್ಟೆಯ ಚೀಲ. ದಿನಾಂಕದ ಪಯಣವಲ್ಲ. ಕಥೆ.",
      },
    },
    {
      id: "hermitage",
      src: "assets/bean-to-cup/story-05-hermitage.webp",
      act: "I",
      lore: false,
      en: {
        k: "05 · Chandra Drona",
        h: "A garden before it was a crop",
        p1: "Those first plants did not become a landscape overnight. For a long time they were a curiosity in courtyard earth — a few trees behind a house, not yet the silver-oak rows on the Charmadi road.",
        p2: "Chandra Drona held a garden before it held an estate. The shrine is still on that ridge. The crop learned patience here.",
        cap: "Companion still — a cave hermitage and seedling terraces. Imagined courtyard, not a measured plan of the shrine.",
      },
      kn: {
        k: "೦೫ · ಚಂದ್ರ ದ್ರೋಣ",
        h: "ಬೆಳೆಗಿಂತ ಮೊದಲು ತೋಟ",
        p1: "ಮೊದಲ ಗಿಡಗಳು ರಾತ್ರಿಯಲ್ಲಿ ಭೂದೃಶ್ಯವಾಗಲಿಲ್ಲ. ಬಹುಕಾಲ ಅಂಗಳದ ಕುತೂಹಲ — ಮನೆಯ ಹಿಂದೆ ಕೆಲವು ಮರ.",
        p2: "ಚಂದ್ರ ದ್ರೋಣ ಮೊದಲು ತೋಟ ಹಿಡಿದಿತ್ತು, ಎಸ್ಟೇಟ್ ಅಲ್ಲ. ಗುಡಿ ಇನ್ನೂ ಆ ಬೆಟ್ಟದಲ್ಲಿದೆ.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ಗುಹೆ ಆಶ್ರಮ, ಸಸಿ. ದೇವಸ್ಥಾನದ ನಕ್ಷೆಯಲ್ಲ.",
      },
    },
    {
      id: "estate",
      src: "assets/bean-to-cup/story-06-estate.webp",
      act: "I",
      lore: false,
      en: {
        k: "06 · Estate country",
        h: "When the forest learned rows",
        p1: "Rows came later. In the 1820s planters opened country beside this same ridge, and the crop walked on into Wayanad, the Shevaroys, the Nilgiris.",
        p2: "What had been a hermitage tree became a hillside of labour — shade measured, paths named, a bungalow on the shoulder of the hill.",
        cap: "Companion still — early shade rows and a ridge bungalow. Not a portrait of any working property.",
      },
      kn: {
        k: "೦೬ · ಎಸ್ಟೇಟ್",
        h: "ಕಾಡು ಸಾಲು ಕಲಿತಾಗ",
        p1: "ಸಾಲುಗಳು ನಂತರ ಬಂದವು. ೧೮೨೦ರ ದಶಕದಲ್ಲಿ ಈ ಬೆಟ್ಟದ ಪಕ್ಕದಲ್ಲಿ ನಾಟಿ ಆರಂಭ.",
        p2: "ಆಶ್ರಮದ ಮರ ಬೆಟ್ಟದ ಕೆಲಸವಾಯಿತು — ನೆರಳು ಅಳೆದು, ಹಾದಿ ಹೆಸರಿಸಿ, ಭುಜದ ಮೇಲೆ ಬಂಗಲೆ.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ನೆರಳಿನ ಸಾಲು, ಬಂಗಲೆ.",
      },
    },
    {
      id: "shade-work",
      src: "assets/bean-to-cup/story-07-shade-work.webp",
      act: "I",
      lore: false,
      en: {
        k: "07 · Shade work",
        h: "What you see from the bus",
        p1: "Look out between Mudigere and Balehonnur and you are looking at work: two roofs of shade, pepper on the trunks, arabica underneath. Karnataka still grows the largest share of the Indian crop.",
        p2: "In 1925 an experiment station opened near Balehonnur. The green you photograph from the window is someone's season.",
        cap: "Companion still — silver-oak shade, pepper vine, and a working path. Not a photograph of CCRI.",
      },
      kn: {
        k: "೦೭ · ನೆರಳಿನ ಕೆಲಸ",
        h: "ಬಸ್ಸಿನಿಂದ ಕಾಣುವುದು",
        p1: "ಮೂಡಿಗೆರೆಯಿಂದ ಬಾಳೆಹೊನ್ನೂರಿನ ನಡುವೆ ನೋಡಿದರೆ ಕೆಲಸ ಕಾಣುತ್ತದೆ: ಎರಡು ನೆರಳು, ತೊಂಟೆಯಲ್ಲಿ ಮೆಣಸು, ಕೆಳಗೆ ಅರಬಿಕಾ.",
        p2: "೧೯೨೫ರಲ್ಲಿ ಈ ಜಿಲ್ಲೆಯ ಬಾಳೆಹೊನ್ನೂರಿನ ಹತ್ತಿರ ಪ್ರಯೋಗ ಕೇಂದ್ರ ತೆರೆಯಿತು.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ಬೆಳ್ಳಿ ಓಕ್, ಮೆಣಸು ಬಳ್ಳಿ.",
      },
    },
    {
      id: "guest",
      src: "assets/bean-to-cup/story-08-guest.webp",
      act: "I",
      lore: false,
      en: {
        k: "08 · This companion",
        h: "Walk as a guest",
        p1: "This page will not sell you a cupping, a bungalow, or a jeep through someone else's silver oak. If a planter opens a path, that is their door. Stay on it.",
        p2: "The seven seeds are a story people keep. The canopy is a living crop in a living forest. Drink the cup. Leave the rows as you found them.",
        cap: "Companion still — a quiet path under coffee. This page does not sell a stay or a tour.",
      },
      kn: {
        k: "೦೮ · ಅತಿಥಿ",
        h: "ಅತಿಥಿಯಂತೆ ನಡೆ",
        p1: "ಈ ಪುಟ ಕಪ್ಪಿಂಗ್, ಬಂಗಲೆ, ಅಥವಾ ಬೇರೆಯವರ ಬೆಳ್ಳಿ ಓಕ್‌ನಲ್ಲಿ ಜೀಪ್ ಮಾರುವುದಿಲ್ಲ.",
        p2: "ಏಳು ಬೀಜ ಜನ ಹೇಳುವ ಕಥೆ. ನೆರಳು ಜೀವಂತ ಬೆಳೆ. ಕಪ್ ಕುಡಿ. ಸಾಲುಗಳನ್ನು ಹಾಗೆಯೇ ಬಿಡು.",
        cap: "ಸಂಗಾತಿ ಚಿತ್ರ — ನೆರಳಿನ ಹಾದಿ.",
      },
    },
    {
      id: "shade",
      src: "assets/bean-to-cup/01-shade.webp",
      act: "II",
      lore: false,
      en: {
        k: "09 · Shade",
        h: "A path the canopy keeps",
        p1: "The crop begins where the tar road stops. Arabica sits under silver oak. Mist still hangs in the valley. The path is wet from last night’s rain.",
        p2: "Chikkamagaluru coffee is a shade crop. The hill prefers cloud to open sun. This companion does not sell a tour of anyone’s estate.",
        cap: "Shade-grown arabica at first light — silver oak, mist, a dirt line through the rows.",
      },
      kn: {
        k: "೦೯ · ನೆರಳು",
        h: "ಮೊದಲ ಬೆಳಕಿನ ಹಾದಿ",
        p1: "ಬೆಳೆಯ ನಡಿಗೆ ರಸ್ತೆ ಮುಗಿದಲ್ಲಿ ಆರಂಭವಾಗುತ್ತದೆ. ಬೆಳ್ಳಿ ಓಕ್ ಕೆಳಗೆ ಅರಬಿಕಾ.",
        p2: "ಮಲೆನಾಡಿನ ಕಾಫಿ ಬಿಸಿಲಿನಲ್ಲಿ ಅಲ್ಲ, ಮಬ್ಬಿನಲ್ಲಿ ಬೆಳೆಯುತ್ತದೆ.",
        cap: "ನೆರಳು ಬೆಳೆದ ಅರಬಿಕಾ — ಬೆಳಗಿನ ಹೊಗೆ, ಬೆಳ್ಳಿ ಓಕ್.",
      },
    },
    {
      id: "cherry",
      src: "assets/bean-to-cup/02-cherry.webp",
      act: "II",
      lore: false,
      en: {
        k: "10 · Cherry",
        h: "The bean still dressed as fruit",
        p1: "Coffee is not a cup first. It is a red fruit in the leaf. The skin is sweet. Inside sit two seeds, pressed together like palms.",
        p2: "Pickers wait for that colour. Green cherries taste thin. This is not a recipe. It is the plant, still on the hill.",
        cap: "Ripe arabica cherries on a living shrub — dew on the skin, green fruit still waiting.",
      },
      kn: {
        k: "೧೦ · ಹಣ್ಣು",
        h: "ಕೆಂಪು ಹಣ್ಣಿನಲ್ಲಿ ಬೀಜ",
        p1: "ಕಾಫಿ ಮೊದಲು ಕಪ್ ಅಲ್ಲ. ಅದು ಎಲೆಯ ನಡುವೆ ಕೆಂಪು ಹಣ್ಣು. ತೊಗಟೆ ಸಿಹಿ; ಒಳಗೆ ಎರಡು ಬೀಜ.",
        p2: "ಕೆಂಪಾದಾಗ ಕೀಳುತ್ತಾರೆ. ಇದು ಅಡುಗೆ ಪುಸ್ತಕವಲ್ಲ.",
        cap: "ಹಸಿರು ಕೊಂಬೆಯಲ್ಲಿ ಕೆಂಪು ಅರಬಿಕಾ ಹಣ್ಣು.",
      },
    },
    {
      id: "seed",
      src: "assets/bean-to-cup/03-seed.webp",
      act: "II",
      lore: false,
      en: {
        k: "11 · Seed",
        h: "Three names for one seed",
        p1: "Strip the fruit and a pale husk remains. Dry that, and you hold a green bean. Cherry, parchment, green — three names, one journey.",
        p2: "Mills still do this work in the district. This page does not name a brand or a price.",
        cap: "Cherry, parchment, green bean — one seed counted three ways on a mill table.",
      },
      kn: {
        k: "೧೧ · ಬೀಜ",
        h: "ಮೂರು ಹೆಸರು, ಒಂದು ಬೀಜ",
        p1: "ತೊಗಟೆ ತೆಗೆದರೆ ಒಳಗೆ ತಿಳಿ ಹೊದಿಕೆ. ಅದನ್ನು ಒಣಗಿಸಿದರೆ ಹಸಿರು ಬೀನ್.",
        p2: "ಗಿರಣಿ ಈ ಜಿಲ್ಲೆಯಲ್ಲಿ ಉಳಿದಿದೆ. ಈ ಪುಟ ಯಾವುದೇ ಬ್ರಾಂಡ್ ಮಾರುವುದಿಲ್ಲ.",
        cap: "ಹಣ್ಣು, ಪಾರ್ಚ್‌ಮೆಂಟ್, ಹಸಿರು ಬೀನ್.",
      },
    },
    {
      id: "roast",
      src: "assets/bean-to-cup/04-roast.webp",
      act: "II",
      lore: false,
      en: {
        k: "12 · Fire",
        h: "The drum that names the cup",
        p1: "A green bean has almost no smell. Fire draws the sugar out. Only then does the seed begin to sound like a cup.",
        p2: "Roast is local taste, not a single law. What you see here is the drum — the turn from plant to the filter on a verandah.",
        cap: "A roasting drum at work — steam, sugar browning, the smell that people call coffee.",
      },
      kn: {
        k: "೧೨ · ಬೆಂಕಿ",
        h: "ಡ್ರಮ್‌ನಲ್ಲಿ ಬೆಳಗು",
        p1: "ಹಸಿರು ಬೀನ್‌ಗೆ ವಾಸನೆ ಇಲ್ಲ. ಬೆಂಕಿ ಸಿಹಿ ಹೊರತಂದಾಗಲೇ ಕಪ್ ಆರಂಭ.",
        p2: "ಹುರಿತದ ಮಟ್ಟ ಊರಿಗೆ, ಮನೆಗೆ ಬದಲಾಗುತ್ತದೆ. ಮೆನು ಅಲ್ಲ.",
        cap: "ಹುರಿಯುವ ಡ್ರಮ್‌ನಲ್ಲಿ ಕಂದು ಬೀನ್, ಉಗಿ.",
      },
    },
    {
      id: "brew",
      src: "assets/bean-to-cup/05-brew.webp",
      act: "II",
      lore: false,
      en: {
        k: "13 · Filter",
        h: "Two steel barrels, hot water",
        p1: "Malnad drinks it this way: grounds in the upper barrel, decoction collecting below. Steam is the clock.",
        p2: "This is house coffee, not a café list. The companion will not sell you a cup.",
        cap: "South Indian filter on an estate table — grounds, hot water, the slow drip.",
      },
      kn: {
        k: "೧೩ · ಫಿಲ್ಟರ್",
        h: "ಎರಡು ಉಕ್ಕಿನ ಬಾರೆಲ್",
        p1: "ಮಲೆನಾಡು ಈ ರೀತಿ ಕುಡಿಯುತ್ತದೆ: ಮೇಲಿನ ಡಬ್ಬದಲ್ಲಿ ಪುಡಿ, ಕೆಳಗೆ ಡಿಕಾಕ್ಷನ್.",
        p2: "ಕೆಫೆ ಪಟ್ಟಿ ಅಲ್ಲ. ಮನೆಯ ಕಾಫಿ.",
        cap: "ಮಲೆನಾಡಿನ ಫಿಲ್ಟರ್: ನೀರು, ಪುಡಿ, ಮರದ ಮೇಜು.",
      },
    },
    {
      id: "cup",
      src: "assets/bean-to-cup/06-cup.webp",
      act: "II",
      lore: false,
      en: {
        k: "14 · Cup",
        h: "The davara, and the hill still there",
        p1: "Here the cup is a davara. Milk is a household choice. The hill is still in the window.",
        p2: "From seven Mocha seeds to this metal is one walk. Not a shop. The saint first. Then the crop.",
        cap: "Decoction in a steel davara — the estate still in the frame, first light on the shrubs.",
      },
      kn: {
        k: "೧೪ · ಕಪ್",
        h: "ಡವರದಲ್ಲಿ ಬೆಳಗು",
        p1: "ಕಪ್ ಎಂದರೆ ಇಲ್ಲಿ ಡವರ. ಹಾಲು ಬೇಕಾದರೆ ಮನೆಯ ನಿಯಮ. ಬೆಟ್ಟ ಇನ್ನೂ ಕಿಟಕಿಯಲ್ಲಿದೆ.",
        p2: "ಏಳು ಬೀಜದಿಂದ ಈ ಲೋಹದ ಕಪ್‌ವರೆಗೆ ಒಂದೇ ನಡಿಗೆ. ಅಂಗಡಿ ಅಲ್ಲ.",
        cap: "ಉಗಿ ಬರುವ ಡವರ, ಹಿಂದೆ ಕಾಫಿ ಬೆಟ್ಟ.",
      },
    },
  ];

  var UI = {
    en: {
      "nav.home": "Home",
      "nav.explore": "Explore",
      "nav.places": "Places",
      "nav.stories": "Stories",
      "nav.here": "Bean to cup",
      "nav.plan": "Plan",
      "chip.i": "Origin",
      "chip.ii": "Crop",
      "close.k": "Close",
      "close.h": "Drink. Leave the rows.",
      "close.p": "From seven Mocha seeds to a davara is one walk. This page is not a shop. Believe the slope. Treat the beard as lore.",
      "cta.home": "Back to the companion",
      "cta.baba": "Baba Budangiri",
      "foot.note": "Independent companion. Not a government site. Not a booking service.",
      "pre.l": "Seven seeds",
      "pre.r": "One cup",
      actI: "Act I · Origin",
      actII: "Act II · Crop",
    },
    kn: {
      "nav.home": "ಮನೆ",
      "nav.explore": "ಅನ್ವೇಷಿಸಿ",
      "nav.places": "ಸ್ಥಳಗಳು",
      "nav.stories": "ಕಥೆಗಳು",
      "nav.here": "ಬೀನ್ ಟು ಕಪ್",
      "nav.plan": "ಯೋಜನೆ",
      "chip.i": "ಮೂಲ",
      "chip.ii": "ಬೆಳೆ",
      "close.k": "ಮುಕ್ತಾಯ",
      "close.h": "ಕುಡಿ. ಸಾಲು ಬಿಡು.",
      "close.p": "ಏಳು ಮೋಚಾ ಬೀಜದಿಂದ ಡವರದವರೆಗೆ ಒಂದೇ ನಡಿಗೆ. ಈ ಪುಟ ಅಂಗಡಿ ಅಲ್ಲ. ಬೆಟ್ಟ ನಂಬಿ. ಕಥೆಯನ್ನು ಕಥೆಯೆಂದು ಇರಿಸಿ.",
      "cta.home": "ಸಂಗಾತಿಗೆ ಹಿಂದಿರುಗಿ",
      "cta.baba": "ಬಾಬಾ ಬುದನ್ ಗಿರಿ",
      "foot.note": "ಸ್ವತಂತ್ರ ಸಂಗಾತಿ. ಸರ್ಕಾರಿ ತಾಣವಲ್ಲ. ಬುಕಿಂಗ್ ಅಲ್ಲ.",
      "pre.l": "ಏಳು ಬೀಜ",
      "pre.r": "ಒಂದು ಕಪ್",
      actI: "ಅಂಕ ೦೧ · ಮೂಲ",
      actII: "ಅಂಕ ೦೨ · ಬೆಳೆ",
    },
  };

  var lang = localStorage.getItem(STORAGE_LANG) || "en";
  var frames = [];
  var painted = -1;
  var pending = -1;
  var raf = 0;
  var canvas;
  var ctx;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function pack() {
    return lang === "kn" ? "kn" : "en";
  }
  function copyOf(beat) {
    return beat[pack()] || beat.en;
  }

  function applyUi() {
    var dict = UI[pack()];
    $$("[data-i]").forEach(function (el) {
      var k = el.getAttribute("data-i");
      if (k && dict[k]) el.textContent = dict[k];
    });
    var tog = $("[data-lang-toggle]");
    if (tog) {
      tog.textContent = lang === "kn" ? "English" : "ಕನ್ನಡ";
      tog.setAttribute("aria-pressed", lang === "kn" ? "true" : "false");
    }
    document.documentElement.lang = lang === "kn" ? "kn" : "en";
    paintCopy(Math.max(0, painted));
  }

  function setProgress(pct) {
    var bar = $("#pre-bar");
    var num = $("#pre-num");
    if (bar) bar.style.right = 100 - pct + "%";
    if (num) num.textContent = String(Math.min(100, Math.round(pct))).padStart(3, "0");
  }

  function makeGrain() {
    var c = document.createElement("canvas");
    c.width = c.height = 180;
    var x = c.getContext("2d");
    var d = x.createImageData(180, 180);
    for (var i = 0; i < d.data.length; i += 4) {
      var v = 160 + Math.random() * 70;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 42;
    }
    x.putImageData(d, 0, 0);
    var g = $("#grain");
    if (g) g.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
  }

  function drawCover(img, w, h) {
    if (!img || !img.width) return;
    var ir = img.width / img.height;
    var cr = w / h;
    var dw;
    var dh;
    var dx;
    var dy;
    if (ir > cr) {
      dh = h;
      dw = h * ir;
      dx = (w - dw) / 2;
      dy = 0;
    } else {
      dw = w;
      dh = w / ir;
      dx = 0;
      dy = (h - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function sizeCanvas() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    painted = -1;
    schedulePaint(pending < 0 ? 0 : pending);
  }

  function paintCopy(i) {
    var beat = BEATS[i];
    if (!beat) return;
    var c = copyOf(beat);
    var kicker = $("#copy-k");
    var title = $("#copy-h");
    var p1 = $("#copy-p1");
    var p2 = $("#copy-p2");
    var cap = $("#copy-cap");
    var lore = $("#copy-lore");
    var num = $("#frame-num");
    var act = $("#frame-act");
    if (kicker) kicker.textContent = c.k;
    if (title) title.textContent = c.h;
    if (p1) p1.textContent = c.p1;
    if (p2) p2.textContent = c.p2;
    if (cap) cap.textContent = c.cap;
    if (lore) lore.hidden = !beat.lore;
    if (num) num.textContent = String(i).padStart(2, "0");
    if (act) act.textContent = beat.act === "II" ? UI[pack()].actII : UI[pack()].actI;
    $$(".seq-dots button").forEach(function (b, n) {
      b.classList.toggle("on", n === i);
    });
    $$(".chip").forEach(function (ch) {
      var which = ch.getAttribute("data-act");
      ch.classList.toggle("on", which === beat.act);
    });
  }

  function paintFrame(i) {
    if (!ctx || !canvas) return;
    if (i === painted) return;
    var img = frames[i];
    if (!img) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, w, h);
    drawCover(img, w, h);
    painted = i;
    paintCopy(i);
  }

  function schedulePaint(i) {
    pending = i;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      paintFrame(pending);
    });
  }

  function frameFromScroll() {
    var reel = $("#reel");
    if (!reel) return 0;
    var rect = reel.getBoundingClientRect();
    var total = reel.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    var y = -rect.top;
    var t = Math.min(1, Math.max(0, y / total));
    var n = frames.length;
    var idx = Math.min(n - 1, Math.floor(t * n));
    return idx;
  }

  function onScroll() {
    if (reduced) return;
    var i = frameFromScroll();
    if (i !== painted) schedulePaint(i);
  }

  function jumpToFrame(i) {
    var reel = $("#reel");
    if (!reel) return;
    var total = reel.offsetHeight - window.innerHeight;
    var n = Math.max(frames.length, 1);
    var y = reel.offsetTop + (i / n) * total + 2;
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  }

  function preload() {
    var list = BEATS.slice();
    if (narrow && list.length > 8) {
      /* phones: keep every beat — 15 stills is already the story, not a 200-frame reel */
    }
    var done = 0;
    return new Promise(function (resolve) {
      list.forEach(function (beat, i) {
        var img = new Image();
        img.decoding = "async";
        img.onload = img.onerror = function () {
          frames[i] = img;
          done += 1;
          setProgress(8 + (done / list.length) * 88);
          if (done === list.length) resolve();
        };
        img.src = beat.src;
      });
    });
  }

  function fillLongread() {
    var host = $("#longread");
    if (!host) return;
    host.innerHTML = BEATS.map(function (b, i) {
      var c = copyOf(b);
      return (
        "<article id=\"beat-" +
        b.id +
        "\"><p class=\"kicker\">" +
        c.k +
        (b.lore ? ' <span class="lore">Lore</span>' : "") +
        "</p><img src=\"" +
        b.src +
        "\" alt=\"" +
        c.cap.replace(/"/g, "") +
        "\" width=\"1600\" height=\"900\"/><h2>" +
        c.h +
        "</h2><p>" +
        c.p1 +
        "</p><p>" +
        c.p2 +
        "</p><p class=\"cap\">" +
        c.cap +
        "</p></article>"
      );
    }).join("");
  }

  function wireNav() {
    var nav = $(".nav");
    var burger = $(".nav-burger");
    var lastY = 0;
    if (burger && nav) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("menu-open");
        burger.classList.toggle("active", open);
        document.documentElement.classList.toggle("nav-open", open);
      });
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!nav) return;
        var y = window.scrollY;
        nav.classList.toggle("stuck", y > 16);
        if (!nav.classList.contains("menu-open")) nav.classList.toggle("hide", y > lastY && y > 140);
        lastY = y;
      },
      { passive: true }
    );
    document.documentElement.style.setProperty("--vw", window.innerWidth + "px");
    window.addEventListener("resize", function () {
      document.documentElement.style.setProperty("--vw", window.innerWidth + "px");
      narrow = window.matchMedia("(max-width: 768px)").matches;
      sizeCanvas();
    });
  }

  function boot() {
    canvas = $("#seq");
    if (canvas) ctx = canvas.getContext("2d", { alpha: false });
    makeGrain();
    wireNav();
    fillLongread();
    applyUi();
    $("[data-lang-toggle]") &&
      $("[data-lang-toggle]").addEventListener("click", function () {
        lang = lang === "kn" ? "en" : "kn";
        localStorage.setItem(STORAGE_LANG, lang);
        applyUi();
        fillLongread();
      });
    $$(".seq-dots button").forEach(function (b, i) {
      b.addEventListener("click", function () {
        jumpToFrame(i);
      });
    });
    $$(".chip").forEach(function (ch) {
      ch.addEventListener("click", function () {
        jumpToFrame(ch.getAttribute("data-act") === "II" ? 9 : 0);
      });
    });

    preload().then(function () {
      sizeCanvas();
      schedulePaint(0);
      document.body.classList.remove("is-locked");
      var pre = $("#pre");
      if (pre) pre.classList.add("done");
      if (!reduced) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
