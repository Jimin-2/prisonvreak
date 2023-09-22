const navButton = document.querySelector(".nav-button");
const navToggleButton = document.querySelector(".nav-toggle-button");

navButton.addEventListener("click", () => {
  navToggleButton.classList.toggle("active"); // active 클래스 토글
  console.log("Button clicked"); // 클릭 이벤트 발생 시 로그 출력
});
