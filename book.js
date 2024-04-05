const navLinks = document.querySelectorAll(".header__nav-link");
navLinks.forEach((link) => {
  link.onmouseover = () => {
    link.classList.add("animation-active");
  };
  link.onmouseout = () => {
    if (!link.classList.contains("animation-active")) {
      link.classList.add("animation-active");
    }
  };
});

const bookId = getBookIdFromQuery();
let popupRating = 0;
let editingReviewIndex = -1;
const burger = document.querySelector(".logo");
const menu = document.querySelector(".burger");
const nameInput = document.querySelector('.popup__header input[type="text"]');
const commentInput = document.getElementById("comment");
const submitPopupButton = document.querySelector(".popup__button-submit");
const stars = document.querySelectorAll(".popup__star");

function getBookIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  console.log(params.get("id"));
  return params.get("id"); // вернёт `null`, если параметр `id` не найден
}

function generateRatingStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star">${i < rating ? "&#9733;" : "&#9734;"}</span>`;
  }
  return stars;
}

renderReviews();

document.addEventListener("click", function (event) {
  if (event.target === popup) {
    closePopup();
  }
});

function loadBookDetails(id) {
  const transaction = db.transaction(["books"], "readonly");
  const objectStore = transaction.objectStore("books");
  const request = objectStore.get(Number(id));

  request.onerror = function (e) {
    console.error("Error fetching book", e);
  };

  request.onsuccess = function (e) {
    const book = e.target.result;
    if (book) {
      // Теперь заполните детали книги на странице
      document.querySelector(".card__title").textContent = book.title;
      document.querySelector(".card__author").textContent = book.author;
      document.querySelector(".card__description").textContent =
        book.description;
      document.querySelector(".card__price").textContent = `$${book.price}`;
      // Предполагается, что у вас есть функция для отображения звёзд рейтинга
      document.querySelector(".card__rating").innerHTML = generateRatingStars(
        book.rating
      );
      // Установите изображение, если оно есть
      if (book.image) {
        document.querySelector(".card__img").src = book.image;
      }
    } else {
      console.error("Book not found");
    }
  };
}

function loadBookReviews(id) {
  const reviews = JSON.parse(localStorage.getItem("reviews")) || {};
  return reviews[id] || []; // вернёт пустой массив, если для книги нет отзывов
}

function displayReviews(reviews) {
  const reviewsContainer = document.querySelector(".reviews__inner");
  reviewsContainer.innerHTML = ""; // Очистить существующие отзывы

  reviews.forEach((review, index) => {
    let starsHTML = "";
    for (let i = 0; i < 5; i++) {
      starsHTML += `<span class="review__star">${
        i < review.rating ? "&#9733;" : "&#9734;"
      }</span>`;
    }
    const reviewElement = document.createElement("div");
    reviewElement.classList.add("review");
    reviewElement.setAttribute("data-index", index);
    reviewElement.innerHTML = `
      <img class="delete" src="/images/delete.svg" alt="" />
      <div class="review__inner">
        <div class="review__header">
          <p class="review__author">${review.name}</p>
          <div class="review__rating">${starsHTML}</div>
        </div>
        <p class="review__text">${review.comment}</p>
      </div>
    `;

    // Добавляем обработчик события dblclick для редактирования отзыва
    reviewElement.addEventListener(
      "dblclick",
      () => editReview(index) // Передаем bookId в функцию editReview
    );

    // Добавляем созданный элемент в контейнер отзывов
    reviewsContainer.appendChild(reviewElement);
  });
}

let db; // Глобальная переменная для базы данных

document.addEventListener("DOMContentLoaded", () => {
  const openRequest = indexedDB.open("BooksStore", 1);

  openRequest.onupgradeneeded = function (e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
    }
  };

  openRequest.onerror = function (e) {
    console.error("Error opening db", e);
  };

  openRequest.onsuccess = function (e) {
    db = e.target.result;

    if (bookId) {
      loadBookDetails(bookId);
      const reviews = loadBookReviews(bookId);
      displayReviews(reviews); // Эта функция будет вызвана сразу после загрузки данных о книге
      renderReviews(); // Эта функция вызовется после того, как данные из localStorage будут получены и обработаны
    } else {
      console.error("Book id not found in query string");
    }
  };
});

burger.addEventListener("click", () => {
  menu.classList.toggle("active");
});

stars.forEach((star, index) => {
  star.addEventListener("click", () => {
    setRating(index + 1);
  });
});

nameInput.addEventListener("input", updateSubmitButtonState);
commentInput.addEventListener("input", updateSubmitButtonState);
submitPopupButton.addEventListener("click", function (event) {
  console.log("Кнопка подтверждения нажата"); // Проверка, что событие срабатывает
  submitReview();
});

const popup = document.getElementById("popup");
const openPopupButton = document.getElementById("openPopup");
const closePopupButton = document.querySelector(".popup__button-close");

function openPopup() {
  editingReviewIndex = -1;
  popup.classList.remove("out");
}

function closePopup() {
  popup.classList.add("out");
}

openPopupButton.addEventListener("click", openPopup);

closePopupButton.addEventListener("click", closePopup);

function attachDeleteHandlers() {
  const deleteButtons = document.querySelectorAll(".review .delete");
  deleteButtons.forEach((button, index) => {
    button.addEventListener("click", () => deleteReview(index));
  });
}

function renderReviews() {
  if (!bookId) {
    console.error("Book ID not found");
    return;
  }
  const reviewsContainer = document.querySelector(".reviews__inner");
  const reviewsData = JSON.parse(localStorage.getItem("reviews")) || {};
  const reviews = reviewsData[bookId] || [];

  if (reviewsContainer) {
    reviewsContainer.innerHTML = "";
    if (reviews.length > 0) {
      reviews.forEach((review, index) => {
        let starsHTML = "";
        for (let i = 0; i < 5; i++) {
          starsHTML += `<span class="review__star">${
            i < review.rating ? "&#9733;" : "&#9734;"
          }</span>`;
        }
        const reviewElement = document.createElement("div");
        reviewElement.classList.add("review");
        reviewElement.setAttribute("data-index", index);
        reviewElement.innerHTML = `
          <img class="delete" src="/images/delete.svg" alt="" />
          <div class="review__inner">
            <div class="review__header">
              <p class="review__author">${review.name}</p>
              <div class="review__rating">${starsHTML}</div>
            </div>
            <p class="review__text">${review.comment}</p>
          </div>
        `;

        // Добавляем обработчик события dblclick для редактирования отзыва
        reviewElement.addEventListener("dblclick", () => editReview(index));

        // Добавляем созданный элемент в контейнер отзывов
        reviewsContainer.appendChild(reviewElement);
      });

      document.querySelector(".reviews__empty").classList.add("hidden");
      reviewsContainer.classList.remove("hidden");
    } else {
      reviewsContainer.classList.add("hidden");
      document.querySelector(".reviews__empty").classList.remove("hidden");
    }
  } else {
    console.error("Не найден контейнер для отзывов (.reviews)");
  }
  attachDeleteHandlers();
}

function editReview(index) {
  editingReviewIndex = index;
  const reviews = JSON.parse(localStorage.getItem("reviews")) || {};
  if (reviews[bookId] && reviews[bookId][index]) {
    const review = reviews[bookId][index];
    openPopup();
    fillPopupWithReviewData(review, index);
  } else {
    console.error("Не удалось найти отзыв для редактирования");
  }
}

function fillPopupWithReviewData(review, index) {
  // Заполняем попап данными для редактирования
  nameInput.value = review.name;
  commentInput.value = review.comment;
  setRating(review.rating);
  editingReviewIndex = index; // Сохраняем индекс редактируемого отзыва
}

function submitReview() {
  const name = document.querySelector(
    '.popup__header input[type="text"]'
  ).value;
  const comment = document.querySelector("#comment").value;
  const rating = popupRating;

  if (name && comment && rating) {
    if (editingReviewIndex >= 0) {
      updateReview(editingReviewIndex, name, comment, rating, bookId);
      document.querySelector('.popup__header input[type="text"]').value = "";
      document.querySelector("#comment").value = "";
      setRating(0);
      closePopup();
    } else {
      addReview(name, comment, rating);
      document.querySelector('.popup__header input[type="text"]').value = "";
      document.querySelector("#comment").value = "";
      setRating(0);
      closePopup();
    }
  } else {
    alert("Пожалуйста, заполните все поля и выберите рейтинг.");
  }
}

function addReview(name, comment, rating) {
  // Убедимся, что bookId доступен в этой функции
  const bookId = getBookIdFromQuery();
  if (bookId) {
    let reviews = JSON.parse(localStorage.getItem("reviews")) || {};
    if (!reviews[bookId]) {
      reviews[bookId] = [];
    }
    reviews[bookId].push({ name, comment, rating });
    localStorage.setItem("reviews", JSON.stringify(reviews));
    renderReviews(); // Обновляем отображение отзывов
  } else {
    console.error("Book ID is undefined or null");
  }
}

function updateReview(index, name, comment, rating) {
  let reviews = JSON.parse(localStorage.getItem("reviews")) || {};
  if (reviews[bookId] && reviews[bookId][index]) {
    reviews[bookId][index] = { name, comment, rating };
    localStorage.setItem("reviews", JSON.stringify(reviews));
    renderReviews(); // Обновляем отображение отзывов
  }
}

function deleteReview(index) {
  let reviews = JSON.parse(localStorage.getItem("reviews")) || {};
  if (!reviews[bookId] || !reviews[bookId][index]) {
    console.error("Не удалось найти отзыв для удаления");
    return;
  }

  if (confirm("Вы уверены, что хотите удалить этот отзыв?")) {
    // Удаление отзыва из массива
    reviews[bookId].splice(index, 1);
    localStorage.setItem("reviews", JSON.stringify(reviews)); // Сохраняем изменения
    displayReviews(reviews[bookId]); // Перерисовка отзывов
    renderReviews();
  }
}

function attachDeleteHandlers() {
  const deleteButtons = document.querySelectorAll(".review .delete");
  deleteButtons.forEach((button, index) => {
    button.addEventListener("click", () => deleteReview(index, bookId));
  });
}

function updateSubmitButtonState() {
  const nameFilled = nameInput.value.trim() !== "";
  const commentFilled = commentInput.value.trim() !== "";
  const ratingSelected = popupRating > 0;

  if (nameFilled && commentFilled && ratingSelected) {
    submitPopupButton.removeAttribute("disabled");
  } else {
    submitPopupButton.setAttribute("disabled", "disabled");
  }
}

function setRating(rating) {
  for (let i = 0; i < stars.length; i++) {
    if (i < rating) {
      stars[i].innerHTML = "&#9733;";
      stars[i].style.color = "black";
    } else {
      stars[i].innerHTML = "&#9734;";
      stars[i].style.color = "grey";
    }
  }

  popupRating = rating;
  updateSubmitButtonState();
  console.log(`Выбрано звёзд: ${rating}`);
}
