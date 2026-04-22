document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";
  const activeKey = document.body.dataset.nav || page;
  const icons = {
    category: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></svg>',
    mypage: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    orders: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h12v10H3zM15 10h3l3 3v3h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>'
  };
  const items = [
    { key: "category", href: "./category.html", icon: icons.category, label: "\uCE74\uD14C\uACE0\uB9AC" },
    { key: "search", href: "./search.html", icon: icons.search, label: "\uAC80\uC0C9" },
    { key: "home", href: "./index.html", icon: icons.home, label: "\uD648" },
    { key: "mypage", href: "./mypage.html", icon: icons.mypage, label: "\uB9C8\uC774\uD398\uC774\uC9C0" },
    { key: "orders", href: "./orders.html", icon: icons.orders, label: "\uC8FC\uBB38\uBC30\uC1A1" }
  ];

  document.querySelectorAll("[data-bottom-nav]").forEach((nav) => {
    nav.innerHTML = items.map((item) => `
      <a class="${activeKey === item.key ? "active" : ""}" href="${item.href}" aria-label="${item.label}">
        <span>${item.icon}</span>
        <b>${item.label}</b>
      </a>
    `).join("");
  });
});
