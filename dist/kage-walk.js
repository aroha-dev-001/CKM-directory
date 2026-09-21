/* Bean to cup — config-driven player. Public page has no admin HUD. */
(function () {
  "use strict";

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


  var WALK_DEFAULTS = {
  "world": {
    "background": "#05070a",
    "fogColor": "#05070a",
    "fogDensity": 0.046,
    "grainOpacity": 0.05,
    "vignette": 0.5,
    "scrollHeightVh": 560,
    "pixelRatioCap": 1.75
  },
  "camera": {
    "startX": -0.55,
    "startY": 0.15,
    "startZ": 7.2,
    "fov": 46,
    "near": 0.12,
    "far": 180,
    "rightBias": 2.35,
    "rightBiasMobile": 1.05,
    "mobileBreakpoint": 820,
    "lookY": 0.06,
    "lookAhead": 8.4,
    "weave": 0.18,
    "lerpPower": 0.0008,
    "pointerX": 0.22,
    "pointerY": 0.18
  },
  "motion": {
    "easing": "linear",
    "gap": 11,
    "dollyExtra": 5.5,
    "plateFloat": 0.04,
    "shardFloat": 0.18,
    "beanBob": 0.12
  },
  "focus": {
    "ahead": 8.2,
    "range": 7.5,
    "growAhead": 7.2,
    "growRange": 4,
    "growAmount": 0.12,
    "opacityIdle": 0.28,
    "opacityGain": 0.7,
    "idleDriftX": 0.28,
    "rotY": -0.14,
    "rotYIdle": 0.06
  },
  "plates": {
    "width": 7.4,
    "baseX": 2.45,
    "altA": -0.12,
    "altB": 0.18,
    "baseY": 0.08,
    "ySine": 0.1,
    "rotY": -0.16,
    "fallbackShift": 0.16
  },
  "shards": {
    "enabled": true,
    "x": 4.55,
    "y": 1.28,
    "zOffset": 1.8,
    "scale": 0.3,
    "opacity": 0.34,
    "rotY": -0.38
  },
  "particles": {
    "enabled": true,
    "count": 36,
    "minX": 1.8,
    "spreadX": 5.5,
    "bean": "#4a2c1a",
    "cherry": "#8a1f18"
  },
  "copyRail": {
    "side": "left",
    "maxWidth": "min(40vw, 28.5rem)",
    "overlayGradient": "linear-gradient(90deg, rgba(5,7,10,.96) 0%, rgba(5,7,10,.88) 62%, rgba(5,7,10,.35) 88%, transparent 100%)",
    "passLow": 0.12,
    "passHigh": 0.78,
    "stageIndexVisible": true,
    "dotsVisible": true,
    "chipsVisible": true
  },
  "nav": {
    "hideOnScroll": true,
    "hideThreshold": 140,
    "jumpSmooth": true,
    "actIIIndex": 9
  },
  "a11y": {
    "reducedMotion": "auto"
  },
  "debug": {
    "hudOpen": true,
    "force2d": false
  }
};
  var CFG = JSON.parse(JSON.stringify(WALK_DEFAULTS));
  var STORAGE_LANG = "ckm-lang";
  var lang = localStorage.getItem(STORAGE_LANG) || "en";
  var frames = [];
  var painted = -1;
  var canvas;
  var ctx;
  var world = null;
  var scrollT = 0;
  var pointer = { x: 0, y: 0 };
  var running = true;

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  function hexNum(h) {
    return parseInt(String(h).replace("#", ""), 16);
  }
  function ease(t, kind) {
    t = Math.min(1, Math.max(0, t));
    if (kind === "smoothstep") return t * t * (3 - 2 * t);
    if (kind === "easeInOutCubic") return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return t;
  }

  function deepMerge(a, b) {
    if (!b) return a;
    Object.keys(b).forEach(function (k) {
      if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) a[k] = deepMerge(a[k] || {}, b[k]);
      else a[k] = b[k];
    });
    return a;
  }

  function reducedNow() {
    if (CFG.a11y.reducedMotion === "force") return true;
    if (CFG.a11y.reducedMotion === "off") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

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

  function applyChrome() {
    var w = CFG.world;
    var rail = CFG.copyRail;
    document.documentElement.style.setProperty("--ink", w.background);
    document.body.style.background = w.background;
    var spacer = $(".reel-spacer");
    if (spacer) spacer.style.height = w.scrollHeightVh + "vh";
    var grain = $("#grain");
    if (grain) grain.style.opacity = String(w.grainOpacity);
    var vig = $("#vignette");
    if (vig) {
      vig.style.background =
        "radial-gradient(120% 90% at 50% 42%, transparent 42%, rgba(2,4,6," + w.vignette + ") 100%)";
    }
    var cr = $(".copy-rail");
    if (cr) {
      cr.style.width = rail.maxWidth;
      cr.style.background = rail.overlayGradient;
      if (rail.side === "right") {
        cr.style.left = "auto";
        cr.style.right = "0";
        cr.style.background = rail.overlayGradient.replace("90deg", "270deg");
      } else {
        cr.style.left = "0";
        cr.style.right = "auto";
      }
    }
    var meta = $(".stage-meta");
    if (meta) meta.style.display = rail.stageIndexVisible ? "" : "none";
    var dots = $(".seq-dots");
    if (dots) dots.style.display = rail.dotsVisible ? "" : "none";
    var chips = $(".chips");
    if (chips) chips.style.display = rail.chipsVisible ? "" : "none";
    document.body.classList.toggle("is-2d", !!CFG.debug.force2d || reducedNow());
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
    paintCopy(Math.max(0, painted < 0 ? 0 : painted));
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

  function drawCover(img, w, h, alpha) {
    if (!img || !img.width) return;
    var ir = img.width / img.height;
    var cr = w / h;
    var dw, dh, dx, dy;
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
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function scrollProgress() {
    var reel = $("#reel");
    if (!reel) return 0;
    var total = reel.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    var y = -reel.getBoundingClientRect().top;
    return Math.min(1, Math.max(0, y / total));
  }

  function beatFromT(t) {
    var n = Math.max(BEATS.length - 1, 1);
    return Math.min(BEATS.length - 1, Math.max(0, Math.round(t * n)));
  }

  function paintCopy(i) {
    var beat = BEATS[i];
    if (!beat) return;
    var c = copyOf(beat);
    if ($("#copy-k")) $("#copy-k").textContent = c.k;
    if ($("#copy-h")) $("#copy-h").textContent = c.h;
    if ($("#copy-p1")) $("#copy-p1").textContent = c.p1;
    if ($("#copy-p2")) $("#copy-p2").textContent = c.p2;
    if ($("#copy-cap")) $("#copy-cap").textContent = c.cap;
    if ($("#copy-lore")) $("#copy-lore").hidden = !beat.lore;
    if ($("#frame-num")) $("#frame-num").textContent = String(i).padStart(2, "0");
    if ($("#frame-act")) $("#frame-act").textContent = beat.act === "II" ? UI[pack()].actII : UI[pack()].actI;
    $$(".seq-dots button").forEach(function (b, n) {
      b.classList.toggle("on", n === i);
    });
    $$(".chip").forEach(function (ch) {
      ch.classList.toggle("on", ch.getAttribute("data-act") === beat.act);
    });
    var hudBeat = $("#hud-beat");
    if (hudBeat) hudBeat.textContent = String(i).padStart(2, "0") + " · t " + scrollT.toFixed(3);
  }

  function setCopyHold(t) {
    var n = Math.max(BEATS.length - 1, 1);
    var f = t * n;
    var frac = f - Math.floor(f);
    var card = $("#copy-card");
    if (!card) return;
    var passing = frac > CFG.copyRail.passHigh || frac < CFG.copyRail.passLow;
    card.classList.toggle("is-pass", passing && t > 0.01 && t < 0.99);
  }

  function paintBlend(t) {
    if (!ctx || !canvas) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var n = frames.length;
    if (!n) return;
    t = ease(t, CFG.motion.easing);
    var f = t * Math.max(n - 1, 1);
    var i0 = Math.floor(f);
    var i1 = Math.min(n - 1, i0 + 1);
    var u = f - i0;
    ctx.fillStyle = CFG.world.background;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(Math.round(w * CFG.plates.fallbackShift), 0);
    drawCover(frames[i0], w, h, 1);
    if (i1 !== i0 && frames[i1]) drawCover(frames[i1], w, h, u);
    ctx.restore();
    var idx = beatFromT(t);
    if (idx !== painted) {
      painted = idx;
      paintCopy(idx);
    }
    setCopyHold(t);
  }

  function size2d() {
    if (!canvas || world) return;
    var dpr = Math.min(window.devicePixelRatio || 1, CFG.world.pixelRatioCap);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBlend(scrollT);
  }

  function jumpToFrame(i) {
    var reel = $("#reel");
    if (!reel) return;
    var total = reel.offsetHeight - window.innerHeight;
    var n = Math.max(BEATS.length - 1, 1);
    var y = reel.offsetTop + (i / n) * total + 2;
    window.scrollTo({
      top: y,
      behavior: CFG.nav.jumpSmooth && !reducedNow() ? "smooth" : "auto",
    });
  }

  function preload() {
    var done = 0;
    return new Promise(function (resolve) {
      BEATS.forEach(function (beat, i) {
        var img = new Image();
        img.decoding = "async";
        img.onload = img.onerror = function () {
          frames[i] = img;
          done += 1;
          setProgress(8 + (done / BEATS.length) * 88);
          if (done === BEATS.length) resolve();
        };
        img.src = beat.src;
      });
    });
  }

  function fillLongread() {
    var host = $("#longread");
    if (!host) return;
    host.innerHTML = BEATS.map(function (b) {
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
        if (CFG.nav.hideOnScroll && !nav.classList.contains("menu-open")) {
          nav.classList.toggle("hide", y > lastY && y > CFG.nav.hideThreshold);
        } else {
          nav.classList.remove("hide");
        }
        lastY = y;
      },
      { passive: true }
    );
    document.documentElement.style.setProperty("--vw", window.innerWidth + "px");
    window.addEventListener("resize", function () {
      document.documentElement.style.setProperty("--vw", window.innerWidth + "px");
      if (world && world.resize) world.resize();
      else size2d();
    });
  }

  function disposeWorld() {
    running = false;
    if (world && world.dispose) world.dispose();
    world = null;
  }

  function initWorld() {
    if (reducedNow() || CFG.debug.force2d || typeof THREE === "undefined") return null;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch (err) {
      return null;
    }
    var cam = CFG.camera;
    var mot = CFG.motion;
    var plt = CFG.plates;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CFG.world.pixelRatioCap));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(hexNum(CFG.world.background), 1);
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(hexNum(CFG.world.fogColor), CFG.world.fogDensity);
    var camera = new THREE.PerspectiveCamera(cam.fov, window.innerWidth / window.innerHeight, cam.near, cam.far);
    camera.position.set(cam.startX, cam.startY, cam.startZ);

    var n = BEATS.length;
    var plates = [];
    var shards = [];
    var beans = [];
    var loader = new THREE.TextureLoader();
    var maxAniso = renderer.capabilities.getMaxAnisotropy();
    var textures = [];

    BEATS.forEach(function (beat, i) {
      var tex = loader.load(beat.src);
      tex.encoding = THREE.sRGBEncoding;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = maxAniso;
      textures.push(tex);
      var aspect = 16 / 9;
      var w = plt.width;
      var h = w / aspect;
      var mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.96,
        depthWrite: true,
        side: THREE.FrontSide,
      });
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      var side = plt.baseX + (i % 2 === 0 ? plt.altA : plt.altB);
      mesh.position.set(side, plt.baseY + Math.sin(i * 0.7) * plt.ySine, -i * mot.gap);
      mesh.rotation.y = plt.rotY;
      mesh.userData.baseX = side;
      mesh.userData.baseY = mesh.position.y;
      mesh.userData.index = i;
      scene.add(mesh);
      plates.push(mesh);

      if (CFG.shards.enabled) {
        var sm = new THREE.Mesh(
          new THREE.PlaneGeometry(w * CFG.shards.scale, h * CFG.shards.scale),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: CFG.shards.opacity, depthWrite: false })
        );
        sm.position.set(CFG.shards.x, CFG.shards.y, -i * mot.gap - CFG.shards.zOffset);
        sm.rotation.y = CFG.shards.rotY;
        sm.userData.phase = i * 0.6;
        scene.add(sm);
        shards.push(sm);
      }
    });

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(48, n * mot.gap + 24),
      new THREE.MeshBasicMaterial({ color: 0x0c1014, transparent: true, opacity: 0.55 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -2.35, -((n - 1) * mot.gap) / 2);
    scene.add(floor);

    if (CFG.particles.enabled) {
      var beanGeo = new THREE.SphereGeometry(1, 10, 8);
      var beanMat = new THREE.MeshBasicMaterial({ color: hexNum(CFG.particles.bean) });
      var cherryMat = new THREE.MeshBasicMaterial({ color: hexNum(CFG.particles.cherry) });
      for (var b = 0; b < CFG.particles.count; b++) {
        var m = new THREE.Mesh(beanGeo, b % 5 === 0 ? cherryMat : beanMat);
        var s = 0.035 + Math.random() * 0.05;
        m.scale.set(s * 1.35, s, s * 0.85);
        m.position.set(
          CFG.particles.minX + Math.random() * CFG.particles.spreadX,
          (Math.random() - 0.4) * 3.2,
          -Math.random() * (n * mot.gap)
        );
        m.userData.spin = 0.2 + Math.random() * 0.6;
        m.userData.drift = 0.04 + Math.random() * 0.08;
        m.userData.baseY = m.position.y;
        scene.add(m);
        beans.push(m);
      }
    }

    var look = new THREE.Vector3(0, 0.1, -4);
    var camTarget = new THREE.Vector3(cam.startX, cam.startY, cam.startZ);
    var lookTarget = new THREE.Vector3(2.15, 0.08, -4);
    var clock = new THREE.Clock();
    var alive = true;

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }

    function tick() {
      if (!alive) return;
      requestAnimationFrame(tick);
      var dt = Math.min(clock.getDelta(), 0.05);
      var c = CFG.camera;
      var mo = CFG.motion;
      var fo = CFG.focus;
      var n1 = Math.max(n - 1, 1);
      var t = ease(scrollT, mo.easing);
      var z = c.startZ - t * (n1 * mo.gap + mo.dollyExtra);
      var weave = Math.sin(t * Math.PI * n1 * 0.35) * c.weave;
      var rightBias = window.innerWidth < c.mobileBreakpoint ? c.rightBiasMobile : c.rightBias;
      camTarget.set(c.startX + weave * 0.12 + pointer.x * c.pointerX, c.startY - 0.03 + pointer.y * c.pointerY, z);
      var nearest = beatFromT(t);
      lookTarget.set(rightBias, c.lookY, z - c.lookAhead);
      camera.fov = c.fov;
      camera.near = c.near;
      camera.far = c.far;
      camera.updateProjectionMatrix();
      camera.position.lerp(camTarget, 1 - Math.pow(c.lerpPower, dt));
      look.lerp(lookTarget, 1 - Math.pow(c.lerpPower, dt));
      camera.lookAt(look);
      scene.fog.density = CFG.world.fogDensity;
      scene.fog.color.setHex(hexNum(CFG.world.fogColor));
      renderer.setClearColor(hexNum(CFG.world.background), 1);

      plates.forEach(function (p, i) {
        var dz = p.position.z - camera.position.z;
        var ahead = -dz;
        var focus = 1 - Math.min(1, Math.abs(ahead - fo.ahead) / fo.range);
        p.material.opacity = fo.opacityIdle + focus * fo.opacityGain;
        var grow = 1 + Math.max(0, 1 - Math.abs(ahead - fo.growAhead) / fo.growRange) * fo.growAmount;
        p.scale.setScalar(grow);
        p.position.x = p.userData.baseX + (1 - focus) * fo.idleDriftX;
        p.position.y = p.userData.baseY + Math.sin(clock.elapsedTime * 0.35 + i) * mo.plateFloat;
        p.rotation.y = fo.rotY - (1 - focus) * fo.rotYIdle;
      });
      shards.forEach(function (s) {
        s.visible = CFG.shards.enabled;
        s.material.opacity = CFG.shards.opacity;
        s.position.x = CFG.shards.x;
        s.position.y = CFG.shards.y + Math.sin(clock.elapsedTime * 0.5 + s.userData.phase) * mo.shardFloat;
        s.rotation.z = Math.sin(clock.elapsedTime * 0.2 + s.userData.phase) * 0.08;
      });
      beans.forEach(function (m) {
        m.visible = CFG.particles.enabled;
        m.rotation.y += m.userData.spin * dt;
        m.position.y = m.userData.baseY + Math.sin(clock.elapsedTime * m.userData.drift * 6 + m.position.z) * mo.beanBob;
      });

      if (nearest !== painted) {
        painted = nearest;
        paintCopy(nearest);
      }
      setCopyHold(t);
      renderer.render(scene, camera);
    }

    running = true;
    tick();
    return {
      resize: resize,
      dispose: function () {
        alive = false;
        textures.forEach(function (tex) {
          tex.dispose();
        });
        plates.forEach(function (p) {
          p.geometry.dispose();
          p.material.dispose();
        });
        renderer.dispose();
      },
    };
  }

  function onScroll() {
    scrollT = scrollProgress();
    if (!world) paintBlend(scrollT);
    var hudBeat = $("#hud-beat");
    if (hudBeat) hudBeat.textContent = String(Math.max(0, painted)).padStart(2, "0") + " · t " + scrollT.toFixed(3);
  }

  var STRUCT = [
    "plates.width",
    "plates.baseX",
    "plates.altA",
    "plates.altB",
    "plates.baseY",
    "plates.ySine",
    "plates.rotY",
    "motion.gap",
    "shards.enabled",
    "shards.scale",
    "shards.zOffset",
    "particles.enabled",
    "particles.count",
    "debug.force2d",
    "a11y.reducedMotion",
    "world.pixelRatioCap",
    "camera.startZ",
  ];

  function pathOf(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o ? o[k] : undefined;
    }, obj);
  }

  function needsRebuild(prev, next) {
    return STRUCT.some(function (p) {
      return pathOf(prev, p) !== pathOf(next, p);
    });
  }

  function persist() {}

  var rebuildTimer = null;
  function rebuildNow() {
    disposeWorld();
    ctx = null;
    if (canvas && !reducedNow() && !CFG.debug.force2d) {
      world = initWorld();
    }
    if (!world && canvas) {
      ctx = canvas.getContext("2d", { alpha: false });
      size2d();
    }
  }
  function applyConfig(next, opts) {
    opts = opts || {};
    var prev = clone(CFG);
    CFG = deepMerge(clone(WALK_DEFAULTS), next);
    applyChrome();
    persist();
    if (opts.rebuild || needsRebuild(prev, CFG)) {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(rebuildNow, opts.rebuild ? 0 : 160);
    }
  }

  function boot() {
    canvas = $("#seq");
    applyChrome();
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
        jumpToFrame(ch.getAttribute("data-act") === "II" ? CFG.nav.actIIIndex : 0);
      });
    });
    window.addEventListener(
      "pointermove",
      function (e) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      },
      { passive: true }
    );

    preload().then(function () {
      world = reducedNow() || CFG.debug.force2d ? null : initWorld();
      if (!world && canvas) {
        ctx = canvas.getContext("2d", { alpha: false });
        size2d();
      }
      paintCopy(0);
      document.body.classList.remove("is-locked");
      var pre = $("#pre");
      if (pre) pre.classList.add("done");
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  function start() {
    var url = "bean-to-cup.walk.json?v=cup7";
    fetch(url)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) {
        CFG = deepMerge(clone(WALK_DEFAULTS), j || {});
      })
      .catch(function () {
        CFG = clone(WALK_DEFAULTS);
      })
      .then(boot);
  }
})();
