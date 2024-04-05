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

let popupRating = 0;
const burger = document.querySelector(".logo");
const menu = document.querySelector(".burger");
const nameInput = document.querySelector('.popup__header input[type="text"]');
const commentInput = document.getElementById("comment");
const submitPopupButton = document.querySelector(".popup__button-submit");

burger.addEventListener("click", () => {
  menu.classList.toggle("active");
});
