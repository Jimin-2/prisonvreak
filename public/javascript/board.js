document.addEventListener("DOMContentLoaded", function () {
  const table = document.querySelector(".table-template");
  
  function adjustHeights() {
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(function (row) {
      const textCell = row.querySelector("td:first-child a");
      const textContainer = textCell.parentElement;

      textContainer.style.height = "auto"; // 초기 높이를 자동으로 설정
      const textHeight = textCell.offsetHeight;
      textContainer.style.height = textHeight + "px";
    });
  }

  // 페이지 로드 시 및 텍스트 내용 변경 시에도 높이 조절
  window.addEventListener("resize", adjustHeights);
  window.addEventListener("input", adjustHeights);

  // 초기 높이 조절
  adjustHeights();
});
