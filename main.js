// Tắt tính năng tự động ghi nhớ vị trí cuộn của trình duyệt
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
// Ép cuộn lên đầu trang (tọa độ 0, 0)
window.scrollTo(0, 0);

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

        // [NEW] SCROLLSPY - Tự động bôi sáng menu khi cuộn
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        const navLinks = document.querySelectorAll('.nav-menu ul li a');
        navLinks.forEach(a => {
            a.classList.remove('active');
            const href = a.getAttribute('href');

            // Highlight TRANG CHỦ khi ở đầu trang
            if (!current && window.scrollY < 200 && href === 'index.html') {
                a.classList.add('active');
            }
            // Highlight các section tương ứng
            else if (current && href === `#${current}`) {
                a.classList.add('active');
            }
        });
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
                group.classList.remove('active');
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

// =========================================
// LOGIC ĐĂNG NHẬP / ĐĂNG KÝ (LOCALSTORAGE)
// =========================================

// 1. Tạo tài khoản mặc định
function initMockDatabase() {
    let users = JSON.parse(localStorage.getItem('fastfood_users')) || [];
    if (users.length === 0) {
        users.push({ username: 'Khach01', password: '123456' });
        localStorage.setItem('fastfood_users', JSON.stringify(users));
    }
}

// 2. Cập nhật giao diện Navbar
function updateAuthUI() {
    const currentUser = sessionStorage.getItem('fastfood_currentUser');
    const guestView = document.getElementById('guest-view');
    const userView = document.getElementById('user-view');
    const welcomeText = document.getElementById('welcome-text');

    if (currentUser) {
        guestView.style.display = 'none';
        userView.style.display = 'flex';
        welcomeText.textContent = `Xin chào, ${currentUser}!`;
    } else {
        guestView.style.display = 'block';
        userView.style.display = 'none';
    }
}

// 3. Xử lý bật tắt Modal
function openLoginModal() { document.getElementById('login-modal').style.display = 'flex'; }
function openRegisterModal() { document.getElementById('register-modal').style.display = 'flex'; }
function closeModals() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('register-modal').style.display = 'none';
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    if (typeof closeMapModal === 'function') closeMapModal();
}

// Bấm ra ngoài vùng nền đen để đóng
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-overlay')) {
        closeModals();
        if (typeof closeHistoryModal === 'function') closeHistoryModal();
    }
    if (event.target.classList.contains('cart-overlay')) closeCartModal();
});

// 4. Logic Đăng ký
function handleRegister(e) {
    e.preventDefault();
    const userVal = document.getElementById('reg-username').value.trim();
    const passVal = document.getElementById('reg-password').value;

    let users = JSON.parse(localStorage.getItem('fastfood_users')) || [];
    if (users.find(u => u.username === userVal)) {
        showToast('Tên đăng nhập đã tồn tại!', 'error');
        return;
    }

    users.push({ username: userVal, password: passVal });
    localStorage.setItem('fastfood_users', JSON.stringify(users));

    showToast('Đăng ký thành công! Hãy đăng nhập nhé.', 'success');
    closeModals();
    openLoginModal();
}

// 5. Logic Đăng nhập
function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById('login-username').value.trim();
    const passVal = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('fastfood_users')) || [];
    const isValid = users.find(u => u.username === userVal && u.password === passVal);

    if (isValid) {
        sessionStorage.setItem('fastfood_currentUser', userVal);
        showToast('Đăng nhập thành công!', 'success');
        closeModals();
        updateAuthUI();
    } else {
        showToast('Sai tên đăng nhập hoặc mật khẩu!', 'error');
    }
}

// 6. Đăng xuất
function handleLogout() {
    sessionStorage.removeItem('fastfood_currentUser');
    updateAuthUI();
}

// Chạy hàm khởi tạo khi load
initMockDatabase();
updateAuthUI();

// =========================================
// TOAST NOTIFICATION FUNCTION
// =========================================
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Define icon based on type
    const icon = type === 'success' ? '✅' : '❌';

    // HTML structure
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <div class="toast-progress"></div>
    `;

    // Append to container
    toastContainer.appendChild(toast);

    // Trigger reflow for slide in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400); // Wait for transition
    }, 3000);
}

// =========================================
// CART LOGIC
// =========================================

function getCart() {
    return JSON.parse(localStorage.getItem('fastfood_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('fastfood_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = totalItems;
}

// Thêm vào giỏ khi click nút "cart-btn" (Sử dụng Event Delegation)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-btn');
    if (!btn) return;

    const currentUser = sessionStorage.getItem('fastfood_currentUser');
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để mua hàng!', 'error');
        openLoginModal();
        return;
    }

    const card = btn.closest('.card');
    const name = card.querySelector('h3').textContent;
    const priceText = card.querySelector('.price').textContent;
    const price = parseInt(priceText.replace(/\D/g, ''));
    const image = card.querySelector('img').src;

    const cart = getCart();
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }

    saveCart(cart);
    updateCartBadge();
    showToast('Đã thêm vào giỏ hàng', 'success');
});

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const subtotalEl = document.getElementById('cart-subtotal');

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:50px;">Giỏ hàng của bạn đang trống</p>';
        if (totalEl) totalEl.textContent = '0đ';
        if (subtotalEl) subtotalEl.textContent = '0đ';
        updateCartTotal();
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="price">${item.price.toLocaleString('vi-VN')}đ</span>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">&times;</button>
            </div>
        `;
    });

    container.innerHTML = html;
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
    updateCartTotal(subtotal);
}

// =========================================
// HỆ THỐNG MÃ ƯU ĐÃI
// =========================================
const PROMO_CODES = {
    'FASTFOOD10': { type: 'percent', value: 10, label: 'Giảm 10%' },
    'SALE20': { type: 'percent', value: 20, label: 'Giảm 20%' },
    'GIAM50K': { type: 'fixed', value: 50000, label: 'Giảm 50.000đ' },
    'COMBO30': { type: 'percent', value: 30, label: 'Giảm 30%' },
    'FREESHIP': { type: 'fixed', value: 20000, label: 'Miễn phí giao hàng (-20.000đ)' },
    'WELCOME15': { type: 'percent', value: 15, label: 'Giảm 15% cho khách mới' },
};

let activePromo = null; // Lưu mã đang áp dụng

function applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const msgEl = document.getElementById('promo-message');
    const code = input.value.trim().toUpperCase();

    if (!code) {
        msgEl.textContent = 'Vui lòng nhập mã ưu đãi.';
        msgEl.className = 'promo-message error';
        return;
    }

    if (PROMO_CODES[code]) {
        activePromo = { code, ...PROMO_CODES[code] };
        msgEl.textContent = `✅ Áp dụng thành công: ${PROMO_CODES[code].label}`;
        msgEl.className = 'promo-message success';
        input.disabled = true;
        renderCart(); // Re-render để cập nhật giá
    } else {
        activePromo = null;
        msgEl.textContent = '❌ Mã ưu đãi không hợp lệ hoặc đã hết hạn.';
        msgEl.className = 'promo-message error';
        renderCart();
    }
}

// Hàm được gọi từ card ưu đãi: điền mã vào giỏ hàng và áp dụng
function selectPromoCode(code) {
    // Mở giỏ hàng
    openCartModal();

    // Delay nhẹ để DOM kịp render rồi điền mã
    setTimeout(() => {
        const input = document.getElementById('promo-code-input');
        const msgEl = document.getElementById('promo-message');
        if (input) {
            input.value = code;
            input.disabled = false;
        }
        // Tự động áp dụng
        applyPromoCode();
    }, 350);

    showToast(`Đã chọn mã "${code}" — áp dụng vào giỏ hàng!`, 'success');
}


function updateCartTotal(subtotal) {
    if (subtotal === undefined) {
        const cart = getCart();
        subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    const totalEl = document.getElementById('cart-total-price');
    const discountEl = document.getElementById('cart-discount');
    const discountRow = document.getElementById('discount-row');
    const discountLabel = document.getElementById('discount-label');

    let discountAmt = 0;

    if (activePromo && subtotal > 0) {
        if (activePromo.type === 'percent') {
            discountAmt = Math.round(subtotal * activePromo.value / 100);
        } else {
            discountAmt = Math.min(activePromo.value, subtotal);
        }
    }

    const total = subtotal - discountAmt;

    if (discountAmt > 0 && discountRow) {
        discountRow.style.display = 'flex';
        if (discountLabel) discountLabel.textContent = `Giảm (${activePromo.code}):`;
        if (discountEl) discountEl.textContent = '-' + discountAmt.toLocaleString('vi-VN') + 'đ';
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }

    if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + 'đ';
    return { subtotal, discountAmt, total };
}

function resetPromo() {
    activePromo = null;
    const input = document.getElementById('promo-code-input');
    const msgEl = document.getElementById('promo-message');
    if (input) { input.value = ''; input.disabled = false; }
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'promo-message'; }
}

function updateQty(index, change) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        renderCart();
        updateCartBadge();
    }
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartBadge();
}

function openCartModal() {
    resetPromo();
    renderCart();
    const overlay = document.getElementById('cart-modal');
    const sidebar = document.querySelector('.cart-sidebar');
    overlay.style.display = 'block';
    setTimeout(() => {
        overlay.classList.add('show');
        sidebar.classList.add('open');
    }, 10);
}

function closeCartModal() {
    const overlay = document.getElementById('cart-modal');
    const sidebar = document.querySelector('.cart-sidebar');
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Giỏ hàng trống!', 'error');
        return;
    }

    const currentUser = sessionStorage.getItem('fastfood_currentUser');
    const { subtotal, discountAmt, total } = updateCartTotal();

    let orders = JSON.parse(localStorage.getItem('fastfood_orders')) || [];
    orders.push({
        date: new Date().toISOString(),
        username: currentUser,
        items: cart,
        subtotal,
        discount: discountAmt,
        promoCode: activePromo ? activePromo.code : null,
        total
    });

    localStorage.setItem('fastfood_orders', JSON.stringify(orders));
    saveCart([]); // Làm rỗng giỏ
    resetPromo();
    updateCartBadge();
    closeCartModal();
    showToast('Thanh toán thành công!', 'success');
    updateDailyRanking(); // Cập nhật lại danh sách bán chạy
}


// =========================================
// ORDER HISTORY LOGIC
// =========================================
function renderOrderHistory() {
    const currentUser = sessionStorage.getItem('fastfood_currentUser');
    let orders = JSON.parse(localStorage.getItem('fastfood_orders')) || [];

    const userOrders = orders.filter(o => o.username === currentUser);
    const listContainer = document.getElementById('order-history-list');

    if (userOrders.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Bạn chưa có đơn hàng nào.</p>';
        return;
    }

    userOrders.reverse(); // Mới nhất lên đầu

    let html = '';
    userOrders.forEach(order => {
        const d = new Date(order.date);
        const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item-row">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
            `;
        });

        html += `
            <div class="order-card">
                <div class="order-header">Thời gian đặt: ${dateStr}</div>
                <div class="order-body">
                    ${itemsHtml}
                </div>
                <div class="order-footer">Tổng cộng: ${order.total.toLocaleString('vi-VN')}đ</div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

function openHistoryModal() {
    renderOrderHistory();
    document.getElementById('history-modal').style.display = 'flex';
}

function closeHistoryModal() {
    document.getElementById('history-modal').style.display = 'none';
}

// Cập nhật badge giỏ hàng ngay khi load trang
updateCartBadge();

// =========================================
// DAILY RANKING LOGIC
// =========================================
function updateDailyRanking() {
    const container = document.getElementById('daily-ranking-container');
    if (!container) return;

    const allCards = document.querySelectorAll('#menu .card');
    if (allCards.length === 0) return; // Chưa load kịp menu

    let allItems = [];
    allCards.forEach(card => {
        allItems.push({
            name: card.querySelector('h3').textContent,
            priceText: card.querySelector('.price').textContent,
            image: card.querySelector('img').getAttribute('src'),
            desc: card.querySelector('p').textContent
        });
    });

    let orders = JSON.parse(localStorage.getItem('fastfood_orders')) || [];
    const todayStr = new Date().toLocaleDateString();

    let itemSales = {};
    orders.forEach(order => {
        const orderDateStr = new Date(order.date).toLocaleDateString();
        if (orderDateStr === todayStr) {
            order.items.forEach(item => {
                itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
            });
        }
    });

    let sortedNames = Object.keys(itemSales).sort((a, b) => itemSales[b] - itemSales[a]);
    let dailyRanking = [];

    for (let name of sortedNames) {
        let foundItem = allItems.find(i => i.name === name);
        if (foundItem) dailyRanking.push(foundItem);
        if (dailyRanking.length === 4) break;
    }

    if (dailyRanking.length < 4) {
        let remainingItems = allItems.filter(i => !dailyRanking.find(d => d.name === i.name));
        for (let i = remainingItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingItems[i], remainingItems[j]] = [remainingItems[j], remainingItems[i]];
        }

        while (dailyRanking.length < 4 && remainingItems.length > 0) {
            dailyRanking.push(remainingItems.pop());
        }
    }

    // Render ra giao diện
    let html = '';
    const badgeIcons = ['👑', '', '', ''];
    dailyRanking.forEach((item, index) => {
        const rank = index + 1;
        const icon = badgeIcons[index] ? badgeIcons[index] + ' ' : '';
        html += `
            <div class="card">
                <div class="badge badge-top-${rank}">${icon}Top ${rank}</div>
                <img src="${item.image}" alt="${item.name}" class="burger-img">
                <span class="price">${item.priceText}</span>
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
                <button class="cart-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg></button>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Gọi hàm khi load trang
updateDailyRanking();

// =========================================
// BANNER SLIDER LOGIC
// =========================================
function initBannerSlider() {
    const track = document.querySelector('.slider-track');
    const slides = Array.from(document.querySelectorAll('.slide-item'));
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const dots = Array.from(document.querySelectorAll('.slider-dots .dot'));

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let slideInterval;
    const intervalTime = 5000; // 5 giây tự động chuyển

    function updateSlider() {
        // Di chuyển track
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Cập nhật class active cho slide
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Cập nhật trạng thái cho dots
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }

    function startAutoplay() {
        stopAutoplay();
        slideInterval = setInterval(nextSlide, intervalTime);
    }

    function stopAutoplay() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Đăng ký sự kiện nút bấm
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
            startAutoplay(); // Reset thời gian chuyển
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
            startAutoplay(); // Reset thời gian chuyển
        });
    }

    // Đăng ký sự kiện click dot
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = index;
            updateSlider();
            startAutoplay(); // Reset thời gian chuyển
        });
    });

    // Dừng tự động chuyển khi hover vào banner slider
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoplay);
        sliderContainer.addEventListener('mouseleave', startAutoplay);
    }

    // Bắt đầu chạy tự động
    startAutoplay();
}

// Khởi chạy slider
initBannerSlider();

// =========================================
// GOOGLE MAPS MODAL LOGIC FOR BRANCHES
// =========================================
const branchMaps = {
    hcm: {
        title: "Chi Nhánh Trung Tâm - TP. HCM",
        url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4853037254586!2d106.69532561533423!3d10.774095962164475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39194853037254586%3A0x0!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2s!4v1680000000000"
    },
    hn: {
        title: "Chi Nhánh Phố Đi Bộ - Hà Nội",
        url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1130678206894!2d105.85017121540228!3d21.02826689317585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37241130678206894%3A0x0!2zSOG7kyBIb8OgbiBLaeG6v20!5e0!3m2!1svi!2s!4v1680000000000"
    },
    dn: {
        title: "Chi Nhánh Biển Xanh - Đà Nẵng",
        url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9140224443586!2d108.22818961528646!3d16.069904743685957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38339140224443586%3A0x0!2zQ-G6p3UgU8O0bmcgSMOgbg!5e0!3m2!1svi!2s!4v1680000000000"
    }
};

function showBranchMap(branchId) {
    const modal = document.getElementById('map-modal');
    const titleEl = document.getElementById('map-modal-title');
    const iframe = document.getElementById('branch-map-iframe');

    if (modal && titleEl && iframe && branchMaps[branchId]) {
        titleEl.textContent = branchMaps[branchId].title;
        iframe.src = branchMaps[branchId].url;
        modal.style.display = 'flex';

        // Hiệu ứng transition show
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function closeMapModal() {
    const modal = document.getElementById('map-modal');
    const iframe = document.getElementById('branch-map-iframe');

    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            if (iframe) iframe.src = ""; // Xoá src để tránh iframe chạy ngầm
        }, 300);
    }
}

// Bổ sung sự kiện đóng bằng phím ESC
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMapModal();
    }
});