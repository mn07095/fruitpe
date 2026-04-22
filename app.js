const won = (value) => `${value.toLocaleString("ko-KR")}원`;
const params = new URLSearchParams(location.search);
const cartKey = "fruitpe-cart";
const wishKey = "fruitpe-wishlist";
const couponKey = "fruitpe-coupon";
const maskName = (name) => `${name.slice(0, 1)}**`;

const getCart = () => JSON.parse(localStorage.getItem(cartKey) || "[]");
const setCart = (items) => localStorage.setItem(cartKey, JSON.stringify(items));
const getWishlist = () => JSON.parse(localStorage.getItem(wishKey) || "[]");
const setWishlist = (items) => localStorage.setItem(wishKey, JSON.stringify(items));
const hasCoupon = () => localStorage.getItem(couponKey) === "true";

function getCartRows() {
  return getCart()
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      return product ? { ...entry, product } : null;
    })
    .filter(Boolean);
}

function getCartTotals() {
  const rows = getCartRows();
  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 30000 ? 0 : 3000;
  const discount = hasCoupon() && subtotal >= 15000 ? 3000 : 0;
  return { rows, subtotal, shipping, discount, total: Math.max(0, subtotal + shipping - discount) };
}

const productImage = (product, className = "product-photo") => `
  <figure class="${className}">
    <img src="${product.image}" alt="${product.name}" />
  </figure>
`;

const badgeText = (product) => (product.badge === "deal" ? "특가" : "베스트");

const categoryGroups = {
  all: {
    title: "전체 상품",
    eyebrow: "산지에서 바로 고른 신선함",
    lead: "과일과 채소를 한 번에 살펴보고, 타임특가와 베스트 상품까지 빠르게 담아보세요.",
    stat: "전체",
    imageId: "banana",
    subs: [
      { label: "타임특가", href: "./category.html?group=deal", ids: ["banana", "chamoe", "cucumber", "carrot"] },
      { label: "베스트", href: "./category.html?group=best", ids: ["apple", "grape", "orange", "sweet-potato"] },
      { label: "과일", href: "./category.html?type=fruit", ids: ["apple", "banana", "grape", "orange"] },
      { label: "채소", href: "./category.html?type=vegetable", ids: ["tomato", "cucumber", "sweet-potato", "potato"] }
    ]
  },
  fruit: {
    title: "과일",
    eyebrow: "제철 과일 모아보기",
    lead: "당도, 산지, 보관 상태를 기준으로 고른 과일만 모았습니다.",
    stat: "과일",
    imageId: "chamoe",
    subs: [
      { label: "제철과일", href: "./category.html?type=fruit&group=season", ids: ["banana", "chamoe", "orange"] },
      { label: "사과/감귤", href: "./category.html?type=fruit&group=apple-citrus", ids: ["apple", "orange"] },
      { label: "포도/베리", href: "./category.html?type=fruit&group=berry", ids: ["grape", "blueberry"] },
      { label: "키위/망고", href: "./category.html?type=fruit&group=tropical", ids: ["ruby-kiwi", "mango"] }
    ]
  },
  vegetable: {
    title: "채소",
    eyebrow: "오늘 손질하기 좋은 채소",
    lead: "샐러드, 구이, 찜까지 바로 쓰기 좋은 채소를 용도별로 나눴습니다.",
    stat: "채소",
    imageId: "cucumber",
    subs: [
      { label: "샐러드 채소", href: "./category.html?type=vegetable&group=salad", ids: ["tomato", "cucumber"] },
      { label: "뿌리채소", href: "./category.html?type=vegetable&group=root", ids: ["carrot", "potato", "sweet-potato", "onion"] },
      { label: "구이/찜", href: "./category.html?type=vegetable&group=roast", ids: ["sweet-potato", "corn", "potato"] },
      { label: "알뜰 장보기", href: "./category.html?type=vegetable&group=value", ids: ["onion", "carrot", "cucumber"] }
    ]
  },
  deal: {
    title: "타임특가",
    eyebrow: "오늘 자정 종료",
    lead: "할인율이 높은 상품부터 빠르게 볼 수 있는 한정 특가입니다.",
    stat: "특가",
    imageId: "banana",
    subs: []
  },
  best: {
    title: "베스트",
    eyebrow: "구매후기로 검증",
    lead: "구매수와 평점이 좋은 상품을 먼저 모았습니다.",
    stat: "베스트",
    imageId: "apple",
    subs: []
  }
};

const groupIds = Object.values(categoryGroups)
  .flatMap((group) => group.subs)
  .reduce((map, item) => {
    const group = new URL(item.href, location.href).searchParams.get("group");
    return group ? { ...map, [group]: item.ids } : map;
  }, {});

const card = (product) => `
  <a class="product-card" href="./product.html?id=${product.id}">
    ${productImage(product)}
    <div class="card-meta">
      <span class="pill">${badgeText(product)}</span>
      <span class="review-chip">★ ${product.rating} (${product.reviewCount})</span>
    </div>
    <h3>${product.name}</h3>
    <p>${product.subtitle}</p>
    <div class="price-row"><em>${product.discount}%</em><strong>${won(product.price)}</strong></div>
  </a>
`;

const listItem = (product) => `
  <a class="list-item" href="./product.html?id=${product.id}">
    ${productImage(product)}
    <div>
      <span class="pill">산지직송</span>
      <h3>${product.name}</h3>
      <p>${product.subtitle}</p>
      <div class="price-row"><em>${product.discount}%</em><strong>${won(product.price)}</strong></div>
      <span class="review-line">리뷰 ${product.reviewCount}개 · 평점 ${product.rating}</span>
    </div>
  </a>
`;

function addToCart(id, next = "./cart.html") {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  setCart(cart);
  location.href = next;
}

function addToCartWithQty(id, qty = 1, next = "./cart.html") {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, qty });
  setCart(cart);
  location.href = next;
}

function updateCartQty(id, delta) {
  const next = getCart()
    .map((entry) => entry.id === id ? { ...entry, qty: Math.max(1, entry.qty + delta) } : entry)
    .filter((entry) => entry.qty > 0);
  setCart(next);
  renderCart();
}

function removeCartItem(id) {
  setCart(getCart().filter((entry) => entry.id !== id));
  showToast("상품을 장바구니에서 뺐어요.");
  renderCart();
}

function clearCart() {
  if (!getCart().length) {
    showToast("장바구니가 이미 비어 있어요.");
    return;
  }
  setCart([]);
  showToast("장바구니를 비웠어요.");
  renderCart();
}

function toggleWish(id) {
  const list = getWishlist();
  const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  setWishlist(next);
  showToast(next.includes(id) ? "찜한상품에 담았어요." : "찜한상품에서 뺐어요.");
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function openMenu() {
  let drawer = document.querySelector(".menu-drawer");
  if (!drawer) {
    drawer = document.createElement("aside");
    drawer.className = "menu-drawer";
    drawer.innerHTML = `
      <div class="drawer-panel">
        <button type="button" class="drawer-close" aria-label="닫기">×</button>
        <strong>프루피 장터</strong>
        <p>산지직송 특가와 제철 추천을 빠르게 둘러보세요.</p>
        <div class="drawer-highlight">
          <span>친구 초대 리워드</span>
          <b>3,000P 적립</b>
          <button type="button" data-reward-copy>URL 복사</button>
        </div>
        <a href="./index.html#season">타임특가</a>
        <a href="./index.html#pick">프루피픽</a>
        <a href="./category.html?type=fruit">과일특집</a>
        <a href="./category.html?type=vegetable">채소특집</a>
        <a href="./wishlist.html">찜한상품</a>
        <a href="./mypage.html">이벤트/멤버십</a>
      </div>
    `;
    document.body.appendChild(drawer);
  }
  drawer.classList.add("visible");
  requestAnimationFrame(() => drawer.classList.add("open"));
  document.body.classList.add("drawer-locked");
}

function closeMenu() {
  const drawer = document.querySelector(".menu-drawer");
  if (!drawer) return;
  drawer.classList.remove("open");
  document.body.classList.remove("drawer-locked");
  window.setTimeout(() => drawer.classList.remove("visible"), 220);
}

function renderHome() {
  document.querySelector("#bestProducts").innerHTML = products.slice(0, 4).map(card).join("");
  document.querySelector("#dealProducts").innerHTML = products.filter((item) => item.badge === "deal").map(listItem).join("");
  const shortcut = document.querySelector("#categoryShortcut");
  if (shortcut) {
    shortcut.innerHTML = [
      ["타임특가", "./time-sale.html", "오늘 마감", "banana"],
      ["과일", "./category.html?type=fruit", "제철 당도 선별", "chamoe"],
      ["채소", "./category.html?type=vegetable", "샐러드·구이용", "cucumber"],
      ["베스트", "./category.html?group=best", "후기 많은 상품", "apple"],
      ["프루피픽", "./pick.html", "MD 추천", "orange"],
      ["이벤트", "./event.html", "친구초대 리워드", "sweet-potato"]
    ].map(([label, href, text, id]) => {
      const product = products.find((item) => item.id === id) || products[0];
      return `
        <a href="${href}">
          <img src="${product.image}" alt="" />
          <strong>${label}</strong>
          <span>${text}</span>
        </a>
      `;
    }).join("");
  }
  const reviewHighlights = document.querySelector("#reviewHighlights");
  if (reviewHighlights) {
    reviewHighlights.innerHTML = [...products]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 3)
      .map((product) => `
        <a class="review-highlight-card" href="./product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <strong>${product.name}</strong>
            <p>★ ${product.rating} · 후기 ${product.reviewCount}개</p>
            <blockquote>${product.reviews[0][1]}</blockquote>
          </div>
        </a>
      `).join("");
  }
}

function renderCategory() {
  const view = document.body.dataset.view;
  const type = params.get("type");
  const group = params.get("group");
  const sort = params.get("sort") || "recommend";
  let filtered = type ? products.filter((item) => item.type === type) : products;
  let key = type === "fruit" ? "fruit" : type === "vegetable" ? "vegetable" : "all";
  if (group === "deal") key = "deal";
  if (group === "best") key = "best";
  let config = categoryGroups[key] || categoryGroups.all;
  let title = config.title;

  if (view === "time-sale") {
    filtered = products.filter((item) => item.badge === "deal").sort((a, b) => b.discount - a.discount);
    title = "타임특가";
    startDealTimer();
  }
  if (view === "pick") {
    filtered = [...products].sort((a, b) => (b.rating - a.rating) || (b.reviewCount - a.reviewCount)).slice(0, 8);
    title = "프루피픽";
  }

  if (!view) {
    if (group === "deal") filtered = products.filter((item) => item.badge === "deal");
    if (group === "best") filtered = products.filter((item) => item.badge === "best");
    if (groupIds[group]) filtered = products.filter((item) => groupIds[group].includes(item.id));
    filtered = sortProducts(filtered, sort);
    renderCategoryMenu(config, filtered, sort, key, group);
  }

  const titleEl = document.querySelector("#categoryTitle");
  if (titleEl) titleEl.textContent = title;
  const countEl = document.querySelector("#productCount");
  if (countEl) countEl.textContent = `상품 ${filtered.length}개`;
  const productsEl = document.querySelector("#categoryProducts");
  if (productsEl) productsEl.innerHTML = filtered.map(card).join("");
}

function sortProducts(items, sort) {
  const list = [...items];
  if (sort === "review") return list.sort((a, b) => b.reviewCount - a.reviewCount);
  if (sort === "discount") return list.sort((a, b) => b.discount - a.discount);
  if (sort === "price") return list.sort((a, b) => a.price - b.price);
  return list.sort((a, b) => (b.badge === "deal") - (a.badge === "deal") || b.rating - a.rating);
}

function renderCategoryMenu(config, filtered, sort, key, group) {
  document.querySelector("#categoryEyebrow").textContent = config.eyebrow;
  const summary = document.querySelector("#categorySummary");
  const feature = document.querySelector("#categoryFeature");
  const subGrid = document.querySelector("#subCategoryGrid");
  const curation = document.querySelector("#categoryCuration");
  const sortButtons = document.querySelector("#sortButtons");
  const curationTitle = document.querySelector("#curationTitle");
  const activeLink = group === "deal" || group === "best" ? group : key;

  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.categoryLink === activeLink);
  });

  const featureProduct = products.find((item) => item.id === config.imageId) || filtered[0] || products[0];
  const best = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount)[0] || featureProduct;
  summary.innerHTML = `
    <span>${config.stat} ${filtered.length}개</span>
    <span>산지직송 ${filtered.length}개</span>
    <span>평점 ${best.rating}</span>
  `;
  feature.innerHTML = `
    <a href="./product.html?id=${featureProduct.id}">
      <img src="${featureProduct.image}" alt="${featureProduct.name}" />
      <span>
        <b>${config.lead}</b>
        <em>${featureProduct.name} ${won(featureProduct.price)}</em>
      </span>
    </a>
  `;
  subGrid.innerHTML = (config.subs.length ? config.subs : [
    { label: "특가 전체", href: "./time-sale.html", ids: filtered.slice(0, 3).map((item) => item.id) },
    { label: "구매후기순", href: `${baseCategoryHref()}sort=review`, ids: filtered.slice(0, 3).map((item) => item.id) },
    { label: "할인율순", href: `${baseCategoryHref()}sort=discount`, ids: filtered.slice(0, 3).map((item) => item.id) }
  ]).map((item) => {
    const preview = item.ids.map((id) => products.find((product) => product.id === id)).filter(Boolean).slice(0, 3);
    return `
      <a href="${item.href}">
        <strong>${item.label}</strong>
        <span>${preview.map((product) => product.name.replace("프루피 ", "")).join(" · ")}</span>
      </a>
    `;
  }).join("");
  curationTitle.textContent = key === "all" ? "지금 담기 좋은 상품" : `${config.title} 추천 상품`;
  curation.innerHTML = [...filtered].sort((a, b) => b.discount - a.discount).slice(0, 4).map(listItem).join("");
  sortButtons.innerHTML = [
    ["recommend", "추천순"],
    ["review", "후기순"],
    ["discount", "할인율순"],
    ["price", "낮은가격순"]
  ].map(([value, label]) => `<a class="${sort === value ? "active" : ""}" href="${baseCategoryHref()}sort=${value}">${label}</a>`).join("");
}

function baseCategoryHref() {
  const next = new URLSearchParams(location.search);
  next.delete("sort");
  const query = next.toString();
  return `./category.html${query ? `?${query}&` : "?"}`;
}

function startDealTimer() {
  const timer = document.querySelector("#dealTimer");
  if (!timer) return;
  const tick = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end - now);
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    timer.textContent = `${h}:${m}:${s}`;
  };
  tick();
  setInterval(tick, 1000);
}

function renderProduct() {
  const product = products.find((item) => item.id === params.get("id")) || products[0];
  const related = products.filter((item) => item.type === product.type && item.id !== product.id).slice(0, 3);
  let detailQty = 1;
  document.title = `${product.name} | 프루피`;
  document.querySelector("#productDetail").innerHTML = `
    <section class="detail-hero">
      <img src="${product.image}" alt="${product.name}" />
    </section>
    <section class="detail-info">
      <span class="pill">산지직송</span>
      <h1>${product.name}</h1>
      <p>${product.subtitle}</p>
      <div class="detail-price">
        <em>${product.discount}%</em>
        <strong>${won(product.price)}</strong>
        <del>${won(product.original)}</del>
      </div>
      <div class="review-summary">
        <strong>★ ${product.rating}</strong>
        <span>구매후기 ${product.reviewCount}개</span>
      </div>
      <div class="md-strip">
        <span>MD 직접 검수</span>
        <span>신선 책임 보장</span>
        <span>오늘 특가</span>
      </div>
      <div class="benefit-box">
        <strong>첫 구매 쿠폰 적용 시 ${won(Math.max(0, product.price - 3000))}</strong>
        <span>15,000원 이상 구매 시 3,000원 즉시 할인</span>
        <button type="button" class="copy-btn" data-coupon-apply>쿠폰 적용</button>
      </div>
      <dl>
        <div><dt>원산지</dt><dd>${product.origin}</dd></div>
        <div><dt>구성</dt><dd>${product.unit}</dd></div>
        <div><dt>보관</dt><dd>${product.storage}</dd></div>
        <div><dt>배송</dt><dd>${product.delivery}</dd></div>
      </dl>
      <div class="option-panel">
        <label>옵션 선택
          <select>
            <option>${product.name} · ${product.unit}</option>
            <option>${product.name} 2세트 묶음 · 5% 추가 할인</option>
          </select>
        </label>
        <div class="quantity-row">
          <span>수량</span>
          <div>
            <button type="button" data-detail-qty="-1">−</button>
            <strong id="detailQty">1</strong>
            <button type="button" data-detail-qty="1">+</button>
          </div>
        </div>
        <p>예상 결제금액 <strong id="detailTotal">${won(product.price)}</strong></p>
      </div>
    </section>

    <nav class="detail-tabs" aria-label="상품 상세 탭">
      <a href="#detail">상세정보</a>
      <a href="#review">리뷰 ${product.reviewCount}</a>
      <a href="#qna">Q&A</a>
      <a href="#notice">배송/교환</a>
    </nav>

    <section class="detail-section" id="detail">
      <h2>상품 상세정보</h2>
      <img class="wide-detail-image" src="${product.image}" alt="${product.name} 상세 이미지" />
      <p>${product.detail}</p>
      <ul class="point-list">
        ${product.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
      <div class="info-panel">
        <h3>프루피 선별 기준</h3>
        <p>입고 당일 외관, 중량, 신선도를 확인하고 배송 중 손상이 적도록 완충 포장합니다.</p>
      </div>
      <div class="fresh-checklist">
        <article><strong>01</strong><span>산지 입고</span><p>수확 직후 입고된 상품만 선별합니다.</p></article>
        <article><strong>02</strong><span>외관 검수</span><p>무름, 상처, 과숙 여부를 한 번 더 확인합니다.</p></article>
        <article><strong>03</strong><span>맞춤 포장</span><p>과일과 채소별 보관 온도에 맞춰 포장합니다.</p></article>
      </div>
      <div class="packing-panel">
        <h3>포장 안내</h3>
        <div>
          <span>1</span><p>산지 입고 후 무름, 상처, 중량을 확인합니다.</p>
          <span>2</span><p>상품별 완충재와 보냉 포장으로 흔들림을 줄입니다.</p>
          <span>3</span><p>수령 후 바로 확인할 수 있도록 보관법을 함께 안내합니다.</p>
        </div>
      </div>
    </section>

    <section class="detail-section" id="review">
      <div class="section-title">
        <h2>구매후기</h2>
        <span>평균 ${product.rating}</span>
      </div>
      <div class="review-meter">
        <strong>${product.rating}</strong>
        <div>
          <span style="width:${Math.round(product.rating * 20)}%"></span>
        </div>
        <p>최근 30일 기준 만족도가 높은 상품입니다.</p>
      </div>
      <div class="photo-review-grid">
        ${product.reviews.slice(0, 3).map(([name, body]) => `
          <article>
            <img src="${product.image}" alt="" />
            <strong>${maskName(name)}</strong>
            <p>${body}</p>
          </article>
        `).join("")}
      </div>
      <div class="review-list">
        ${product.reviews.map(([name, body, date]) => `
          <article class="review-card">
            <div><strong>${maskName(name)}</strong><span>${date}</span></div>
            <p>★★★★★</p>
            <blockquote>${body}</blockquote>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="detail-section" id="qna">
      <div class="section-title">
        <h2>상품 Q&A</h2>
        <button type="button" class="line-btn">문의하기</button>
      </div>
      <div class="qna-list">
        ${product.qna.map(([question, answer]) => `
          <details>
            <summary><span>Q</span>${question}</summary>
            <p><span>A</span>${answer}</p>
          </details>
        `).join("")}
      </div>
    </section>

    <section class="detail-section notice" id="notice">
      <h2>배송/교환 안내</h2>
      <div class="notice-grid">
        <article><strong>배송</strong><p>평일 오전 주문은 산지 상황에 맞춰 당일 또는 익일 출고됩니다.</p></article>
        <article><strong>신선식품 안내</strong><p>기후와 수확 시점에 따라 크기, 색, 당도는 조금씩 달라질 수 있습니다.</p></article>
        <article><strong>교환/환불</strong><p>상품 이상은 수령 당일 사진과 함께 접수해주시면 빠르게 확인합니다.</p></article>
      </div>
    </section>

    <section class="detail-section">
      <div class="section-title">
        <h2>함께 많이 담았어요</h2>
        <a href="./category.html?type=${product.type}">더보기</a>
      </div>
      <div class="product-list">
        ${related.map(listItem).join("")}
      </div>
    </section>

    <div class="buy-bar">
      <button type="button" class="wish-btn" onclick="toggleWish('${product.id}')">찜하기</button>
      <button type="button" data-detail-cart="${product.id}">장바구니 담기</button>
      <a href="./checkout.html" data-detail-buy="${product.id}">바로 구매</a>
    </div>
  `;
  window.updateDetailQty = (delta) => {
    detailQty = Math.max(1, detailQty + delta);
    document.querySelector("#detailQty").textContent = detailQty;
    document.querySelector("#detailTotal").textContent = won(product.price * detailQty);
  };
}

function renderCart() {
  const { rows, subtotal, shipping, discount, total } = getCartTotals();
  const cartItems = document.querySelector("#cartItems");
  const summary = document.querySelector("#cartSummary");
  const checkout = document.querySelector("#cartCheckout");
  const couponButton = document.querySelector("[data-coupon-apply]");

  if (!rows.length) {
    cartItems.innerHTML = `
      <div class="empty-box">
        <strong>장바구니가 비어 있어요.</strong>
        <p>오늘의 타임특가와 제철 상품을 먼저 담아보세요.</p>
        <a href="./category.html">상품 보러가기</a>
      </div>
    `;
    summary.innerHTML = "";
    checkout.classList.add("disabled");
    checkout.setAttribute("aria-disabled", "true");
  } else {
    checkout.classList.remove("disabled");
    checkout.removeAttribute("aria-disabled");
    cartItems.innerHTML = rows.map(({ product, qty }) => `
      <article class="cart-item">
        ${productImage(product)}
        <div class="cart-info">
          <button type="button" class="cart-remove" data-cart-remove="${product.id}" aria-label="${product.name} 삭제">×</button>
          <h3>${product.name}</h3>
          <p>${product.unit} · ${product.delivery}</p>
          <div class="cart-control">
            <button type="button" data-cart-dec="${product.id}" aria-label="수량 감소">−</button>
            <span>${qty}</span>
            <button type="button" data-cart-inc="${product.id}" aria-label="수량 증가">+</button>
          </div>
          <strong>${won(product.price * qty)}</strong>
        </div>
      </article>
    `).join("");
  }

  if (summary) {
    summary.innerHTML = `
      <div><span>상품 금액</span><strong>${won(subtotal)}</strong></div>
      <div><span>배송비</span><strong>${shipping ? won(shipping) : "무료"}</strong></div>
      <div><span>쿠폰 할인</span><strong>-${won(discount)}</strong></div>
      <div class="summary-total"><span>결제 예정 금액</span><strong>${won(total)}</strong></div>
      ${subtotal > 0 && subtotal < 30000 ? `<p>${won(30000 - subtotal)} 더 담으면 무료배송</p>` : `<p>무료배송 혜택이 적용됐어요.</p>`}
    `;
  }

  if (couponButton) {
    couponButton.textContent = hasCoupon() ? "적용완료" : "적용";
    couponButton.disabled = hasCoupon();
  }

  const recommended = products.filter((product) => !rows.some((row) => row.id === product.id)).slice(0, 3);
  const recommendBox = document.querySelector("#cartRecommendations");
  if (recommendBox) recommendBox.innerHTML = recommended.map(listItem).join("");
}

function renderCheckout() {
  const { total } = getCartTotals();
  document.querySelector("#checkoutTotal").textContent = won(total || products[0].price);
}

function renderWishlist() {
  const items = getWishlist().map((id) => products.find((item) => item.id === id)).filter(Boolean);
  const box = document.querySelector("#wishlistItems");
  if (!items.length) {
    box.innerHTML = `
      <div class="empty-box">
        <strong>아직 찜한 상품이 없어요.</strong>
        <p>상품 상세에서 찜하기를 누르면 여기에 모아둘 수 있어요.</p>
        <a href="./category.html">상품 보러가기</a>
      </div>
    `;
    return;
  }
  box.innerHTML = items.map(listItem).join("");
}

function renderSearch() {
  const input = document.querySelector("#searchInput");
  const box = document.querySelector("#searchProducts");
  const count = document.querySelector("#searchCount");
  const draw = () => {
    const keyword = input.value.trim().toLowerCase();
    const result = keyword
      ? products.filter((item) => `${item.name} ${item.subtitle} ${item.origin}`.toLowerCase().includes(keyword))
      : products.slice(0, 6);
    count.textContent = keyword ? `검색 결과 ${result.length}개` : "추천 상품";
    box.innerHTML = result.length ? result.map(card).join("") : `
      <div class="empty-box">
        <strong>검색 결과가 없어요.</strong>
        <p>다른 과일이나 채소 이름으로 검색해보세요.</p>
      </div>
    `;
  };
  input.addEventListener("input", draw);
  document.querySelectorAll(".popular-keywords button").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.textContent;
      draw();
    });
  });
  draw();
}

document.addEventListener("click", (event) => {
  const target = event.target;
  const menuButton = target.closest?.('button[aria-label="메뉴"]');
  const couponButton = target.closest?.(".coupon-band button");
  const closeButton = target.closest?.(".drawer-close");
  const drawerBackdrop = target.classList?.contains("menu-drawer");
  const qnaButton = target.closest?.(".line-btn");
  const payButton = target.closest?.('button.checkout-btn');
  const cartInc = target.closest?.("[data-cart-inc]");
  const cartDec = target.closest?.("[data-cart-dec]");
  const cartRemove = target.closest?.("[data-cart-remove]");
  const cartClear = target.closest?.("[data-cart-clear]");
  const couponApply = target.closest?.("[data-coupon-apply]");
  const rewardCopy = target.closest?.("[data-reward-copy]");
  const detailQtyButton = target.closest?.("[data-detail-qty]");
  const detailCart = target.closest?.("[data-detail-cart]");
  const detailBuy = target.closest?.("[data-detail-buy]");

  if (menuButton) openMenu();
  if (couponButton) {
    couponButton.textContent = "발급완료";
    couponButton.disabled = true;
    showToast("첫 구매 쿠폰이 발급됐어요.");
  }
  if (closeButton || drawerBackdrop) closeMenu();
  if (qnaButton) showToast("상품 문의가 접수되었습니다.");
  if (payButton) showToast("주문이 접수되었습니다. 결제 모듈 연결 전 샘플 상태예요.");
  if (cartInc) updateCartQty(cartInc.dataset.cartInc, 1);
  if (cartDec) updateCartQty(cartDec.dataset.cartDec, -1);
  if (cartRemove) removeCartItem(cartRemove.dataset.cartRemove);
  if (cartClear) clearCart();
  if (couponApply) {
    localStorage.setItem(couponKey, "true");
    showToast("첫 구매 쿠폰을 적용했어요.");
    couponApply.textContent = "적용완료";
    couponApply.disabled = true;
    if (page === "cart") renderCart();
  }
  if (rewardCopy) {
    navigator.clipboard?.writeText(location.origin + location.pathname);
    showToast("리워드 URL을 복사했어요.");
  }
  if (detailQtyButton) window.updateDetailQty?.(Number(detailQtyButton.dataset.detailQty));
  if (detailCart) {
    const qty = Number(document.querySelector("#detailQty")?.textContent || 1);
    addToCartWithQty(detailCart.dataset.detailCart, qty);
  }
  if (detailBuy) {
    event.preventDefault();
    const qty = Number(document.querySelector("#detailQty")?.textContent || 1);
    addToCartWithQty(detailBuy.dataset.detailBuy, qty, "./checkout.html");
  }
});

const page = document.body.dataset.page;
if (page === "home") renderHome();
if (page === "category") renderCategory();
if (page === "product") renderProduct();
if (page === "cart") renderCart();
if (page === "checkout") renderCheckout();
if (page === "wishlist") renderWishlist();
if (page === "search") renderSearch();
