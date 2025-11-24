document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.querySelector(".logo-container");
  const modal = document.querySelector(".modal");
  const screen = document.querySelector(".screen");
  const confirmBtn = document.querySelector(".btn-confirm");

  function openModal() {
    screen.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    screen.classList.remove("show");
    document.body.style.overflow = "";
  }

  // 로고 클릭시 모달 열기
  if (logoContainer) {
    logoContainer.addEventListener("click", openModal);
  }

  // 확인 버튼 클릭시 모달 닫기
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      closeModal();
      // 실제로 메인 화면으로 이동하는 로직
      console.log("메인 화면으로 이동");
      // window.location.href = "/main";
    });
  }

  // 오버레이 클릭시 모달 닫기
  if (screen) {
    screen.addEventListener("click", (e) => {
      if (e.target === screen) {
        closeModal();
      }
    });
  }

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && screen.classList.contains("show")) {
      closeModal();
    }
  });
});
