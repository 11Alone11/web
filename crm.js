document
  .getElementById("article-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const datetime = document.getElementById("datetime").value;
    const submitButton = e.target.querySelector("button[type='submit']");
    const index = submitButton.dataset.index; // Получаем индекс, если мы обновляем статью

    let articles = JSON.parse(localStorage.getItem("articles")) || [];
    if (index !== undefined) {
      // Обновляем существующую статью
      articles[index] = { title, datetime };
      delete submitButton.dataset.index; // Удаляем индекс после обновления
      submitButton.textContent = "Сохранить статью"; // Меняем текст кнопки обратно
    } else {
      // Добавляем новую статью
      articles.unshift({ title, datetime });
    }

    localStorage.setItem("articles", JSON.stringify(articles)); // Обновляем или добавляем статью в localStorage
    this.reset(); // Сброс формы
    updateArticlesDisplay(); // Обновляем отображение статей
  });

updateArticlesDisplay(); // Первоначальное отображение статей

function deleteArticle(index) {
  let articles = JSON.parse(localStorage.getItem("articles")) || [];
  articles.splice(index, 1); // Удаляем статью из массива
  localStorage.setItem("articles", JSON.stringify(articles)); // Обновляем localStorage
  updateArticlesDisplay(); // Обновляем вид
  document.getElementById("article-form").reset(); // Сбрасываем форму
  const submitButton = document.querySelector(
    "#article-form button[type='submit']"
  );
  if (submitButton.textContent === "Обновить статью") {
    submitButton.textContent = "Сохранить статью";
    delete submitButton.dataset.index; // Удаляем индекс, если он есть
  }
}

// Функция для обновления статьи (предполагается, что у вас есть форма для обновления)
function updateArticle(index) {
  let articles = JSON.parse(localStorage.getItem("articles")) || [];
  // Заполняем форму текущими данными статьи
  document.getElementById("title").value = articles[index].title;
  document.getElementById("datetime").value = articles[index].datetime;
  // Устанавливаем "data-index" для кнопки отправки, чтобы знать, какую статью обновляем
  const submitButton = document.querySelector(
    "#article-form button[type='submit']"
  );
  submitButton.textContent = "Обновить статью";
  submitButton.dataset.index = index;
}

function updateArticlesDisplay() {
  const container = document.querySelector(".articles");
  container.innerHTML = ""; // Очищаем контейнер перед обновлением
  const articles = JSON.parse(localStorage.getItem("articles")) || [];

  articles.forEach((article, index) => {
    const articleHTML = `
    <div class="info-slide">
      <p class="title">Название: ${article.title}</p>
      <p class="date">Дата: ${new Date(article.datetime).toLocaleString()}</p>
      <div class="buttons">
      <button class="button" onclick="updateArticle(${index})">Обновить</button>
      <button class="button" onclick="deleteArticle(${index})">Удалить</button>
      </div>
    </div>
  `;

    container.insertAdjacentHTML("beforeend", articleHTML);
  });
}

document.getElementById("search-input").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  updateArticlesDisplay(searchTerm);
});

document.getElementById("sort-button").addEventListener("click", function () {
  const startDatetime = document.getElementById("start-datetime").value;
  const endDatetime = document.getElementById("end-datetime").value;
  updateArticlesDisplay(null, startDatetime, endDatetime);
});

function updateArticlesDisplay(
  searchTerm = "",
  startDatetime = "",
  endDatetime = ""
) {
  const container = document.querySelector(".articles");
  container.innerHTML = ""; // Очищаем контейнер перед обновлением
  let articles = JSON.parse(localStorage.getItem("articles")) || [];

  // Фильтрация по поисковому запросу, если он есть
  if (searchTerm) {
    articles = articles.filter((article) =>
      article.title.toLowerCase().includes(searchTerm)
    );
  }

  // Сортировка по временному промежутку, если он задан
  if (startDatetime && endDatetime) {
    const start = new Date(startDatetime).getTime();
    const end = new Date(endDatetime).getTime();
    articles = articles.filter((article) => {
      const articleTime = new Date(article.datetime).getTime();
      return articleTime >= start && articleTime <= end;
    });
  }

  // Теперь продолжаем отображать статьи как ранее
  articles.forEach((article, index) => {
    const articleHTML = `
    <div class="info-slide">
      <p class="title">Название: ${article.title}</p>
      <p class="date">Дата: ${new Date(article.datetime).toLocaleString()}</p>
      <div class="buttons">
      <button class="button" onclick="updateArticle(${index})">Обновить</button>
      <button class="button" onclick="deleteArticle(${index})">Удалить</button>
      </div>
    </div>
  `;
    container.insertAdjacentHTML("beforeend", articleHTML);
  });
}

// Вызовите эту функцию, чтобы инициализировать отображение статей при загрузке
updateArticlesDisplay();

//db
document.addEventListener("DOMContentLoaded", () => {
  let db;

  const form = document.getElementById("book-form");
  const titleInput = document.getElementById("book-title");
  const authorInput = document.getElementById("author");
  const descriptionInput = document.getElementById("description");
  const priceInput = document.getElementById("price");
  const imageInput = document.getElementById("image");
  const ratingInput = document.getElementById("rating");
  const booksContainer = document.querySelector(".books");

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
      booksContainer.innerHTML = ""; // Clear the container
      books.forEach((book) => {
        const bookElement = document.createElement("article");
        bookElement.className = "book";
        bookElement.innerHTML = `
            <img class="book__img" src="${book.image}" alt="${book.title}" />
            <div class="book__info">
            <a href="/book.html?id=${book.id}" class="book__title">${book.title}</a>
              <p class="book__author">${book.author}</p>
              <p class="book__description">${book.description}</p>
              <p class="book__price">$${book.price}</p>
            </div>
            <button style="margin-top: 12px" class="button" onclick="deleteBook(${book.id})">Удалить</button>
          `;
        booksContainer.appendChild(bookElement);
      });
    };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const uniqueId = new Date().getTime();
    console.log(ratingInput.value);
    const bookData = {
      id: uniqueId,
      title: titleInput.value,
      author: authorInput.value,
      description: descriptionInput.value,
      price: parseFloat(priceInput.value),
      rating: +ratingInput.value + 1,
      image: "", // Placeholder for image data
    };

    if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
        bookData.image = e.target.result; // Convert image file to Data URL
        addBook(bookData);
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      addBook(bookData); // Add book without image
    }
  });

  function addBook(book) {
    const transaction = db.transaction(["books"], "readwrite");
    const objectStore = transaction.objectStore("books");
    const request = objectStore.add(book);

    request.onsuccess = function () {
      loadBooks(); // Reload the list of books
    };

    request.onerror = function (e) {
      console.error("Error adding book", e);
    };
  }

  window.deleteBook = function (id) {
    const transaction = db.transaction(["books"], "readwrite");
    const objectStore = transaction.objectStore("books");
    const request = objectStore.delete(id);

    request.onsuccess = function () {
      loadBooks(); // Reload the list of books
    };
  };
});
