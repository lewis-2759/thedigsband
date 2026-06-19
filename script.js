const header = document.querySelector("[data-header]");
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");
const scheduleList = document.querySelector("[data-schedule-list]");
const galleryImages = Array.from(document.querySelectorAll(".gallery-grid img"));
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrevious = document.querySelector(".lightbox-previous");
const lightboxNext = document.querySelector(".lightbox-next");
let activeImageIndex = 0;

function showGalleryImage(index) {
  activeImageIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[activeImageIndex];
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
}

function openLightbox(index) {
  showGalleryImage(index);
  document.body.classList.add("lightbox-open");
  lightbox.showModal();
}

function closeLightbox() {
  lightbox.close();
}

galleryImages.forEach((image, index) => {
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Expand image: ${image.alt}`);
  image.addEventListener("click", () => openLightbox(index));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(index);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrevious.addEventListener("click", () => showGalleryImage(activeImageIndex - 1));
lightboxNext.addEventListener("click", () => showGalleryImage(activeImageIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    showGalleryImage(activeImageIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showGalleryImage(activeImageIndex + 1);
  }
});

lightbox.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
});

function formatShowDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit"
  }).format(date);
}

function createShowCard(show) {
  const card = document.createElement(show.url ? "a" : "article");
  card.className = "show-card";

  if (show.url) {
    card.href = show.url;
    card.target = "_blank";
    card.rel = "noopener";
  }

  const date = document.createElement("time");
  date.dateTime = show.date;
  date.textContent = formatShowDate(show.date);

  const details = document.createElement("div");
  const venue = document.createElement("h3");
  const location = document.createElement("p");
  venue.textContent = show.venue;
  location.textContent = show.location;
  details.append(venue, location);

  card.append(date, details);

  if (show.time && show.time.trim()) {
    const time = document.createElement("span");
    time.textContent = show.time;
    card.append(time);
  }

  return card;
}

async function loadSchedule() {
  if (!scheduleList) {
    return;
  }

  try {
    const response = await fetch("schedule.json");

    if (!response.ok) {
      throw new Error(`Schedule request failed: ${response.status}`);
    }

    const shows = await response.json();
    scheduleList.replaceChildren(...shows.map(createShowCard));
  } catch (error) {
    const message = document.createElement("p");
    message.className = "schedule-status";
    message.textContent = "Schedule unavailable. Please check back soon.";
    scheduleList.replaceChildren(message);
    console.error(error);
  }
}

function closeNav() {
  document.body.classList.remove("nav-open");
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    closeNav();
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));
loadSchedule();
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeNav();
  }
});
