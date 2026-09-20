(function (global) {
  const d = global.CKM;
  if (!d || !Array.isArray(d.destinations)) return;

  const dest = d.destinations;
  const byTaluk = {};
  const byCategory = {};
  dest.forEach((p) => {
    byTaluk[p.talukId] = (byTaluk[p.talukId] || 0) + 1;
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });

  function countCategories(ids) {
    return ids.reduce((n, id) => n + (byCategory[id] || 0), 0);
  }

  const interests = [
    {
      id: "peaks-view",
      href: "places.html?interest=peaks-view",
      categories: ["peaks", "viewpoints"],
      image: "assets/mullayanagiri.jpg",
      label: "Peaks and viewpoints",
      kn: "ಶಿಖರಗಳು ಮತ್ತು ನೋಟಗಳು",
      lead: "Grass-and-shola ridges, from Karnataka’s roof to ghat shelves.",
    },
    {
      id: "waterfalls",
      href: "places.html?interest=waterfalls",
      categories: ["waterfalls"],
      image: "assets/hebbe-falls.jpg",
      label: "Waterfalls",
      kn: "ಜಲಪಾತಗಳು",
      lead: "Seasonal cascades — fullest after monsoon, often closed in rain.",
    },
    {
      id: "coffee",
      href: "places.html?interest=coffee",
      categories: ["heritage"],
      image: "assets/coffee-estate.jpg",
      label: "Coffee country",
      kn: "ಕಾಫಿ ನಾಡು",
      lead: "Working shade canopy, ghats, and the slopes that still grow arabica.",
    },
    {
      id: "temples-heritage",
      href: "places.html?interest=temples-heritage",
      categories: ["temples", "forts", "heritage"],
      image: "assets/sringeri.jpg",
      label: "Temples and heritage",
      kn: "ದೇವಾಲಯ ಮತ್ತು ಪರಂಪರೆ",
      lead: "Living mathas, Hoysala stone, and hill forts reached on foot.",
    },
    {
      id: "wildlife",
      href: "places.html?interest=wildlife",
      categories: ["wildlife"],
      image: "assets/kudremukh-np.jpg",
      label: "Wildlife and forests",
      kn: "ವನ್ಯಜೀವಿ ಮತ್ತು ಅರಣ್ಯ",
      lead: "Kudremukh and Bhadra — enter only with a forest permit.",
    },
    {
      id: "family",
      href: "places.html?interest=family",
      categories: ["lakes", "hill-station", "dams"],
      image: "assets/hirekolale.jpg",
      label: "Slow family journeys",
      kn: "ನಿಧಾನ ಕುಟುಂಬ ಪ್ರವಾಸ",
      lead: "Lakes, garden hills and reservoir edges — shorter stops, daylight roads.",
    },
  ].map((item) => ({ ...item, count: countCategories(item.categories) }));

  const featuredHomeIds = [
    "mullayanagiri",
    "baba-budangiri",
    "hebbe-falls",
    "sringeri",
    "kudremukh-np",
    "bhadra-wls",
  ];

  d.canon = {
    destinationCount: dest.length,
    currentAdministrativeTaluks: (d.taluks || []).length,
    mapDisplayRegions: (d.taluks || []).length,
    mapSameAsAdmin: true,
    byTaluk,
    byCategory,
    interests,
    featuredHomeIds,
    highestPoint: { name: "Mullayanagiri", elevationM: 1930 },
    bestTime: "November – February",
    reviewedAt: "2026-09-20",
    seasonSource: {
      label: "District tourism",
      url: "https://chikkamagaluru.nic.in/en/tourism/",
    },
  };

  (d.taluks || []).forEach((t) => {
    t.count = byTaluk[t.id] || 0;
  });
  (d.categories || []).forEach((c) => {
    if (c.id === "all") c.count = dest.length;
    else c.count = byCategory[c.id] || 0;
  });
})(window);
