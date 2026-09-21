/* Bean to cup — Kage-inspired scroll walk. Coffee stills only. No Kyoto hall. */
(function () {
  "use strict";

  var STORAGE_LANG = "ckm-lang";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STILLS = [
    { id: "hero", src: "assets/bean-to-cup/story-00-baba-budan.webp" },
    { id: "saint", src: "assets/bean-to-cup/story-00-baba-budan.webp" },
    { id: "plant", src: "assets/bean-to-cup/story-01-plant.webp" },
    { id: "mocha", src: "assets/bean-to-cup/story-02-mocha.webp" },
    { id: "seeds", src: "assets/bean-to-cup/story-03-seeds.webp" },
    { id: "voyage", src: "assets/bean-to-cup/story-04-voyage.webp" },
    { id: "hermitage", src: "assets/bean-to-cup/story-05-hermitage.webp" },
    { id: "estate", src: "assets/bean-to-cup/story-06-estate.webp" },
    { id: "shade-work", src: "assets/bean-to-cup/story-07-shade-work.webp" },
    { id: "guest", src: "assets/bean-to-cup/story-08-guest.webp" },
    { id: "shade", src: "assets/bean-to-cup/01-shade.webp" },
    { id: "cherry", src: "assets/bean-to-cup/02-cherry.webp" },
    { id: "seed", src: "assets/bean-to-cup/03-seed.webp" },
    { id: "roast", src: "assets/bean-to-cup/04-roast.webp" },
    { id: "brew", src: "assets/bean-to-cup/05-brew.webp" },
    { id: "cup", src: "assets/bean-to-cup/06-cup.webp" },
    { id: "close", src: "assets/bean-to-cup/06-cup.webp" },
  ];

  var KN = {
    "nav.home": "ಮನೆ",
    "nav.explore": "ಅನ್ವೇಷಿಸಿ",
    "nav.places": "ಸ್ಥಳಗಳು",
    "nav.stories": "ಕಥೆಗಳು",
    "nav.here": "ಬೀನ್ ಟು ಕಪ್",
    "nav.plan": "ಯೋಜನೆ",
    "hero.kicker": "ಕಾಫಿ ಈ ಬೆಟ್ಟಕ್ಕೆ ಹೇಗೆ ಬಂತು",
    "hero.title": "ಬಾಬಾ ಬುದನ್, ನಂತರ ಕಪ್",
    "hero.sub": "ಮೋಚಾದ ಏಳು ಬೀಜ, ಚಂದ್ರ ದ್ರೋಣದ ಅಂಗಳ, ನೆರಳಿನ ಸಾಲು, ಡವರದಲ್ಲಿ ಬೆಳಗು. ಎರಡು ಅಂಕ: ಮೊದಲು ಸಂತ, ನಂತರ ಬೆಳೆ. ಅಂಗಡಿ ಅಲ್ಲ.",
    "hero.cue": "ಸ್ಕ್ರಾಲ್",
    "chip.i.b": "ಮೂಲ",
    "chip.i.p": "ಸಂತನ ಬೆಟ್ಟ",
    "chip.ii.b": "ಬೀಜ",
    "chip.ii.p": "ಏಳು ಮೋಚಾ",
    "chip.iii.b": "ನೆರಳು",
    "chip.iii.p": "ಬೆಳೆದ ಬೆಟ್ಟ",
    "chip.iv.b": "ಕಪ್",
    "chip.iv.p": "ಡವರ",
    "peek.b": "ನೆರಳಿನ ಹಾದಿ",
    "peek.i": "೦೯",
    "act1.k": "ಅಂಕ ೦೧",
    "act1.h": "ಏಳು ಬೀಜ ಈ ಬೆಟ್ಟಕ್ಕೆ",
    "act2.k": "ಅಂಕ ೦೨",
    "act2.h": "ನೆರಳಿನಿಂದ ಡವರಕ್ಕೆ",
    "c00.k": "೦೦ · ಸಂತ",
    "c00.h": "ಬಾಬಾ ಬುದನ್, ಈ ಬೆಟ್ಟದ ಹೆಸರು",
    "c00.p1": "ಕಾಫಿ ಈ ಜಿಲ್ಲೆಗೆ ಕಪ್‌ನಿಂದ ಬರಲಿಲ್ಲ. ಸೂಫಿ ಸಂತನ ಕಥೆಯಿಂದ ಬಂತು: ಯೆಮೆನಿನ ಮೋಚಾದಿಂದ ಏಳು ಬೀಜ, ಚಂದ್ರ ದ್ರೋಣದ ಆಶ್ರಮದ ಅಂಗಳದಲ್ಲಿ ನೆಟ್ಟದು.",
    "c00.p2": "ವರ್ಷಗಳು ಒಪ್ಪುವುದಿಲ್ಲ. ಬೆಟ್ಟ ಒಪ್ಪುತ್ತದೆ. ಈ ಪುಟ ಅಂಗಡಿ ಅಲ್ಲ. ಎರಡು ಅಂಕ: ಮೊದಲು ಸಂತ, ನಂತರ ಬೆಳೆ.",
    "c00.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ಬಾಬಾ ಬುದನ್, ಏಳು ಮೋಚಾ ಬೀಜ. ಇತಿಹಾಸದ ಭಾವಚಿತ್ರವಲ್ಲ.",
    "c01.k": "೦೧ · ಗಿಡ",
    "c01.h": "ಮಂಜು ಇಷ್ಟಪಡುವ ಪೊದೆ",
    "c01.p1": "ಕಪ್ ಆಗುವ ಮೊದಲು ಕಾಫಿ ಕೆಂಪು ಹಣ್ಣು. ಮೋಡ ಇಷ್ಟ, ಬಿಸಿಲು ಅಲ್ಲ. ಆ ಗಿಡ ಈ ಘಟ್ಟಕ್ಕೆ ಬರುವ ಮೊದಲು ಬಹು ದೂರ ನಡೆದಿತ್ತು.",
    "c01.p2": "ಚಂದ್ರ ದ್ರೋಣದಲ್ಲಿ ಬೇರು ಬಿಟ್ಟದ್ದು ಇನ್ನೂ ಅದೇ ಗಿಡ: ನೆರಳು ಬೇಕು, ಮಳೆ ನಿಧಾನ, ಸಮಯ ಬೇಕು.",
    "c01.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ಮಂಜಿನಲ್ಲಿ ಅರಬಿಕಾ. ಇಥಿಯೋಪಿಯಾ ಸಮೀಕ್ಷೆಯಲ್ಲ.",
    "c02.k": "೦೨ · ಮೋಚಾ",
    "c02.h": "ಕಪ್ ಮಾರಿದ ಬಂದರು",
    "c02.p1": "ಯೆಮೆನ್ ತೀರದಲ್ಲಿ ಮೋಚಾ ಎಂದರೆ ಕಾಫಿ ಎಂದೇ ಆಯಿತು. ಹುರಿದ ಕುಡಿಯುವುದನ್ನು ಮಾರಿದರು. ಜೀವಂತ ಬೀಜ ಬೇರೆ ಮಾತು.",
    "c02.p2": "ಗಿಡ ಮನೆಯಲ್ಲಿ ಉಳಿದರೆ ಜಗತ್ತು ಗ್ರಾಹಕ. ಆ ಬಂದರಿನಿಂದ ಹೊರಟದ್ದು ಕುಡಿಯಲು, ನೆಡಲು ಅಲ್ಲ.",
    "c02.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ಮೋಚಾ ಬಂದರು. ಐತಿಹಾಸಿಕ ಸಮೀಕ್ಷೆಯಲ್ಲ.",
    "c03.k": "೦೩ · ಏಳು ಬೀಜ",
    "c03.h": "ಈ ಬೆಟ್ಟದ ಅಂಗಳ",
    "c03.p1": "ಈ ಬೆಟ್ಟದ ಸೂಫಿ ಏಳು ಮೋಚಾ ಬೀಜ ತಂದು ಬಾಬಾ ಬುದನ್ ಗಿರಿಯ ಆಶ್ರಮದ ಅಂಗಳದಲ್ಲಿ ನೆಟ್ಟನೆಂದು ಹೇಳುತ್ತಾರೆ. ಕೆಲವು ಕಥೆಗಳು ಸುಮಾರು ೧೬೦೦. ಮತ್ತೆ ಕೆಲವು ಹಜ್‌ನಿಂದ ೧೬೭೦ರ ಹತ್ತಿರ.",
    "c03.p2": "ವರ್ಷಗಳು ವಾದ. ಬೆಟ್ಟ ವಾದವಲ್ಲ. ಅದು ಇನ್ನೂ ಅವನ ಹೆಸರು ಹೊತ್ತಿದೆ. ಗಿಡಗಳು ಇನ್ನೂ ಅದೇ ಮಂಜು ಇಷ್ಟಪಡುತ್ತವೆ.",
    "c03.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ಏಳು ಬೀಜ ನೆಡುವುದು. ದಿನಾಂಕದ ಪುನರ್ನಿರ್ಮಾಣವಲ್ಲ.",
    "c04.k": "೦೪ · ಹಜ್ ಕಥೆ",
    "c04.h": "ಬೆಟ್ಟ ಇನ್ನೂ ಹೇಳುವುದು",
    "c04.p1": "ಬೀಜಗಳೊಂದಿಗೆ ನಡೆಯುವ ಕಥೆ ಕಳ್ಳಸಾಗಣೆಯದು: ಏಳು ಕಚ್ಚಾ ಬೀನ್, ಏಳು ಪವಿತ್ರ, ಗಡ್ಡದಲ್ಲಿ ಅಥವಾ ಬಟ್ಟೆಯಲ್ಲಿ — ಬಂದರು ಕಾಡು ಹೊರಡುವುದನ್ನು ನೋಡದಂತೆ.",
    "c04.p2": "ಯಾವುದೇ ಹಡಗಿನ ಪುಸ್ತಕ ಇದನ್ನು ದೃಢಪಡಿಸುವುದಿಲ್ಲ. ಜಿಲ್ಲೆ ಹೇಳುತ್ತಲೇ ಇದೆ. ಬೆಟ್ಟ ನಂಬಿ. ಗಡ್ಡವನ್ನು ಕಥೆಯೆಂದು ಇರಿಸಿ.",
    "c04.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ದೋಣಿ, ಬಟ್ಟೆಯ ಚೀಲ. ದಿನಾಂಕದ ಪಯಣವಲ್ಲ. ಕಥೆ.",
    "c05.k": "೦೫ · ಚಂದ್ರ ದ್ರೋಣ",
    "c05.h": "ಬೆಳೆಗಿಂತ ಮೊದಲು ತೋಟ",
    "c05.p1": "ಮೊದಲ ಗಿಡಗಳು ರಾತ್ರಿಯಲ್ಲಿ ಭೂದೃಶ್ಯವಾಗಲಿಲ್ಲ. ಬಹುಕಾಲ ಅಂಗಳದ ಕುತೂಹಲ — ಮನೆಯ ಹಿಂದೆ ಕೆಲವು ಮರ, ಚಾರ್ಮಾಡಿ ರಸ್ತೆಯ ಬೆಳ್ಳಿ ಓಕ್ ಸಾಲಲ್ಲ.",
    "c05.p2": "ಚಂದ್ರ ದ್ರೋಣ ಮೊದಲು ತೋಟ ಹಿಡಿದಿತ್ತು, ಎಸ್ಟೇಟ್ ಅಲ್ಲ. ಗುಡಿ ಇನ್ನೂ ಆ ಬೆಟ್ಟದಲ್ಲಿದೆ. ಬೆಳೆ ಇಲ್ಲಿ ತಾಳ್ಮೆ ಕಲಿತಿತು.",
    "c05.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ಗುಹೆ ಆಶ್ರಮ, ಸಸಿ. ದೇವಸ್ಥಾನದ ನಕ್ಷೆಯಲ್ಲ.",
    "c06.k": "೦೬ · ಎಸ್ಟೇಟ್",
    "c06.h": "ಕಾಡು ಸಾಲು ಕಲಿತಾಗ",
    "c06.p1": "ಸಾಲುಗಳು ನಂತರ ಬಂದವು. ೧೮೨೦ರ ದಶಕದಲ್ಲಿ ಈ ಬೆಟ್ಟದ ಪಕ್ಕದಲ್ಲಿ ನಾಟಿ ಆರಂಭ. ಬೆಳೆ ವಯನಾಡು, ಶೆವರಾಯ್, ನೀಲಗಿರಿಗೆ ನಡೆಯಿತು.",
    "c06.p2": "ಆಶ್ರಮದ ಮರ ಬೆಟ್ಟದ ಕೆಲಸವಾಯಿತು — ನೆರಳು ಅಳೆದು, ಹಾದಿ ಹೆಸರಿಸಿ, ಭುಜದ ಮೇಲೆ ಬಂಗಲೆ.",
    "c06.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ನೆರಳಿನ ಸಾಲು, ಬಂಗಲೆ. ಯಾವುದೇ ಎಸ್ಟೇಟ್‌ನ ಭಾವಚಿತ್ರವಲ್ಲ.",
    "c07.k": "೦೭ · ನೆರಳಿನ ಕೆಲಸ",
    "c07.h": "ಬಸ್ಸಿನಿಂದ ಕಾಣುವುದು",
    "c07.p1": "ಮೂಡಿಗೆರೆಯಿಂದ ಬಾಳೆಹೊನ್ನೂರಿನ ನಡುವೆ ನೋಡಿದರೆ ಕೆಲಸ ಕಾಣುತ್ತದೆ: ಎರಡು ನೆರಳು, ತೊಂಟೆಯಲ್ಲಿ ಮೆಣಸು, ಕೆಳಗೆ ಅರಬಿಕಾ. ಕರ್ನಾಟಕ ಇನ್ನೂ ಭಾರತದ ಬೆಳೆಯ ದೊಡ್ಡ ಪಾಲು ಬೆಳೆಯುತ್ತದೆ.",
    "c07.p2": "೧೯೨೫ರಲ್ಲಿ ಈ ಜಿಲ್ಲೆಯ ಬಾಳೆಹೊನ್ನೂರಿನ ಹತ್ತಿರ ಪ್ರಯೋಗ ಕೇಂದ್ರ ತೆರೆಯಿತು. ಕಿಟಕಿಯಿಂದ ನೀವು ಚಿತ್ರಿಸುವ ಹಸಿರು ಯಾರೋ ಒಬ್ಬರ ಋತು.",
    "c07.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ಬೆಳ್ಳಿ ಓಕ್, ಮೆಣಸು ಬಳ್ಳಿ. ಸಿಎಂಆರ್‌ಐ ಭಾವಚಿತ್ರವಲ್ಲ.",
    "c08.k": "೦೮ · ಅತಿಥಿ",
    "c08.h": "ಅತಿಥಿಯಂತೆ ನಡೆ",
    "c08.p1": "ಈ ಪುಟ ಕಪ್ಪಿಂಗ್, ಬಂಗಲೆ, ಅಥವಾ ಬೇರೆಯವರ ಬೆಳ್ಳಿ ಓಕ್‌ನಲ್ಲಿ ಜೀಪ್ ಮಾರುವುದಿಲ್ಲ. ಯಾರಾದರೂ ಹಾದಿ ತೆರೆದರೆ ಅದು ಅವರ ಬಾಗಿಲು. ಅದರಲ್ಲೇ ಇರಿ.",
    "c08.p2": "ಏಳು ಬೀಜ ಜನ ಹೇಳುವ ಕಥೆ. ನೆರಳು ಜೀವಂತ ಕಾಡಿನಲ್ಲಿ ಜೀವಂತ ಬೆಳೆ. ಕಪ್ ಕುಡಿ. ಸಾಲುಗಳನ್ನು ಹಾಗೆಯೇ ಬಿಡು.",
    "c08.cap": "ಸಂಗಾತಿ ಚಿತ್ರ — ನೆರಳಿನ ಹಾದಿ. ಈ ಪುಟ ವಾಸ ಅಥವಾ ಪ್ರವಾಸ ಮಾರುವುದಿಲ್ಲ.",
    "c09.k": "೦೯ · ನೆರಳು",
    "c09.h": "ಮೊದಲ ಬೆಳಕಿನ ಹಾದಿ",
    "c09.p1": "ಬೆಳೆಯ ನಡಿಗೆ ರಸ್ತೆ ಮುಗಿದಲ್ಲಿ ಆರಂಭವಾಗುತ್ತದೆ. ಬೆಳ್ಳಿ ಓಕ್ ಕೆಳಗೆ ಅರಬಿಕಾ, ಕಣಿವೆಯಲ್ಲಿ ಹಬೆ, ಹಾದಿಯಲ್ಲಿ ಒದ್ದೆ ಮಣ್ಣು.",
    "c09.p2": "ಈ ಪುಟ ಎಸ್ಟೇಟ್ ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ. ನೆರಳು ಏಕೆ ಬೇಕು ಎಂಬುದನ್ನು ಮಾತ್ರ ಹೇಳುತ್ತದೆ — ಮಲೆನಾಡಿನ ಕಾಫಿ ಬಿಸಿಲಿನಲ್ಲಿ ಅಲ್ಲ, ಮಬ್ಬಿನಲ್ಲಿ ಬೆಳೆಯುತ್ತದೆ.",
    "c09.cap": "ನೆರಳು ಬೆಳೆದ ಅರಬಿಕಾ — ಬೆಳಗಿನ ಹೊಗೆ, ಬೆಳ್ಳಿ ಓಕ್.",
    "c10.k": "೧೦ · ಹಣ್ಣು",
    "c10.h": "ಕೆಂಪು ಹಣ್ಣಿನಲ್ಲಿ ಬೀಜ",
    "c10.p1": "ಕಾಫಿ ಮೊದಲು ಕಪ್ ಅಲ್ಲ. ಅದು ಎಲೆಯ ನಡುವೆ ಕೆಂಪು ಹಣ್ಣು. ತೊಗಟೆ ಸಿಹಿ; ಒಳಗೆ ಎರಡು ಬೀಜ.",
    "c10.p2": "ಕೆಂಪಾದಾಗ ಕೀಳುತ್ತಾರೆ. ಹಸಿರು ಉಳಿದರೆ ರುಚಿ ಹುಳಿ. ಇದು ಅಡುಗೆ ಪುಸ್ತಕವಲ್ಲ — ಗಿಡದ ಮೇಲೆ ನೋಡುವ ಕಥೆ.",
    "c10.cap": "ಹಸಿರು ಕೊಂಬೆಯಲ್ಲಿ ಕೆಂಪು ಅರಬಿಕಾ ಹಣ್ಣು.",
    "c11.k": "೧೧ · ಬೀಜ",
    "c11.h": "ಮೂರು ಹೆಸರು, ಒಂದು ಬೀಜ",
    "c11.p1": "ತೊಗಟೆ ತೆಗೆದರೆ ಒಳಗೆ ತಿಳಿ ಹೊದಿಕೆ. ಅದನ್ನು ಒಣಗಿಸಿದರೆ ಹಸಿರು ಬೀನ್. ಮೂರೂ ಒಂದೇ ಪ್ರಯಾಣ.",
    "c11.p2": "ಗಿರಣಿ ಈ ಜಿಲ್ಲೆಯಲ್ಲಿ ಉಳಿದಿದೆ. ಈ ಪುಟ ಯಾವುದೇ ಬ್ರಾಂಡ್ ಮಾರುವುದಿಲ್ಲ. ಬೀಜ ಹೇಗೆ ಹೆಸರು ಬದಲಾಯಿಸುತ್ತದೆ ಎಂಬುದು ಮಾತ್ರ.",
    "c11.cap": "ಹಣ್ಣು, ಪಾರ್ಚ್‌ಮೆಂಟ್, ಹಸಿರು ಬೀನ್ — ಒಂದೇ ಬೀಜದ ಮೂರು ರೂಪ.",
    "c12.k": "೧೨ · ಬೆಂಕಿ",
    "c12.h": "ಡ್ರಮ್‌ನಲ್ಲಿ ಬೆಳಗು",
    "c12.p1": "ಹಸಿರು ಬೀನ್‌ಗೆ ವಾಸನೆ ಇಲ್ಲ. ಬೆಂಕಿ ಸಿಹಿ ಹೊರತಂದಾಗಲೇ ಕಪ್ ಆರಂಭ.",
    "c12.p2": "ಹುರಿತದ ಮಟ್ಟ ಊರಿಗೆ, ಮನೆಗೆ ಬದಲಾಗುತ್ತದೆ. ಇಲ್ಲಿ ಫಿಲ್ಟರ್ ಕಾಫಿಗೆ ಹೊಂದುವ ಹುರಿತವನ್ನು ತೋರಿಸಿದೆ — ಮೆನು ಅಲ್ಲ.",
    "c12.cap": "ಹುರಿಯುವ ಡ್ರಮ್‌ನಲ್ಲಿ ಕಂದು ಬೀನ್, ಉಗಿ.",
    "c13.k": "೧೩ · ಫಿಲ್ಟರ್",
    "c13.h": "ಎರಡು ಉಕ್ಕಿನ ಬಾರೆಲ್",
    "c13.p1": "ಮಲೆನಾಡು ಈ ರೀತಿ ಕುಡಿಯುತ್ತದೆ: ಮೇಲಿನ ಡಬ್ಬದಲ್ಲಿ ಪುಡಿ, ಕೆಳಗೆ ಡಿಕಾಕ್ಷನ್. ಆವಿಯೇ ಸಮಯ.",
    "c13.p2": "ಕೆಫೆ ಪಟ್ಟಿ ಅಲ್ಲ. ಮನೆಯ ಕಾಫಿ. ಈ ತಾಣ ಯಾವುದೇ ಕೋಪವನ್ನು ಮಾರುವುದಿಲ್ಲ.",
    "c13.cap": "ಮಲೆನಾಡಿನ ಫಿಲ್ಟರ್: ನೀರು, ಪುಡಿ, ಮರದ ಮೇಜು.",
    "c14.k": "೧೪ · ಕಪ್",
    "c14.h": "ಡವರದಲ್ಲಿ ಬೆಳಗು",
    "c14.p1": "ಕಪ್ ಎಂದರೆ ಇಲ್ಲಿ ಡವರ. ಹಾಲು ಬೇಕಾದರೆ ಮನೆಯ ನಿಯಮ. ಬೆಟ್ಟ ಇನ್ನೂ ಕಿಟಕಿಯಲ್ಲಿದೆ.",
    "c14.p2": "ಏಳು ಬೀಜದಿಂದ ಈ ಲೋಹದ ಕಪ್‌ವರೆಗೆ ಒಂದೇ ನಡಿಗೆ. ಅಂಗಡಿ ಅಲ್ಲ. ಕಥೆ, ನಂತರ ಬೆಳೆ.",
    "c14.cap": "ಉಗಿ ಬರುವ ಡವರ, ಹಿಂದೆ ಕಾಫಿ ಬೆಟ್ಟ.",
    "fin.k": "ಮುಕ್ತಾಯ",
    "fin.h": "ಕುಡಿ. ಸಾಲು ಬಿಡು.",
    "fin.p": "ಏಳು ಮೋಚಾ ಬೀಜದಿಂದ ಡವರದವರೆಗೆ ಒಂದೇ ನಡಿಗೆ. ಈ ಪುಟ ಅಂಗಡಿ ಅಲ್ಲ. ಬೆಟ್ಟ ನಂಬಿ. ಕಥೆಯನ್ನು ಕಥೆಯೆಂದು ಇರಿಸಿ.",
    "cta.home": "ಸಂಗಾತಿಗೆ ಹಿಂದಿರುಗಿ",
    "cta.baba": "ಬಾಬಾ ಬುದನ್ ಗಿರಿ",
    "foot.note": "ಸ್ವತಂತ್ರ ಸಂಗಾತಿ. ಸರ್ಕಾರಿ ತಾಣವಲ್ಲ. ಬುಕಿಂಗ್ ಅಲ್ಲ.",
    "pre.jp": "ಚಿಕ್ಕಮಗಳೂರು",
    "pre.l": "ಏಳು ಬೀಜ",
    "pre.r": "ಒಂದು ಕಪ್",
  };

  var EN = {};
  var lang = localStorage.getItem(STORAGE_LANG) || "en";
  var bgLayers = [];
  var lastBg = -1;
  var gl = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
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
      d.data[i + 3] = 48;
    }
    x.putImageData(d, 0, 0);
    var g = $("#grain");
    if (g) g.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
  }

  function applyLang() {
    var kn = lang === "kn";
    document.documentElement.lang = kn ? "kn" : "en";
    $$("[data-i]").forEach(function (el) {
      var k = el.getAttribute("data-i");
      if (!k) return;
      if (kn && KN[k]) el.textContent = KN[k];
      else if (EN[k]) el.textContent = EN[k];
    });
    var tog = $("[data-lang-toggle]");
    if (tog) {
      tog.textContent = kn ? "English" : "ಕನ್ನಡ";
      tog.setAttribute("aria-pressed", kn ? "true" : "false");
    }
  }

  function captureEnglish() {
    $$("[data-i]").forEach(function (el) {
      var k = el.getAttribute("data-i");
      if (k && !EN[k]) EN[k] = el.textContent;
    });
  }

  function buildBg() {
    var host = $("#story-bg");
    if (!host) return;
    STILLS.forEach(function (s, i) {
      var el = document.createElement("i");
      el.style.backgroundImage = "url(" + s.src + ")";
      if (i === 0) el.className = "on";
      host.appendChild(el);
      bgLayers.push(el);
    });
  }

  function setBg(index) {
    if (index === lastBg) return;
    lastBg = index;
    bgLayers.forEach(function (el, i) {
      el.classList.toggle("on", i === index);
    });
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
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".nav-link", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("menu-open");
          burger.classList.remove("active");
          document.documentElement.classList.remove("nav-open");
        });
      });
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!nav) return;
        var y = window.scrollY;
        nav.classList.toggle("stuck", y > 24);
        if (!nav.classList.contains("menu-open")) {
          nav.classList.toggle("hide", y > lastY && y > 120);
        }
        lastY = y;
      },
      { passive: true }
    );
    document.documentElement.style.setProperty("--vw", window.innerWidth + "px");
    window.addEventListener("resize", function () {
      document.documentElement.style.setProperty("--vw", window.innerWidth + "px");
    });
  }

  function wireCursor() {
    var dot = $(".cur-dot");
    if (!dot || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    window.addEventListener(
      "pointermove",
      function (e) {
        dot.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
      },
      { passive: true }
    );
    document.addEventListener("pointerover", function (e) {
      var hit = e.target.closest("a,button,.chip,.card");
      dot.classList.toggle("act", !!hit);
    });
  }

  function reveal() {
    var nodes = $$("[data-rv]");
    if (!nodes.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.classList.add("rv-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("rv-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function jumpTo(hash) {
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function wireJumps() {
    $$("[data-jump]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var h = el.getAttribute("data-jump");
        if (!h) return;
        e.preventDefault();
        jumpTo(h);
      });
    });
    $$(".rail button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var h = btn.getAttribute("data-jump");
        if (h) jumpTo(h);
      });
    });
  }

  function sectionIndex() {
    var secs = $$("[data-cam]");
    var mid = window.innerHeight * 0.42;
    var best = 0;
    var bestD = Infinity;
    secs.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var c = r.top + r.height * 0.35;
      var d = Math.abs(c - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return { i: best, secs: secs };
  }

  function wireScrollChrome() {
    var chips = $$(".chip");
    var rails = $$(".rail button");
    function tick() {
      var info = sectionIndex();
      var id = info.secs[info.i] && info.secs[info.i].id;
      chips.forEach(function (c) {
        var j = c.getAttribute("data-jump");
        c.classList.toggle("on", j === "#" + id || (id && j && document.querySelector(j) && info.secs[info.i].closest(j)));
      });
      if (id === "hero") chips.forEach(function (c, n) { if (n === 0) c.classList.add("on"); });
      if (id === "act-origin" || (info.i > 0 && info.i < 11)) {
        chips.forEach(function (c, n) {
          if (n === 0 && info.i < 5) c.classList.add("on");
          if (n === 1 && info.i >= 5 && info.i < 11) c.classList.add("on");
        });
      }
      if (info.i >= 11 && info.i < 18) {
        chips.forEach(function (c, n) {
          c.classList.toggle("on", n === 2);
        });
      }
      if (id === "bean-cup" || id === "close") {
        chips.forEach(function (c, n) {
          c.classList.toggle("on", n === 3);
        });
      }
      rails.forEach(function (b, n) {
        b.classList.toggle("on", n === Math.min(n, info.i));
      });
      var cam = info.secs[info.i] && info.secs[info.i].getAttribute("data-cam");
      var idx = cam ? parseInt(cam, 10) : 0;
      if (!isNaN(idx)) setBg(Math.max(0, Math.min(bgLayers.length - 1, idx)));
      if (gl && gl.onScroll) gl.onScroll(info);
    }
    window.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  function initGL() {
    var canvas = $("#gl");
    if (!canvas || reduced || typeof THREE === "undefined") return null;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      document.documentElement.classList.add("no-webgl");
      return null;
    }
    if (!renderer.getContext()) {
      document.documentElement.classList.add("no-webgl");
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.028);
    var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 220);
    camera.position.set(0, 0.4, 8);

    var loader = new THREE.TextureLoader();
    var plates = [];
    var lookPts = [];
    var camPts = [];
    var uniqueSrc = [];
    var seen = {};
    STILLS.forEach(function (s) {
      if (!seen[s.src]) {
        seen[s.src] = true;
        uniqueSrc.push(s.src);
      }
    });

    function texOf(src, cb) {
      loader.load(
        src,
        function (tex) {
          tex.encoding = THREE.sRGBEncoding;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          cb(tex);
        },
        undefined,
        function () {
          cb(null);
        }
      );
    }

    uniqueSrc.forEach(function (src, n) {
      texOf(src, function (tex) {
        if (!tex) return;
        var w = 7.2;
        var h = w * (9 / 16);
        var mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.92,
          side: THREE.FrontSide,
          depthWrite: true,
        });
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        var z = -n * 11;
        var x = (n % 2 === 0 ? -1.15 : 1.25) * (n === 0 ? 0 : 1);
        var y = 0.15 + Math.sin(n * 0.7) * 0.22;
        mesh.position.set(x, y, z);
        mesh.rotation.y = x > 0 ? -0.18 : 0.18;
        mesh.userData.baseY = y;
        mesh.userData.baseX = x;
        mesh.userData.lift = 0;
        scene.add(mesh);
        plates.push(mesh);
        lookPts[n] = new THREE.Vector3(x * 0.35, y, z);
        camPts[n] = new THREE.Vector3(x * -0.35, y + 0.35, z + 8.2);
      });
    });

    var mistGeo = new THREE.PlaneGeometry(40, 18);
    var mistMat = new THREE.MeshBasicMaterial({
      color: 0x1a120c,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    var mist = new THREE.Mesh(mistGeo, mistMat);
    mist.position.set(0, -2.4, -20);
    mist.rotation.x = -Math.PI / 2.4;
    scene.add(mist);

    var ray = new THREE.Raycaster();
    var pointer = new THREE.Vector2(-2, -2);
    window.addEventListener(
      "pointermove",
      function (e) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      { passive: true }
    );

    var targetPos = new THREE.Vector3(0, 0.4, 8);
    var targetLook = new THREE.Vector3(0, 0.2, 0);
    var look = new THREE.Vector3(0, 0.2, 0);
    var tCam = 0;

    function onScroll(info) {
      var secs = info.secs;
      var i = info.i;
      var a = secs[i];
      if (!a) return;
      var r = a.getBoundingClientRect();
      var local = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / Math.max(r.height, 1)));
      var nPlates = Math.max(plates.length - 1, 1);
      var mapped = (i / Math.max(secs.length - 1, 1)) * nPlates;
      tCam = Math.min(nPlates, Math.max(0, mapped + local * 0.35));
    }

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener("resize", resize);

    var clock = new THREE.Clock();
    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      var n = plates.length;
      if (n > 1) {
        var f = tCam;
        var i0 = Math.floor(f);
        var i1 = Math.min(n - 1, i0 + 1);
        var u = f - i0;
        var c0 = camPts[i0] || targetPos;
        var c1 = camPts[i1] || c0;
        var l0 = lookPts[i0] || targetLook;
        var l1 = lookPts[i1] || l0;
        targetPos.lerpVectors(c0, c1, u);
        targetLook.lerpVectors(l0, l1, u);
      }
      camera.position.lerp(targetPos, 1 - Math.pow(0.001, dt));
      look.lerp(targetLook, 1 - Math.pow(0.001, dt));
      camera.lookAt(look);

      ray.setFromCamera(pointer, camera);
      var hits = ray.intersectObjects(plates);
      var hit = hits[0] && hits[0].object;
      plates.forEach(function (p) {
        var want = p === hit ? 1 : 0;
        p.userData.lift += (want - p.userData.lift) * 0.08;
        p.position.y = p.userData.baseY + p.userData.lift * 0.28;
        p.scale.setScalar(1 + p.userData.lift * 0.06);
        p.material.opacity = 0.78 + p.userData.lift * 0.2;
      });
      mist.position.z = camera.position.z - 22;
      renderer.render(scene, camera);
    }
    frame();
    return { onScroll: onScroll };
  }

  function finishPre() {
    var pre = $("#pre");
    document.body.classList.remove("is-locked");
    if (!pre) return;
    pre.classList.add("done");
  }

  function boot() {
    captureEnglish();
    applyLang();
    $("[data-lang-toggle]") &&
      $("[data-lang-toggle]").addEventListener("click", function () {
        lang = lang === "kn" ? "en" : "kn";
        localStorage.setItem(STORAGE_LANG, lang);
        applyLang();
      });
    makeGrain();
    buildBg();
    wireNav();
    wireCursor();
    wireJumps();
    reveal();
    setProgress(12);

    var jobs = 0;
    var total = STILLS.length;
    function ping() {
      jobs += 1;
      setProgress(12 + (jobs / total) * 80);
      if (jobs >= total) {
        setProgress(100);
        setTimeout(function () {
          gl = initGL();
          wireScrollChrome();
          finishPre();
        }, reduced ? 40 : 420);
      }
    }
    STILLS.forEach(function (s) {
      var img = new Image();
      img.onload = ping;
      img.onerror = ping;
      img.src = s.src;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
