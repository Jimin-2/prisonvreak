const search = document.querySelector(".search");
const btn = document.querySelector(".search-btn");
const input = document.querySelector(".search-input");

btn.addEventListener("click", () => {
  search.classList.toggle("active");
  input.focus();
});