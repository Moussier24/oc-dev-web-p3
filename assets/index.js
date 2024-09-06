const API_URL = "http://localhost:5678/api";

function getWorks() {
  /* Charger les projets et les enregistrer dans le local storage */
  return fetch(`${API_URL}/works`)
    .then((response) => response.json())
    .then((works) => {
      localStorage.setItem("works", JSON.stringify(works));
      displayPortfolioWorks(works);
      const token = localStorage.getItem("token");
      if (token) {
        displayGalleryEditWorks(works);
      }
    });
}

function getWorksCategories() {
  return fetch(`${API_URL}/categories`)
    .then((response) => response.json())
    .then((categories) => {
      localStorage.setItem("categories", JSON.stringify(categories));
      displayPortfolioWorksCategories(categories);
    });
}

function addWork(formElement) {
  let workFormData = new FormData(formElement);
  return fetch(`${API_URL}/works`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: workFormData,
  }).then((response) => {
    if (response.ok) {
      getWorks();
      resetAddForm();
    }
  });
}

function resetAddForm() {
  const formElement = document.querySelector("#add-work-form");
  formElement.reset();
  document.querySelector("#add-work-modal").close();
  document.querySelector("#upload-img-preview").style.display = "none";
  document.querySelector("#upload-img-preview").src = "";
  document.querySelector(
    "#upload-img-preview"
  ).previousElementSibling.style.display = "flex";
}

function deleteWork(id) {
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (response.ok) {
      return getWorks();
    }
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

function addCategoriesOptionsToSelect(categories) {
  const categoriesSelectElement = document.querySelector("#work-category");
  categories.forEach((category) => {
    const optionElement = document.createElement("option");
    optionElement.value = category.id;
    optionElement.textContent = category.name;
    categoriesSelectElement.appendChild(optionElement);
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

function displayGalleryEditWorks(works) {
  const galleryElement = document.querySelector("#edit-gallery");
  galleryElement.innerHTML = "";
  works.forEach((work) => {
    const workElement = document.createElement("figure");
    workElement.classList.add("gallery-edit-item");
    let buttonElement = document.createElement("button");
    buttonElement.classList.add("gallery-edit-delete");
    buttonElement.innerHTML = `
                <i class="fa-solid fa-trash-can"></i>
            `;
    buttonElement.setAttribute("data-id", work.id);
    buttonElement.addEventListener("click", (event) => {
      const element = event.target;
      let workId = element.getAttribute("data-id");
      if (!element.classList.contains("gallery-edit-delete")) {
        let parent = element.closest(".gallery-edit-delete");
        workId = parent.getAttribute("data-id");
      }
      if (workId) {
        deleteWork(workId);
      }
    });
    workElement.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}" class="gallery-edit-img">
            `;
    workElement.appendChild(buttonElement);
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

function checkLoginStatus() {
  const token = localStorage.getItem("token");
  let bodyElement = document.querySelector("body");
  if (token) {
    bodyElement.dataset.login = "true";
  } else {
    bodyElement.dataset.login = "false";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  window.location.href = "/";
}

function previewInputImage() {
  let input = document.querySelector("#image");
  let imageElement = document.querySelector("#upload-img-preview");
  let imageElementSibling = imageElement.previousElementSibling;
  let imageFile = input.files?.[0];
  if (!imageFile) {
    return;
  }
  let imageUrl = URL.createObjectURL(imageFile);
  imageElement.src = imageUrl;
  imageElementSibling.style.display = "none";
  imageElement.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  getWorks();
  getWorksCategories();
  checkLoginStatus();
});

document
  .querySelector(".filters-button")
  .addEventListener("click", handleCategoryFilter);

document.querySelector("#logout-button").addEventListener("click", logout);

document
  .querySelector("#edit-projects-button")
  .addEventListener("click", () => {
    let editProjectsDialodElement = document.querySelector(
      "#edit-gallery-modal"
    );
    editProjectsDialodElement.showModal();
  });

document.querySelector("#add-work-button").addEventListener("click", () => {
  const categories = JSON.parse(localStorage.getItem("categories"));
  addCategoriesOptionsToSelect(categories);
  let addWorkDialogElement = document.querySelector("#add-work-modal");
  previewInputImage();
  addWorkDialogElement.showModal();
});

document.querySelectorAll(".modal .close-modal").forEach((closeButton) => {
  closeButton.addEventListener("click", (event) => {
    let parentModalElement = event.target.closest(".modal");
    resetAddForm();
    parentModalElement.close();
  });
});

document
  .querySelector("#add-work-form")
  .addEventListener("input", function (event) {
    event.preventDefault();
    let formElement = event.target.closest("form");
    let formData = new FormData(formElement);
    console.log(formData);
    let isFormValid = true;
    formData.forEach((value, key) => {
      if (!value) {
        isFormValid = false;
      }
    });
    let submitButton = document.querySelector("#submit-work-button");
    if (isFormValid) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  });

document.querySelector("#image").addEventListener("change", function (event) {
  previewInputImage();
});

document
  .querySelector("#add-work-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let formElement = event.target;
    addWork(formElement);
  });
