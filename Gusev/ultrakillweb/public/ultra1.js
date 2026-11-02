const slider = document.getElementById("page-slider");

if (slider) {
  slider.addEventListener("input", () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo(0, maxScroll * (Number(slider.value) / 100));
  });

  window.addEventListener("scroll", () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    slider.value =
      maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  });
}

document.querySelectorAll('.navigation a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);

    if (!target) {
      console.log("Не найден заголовок с id:", id);
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const toggleButton = document.getElementById("toggle-mechanics");

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const sections = document.querySelectorAll("details.mechanics");
    const shouldOpen = [...sections].some((section) => !section.open);

    sections.forEach((section) => {
      section.open = shouldOpen;
    });

    toggleButton.textContent = shouldOpen
      ? "Свернуть все механики"
      : "Раскрыть все механики";
  });
}
