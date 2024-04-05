document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector("#slides");
  let articles = JSON.parse(localStorage.getItem("articles")) || [];
  let ascending = true;
  // Initially display all articles
  displayArticles(articles);

  const searchInput = document.querySelector("#searchInput");
  const dateInput = document.querySelector("#dateInput");
  const filterButton = document.querySelector("#filterButton");
  const sortButton = document.querySelector("#sortButton"); // Кнопка сортировки

  // Event listener for real-time search filtering
  searchInput.addEventListener("input", function () {
    const searchQuery = searchInput.value.toLowerCase();
    const filteredArticles = articles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery)
    );

    displayArticles(filteredArticles);
  });

  // Event listener for date filtering
  filterButton.addEventListener("click", function () {
    const searchQuery = searchInput.value.toLowerCase();
    const filterDate = dateInput.value ? new Date(dateInput.value) : null;

    const filteredArticles = articles.filter((article) => {
      const titleMatch = article.title.toLowerCase().includes(searchQuery);
      const dateMatch = filterDate
        ? new Date(article.datetime) >= filterDate
        : true;
      return titleMatch && dateMatch;
    });

    displayArticles(filteredArticles);
  });

  sortButton.addEventListener("click", function () {
    ascending = !ascending; // Переключаем направление сортировки

    articles.sort((a, b) => {
      // Сравниваем названия статей для сортировки
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      if (titleA < titleB) return ascending ? -1 : 1;
      if (titleA > titleB) return ascending ? 1 : -1;
      return 0;
    });

    displayArticles(articles);
  });

  function displayArticles(articlesToDisplay) {
    container.innerHTML = ""; // Clear the container
    if (articlesToDisplay.length === 0) {
      const slideDiv = document.createElement("div");
      const titleP = document.createElement("p");

      slideDiv.className = "slide";
      titleP.textContent = "Ничего не найдено";

      slideDiv.appendChild(titleP);

      container.prepend(slideDiv);
    }
    articlesToDisplay.forEach((article) => {
      const slideDiv = document.createElement("div");
      const titleP = document.createElement("p");
      const dateP = document.createElement("p");

      slideDiv.className = "slide";
      titleP.textContent = article.title;
      dateP.textContent = new Date(article.datetime).toLocaleString();

      slideDiv.appendChild(titleP);
      slideDiv.appendChild(dateP);

      container.prepend(slideDiv);
    });
  }
});
