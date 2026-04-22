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
    <img src="${product.image}" alt="${product.name}" loading="lazy" />
  </figure>
`;

const badgeText = (product) => (product.badge === "deal" ? "특가" : "베스트");

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
        <strong>프루피 바로가기</strong>
        <a href="./category.html?type=fruit">과일 신상품</a>
        <a href="./category.html?type=vegetable">채소 산지직송</a>
        <a href="./index.html#sale">오늘의 타임특가</a>
        <a href="./wishlist.html">찜한상품</a>
        <a href="./mypage.html">멤버십 혜택</a>
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
}

function renderCategory() {
  const type = params.get("type");
  const filtered = type ? products.filter((item) => item.type === type) : products;
  const title = type === "fruit" ? "과일" : type === "vegetable" ? "채소" : "전체 상품";
  document.querySelector("#categoryTitle").textContent = title;
  document.querySelector("#productCount").textContent = `상품 ${filtered.length}개`;
  document.querySelector("#categoryProducts").innerHTML = filtered.map(card).join("");
}

function renderProduct() {
  const product = products.find((item) => item.id === params.get("id")) || products[0];
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
      <dl>
        <div><dt>원산지</dt><dd>${product.origin}</dd></div>
        <div><dt>구성</dt><dd>${product.unit}</dd></div>
        <div><dt>보관</dt><dd>${product.storage}</dd></div>
        <div><dt>배송</dt><dd>${product.delivery}</dd></div>
      </dl>
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

    <div class="buy-bar">
      <button type="button" class="wish-btn" onclick="toggleWish('${product.id}')">찜하기</button>
      <button type="button" onclick="addToCart('${product.id}')">장바구니 담기</button>
      <a href="./checkout.html" onclick="addToCart('${product.id}', './checkout.html'); return false;">바로 구매</a>
    </div>
  `;
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
    renderCart();
  }
});

const page = document.body.dataset.page;
if (page === "home") renderHome();
if (page === "category") renderCategory();
if (page === "product") renderProduct();
if (page === "cart") renderCart();
if (page === "checkout") renderCheckout();
if (page === "wishlist") renderWishlist();
