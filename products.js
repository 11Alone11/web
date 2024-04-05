document.addEventListener("DOMContentLoaded", () => {
  let db;

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
    loadBooks();
  };

  function loadBooks() {
    const transaction = db.transaction(["books"], "readonly");
    const objectStore = transaction.objectStore("books");
    const request = objectStore.getAll();

    request.onerror = function (e) {
      console.error("Error fetching books", e);
    };

    request.onsuccess = function (e) {
      const books = e.target.result;
      const booksContainer = document.querySelector(".grid");
      //   booksContainer.innerHTML = ""; // Clear the container

      books.forEach((book) => {
        const ratingStars = generateRatingStars(book.rating); // Предполагаемая функция для генерации звезд рейтинга
        const bookHTML = `
        <article class="book">
        <a href="/book.html?id=${book.id}">
          <img class="book__img" src="${book.image}" alt="${book.title}" />
        </a>
        <div class="">
        <a href="/book.html?id=${book.id}" class="book__title">${book.title}</a>
        <p class="book__author">${book.author}</p>
        <p class="book__description">${book.description}</p>
        <div class="book__rating">
          <div class="book__stars">${ratingStars}</div>
        </div>
        <p class="book__price">$${book.price}</p>
        </div>
      </article>
        `;
        booksContainer.innerHTML += bookHTML; // Добавляем карточку книги к остальным в контейнере
      });
    };
  }

  function generateRatingStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span class="star">${
        i < rating ? "&#9733;" : "&#9734;"
      }</span>`;
    }
    return stars;
  }
});
