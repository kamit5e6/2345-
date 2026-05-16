document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 SkiResort Script Loaded');

    // ==========================================
    // 1. КОРЗИНА (ЯДРО)
    // ==========================================
    let cart = [];
    try {
        const saved = localStorage.getItem('skiResort_cart');
        cart = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) { console.error('Cart load error', e); cart = []; }

    function updateCartCounter() {
        const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        const el = document.getElementById('cartCount');
        if (el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    function saveCart() {
        localStorage.setItem('skiResort_cart', JSON.stringify(cart));
        updateCartCounter();
    }

    function renderCart() {
        const container = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotalPrice');
        const footer = document.getElementById('cartFooter');
        if (!container) return;

        container.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">Корзина пуста</p>';
            if (footer) footer.style.display = 'none';
            if (totalEl) totalEl.textContent = '0 ₽';
            updateCartCounter();
            return;
        }

        if (footer) footer.style.display = 'block';

        cart.forEach((item, idx) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.qty) || 1;
            total += price * qty;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.img || ''}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
                <div style="flex:1;min-width:0;">
                    <h4 style="margin:0 0 4px;font-size:14px;">${item.title}</h4>
                    <p style="margin:0;font-size:12px;color:var(--text-muted);">${item.size || ''}</p>
                    <div style="font-weight:700;color:var(--primary);margin-top:4px;">${(price * qty).toLocaleString('ru-RU')} ₽</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;background:var(--bg);padding:4px 8px;border-radius:6px;">
                        <button onclick="window.cartMinus(${idx})" style="width:20px;height:20px;border:none;background:transparent;cursor:pointer;font-weight:bold;">−</button>
                        <span>${qty}</span>
                        <button onclick="window.cartPlus(${idx})" style="width:20px;height:20px;border:none;background:transparent;cursor:pointer;font-weight:bold;">+</button>
                    </div>
                    <button onclick="window.cartRemove(${idx})" style="background:transparent;border:none;color:red;cursor:pointer;font-size:18px;">×</button>
                </div>
            `;
            container.appendChild(div);
        });

        if (totalEl) totalEl.textContent = total.toLocaleString('ru-RU') + ' ₽';
        updateCartCounter();
    }

    // Глобальные функции для кнопок в корзине
    window.cartMinus = (i) => { cart[i].qty--; if (cart[i].qty < 1) cart.splice(i, 1); saveCart(); renderCart(); };
    window.cartPlus = (i) => { cart[i].qty++; saveCart(); renderCart(); };
    window.cartRemove = (i) => { cart.splice(i, 1); saveCart(); renderCart(); };

    // ==========================================
    // 2. ГЛОБАЛЬНЫЙ UI (Тема, Бургер, Модалки, Аккордеон, Табы, Слайдер)
    // ==========================================

    // Тема
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('.icon-sun')?.classList.add('hidden');
        document.querySelector('.icon-moon')?.classList.remove('hidden');
    }
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        document.querySelector('.icon-sun')?.classList.toggle('hidden', !isDark);
        document.querySelector('.icon-moon')?.classList.toggle('hidden', isDark);
    });

    // Бургер
    document.getElementById('burgerMenu')?.addEventListener('click', () => {
        document.getElementById('burgerMenu')?.classList.toggle('active');
        document.getElementById('navMenu')?.classList.toggle('open');
    });

    // Модалки
    const openModal = (id) => {
        const m = document.getElementById(id);
        if (m) {
            if (id === 'cartModal') renderCart();
            m.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };
    const closeModal = (id) => {
        const m = document.getElementById(id);
        if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
    };

    document.getElementById('cartIcon')?.addEventListener('click', () => openModal('cartModal'));
    document.getElementById('cartModalClose')?.addEventListener('click', () => closeModal('cartModal'));
    document.getElementById('cartModalOverlay')?.addEventListener('click', () => closeModal('cartModal'));
    document.getElementById('openAuthModal')?.addEventListener('click', () => openModal('authModal'));
    document.getElementById('authModalClose')?.addEventListener('click', () => closeModal('authModal'));
    document.getElementById('authModalOverlay')?.addEventListener('click', () => closeModal('authModal'));
    // Обработка формы РЕГИСТРАЦИИ
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('regName').value;
        const phone = document.getElementById('regPhone').value;
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';

        console.log('📝 Данные регистрации:', fullName, phone, email);

        // Сохраняем данные пользователя
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('currentUserEmail', email); // Сохраняем email текущего пользователя
        localStorage.setItem('isLoggedIn', 'true');

        closeModal('authModal');

        if (window.location.pathname.includes('account.html')) {
            window.location.reload();
        } else {
            alert('✅ Вы успешно зарегистрировались!');
        }
        // === ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ВХОДОМ И РЕГИСТРАЦИЕЙ ===
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        console.log('🔍 Элементы:', { showRegisterLink, showLoginLink, loginForm, registerForm });

        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👆 Клик по "Зарегистрироваться"');
                if (loginForm) loginForm.classList.add('hidden');
                if (registerForm) registerForm.classList.remove('hidden');
            });
        } else {
            console.error('❌ Элемент showRegister не найден!');
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👆 Клик по "Войти"');
                if (registerForm) registerForm.classList.add('hidden');
                if (loginForm) loginForm.classList.remove('hidden');
            });
        } else {
            console.error('❌ Элемент showLogin не найден!');
        }
    });
    // === ОБРАБОТКА ФОРМЫ ВХОДА ===
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault(); // Останавливаем стандартную отправку формы (чтобы страница не перезагружалась)
        console.log('🔑 Вход выполнен');

        // 1. Сохраняем в память браузера, что пользователь вошел
        localStorage.setItem('isLoggedIn', 'true');

        // 2. Закрываем модальное окно
        closeModal('authModal');

        // 3. Проверяем, где мы находимся
        if (window.location.pathname.includes('account.html')) {
            // Если мы на странице аккаунта -> перезагружаем её, чтобы скрипт увидел, что мы вошли, и показал профиль
            window.location.reload();
        } else {
            // Если мы на другой странице -> просто говорим, что вход успешен
            alert('✅ Вы успешно вошли в аккаунт!');
        }
    });
    // === НОВОЕ ОКНО: Требуется авторизация ===

    // Кнопка "Войти" внутри окна ошибки
    document.getElementById('goToLoginBtn')?.addEventListener('click', () => {
        closeModal('authRequiredModal'); // Закрываем ошибку
        openModal('authModal');          // Открываем окно входа
    });

    // Закрытие окна ошибки
    document.getElementById('authRequiredClose')?.addEventListener('click', () => closeModal('authRequiredModal'));
    document.getElementById('authRequiredOverlay')?.addEventListener('click', () => closeModal('authRequiredModal'));

    // Аккордеон
    document.querySelectorAll('.accordion__header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion__content');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion__item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion__content').style.maxHeight = null;
            });
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // Табы
    document.querySelectorAll('.tabs__nav').forEach(group => {
        const btns = group.querySelectorAll('.tabs__btn');
        const panels = group.parentElement.querySelectorAll('.tabs__panel');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('tabs__btn--active'));
                btn.classList.add('tabs__btn--active');
                const target = btn.getAttribute('data-tab');
                panels.forEach(p => p.classList.toggle('tabs__panel--active', p.getAttribute('data-panel') === target));
            });
        });
    });

    // Слайдер команды
    const teamSlider = document.getElementById('teamSlider');
    if (teamSlider) {
        document.getElementById('teamPrev')?.addEventListener('click', () => teamSlider.scrollBy({ left: -300, behavior: 'smooth' }));
        document.getElementById('teamNext')?.addEventListener('click', () => teamSlider.scrollBy({ left: 300, behavior: 'smooth' }));
    }

    // ==========================================
    // ==========================================
    // 3. КАТАЛОГ
    // ==========================================
    if (window.location.pathname.includes('catalog.html')) {
        console.log('📦 Каталог загружен');

        // Загружаем товары из localStorage или используем стандартные
        const adminProducts = JSON.parse(localStorage.getItem('skiResort_products') || '[]');

        const defaultProducts = [
            { id: 1, title: "Ски-пасс (1 день)", price: 2500, oldPrice: 3200, desc: "Безлимитный доступ ко всем трассам", img: "https://via.placeholder.com/400x400/06b6d4/ffffff?text=Ski+Pass", hasSizes: false },
            { id: 2, title: "Урок с инструктором", price: 4000, desc: "Индивидуальное занятие", img: "https://via.placeholder.com/400x400/3b82f6/ffffff?text=Lesson", hasSizes: false },
            { id: 3, title: "Шлем горнолыжный", price: 5200, oldPrice: 6500, desc: "Легкий вентилируемый шлем", img: "https://via.placeholder.com/400x400/f43f5e/ffffff?text=Helmet", hasSizes: true },
            { id: 4, title: "Ботинки горные", price: 12000, oldPrice: 15000, desc: "Профессиональные ботинки", img: "https://via.placeholder.com/400x400/6366f1/ffffff?text=Boots", hasSizes: true },
            { id: 5, title: "Маска защитная", price: 3800, oldPrice: 4500, desc: "Двойная линза UV400", img: "https://via.placeholder.com/400x400/f59e0b/ffffff?text=Goggles", hasSizes: true }
        ];

        const productsDB = adminProducts.length > 0 ? adminProducts : defaultProducts;
        console.log('📊 Товаров в каталоге:', productsDB.length);

        // Рендерим товары в каталоге
        function renderCatalog() {
            const grid = document.querySelector('.product-grid');
            if (!grid) return;

            grid.innerHTML = productsDB.map(p => `
                <div class="product-card" data-category="all">
                    <div class="product-img-wrapper">
                        <img src="${p.img}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        ${p.oldPrice ? `<span class="badge badge--sale">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${p.title}</h3>
                        <p class="product-desc">${p.desc || ''}</p>
                        <div class="product-price" style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:20px;font-weight:800;color:var(--primary);">${p.price.toLocaleString('ru-RU')} ₽</span>
                            ${p.oldPrice ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:14px;">${p.oldPrice.toLocaleString('ru-RU')} ₽</span>` : ''}
                        </div>
                        <button class="btn btn--primary btn--sm btn--full" onclick="addToCartFromCatalog(${p.id})">В корзину</button>
                    </div>
                </div>
            `).join('');
        }

        // Добавление в корзину из каталога
        window.addToCartFromCatalog = (id) => {
            const product = productsDB.find(p => p.id === id);
            if (!product) return;

            const existing = cart.find(i => i.title === product.title);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({
                    title: product.title,
                    price: product.price,
                    size: '-',
                    qty: 1,
                    img: product.img
                });
            }
            saveCart();
            renderCart();
            openModal('cartModal');
        };

        // Рендерим при загрузке
        setTimeout(() => {
            renderCatalog();

            const searchInput = document.getElementById('searchInput');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const sortSelect = document.getElementById('sortSelect');
            const productsGrid = document.querySelector('.product-grid');

            // Поиск
            searchInput?.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.product-card');
                cards.forEach(card => {
                    const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
                    const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
                    card.style.display = (title.includes(val) || desc.includes(val)) ? 'block' : 'none';
                });
            });

            // Фильтры
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const cat = btn.getAttribute('data-filter');
                    const cards = document.querySelectorAll('.product-card');
                    cards.forEach(card => {
                        const cardCat = card.getAttribute('data-category');
                        card.style.display = (cat === 'all' || cardCat === cat) ? 'block' : 'none';
                    });
                });
            });

            // Сортировка
            if (sortSelect && productsGrid) {
                sortSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    const cards = Array.from(productsGrid.querySelectorAll('.product-card'));
                    cards.sort((a, b) => {
                        const pA = parseInt(a.querySelector('.product-price')?.textContent.replace(/\D/g, '')) || 0;
                        const pB = parseInt(b.querySelector('.product-price')?.textContent.replace(/\D/g, '')) || 0;
                        return val === 'price-asc' ? pA - pB : pB - pA;
                    });
                    productsGrid.innerHTML = '';
                    cards.forEach(c => productsGrid.appendChild(c));
                });
            }


            // Кнопки "В корзину"
            productCards.forEach(card => {
                const btn = card.querySelector('.btn');
                btn?.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const title = card.querySelector('.product-title')?.textContent || 'Товар';
                    const price = parseInt(card.querySelector('.product-price')?.textContent.replace(/\D/g, '')) || 0;
                    const img = card.querySelector('img')?.src || '';
                    const existing = cart.find(i => i.title === title);
                    if (existing) existing.qty++;
                    else cart.push({ title, price, size: '-', qty: 1, img });
                    saveCart(); renderCart(); openModal('cartModal');
                });
            });
        }, 50);
    }

    // ==========================================
    // 4. СТРАНИЦА ТОВАРА (ПОЛНАЯ БАЗА + ЛОГИКА)
    // ==========================================
    if (window.location.pathname.includes('product.html')) {
        const defaultProducts = [
            { id: 1, title: "Ски-пасс (1 день)", price: 2500, oldPrice: 3200, desc: "Безлимитный доступ ко всем 120 км трасс курорта.", img: "https://via.placeholder.com/400x400/06b6d4/ffffff?text=Ski+Pass", specs: { "Тип": "Электронный", "Время": "08:30-16:30" }, hasSizes: false },
            { id: 2, title: "Урок с инструктором", price: 4000, oldPrice: null, desc: "Индивидуальное занятие для любого уровня подготовки.", img: "https://via.placeholder.com/400x400/3b82f6/ffffff?text=Lesson", specs: { "Длительность": "2 часа", "Формат": "Индивидуально" }, hasSizes: false },
            { id: 3, title: "Шлем горнолыжный", price: 5200, oldPrice: 6500, desc: "Легкий вентилируемый шлем с системой защиты MIPS.", img: "https://via.placeholder.com/400x400/f43f5e/ffffff?text=Helmet", specs: { "Материал": "ABS/EPS", "Вес": "450 г" }, hasSizes: true },
            { id: 4, title: "Открытие трассы «Орёл»", price: 0, oldPrice: null, desc: "Новая черная трасса с перепадом 600м. Вход свободный.", img: "https://via.placeholder.com/400x400/10b981/ffffff?text=Trail", specs: { "Сложность": "Черная", "Длина": "3.2 км" }, hasSizes: false },
            { id: 5, title: "Маска защитная", price: 3800, oldPrice: 4500, desc: "Двойная линза с антизапотевающим покрытием UV400.", img: "https://via.placeholder.com/400x400/f59e0b/ffffff?text=Goggles", specs: { "Линза": "Двойная", "Защита": "UV400" }, hasSizes: true },
            { id: 6, title: "SPA-комплекс", price: 3500, oldPrice: null, desc: "Бассейн с подогревом, финская сауна и сеанс массажа.", img: "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=SPA", specs: { "Время": "1.5 часа", "Услуги": "Комплекс" }, hasSizes: false },
            { id: 7, title: "Перчатки Pro", price: 1500, oldPrice: null, desc: "Водонепроницаемые тёплые перчатки с мембраной Gore-Tex.", img: "https://via.placeholder.com/400x400/ec4899/ffffff?text=Gloves", specs: { "Материал": "Gore-Tex", "Сезон": "Зима" }, hasSizes: true },
            { id: 8, title: "Ботинки горные", price: 12000, oldPrice: 15000, desc: "Профессиональные ботинки с карбоновой рамой, жесткость 80.", img: "https://via.placeholder.com/400x400/6366f1/ffffff?text=Boots", specs: { "Жесткость": "80", "Материал": "Карбон" }, hasSizes: true },
            { id: 9, title: "Прокат лыж", price: 1200, oldPrice: null, desc: "Современное оборудование от ведущих брендов.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Rental", specs: { "Комплект": "Лыжи+ботинки", "Залог": "5000₽" }, hasSizes: false },
            { id: 10, title: "Носки термо", price: 800, oldPrice: null, desc: "Термоноски из шерсти мериноса с антибактериальной обработкой.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Socks", specs: { "Состав": "70% шерсть", "Высота": "25 см" }, hasSizes: true },
            { id: 11, title: "Фестиваль снега", price: 0, oldPrice: null, desc: "Ежегодный фестиваль с живой музыкой и фуд-кортами.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Event", specs: { "Дата": "15.02.2026", "Вход": "Свободный" }, hasSizes: false },
            { id: 12, title: "Палки лыжные", price: 2100, oldPrice: 2800, desc: "Лёгкие алюминиевые палки с карбоновыми вставками.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Poles", specs: { "Длина": "100-130 см", "Вес": "180 г" }, hasSizes: false },
            { id: 13, title: "Фотосессия", price: 5000, oldPrice: null, desc: "Профессиональная съемка на фоне гор. 50 фото в обработке.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Photo", specs: { "Время": "1 час", "Фото": "50 шт" }, hasSizes: false },
            { id: 14, title: "Мазь для лыж", price: 600, oldPrice: null, desc: "Универсальная мазь скольжения. Работает до -5°C.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Wax", specs: { "Темп": "-5°C", "Объем": "100 г" }, hasSizes: false },
            { id: 15, title: "Рюкзак лавинный", price: 15000, oldPrice: 18000, desc: "Рюкзак с системой безопасности ABS. Объем 30л.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Bag", specs: { "Объем": "30 л", "Система": "ABS" }, hasSizes: false },
            { id: 16, title: "Трансфер", price: 3000, oldPrice: null, desc: "Комфортный трансфер из аэропорта на микроавтобусе.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Transfer", specs: { "Время": "1.5 часа", "Мест": "8" }, hasSizes: false },
            { id: 17, title: "Балаклава", price: 900, oldPrice: null, desc: "Защита от ветра и холода. Дышащий флис.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Balaclava", specs: { "Материал": "Флис", "Размер": "Uni" }, hasSizes: true },
            { id: 18, title: "Крем SPF 50+", price: 1100, oldPrice: null, desc: "Специальный крем для высокогорья. Водостойкий.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Sun", specs: { "SPF": "50+", "Объем": "100 мл" }, hasSizes: false },
            { id: 19, title: "Прогноз снега", price: 0, oldPrice: null, desc: "Актуальный прогноз выпадения снега на неделю.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Weather", specs: { "Прогноз": "+40 см", "Период": "7 дней" }, hasSizes: false },
            { id: 20, title: "Ремонт снарядов", price: 1500, oldPrice: null, desc: "Профессиональная заточка кантов и нанесение парафина.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Repair", specs: { "Услуги": "Комплекс", "Срок": "2 часа" }, hasSizes: false },
            { id: 21, title: "Термос 1л", price: 2200, oldPrice: 2800, desc: "Двухстенный термос из нержавеющей стали. Держит тепло 12ч.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Thermos", specs: { "Объем": "1 л", "Время": "12 ч" }, hasSizes: false },
            { id: 22, title: "Детская школа", price: 3200, oldPrice: null, desc: "Групповые занятия для детей 4-7 лет с опытными инструкторами.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Kids", specs: { "Возраст": "4-7 лет", "Время": "4 ч" }, hasSizes: false },
            { id: 23, title: "Куртка мембранная", price: 4500, oldPrice: 6000, desc: "Дышащая ветрозащитная куртка с мембраной 10000 мм.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Jacket", specs: { "Мембрана": "10000", "Размеры": "S-XL" }, hasSizes: true },
            { id: 24, title: "Камера хранения", price: 800, oldPrice: null, desc: "Индивидуальный сейф для хранения ценностей 24/7.", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Locker", specs: { "Размер": "40x30x50", "Доступ": "24/7" }, hasSizes: false }
        ];
        const productsDB = JSON.parse(localStorage.getItem('skiResort_products')) || defaultProducts;
        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get('id')) || 1;
        const product = productsDB.find(p => p.id === id) || productsDB[0];

        // Заполнение данных
        document.getElementById('prodTitle') && (document.getElementById('prodTitle').textContent = product.title);
        document.getElementById('prodPrice') && (document.getElementById('prodPrice').textContent = product.price > 0 ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Бесплатно');
        document.getElementById('prodOldPrice') && (document.getElementById('prodOldPrice').textContent = product.oldPrice ? `${product.oldPrice.toLocaleString('ru-RU')} ₽` : '');
        document.getElementById('prodDesc') && (document.getElementById('prodDesc').textContent = product.desc);
        document.getElementById('mainProductImg') && (document.getElementById('mainProductImg').src = product.img);

        const specsList = document.getElementById('prodSpecs');
        if (specsList && product.specs) {
            specsList.innerHTML = Object.entries(product.specs).map(([k, v]) => `<li><span>${k}:</span> ${v}</li>`).join('');
        }

        // Размеры
        const sizeWrap = document.getElementById('sizeSelector');
        if (sizeWrap) sizeWrap.style.display = product.hasSizes ? 'block' : 'none';
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Кнопка в корзину
        document.getElementById('addToCartBtn')?.addEventListener('click', () => {
            const size = product.hasSizes ? document.querySelector('.size-btn.active')?.textContent || 'M' : '-';
            const existing = cart.find(i => i.title === product.title && i.size === size);
            if (existing) existing.qty++;
            else cart.push({ title: product.title, price: product.price, size, qty: 1, img: product.img });
            saveCart(); renderCart(); openModal('cartModal');
        });

        // Галерея
        const dots = document.querySelectorAll('#productGalleryDots .dot');
        const slider = document.getElementById('productGallery');
        if (slider && dots.length) {
            let idx = 0;
            const move = (i) => { slider.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, n) => d.classList.toggle('active', n === i)); idx = i; };
            setInterval(() => move((idx + 1) % dots.length), 3000);
            dots.forEach((d, i) => d.addEventListener('click', () => move(i)));
        }

        // Отзывы
        const revForm = document.getElementById('reviewForm');
        const revList = document.getElementById('reviewsList');
        if (revForm && revList) {
            const stars = document.querySelectorAll('.star-rating .star');
            const ratingInput = document.getElementById('reviewRating');

            stars.forEach(s => s.addEventListener('click', () => {
                const val = +s.dataset.value; ratingInput.value = val;
                stars.forEach(st => st.classList.toggle('active', +st.dataset.value <= val));
            }));

            const saved = JSON.parse(localStorage.getItem(`rev_prod_${id}`) || '[]');
            saved.forEach(r => {
                const el = document.createElement('div'); el.className = 'review-card';
                el.innerHTML = `<div class="review-header"><span>${r.name}</span><span>${r.date}</span></div><div>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><p>${r.text}</p>`;
                revList.appendChild(el);
            });

            revForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('reviewName').value.trim();
                const text = document.getElementById('reviewText').value.trim();
                const rating = +ratingInput.value;
                const date = new Date().toLocaleDateString('ru-RU');
                const data = JSON.parse(localStorage.getItem(`rev_prod_${id}`) || '[]');
                data.unshift({ name, rating, text, date });
                localStorage.setItem(`rev_prod_${id}`, JSON.stringify(data));

                const el = document.createElement('div'); el.className = 'review-card new-review';
                el.innerHTML = `<div class="review-header"><span>${name}</span><span>${date}</span></div><div>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div><p>${text}</p>`;
                revList.insertBefore(el, revList.firstChild);
                revForm.reset(); ratingInput.value = 5;
                stars.forEach(s => s.classList.toggle('active', +s.dataset.value <= 5));
            });
        }
    }

    // ==========================================
    // 5. ОФОРМЛЕНИЕ ЗАКАЗА
    // ==========================================
    // Оформление заказа
    // ==========================================
    // 5. ОФОРМЛЕНИЕ ЗАКАЗА (С ОТЛАДКОЙ)
    // ==========================================

    // Ждем, пока страница загрузится полностью, чтобы найти кнопку
    setTimeout(() => {
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (checkoutBtn) {
            console.log('✅ Кнопка checkoutBtn найдена!');

            checkoutBtn.addEventListener('click', () => {
                console.log(' Клик по кнопке "Оформить заказ"');
                console.log('🛒 Корзина:', cart);

                if (cart.length === 0) {
                    alert('Корзина пуста! Добавьте товары.');
                    return;
                }

                const isLoggedIn = localStorage.getItem('isLoggedIn');
                const currentUser = localStorage.getItem('currentUserEmail');

                console.log('🔐 Статус входа:', isLoggedIn);
                console.log('👤 Текущий юзер:', currentUser);

                if (isLoggedIn !== 'true') {
                    console.log('⛔ Требуется авторизация');
                    // Пытаемся открыть модалку ошибки
                    const authReqModal = document.getElementById('authRequiredModal');
                    if (authReqModal) {
                        authReqModal.classList.add('open');
                        document.body.style.overflow = 'hidden';
                    } else {
                        console.error('❌ Модалка authRequiredModal не найдена в HTML!');
                        alert('Пожалуйста, войдите в аккаунт.');
                    }
                    return;
                }

                // Если все ок — оформляем
                console.log('✅ Оформление заказа...');
                const now = new Date().toLocaleDateString('ru-RU');
                const num = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

                let orders = JSON.parse(localStorage.getItem('skiResort_history_orders')) || [];
                let bookings = JSON.parse(localStorage.getItem('skiResort_history_bookings')) || [];

                cart.forEach(item => {
                    const baseData = {
                        id: num,
                        title: item.title,
                        price: (item.price || 0) * (item.qty || 1),
                        qty: item.qty,
                        date: now,
                        user: currentUser
                    };

                    if (item.type === 'hotel') {
                        bookings.push({ ...baseData, dates: item.size });
                    } else {
                        orders.push({ ...baseData, size: item.size });
                    }
                });

                localStorage.setItem('skiResort_history_orders', JSON.stringify(orders));
                localStorage.setItem('skiResort_history_bookings', JSON.stringify(bookings));

                cart = [];
                saveCart();
                renderCart();

                // Закрываем модалку корзины
                const cartModal = document.getElementById('cartModal');
                if (cartModal) {
                    cartModal.classList.remove('open');
                    document.body.style.overflow = '';
                }

                alert(`✅ Заказ ${num} успешно оформлен!`);
            });
        } else {
            console.error('❌ Кнопка с id="checkoutBtn" НЕ НАЙДЕНА в HTML!');
        }
    }, 100); // Небольшая задержка, чтобы модалка точно отрисовалась

    // Инициализация при загрузке
    updateCartCounter();
    // ==========================================
    // 6. СТРАНИЦА ОТЕЛЯ (hotel-booking.html)
    // ==========================================
    if (window.location.pathname.includes('hotel-booking.html')) {
        console.log('🏨 Hotel page detected');

        const defaultHotels = [
            { id: 1, title: "Alpine Resort Hotel 5*", price: 8500, oldPrice: 11000, desc: "Роскошный отель в самом центре курорта. Номера с видом на горы.", img: "https://via.placeholder.com/400x400/06b6d4/ffffff?text=Alpine+5*", specs: { "Wi-Fi": "Бесплатный", "Завтрак": "Шведский стол", "Бассейн": "Подогреваемый" } },
            { id: 2, title: "Mountain Lodge 4*", price: 6200, oldPrice: 7500, desc: "Уютный отель в стиле шале. Идеален для семейного отдыха.", img: "https://via.placeholder.com/400x400/3b82f6/ffffff?text=Lodge+4*", specs: { "Wi-Fi": "В лобби", "Сауна": "В номере", "Парковка": "Бесплатная" } },
            { id: 3, title: "Ski Chalet 3*", price: 4100, oldPrice: null, desc: "Бюджетный вариант для активных туристов.", img: "https://via.placeholder.com/400x400/f43f5e/ffffff?text=Chalet+3*", specs: { "Питание": "Нет", "Расположение": "200м до трассы" } },

            // --- НОВЫЕ ОТЕЛИ ---
            { id: 4, title: "Grand Summit 5*", price: 15000, oldPrice: 18000, desc: "Премиум отель с собственным SPA-центром и рестораном высокой кухни.", img: "https://via.placeholder.com/400x400/f59e0b/ffffff?text=Grand+Summit", specs: { "Уровень": "Luxury", "Сервис": "24/7", "Бар": "На крыше" } },
            { id: 5, title: "Медвежья Лапа", price: 3500, oldPrice: null, desc: "Аутентичный деревянный домик у подножия горы. Тишина и покой.", img: "https://via.placeholder.com/400x400/10b981/ffffff?text=Bear+Lodge", specs: { "Тип": "Коттедж", "Камин": "Есть", "Питание": "Полупансион" } },
            { id: 6, title: "Ice & Fire Glamping", price: 7500, oldPrice: 9000, desc: "Глэмпинг с панорамными окнами. Ночуйте под звездами в тепле.", img: "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Glamping", specs: { "Вид": "Панорамный", "Отопление": "Теплый пол", "Завтрак": "В постель" } },
            { id: 7, title: "Nordic Spa Hotel", price: 9200, oldPrice: null, desc: "Скандинавский минимализм и лучшие банные традиции.", img: "https://via.placeholder.com/400x400/64748b/ffffff?text=Nordic+Spa", specs: { "Баня": "Финская", "Массаж": "Включен", "Дизайн": "Сканди" } }
        ];
        const hotelsDB = JSON.parse(localStorage.getItem('skiResort_hotels')) || defaultHotels;
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id')) || 1;
        const hotel = hotelsDB.find(h => h.id === id) || hotelsDB[0];

        // Заполнение данных
        document.getElementById('hotelTitle').textContent = hotel.title;
        document.getElementById('hotelPrice').textContent = hotel.price.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('hotelOldPrice').textContent = hotel.oldPrice ? hotel.oldPrice.toLocaleString('ru-RU') + ' ₽' : '';
        document.getElementById('hotelDesc').textContent = hotel.desc;
        document.getElementById('hotelMainImg').src = hotel.img;

        // Характеристики
        const specsList = document.getElementById('hotelSpecs');
        if (specsList && hotel.specs) {
            specsList.innerHTML = Object.entries(hotel.specs).map(([k, v]) => `<li><span>${k}:</span> ${v}</li>`).join('');
        }

        // Галерея
        const dots = document.querySelectorAll('#hotelDots .dot');
        const slider = document.getElementById('hotelGallery');
        if (slider && dots.length) {
            let idx = 0;
            const move = (i) => { slider.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, n) => d.classList.toggle('active', n === i)); idx = i; };
            setInterval(() => move((idx + 1) % dots.length), 3000);
            dots.forEach((d, i) => d.addEventListener('click', () => move(i)));
        }

        // Отзывы
        const revForm = document.getElementById('hotelReviewForm');
        const revList = document.getElementById('hotelReviewsList');
        if (revForm && revList) {
            const stars = revForm.querySelectorAll('.star');
            const ratingInput = revForm.querySelector('#hotelReviewRating');

            stars.forEach(s => s.addEventListener('click', () => {
                const val = +s.dataset.value; ratingInput.value = val;
                stars.forEach(st => st.classList.toggle('active', +st.dataset.value <= val));
            }));

            const saved = JSON.parse(localStorage.getItem(`rev_hotel_${id}`) || '[]');
            saved.forEach(r => {
                const el = document.createElement('div'); el.className = 'review-card';
                el.innerHTML = `<div class="review-header"><span>${r.name}</span><span>${r.date}</span></div><div>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><p>${r.text}</p>`;
                revList.appendChild(el);
            });

            revForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('hotelReviewName').value.trim();
                const text = document.getElementById('hotelReviewText').value.trim();
                const rating = +ratingInput.value;
                const date = new Date().toLocaleDateString('ru-RU');
                const data = JSON.parse(localStorage.getItem(`rev_hotel_${id}`) || '[]');
                data.unshift({ name, rating, text, date });
                localStorage.setItem(`rev_hotel_${id}`, JSON.stringify(data));

                const el = document.createElement('div'); el.className = 'review-card new-review';
                el.innerHTML = `<div class="review-header"><span>${name}</span><span>${date}</span></div><div>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div><p>${text}</p>`;
                revList.insertBefore(el, revList.firstChild);
                revForm.reset(); ratingInput.value = 5;
                stars.forEach(s => s.classList.toggle('active', +s.dataset.value <= 5));
            });
        }

        // Кнопка бронирования
        document.getElementById('bookHotelBtn')?.addEventListener('click', () => {
            const d1 = document.getElementById('checkIn').value;
            const d2 = document.getElementById('checkOut').value;
            if (!d1 || !d2) return alert('Выберите даты заезда и выезда!');

            const nights = Math.ceil(Math.abs(new Date(d2) - new Date(d1)) / 864e5);
            if (nights <= 0) return alert('Дата выезда должна быть позже даты заезда!');

            const totalPrice = hotel.price * nights;

            cart.push({
                title: `🏨 ${hotel.title}`,
                price: totalPrice,
                size: `${nights} ночей (${d1} → ${d2})`,
                qty: 1,
                img: hotel.img,
                type: 'hotel'
            });

            saveCart();
            renderCart();
            openModal('cartModal');
        });
    }
    // ==========================================
    // 7. ЛОГИКА АККАУНТА (account.html)
    // ==========================================
    if (window.location.pathname.includes('account.html')) {
        console.log('👤 Account page loaded');

        const profileContent = document.getElementById('profileContent');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // Если НЕ авторизован -> скрываем профиль, открываем окно входа
        if (!isLoggedIn) {
            if (profileContent) profileContent.classList.add('hidden');
            setTimeout(() => openModal('authModal'), 400); // Плавное появление
        } else {
            // Если авторизован -> показываем профиль и грузим данные
            if (profileContent) profileContent.classList.remove('hidden');
            renderAccountData();
        }

        // Функция отрисовки истории и статистики
        function renderAccountData() {
            // ОТОБРАЖЕНИЕ ИМЕНИ И ТЕЛЕФОНА
            const savedName = localStorage.getItem('userFullName');
            const savedPhone = localStorage.getItem('userPhone');
            const currentUser = localStorage.getItem('currentUserEmail');

            const profileCard = document.querySelector('.card[style*="margin-bottom: 24px"]');

            if (savedName && profileCard) {
                const nameElement = profileCard.querySelector('h2');
                const phoneElement = profileCard.querySelector('p:nth-of-type(2)');

                if (nameElement) nameElement.textContent = savedName;
                if (phoneElement && savedPhone) phoneElement.textContent = `📞 ${savedPhone}`;
            }

            const ordersListEl = document.getElementById('ordersList');
            const bookingsListEl = document.getElementById('bookingsList');
            const statOrdersEl = document.getElementById('statOrders');
            const statBookingsEl = document.getElementById('statBookings');

            const allOrders = JSON.parse(localStorage.getItem('skiResort_history_orders')) || [];
            const allBookings = JSON.parse(localStorage.getItem('skiResort_history_bookings')) || [];

            // Фильтруем заказы ТОЛЬКО текущего пользователя
            const orderHistory = allOrders.filter(order => order.user === currentUser);
            const bookingHistory = allBookings.filter(booking => booking.user === currentUser);

            if (statOrdersEl) statOrdersEl.textContent = orderHistory.length;
            if (statBookingsEl) statBookingsEl.textContent = bookingHistory.length;

            if (ordersListEl) {
                ordersListEl.innerHTML = orderHistory.length ? orderHistory.reverse().map(order => `
                    <div class="history-item">
                        <div class="history-item-info">
                            <h4>${order.title}</h4>
                            <p>📅 ${order.date} • ${order.qty} шт. • №${order.id}</p>
                        </div>
                        <div class="history-item-price">${order.price.toLocaleString('ru-RU')} ₽</div>
                    </div>`).join('') : '<p style="text-align:center; color:var(--text-muted); padding:30px;">У вас пока нет заказов</p>';
            }

            if (bookingsListEl) {
                bookingsListEl.innerHTML = bookingHistory.length ? bookingHistory.reverse().map(booking => `
                    <div class="history-item">
                        <div class="history-item-info">
                            <h4>${booking.title}</h4>
                            <p>📅 ${booking.dates} • №${booking.id}</p>
                        </div>
                        <div class="history-item-price">${booking.price.toLocaleString('ru-RU')} ₽</div>
                    </div>`).join('') : '<p style="text-align:center; color:var(--text-muted); padding:30px;">У вас пока нет бронирований</p>';
            }
        }

        // Кнопка ВЫЙТИ
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            alert('👋 Вы успешно вышли из аккаунта');
            window.location.href = 'index.html';
        });
    }
    // === ИСПРАВЛЕННОЕ ПЕРЕКЛЮЧЕНИЕ ФОРМ ===
    function setupAuthForms() {
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (!loginForm || !registerForm) {
            console.warn('⚠️ Формы входа/регистрации не найдены на этой странице');
            return;
        }

        // Показываем регистрацию
        if (showRegisterLink) {
            showRegisterLink.onclick = (e) => {
                e.preventDefault();
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                console.log('✅ Переключено на регистрацию');
            };
        }

        // Показываем вход
        if (showLoginLink) {
            showLoginLink.onclick = (e) => {
                e.preventDefault();
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                console.log('✅ Переключено на вход');
            };
        }
    }

    // Запускаем при загрузке и при открытии модалки
    setupAuthForms();

    // Также вызываем при открытии окна входа
    document.getElementById('openAuthModal')?.addEventListener('click', () => {
        setTimeout(setupAuthForms, 100);
    });
    // ==========================================

    // ==========================================
    // 9. АДМИН-ПАНЕЛЬ
    // ==========================================
    if (window.location.pathname.includes('admin.html')) {
        console.log('✅ Админ-панель загружена');

        const loginScreen = document.getElementById('adminLogin');
        const adminPanel = document.getElementById('adminPanel');
        const loginForm = document.getElementById('adminLoginForm');
        const logoutBtn = document.getElementById('adminLogout');
        const errorEl = document.getElementById('adminError');

        // Проверка авторизации
        if (localStorage.getItem('adminAuth') === 'true') {
            if (loginScreen) loginScreen.classList.add('hidden');
            if (adminPanel) adminPanel.classList.remove('hidden');
            setTimeout(initAdminData, 100);
        } else {
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (adminPanel) adminPanel.classList.add('hidden');
        }

        // Вход
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = document.getElementById('adminUser').value;
                const pass = document.getElementById('adminPass').value;

                if (user === 'admin' && pass === 'admin2026') {
                    localStorage.setItem('adminAuth', 'true');
                    location.reload();
                } else {
                    if (errorEl) {
                        errorEl.textContent = '❌ Неверный логин или пароль';
                        errorEl.style.display = 'block';
                    }
                }
            });
        }

        // Выход
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminAuth');
                window.location.href = 'index.html';
            });
        }

        // Переключение табов
        document.querySelectorAll('.admin-nav button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                const section = document.getElementById('tab-' + btn.dataset.tab);
                if (section) section.classList.add('active');
            });
        });

        // === ИНИЦИАЛИЗАЦИЯ ДАННЫХ ===
        function initAdminData() {
            console.log('🔄 Загрузка данных...');

            // === ТОВАРЫ (24 шт) ===
            const existingProducts = localStorage.getItem('skiResort_products');
            if (!existingProducts || existingProducts === '[]') {
                console.log('📦 Загрузка 24 товаров...');
                const defaultProducts = [
                    { id: 1, title: "Ски-пасс (1 день)", price: 2500, oldPrice: 3200, desc: "Безлимитный доступ ко всем трассам", img: "https://via.placeholder.com/400x400/06b6d4/ffffff?text=Ski+Pass", hasSizes: false },
                    { id: 2, title: "Урок с инструктором", price: 4000, desc: "Индивидуальное занятие", img: "https://via.placeholder.com/400x400/3b82f6/ffffff?text=Lesson", hasSizes: false },
                    { id: 3, title: "Шлем горнолыжный", price: 5200, oldPrice: 6500, desc: "Легкий вентилируемый шлем", img: "https://via.placeholder.com/400x400/f43f5e/ffffff?text=Helmet", hasSizes: true },
                    { id: 4, title: "Ботинки горные", price: 12000, oldPrice: 15000, desc: "Профессиональные ботинки", img: "https://via.placeholder.com/400x400/6366f1/ffffff?text=Boots", hasSizes: true },
                    { id: 5, title: "Маска защитная", price: 3800, oldPrice: 4500, desc: "Двойная линза UV400", img: "https://via.placeholder.com/400x400/f59e0b/ffffff?text=Goggles", hasSizes: true },
                    { id: 6, title: "SPA-комплекс", price: 3500, desc: "Бассейн и сауна", img: "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=SPA", hasSizes: false },
                    { id: 7, title: "Перчатки Pro", price: 1500, desc: "Водонепроницаемые Gore-Tex", img: "https://via.placeholder.com/400x400/ec4899/ffffff?text=Gloves", hasSizes: true },
                    { id: 8, title: "Прокат лыж", price: 1200, desc: "Современное оборудование", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Rental", hasSizes: false },
                    { id: 9, title: "Носки термо", price: 800, desc: "Шерсть мериноса", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Socks", hasSizes: true },
                    { id: 10, title: "Палки лыжные", price: 2100, oldPrice: 2800, desc: "Алюминиевые с карбоном", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Poles", hasSizes: false },
                    { id: 11, title: "Фотосессия", price: 5000, desc: "50 фото в обработке", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Photo", hasSizes: false },
                    { id: 12, title: "Мазь для лыж", price: 600, desc: "До -5°C", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Wax", hasSizes: false },
                    { id: 13, title: "Рюкзак лавинный", price: 15000, oldPrice: 18000, desc: "Система ABS 30л", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Bag", hasSizes: false },
                    { id: 14, title: "Трансфер", price: 3000, desc: "Из аэропорта", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Transfer", hasSizes: false },
                    { id: 15, title: "Балаклава", price: 900, desc: "Дышащий флис", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Balaclava", hasSizes: true },
                    { id: 16, title: "Крем SPF 50+", price: 1100, desc: "Водостойкий", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Sun", hasSizes: false },
                    { id: 17, title: "Термос 1л", price: 2200, oldPrice: 2800, desc: "Держит тепло 12ч", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Thermos", hasSizes: false },
                    { id: 18, title: "Куртка мембранная", price: 4500, oldPrice: 6000, desc: "Мембрана 10000мм", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Jacket", hasSizes: true },
                    { id: 19, title: "Камера хранения", price: 800, desc: "24/7 доступ", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Locker", hasSizes: false },
                    { id: 20, title: "Ремонт снарядов", price: 1500, desc: "Заточка кантов", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Repair", hasSizes: false },
                    { id: 21, title: "Фестиваль снега", price: 0, desc: "Вход свободный", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Event", hasSizes: false },
                    { id: 22, title: "Детская школа", price: 3200, desc: "Группы 4-7 лет", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Kids", hasSizes: false },
                    { id: 23, title: "Открытие трассы", price: 0, desc: "Черная трасса Орёл", img: "https://via.placeholder.com/400x400/10b981/ffffff?text=Trail", hasSizes: false },
                    { id: 24, title: "Прогноз снега", price: 0, desc: "На 7 дней", img: "https://via.placeholder.com/400x400/94a3b8/ffffff?text=Weather", hasSizes: false }
                ];
                localStorage.setItem('skiResort_products', JSON.stringify(defaultProducts));
                console.log('✅ Загружено товаров:', defaultProducts.length);
            }

            // === ОТЕЛИ (7 шт) ===
            const existingHotels = localStorage.getItem('skiResort_hotels');
            if (!existingHotels || existingHotels === '[]') {
                console.log('🏨 Загрузка 7 отелей...');
                const defaultHotels = [
                    { id: 1, title: "Alpine Resort Hotel 5*", price: 8500, oldPrice: 11000, desc: "Роскошный отель в центре курорта", img: "https://via.placeholder.com/400x400/06b6d4/ffffff?text=Alpine+5*" },
                    { id: 2, title: "Mountain Lodge 4*", price: 6200, oldPrice: 7500, desc: "Уютное шале для семьи", img: "https://via.placeholder.com/400x400/3b82f6/ffffff?text=Lodge+4*" },
                    { id: 3, title: "Ski Chalet 3*", price: 4100, desc: "Бюджетный вариант", img: "https://via.placeholder.com/400x400/f43f5e/ffffff?text=Chalet+3*" },
                    { id: 4, title: "Grand Summit 5*", price: 15000, oldPrice: 18000, desc: "Премиум отель с SPA", img: "https://via.placeholder.com/400x400/f59e0b/ffffff?text=Grand+Summit" },
                    { id: 5, title: "Медвежья Лапа", price: 3500, desc: "Деревянный домик у горы", img: "https://via.placeholder.com/400x400/10b981/ffffff?text=Bear+Lodge" },
                    { id: 6, title: "Ice & Fire Glamping", price: 7500, oldPrice: 9000, desc: "Глэмпинг с панорамными окнами", img: "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Glamping" },
                    { id: 7, title: "Nordic Spa Hotel", price: 9200, desc: "Скандинавский минимализм", img: "https://via.placeholder.com/400x400/64748b/ffffff?text=Nordic+Spa" }
                ];
                localStorage.setItem('skiResort_hotels', JSON.stringify(defaultHotels));
                console.log('✅ Загружено отелей:', defaultHotels.length);
            }

            renderAll();
        }

        function renderAll() {
            renderProducts();
            renderHotels();
            renderUsers();
            renderOrders();
            renderBookings();
        }

        // === РЕНДЕР ТОВАРОВ ===
        function renderProducts() {
            const products = JSON.parse(localStorage.getItem('skiResort_products') || '[]');
            const grid = document.getElementById('productsGrid');
            if (!grid) return;

            if (products.length === 0) {
                grid.innerHTML = '<p class="empty-state">Нет товаров</p>';
                return;
            }

            grid.innerHTML = products.map((p, i) => `
                <div class="admin-card">
                    <img src="${p.img}" alt="${p.title}" onerror="this.style.display='none'">
                    <h4>${p.title}</h4>
                    <p style="font-size:18px;font-weight:700;color:var(--primary);margin:10px 0;">
                        ${p.price.toLocaleString('ru-RU')} ₽
                        ${p.oldPrice ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:14px;"> ${p.oldPrice.toLocaleString('ru-RU')} ₽</span>` : ''}
                    </p>
                    <p style="font-size:13px;color:var(--text-muted);margin-bottom:15px;">${p.desc || ''}</p>
                    <div class="admin-card-actions" style="display:flex; gap:10px;">
                        <button class="btn-edit" onclick="window.openProductModal(${i})" style="flex:1; background:#3b82f6; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:600;">✏️ Изменить</button>
                        <button class="btn-delete" onclick="window.deleteProduct(${i})" style="flex:1;">🗑️ Удалить</button>
                    </div>
                </div>
            `).join('');
        }

        // === РЕНДЕР ОТЕЛЕЙ ===
        function renderHotels() {
            console.log('🏨 renderHotels() вызвана');
            const hotels = JSON.parse(localStorage.getItem('skiResort_hotels') || '[]');
            const grid = document.getElementById('hotelsGrid');

            console.log('📊 Найдено отелей:', hotels.length);
            console.log('🔍 Grid элемент:', grid);

            if (!grid) {
                console.error('❌ hotelsGrid не найден!');
                return;
            }

            if (hotels.length === 0) {
                grid.innerHTML = '<p class="empty-state">Нет отелей</p>';
                console.log('✅ Пустой список отелей отрисован');
                return;
            }

            grid.innerHTML = hotels.map((h, i) => `
                <div class="admin-card">
                    <img src="${h.img}" alt="${h.title}" onerror="this.style.display='none'">
                    <h4>${h.title}</h4>
                    <p style="font-size:18px;font-weight:700;color:var(--primary);margin:10px 0;">
                        ${h.price.toLocaleString('ru-RU')} ₽ / ночь
                        ${h.oldPrice ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:14px;"> ${h.oldPrice.toLocaleString('ru-RU')} ₽</span>` : ''}
                    </p>
                    <p style="font-size:13px;color:var(--text-muted);margin-bottom:15px;">${h.desc || ''}</p>
                    <div class="admin-card-actions" style="display:flex; gap:10px;">
                        <button class="btn-edit" onclick="window.openHotelModal(${i})" style="flex:1; background:#3b82f6; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:600;">✏️ Изменить</button>
                        <button class="btn-delete" onclick="window.deleteHotel(${i})" style="flex:1;">🗑️ Удалить</button>
                    </div>
                </div>
            `).join('');
            console.log('✅ Отели отрисованы, карточек:', hotels.length);
        }
        // === РЕНДЕР ПОЛЬЗОВАТЕЛЕЙ ===
        function renderUsers() {
            const users = JSON.parse(localStorage.getItem('skiResort_users') || '[]');
            const tbody = document.querySelector('#usersTable tbody');
            if (!tbody) return;

            tbody.innerHTML = users.length ? users.map((u, i) => `
                <tr>
                    <td>${u.name || '-'}</td>
                    <td>${u.phone || '-'}</td>
                    <td>${u.email || '-'}</td>
                    <td>${u.date || '-'}</td>
                    <td><button class="btn-delete" onclick="window.deleteUser(${i})">Удалить</button></td>
                </tr>
            `).join('') : '<tr><td colspan="5" class="empty-state">Нет пользователей</td></tr>';
        }

        // === РЕНДЕР ЗАКАЗОВ ===
        function renderOrders() {
            const orders = JSON.parse(localStorage.getItem('skiResort_history_orders') || '[]');
            const grid = document.getElementById('ordersGrid');
            if (!grid) return;

            grid.innerHTML = orders.length ? orders.map((o, i) => `
                <div class="order-card">
                    <div class="card-header">
                        <h4 class="card-title">📦 ${o.title}</h4>
                        <span class="card-id">${o.id}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-item"><span class="card-label">Клиент</span><span class="card-value">${o.user || 'Гость'}</span></div>
                        <div class="card-item"><span class="card-label">Количество</span><span class="card-value">${o.qty || 1} шт.</span></div>
                    </div>
                    <div class="card-price">${(o.price || 0).toLocaleString('ru-RU')} ₽</div>
                    <div class="card-footer">
                        <span class="card-date">📅 ${o.date}</span>
                        <button class="btn-delete" onclick="window.deleteOrder(${i})">Удалить</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">Нет заказов</p>';
        }

        // === РЕНДЕР БРОНИРОВАНИЙ ===
        function renderBookings() {
            const bookings = JSON.parse(localStorage.getItem('skiResort_history_bookings') || '[]');
            const grid = document.getElementById('bookingsGrid');
            if (!grid) return;

            grid.innerHTML = bookings.length ? bookings.map((b, i) => `
                <div class="booking-card">
                    <div class="card-header">
                        <h4 class="card-title">🏨 ${b.title}</h4>
                        <span class="card-id">${b.id}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-item"><span class="card-label">Клиент</span><span class="card-value">${b.user || 'Гость'}</span></div>
                        <div class="card-item"><span class="card-label">Даты</span><span class="card-value">${b.dates || '-'}</span></div>
                    </div>
                    <div class="card-price">${(b.price || 0).toLocaleString('ru-RU')} ₽</div>
                    <div class="card-footer">
                        <span class="card-date">📅 Забронировано</span>
                        <button class="btn-delete" onclick="window.deleteBooking(${i})">Удалить</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">Нет бронирований</p>';
        }

        // === УДАЛЕНИЕ (ГЛОБАЛЬНЫЕ ФУНКЦИИ) ===
        window.deleteProduct = (index) => {
            if (!confirm('Удалить товар?')) return;
            let products = JSON.parse(localStorage.getItem('skiResort_products') || '[]');
            products.splice(index, 1);
            localStorage.setItem('skiResort_products', JSON.stringify(products));
            renderProducts();
            console.log('✅ Товар удалён');
        };

        window.deleteHotel = (index) => {
            if (!confirm('Удалить отель?')) return;
            let hotels = JSON.parse(localStorage.getItem('skiResort_hotels') || '[]');
            hotels.splice(index, 1);
            localStorage.setItem('skiResort_hotels', JSON.stringify(hotels));
            renderHotels();
            console.log('✅ Отель удалён');
        };

        window.deleteUser = (index) => {
            if (!confirm('Удалить пользователя?')) return;
            let users = JSON.parse(localStorage.getItem('skiResort_users') || '[]');
            users.splice(index, 1);
            localStorage.setItem('skiResort_users', JSON.stringify(users));
            renderUsers();
        };

        window.deleteOrder = (index) => {
            if (!confirm('Удалить заказ?')) return;
            let orders = JSON.parse(localStorage.getItem('skiResort_history_orders') || '[]');
            orders.splice(index, 1);
            localStorage.setItem('skiResort_history_orders', JSON.stringify(orders));
            renderOrders();
        };

        window.deleteBooking = (index) => {
            if (!confirm('Удалить бронирование?')) return;
            let bookings = JSON.parse(localStorage.getItem('skiResort_history_bookings') || '[]');
            bookings.splice(index, 1);
            localStorage.setItem('skiResort_history_bookings', JSON.stringify(bookings));
            renderBookings();
        };

        // === МОДАЛЬНЫЕ ОКНА: Открытие/Закрытие ===

        // Товары: открыть модалку (добавление или редактирование)
        window.openProductModal = (editIndex = null) => {
            const modal = document.getElementById('productModal');
            const form = document.getElementById('productForm');
            const title = document.getElementById('productModalTitle');

            form.reset();
            document.getElementById('editProductId').value = '';

            if (editIndex !== null && editIndex !== '') {
                // Режим редактирования
                title.textContent = '✏️ Редактировать товар';
                let products = JSON.parse(localStorage.getItem('skiResort_products') || '[]');
                const p = products[editIndex];
                document.getElementById('editProductId').value = editIndex;
                document.getElementById('pTitle').value = p.title || '';
                document.getElementById('pPrice').value = p.price || '';
                document.getElementById('pOldPrice').value = p.oldPrice || '';
                document.getElementById('pDesc').value = p.desc || '';
                document.getElementById('pImg').value = p.img || '';
                document.getElementById('pHasSizes').value = p.hasSizes ? 'true' : 'false';
            } else {
                // Режим добавления
                title.textContent = '➕ Добавить товар';
            }

            modal.classList.remove('hidden');
        };

        window.closeProductModal = () => {
            document.getElementById('productModal').classList.add('hidden');
        };

        // Отели: открыть модалку (добавление или редактирование)
        window.openHotelModal = function (editIndex) {
            console.log('🏨 openHotelModal вызвана, index:', editIndex);

            const modal = document.getElementById('hotelModal');
            const form = document.getElementById('hotelForm');
            const title = document.getElementById('hotelModalTitle');
            const editIdInput = document.getElementById('editHotelId');

            // Проверка элементов
            if (!modal) { console.error('❌ hotelModal не найден!'); return; }
            if (!form) { console.error('❌ hotelForm не найден!'); return; }
            if (!title) { console.error('❌ hotelModalTitle не найден!'); return; }
            if (!editIdInput) { console.error('❌ editHotelId не найден!'); return; }

            form.reset();
            editIdInput.value = '';

            // Если редактирование
            if (editIndex !== null && editIndex !== undefined && editIndex !== '') {
                title.textContent = '✏️ Редактировать отель';
                let hotels = JSON.parse(localStorage.getItem('skiResort_hotels') || '[]');
                const h = hotels[editIndex];
                if (h) {
                    editIdInput.value = editIndex;
                    document.getElementById('hTitle').value = h.title || '';
                    document.getElementById('hPrice').value = h.price || '';
                    document.getElementById('hOldPrice').value = h.oldPrice || '';
                    document.getElementById('hDesc').value = h.desc || '';
                    document.getElementById('hImg').value = h.img || '';
                }
            } else {
                // Если добавление
                title.textContent = '➕ Добавить отель';
            }

            modal.classList.remove('hidden');
            console.log('✅ Модальное окно отеля открыто');
        };

        window.closeHotelModal = function () {
            const modal = document.getElementById('hotelModal');
            if (modal) {
                modal.classList.add('hidden');
                console.log('✅ Модальное окно отеля закрыто');
            }
        };

        // === СОХРАНЕНИЕ ТОВАРА ===
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const editIndex = document.getElementById('editProductId').value;
            let products = JSON.parse(localStorage.getItem('skiResort_products') || '[]');

            const productData = {
                id: editIndex ? products[editIndex].id : Date.now(),
                title: document.getElementById('pTitle').value,
                price: parseInt(document.getElementById('pPrice').value) || 0,
                oldPrice: parseInt(document.getElementById('pOldPrice').value) || null,
                desc: document.getElementById('pDesc').value,
                img: document.getElementById('pImg').value,
                hasSizes: document.getElementById('pHasSizes').value === 'true',
                specs: {}
            };

            if (editIndex) {
                products[editIndex] = productData;
                console.log('✅ Товар обновлён');
            } else {
                products.push(productData);
                console.log('✅ Товар добавлен');
            }

            localStorage.setItem('skiResort_products', JSON.stringify(products));
            closeProductModal();
            renderProducts();
        });

        // === СОХРАНЕНИЕ ОТЕЛЯ ===
        document.getElementById('hotelForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📝 Форма отеля отправлена');

            const editIndex = document.getElementById('editHotelId').value;
            let hotels = JSON.parse(localStorage.getItem('skiResort_hotels') || '[]');
            console.log('📊 Отелей до сохранения:', hotels.length);

            const hotelData = {
                id: editIndex ? hotels[editIndex].id : Date.now(),
                title: document.getElementById('hTitle').value,
                price: parseInt(document.getElementById('hPrice').value) || 0,
                oldPrice: parseInt(document.getElementById('hOldPrice').value) || null,
                desc: document.getElementById('hDesc').value,
                img: document.getElementById('hImg').value,
                specs: {}
            };

            console.log('🏨 Сохраняем отель:', hotelData);

            if (editIndex) {
                hotels[editIndex] = hotelData;
                console.log('✅ Отель обновлён, индекс:', editIndex);
            } else {
                hotels.push(hotelData);
                console.log('✅ Отель добавлен, новый индекс:', hotels.length - 1);
            }

            localStorage.setItem('skiResort_hotels', JSON.stringify(hotels));
            console.log('💾 Сохранено в localStorage, всего отелей:', hotels.length);

            closeHotelModal();
            console.log('🔄 Вызываем renderHotels()...');
            renderHotels();
        });
    }
});