document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const mapContainer = document.querySelector('.map-container');
    const modal = document.querySelector('.map-moving-modal');
    const okButton = modal ? modal.querySelector('.map-moving-modal-OK-btn') : null;

    if (!mapContainer || !modal) return;

    // 2. 초기 상태 설정: 모달을 화면 아래로 숨김
    modal.classList.add('modal-initial');
    
    // 3. 맵 컨테이너 클릭 시 모달 표시
    mapContainer.addEventListener('click', () => {
        modal.classList.remove('modal-initial');
        modal.classList.add('is-visible');
    });

    // 4. '확인' 버튼 클릭 시 모달 닫기
    if (okButton) {
        okButton.addEventListener('click', () => {
            modal.classList.remove('is-visible');
            modal.classList.add('modal-initial');
        });
    }
});