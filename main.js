// [UPDATE: 2026-08-16] - Hàm điều chỉnh giao diện thanh điều hướng khi người dùng cuộn
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 50px';
            navbar.style.boxShadow = '0 6px 15px rgba(0,0,0,0.2)';
        } else {
            navbar.style.padding = '15px 50px';
            navbar.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        }
    });
}

// [UPDATE: 2026-08-16] - Xử lý sự kiện click để đổi trạng thái active cho danh mục
const categoryCards = document.querySelectorAll('.category-card');
const menuGroups = document.querySelectorAll('#menu .menu-group');

categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        document.querySelector('.category-card.active')?.classList.remove('active');
        card.classList.add('active');

        const target = card.getAttribute('data-target');

        menuGroups.forEach(group => {
            if (target === 'all' || group.id === target) {
                group.classList.add('active');
                group.style.display = 'grid'; 
            } else {
                group.classList.remosve('active');
                group.style.display = 'none'; 
            }
        });
    });
});

// [UPDATE: 2026-08-16] - Xử lý sự kiện click để đổi trạng thái active cho thẻ món ăn
const menuCards = document.querySelectorAll('.card');
menuCards.forEach(card => {
    card.addEventListener('click', () => {
        document.querySelector('.card.active')?.classList.remove('active');
        card.classList.add('active');
    });
});