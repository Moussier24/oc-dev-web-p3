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
  /* 
    Charger les catégories des projets et les enregistrer dans le local storage
*/
  return fetch(`${API_URL}/categories`)
    .then((response) => response.json())
    .then((categories) => {
      localStorage.setItem("categories", JSON.stringify(categories));
      displayPortfolioWorksCategories(categories);
    });
}

function addWork(formElement) {
  /*
    Ajouter un projet
    */
  let workFormData = new FormData(formElement);
  let errorMessage = document.getElementById("add-work-error");
  errorMessage.style.display = "none";
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
    } else {
      if (response.status === 401) {
        errorMessage.textContent =
          "Vous devez être connecté pour ajouter un projet";
      } else if (response.status === 400) {
        errorMessage.textContent = "Veuillez remplir tous les champs";
      } else {
        errorMessage.textContent = "Une erreur s'est produite";
      }
      errorMessage.style.display = "block";
    }
  });
}

function resetAddForm() {
  /* 
    Réinitialiser le formulaire d'ajout de projet
    */
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
  /* 
    Supprimer un projet
    */
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
  /* 
    Afficher les catégories dans le filtre de la page d'accueil
    */
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
  /* 
    Ajouter les catégories au select du formulaire d'ajout de projet
    */
  const categoriesSelectElement = document.querySelector("#work-category");
  categoriesSelectElement.innerHTML = "";
  categories.forEach((category) => {
    const optionElement = document.createElement("option");
    optionElement.value = category.id;
    optionElement.textContent = category.name;
    categoriesSelectElement.appendChild(optionElement);
  });
}

function displayPortfolioWorks(works) {
  /*
    Afficher les projets dans la page d'accueil
    */
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
  /* 
    Afficher les projets dans la modale d'édition des projets
    */
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
  /* 
    Filtrer les projets par catégorie et afficher les projets correspondants
    */
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
  /* 
    Vérifier si l'utilisateur est connecté et mettre à jour le dataset de la balise body
    */
  const token = localStorage.getItem("token");
  let bodyElement = document.querySelector("body");
  if (token) {
    bodyElement.dataset.login = "true";
  } else {
    bodyElement.dataset.login = "false";
  }
}

function logout() {
  /* 
    Déconnecter l'utilisateur et rediriger vers la page d'accueil
    */
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  window.location.href = "/";
}

function previewInputImage() {
  /* 
    Afficher l'image sélectionnée dans le formulaire d'ajout de projet
    */
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

function checkAddWorkForm() {
  /* 
    Vérifier si le formulaire d'ajout de projet est valide
    */
  let formElement = document.querySelector("#add-work-form");
  let imageInput = formElement.querySelector("#image");
  let image = imageInput.files[0];
  let formData = new FormData(formElement);
  let isFormValid = true;
  if (!image || !formData.get("title") || !formData.get("category")) {
    isFormValid = false;
  }
  let submitButton = document.querySelector("#submit-work-button");
  if (isFormValid) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
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
  checkAddWorkForm();
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

// fermer la modale d'ajout de projet si l'utilisateur clique en dehors de la modale
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      resetAddForm();
      modal.close();
    }
  });
});

document
  .querySelector("#add-work-form")
  .addEventListener("input", function (event) {
    event.preventDefault();
    checkAddWorkForm();
  });

document.querySelector("#image").addEventListener("change", function (event) {
  let errorMessage = document.querySelector("#add-work-error");
  errorMessage.style.display = "none";
  if (event.target.files.length === 0) {
    return;
  }
  // afficher un message d'erreur si le fichier est plus grand que 4Mo et n'est pas un jpg ou png
  if (event.target.files[0].size > 4000000) {
    errorMessage.textContent = "L'image ne doit pas dépasser 4Mo";
    errorMessage.style.display = "block";
    return;
  }
  if (
    event.target.files[0].type !== "image/jpeg" &&
    event.target.files[0].type !== "image/jpg" &&
    event.target.files[0].type !== "image/png"
  ) {
    errorMessage.textContent = "L'image doit être au format jpg ou png";
    errorMessage.style.display = "block";
    return;
  }
  previewInputImage();
});

document
  .querySelector("#add-work-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let formElement = event.target;
    addWork(formElement);
  });
