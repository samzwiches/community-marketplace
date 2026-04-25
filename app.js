const STORAGE_KEY = "community-marketplace-listings";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=60";

const listingForm = document.querySelector("#listingForm");
const listingsGrid = document.querySelector("#listingsGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const sortBy = document.querySelector("#sortBy");
const clearButton = document.querySelector("#clearButton");
const seedButton = document.querySelector("#seedButton");
const cardTemplate = document.querySelector("#listingCardTemplate");
const contactDialog = document.querySelector("#contactDialog");
const contactListingName = document.querySelector("#contactListingName");
const contactMessage = document.querySelector("#contactMessage");
const sendContactButton = document.querySelector("#sendContactButton");

let activeListing = null;

const readListings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const writeListings = (listings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
};

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);

const getFilteredListings = () => {
  const search = searchInput.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const sort = sortBy.value;

  const filtered = readListings().filter((listing) => {
    const matchesCategory = category === "All" || listing.category === category;
    const matchesSearch =
      `${listing.title} ${listing.location} ${listing.description}`
        .toLowerCase()
        .includes(search);

    return matchesCategory && matchesSearch;
  });

  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    priceLow: (a, b) => Number(a.price) - Number(b.price),
    priceHigh: (a, b) => Number(b.price) - Number(a.price),
  };

  return filtered.sort(sorters[sort]);
};

const createCard = (listing) => {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);

  card.querySelector(".listing-image").src = listing.image || FALLBACK_IMAGE;
  card.querySelector(".listing-title").textContent = listing.title;
  card.querySelector(".listing-price").textContent = formatPrice(Number(listing.price));
  card.querySelector(
    ".listing-meta"
  ).textContent = `${listing.category} • ${listing.location} • ${formatDate(
    listing.createdAt
  )}`;
  card.querySelector(".listing-description").textContent = listing.description;

  card.querySelector(".delete-button").addEventListener("click", () => {
    const remaining = readListings().filter((entry) => entry.id !== listing.id);
    writeListings(remaining);
    renderListings();
  });

  card.querySelector(".contact-button").addEventListener("click", () => {
    activeListing = listing;
    contactListingName.textContent = `Listing: ${listing.title}`;
    contactMessage.value = `Hi! Is \"${listing.title}\" still available?`;
    contactDialog.showModal();
  });

  return card;
};

const renderListings = () => {
  const listings = getFilteredListings();
  listingsGrid.replaceChildren();

  if (!listings.length) {
    const state = document.createElement("p");
    state.className = "empty-state";
    state.textContent =
      "No listings match this filter yet. Add one or adjust your search.";
    listingsGrid.append(state);
    return;
  }

  listings.forEach((listing) => listingsGrid.append(createCard(listing)));
};

const addListing = (event) => {
  event.preventDefault();
  const formData = new FormData(listingForm);

  const listing = {
    id: crypto.randomUUID(),
    title: formData.get("title").trim(),
    price: Number(formData.get("price")),
    category: formData.get("category"),
    location: formData.get("location").trim(),
    description: formData.get("description").trim(),
    image: formData.get("image").trim(),
    createdAt: new Date().toISOString(),
  };

  const listings = [listing, ...readListings()];
  writeListings(listings);
  listingForm.reset();
  renderListings();
};

const seedDemoListings = () => {
  const existing = readListings();
  if (existing.length) return;

  const now = Date.now();
  const demo = [
    {
      id: crypto.randomUUID(),
      title: "Mid-century Walnut Desk",
      price: 220,
      category: "Furniture",
      location: "Austin, TX",
      description: "Solid wood desk in excellent condition. Pickup only.",
      image:
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=60",
      createdAt: new Date(now - 3600_000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Nintendo Switch OLED + case",
      price: 250,
      category: "Electronics",
      location: "Seattle, WA",
      description: "Lightly used, includes original dock and charger.",
      image:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=60",
      createdAt: new Date(now - 7200_000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Vintage road bike",
      price: 180,
      category: "Vehicles",
      location: "Portland, OR",
      description: "Great commuter bike, tuned up last month.",
      image:
        "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=900&q=60",
      createdAt: new Date(now - 10800_000).toISOString(),
    },
  ];

  writeListings(demo);
  renderListings();
};

listingForm.addEventListener("submit", addListing);
[searchInput, categoryFilter, sortBy].forEach((input) => {
  input.addEventListener("input", renderListings);
  input.addEventListener("change", renderListings);
});

clearButton.addEventListener("click", () => {
  if (!confirm("Delete all listings? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderListings();
});

seedButton.addEventListener("click", seedDemoListings);

sendContactButton.addEventListener("click", (event) => {
  event.preventDefault();

  if (!activeListing) {
    contactDialog.close();
    return;
  }

  const message = contactMessage.value.trim();
  if (!message) return;

  alert(
    `Message queued for ${activeListing.title}:\n\n${message}\n\n(You can wire this up to email, SMS, or chat next.)`
  );
  activeListing = null;
  contactDialog.close();
});

renderListings();
