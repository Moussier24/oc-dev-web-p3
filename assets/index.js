const API_URL = "http://localhost:5678/api";

function getWorks() {
  /* Charger les projets et les enregistrer dans le local storage */
  return fetch(`${API_URL}/works`)
    .then((response) => response.json())
    .then((works) => {
      localStorage.setItem("works", JSON.stringify(works));
      displayPortfolioWorks(works);
    });
}

function getWorksCategories() {
  return fetch(`${API_URL}/categories`)
    .then((response) => response.json())
    .then((categories) => displayPortfolioWorksCategories(categories));
}

function addWork(image, title) {
  return fetch(`${API_URL}/works`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(work),
  })
    .then((response) => response.json())
    .then((data) => data.work);
}

function deleteWork(id) {
  return fetch(`${API_URL}/works/${id}`, {
    method: "DELETE",
  });
}

function displayPortfolioWorksCategories(categories) {
  categories.forEach((category) => {
    const filtersElement = document.querySelector("#categories-filter");
    const categoryElement = document.createElement("li");
    //categoryElement.innerHTML = `<button class="filters-button" data-id=${category.id}>${category.name}</button>`;
    const buttonElement = document.createElement("button");
    buttonElement.classList.add("filters-button");
    buttonElement.setAttribute("data-id", category.id);
    buttonElement.textContent = category.name;
    buttonElement.addEventListener("click", handleCategoryFilter);
    categoryElement.appendChild(buttonElement);
    filtersElement.appendChild(categoryElement);
  });
}

function displayPortfolioWorks(works) {
  const galleryElement = document.querySelector("#portfolio .gallery");
  galleryElement.innerHTML = "";
  works.forEach((work) => {
    const workElement = document.createElement("figure");
    workElement.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}">
                <figcaption>${work.title}</figcaption>
            `;
    galleryElement.appendChild(workElement);
  });
}

function handleCategoryFilter(event) {
  const filterButton = event.target;
  let categoryId = filterButton.getAttribute("data-id"); // Récupérer le id de la catégorie
  categoryId = categoryId === "all" ? categoryId : parseInt(categoryId); // Convertir le id en entier
  let works = JSON.parse(localStorage.getItem("works")); // Récupérer les projets depuis le local storage
  // Filtrer les projets par catégorie
  works =
    categoryId === "all"
      ? works
      : works.filter((work) => work.categoryId === categoryId);
  // Mettre à jour le bouton actif
  const activeFilterButton = document.querySelector(".filters-button-active");
  if (activeFilterButton) {
    activeFilterButton.classList.remove("filters-button-active");
  }
  filterButton.classList.add("filters-button-active");
  // Afficher les projets
  displayPortfolioWorks(works);
}

document.addEventListener("DOMContentLoaded", () => {
  getWorks();
  getWorksCategories();
});

document
  .querySelector(".filters-button")
  .addEventListener("click", handleCategoryFilter);
