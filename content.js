(() => {
  const PURCHASE_PATH = "/mye/myebay/purchase";
  const BUY_AGAIN_PATH = "/mye/buyagain";
  const VIEW_MESSAGE_PATH = "/cnt/ViewMessage";
  const FULL_PURCHASE_VARIANT = new URLSearchParams({
    page: "1",
    moduleId: "122167",
    mp: "purchase-module-v2",
    type: "v2",
    pg: "purchase"
  });

  function shouldNormalizePurchaseUrl(url) {
    if (url.hostname !== "www.ebay.com" || url.pathname !== PURCHASE_PATH) {
      return false;
    }

    for (const [key, value] of FULL_PURCHASE_VARIANT.entries()) {
      if (url.searchParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  }

  function normalizePurchaseUrl() {
    const url = new URL(window.location.href);
    if (!shouldNormalizePurchaseUrl(url)) {
      return;
    }

    window.location.replace(`https://www.ebay.com${PURCHASE_PATH}`);
  }

  function redirectBuyAgainToError() {
    const url = new URL(window.location.href);
    if (url.hostname === "www.ebay.com" && url.pathname === BUY_AGAIN_PATH) {
      window.location.replace("https://www.ebay.com/n/error");
    }
  }

  function removeReadyToResellContainer() {
    const links = document.querySelectorAll("a");
    for (const link of links) {
      const text = link.textContent ? link.textContent.trim() : "";
      if (text !== "Ready to resell?") {
        continue;
      }

      const container = link.closest("aside") || link.closest("section") || link.parentElement;
      if (container) {
        container.remove();
      }
    }
  }

  function removePurchaseSearchControls() {
    if (window.location.pathname !== PURCHASE_PATH) {
      return;
    }

    const labels = document.querySelectorAll("span.floating-label");
    for (const wrapper of labels) {
      const label = wrapper.querySelector("label");
      const text = label && label.textContent ? label.textContent.trim() : "";
      if (text === "Search your orders") {
        wrapper.remove();
      }
    }

    const buttons = document.querySelectorAll("button.search-button, button[aria-label='Search your orders']");
    for (const button of buttons) {
      const aria = button.getAttribute("aria-label") || "";
      const text = button.textContent ? button.textContent.trim() : "";
      if (aria === "Search your orders" || text === "Search") {
        button.remove();
      }
    }
  }

  function removeDeletedMessageMenuItem() {
    if (window.location.pathname !== VIEW_MESSAGE_PATH) {
      return;
    }

    const menuItems = document.querySelectorAll("div.menu__item.menu__item--badged");
    for (const item of menuItems) {
      const span = item.querySelector("span");
      const text = span && span.textContent ? span.textContent.trim() : "";
      const action = item.getAttribute("data-action") || "";

      if (text === "Deleted" || action.includes("M2M_CHAT.DELETED")) {
        item.remove();
      }
    }
  }

  function removeShowHiddenElements() {
    const candidates = document.querySelectorAll("a, button, span, div, li, [role='button'], [role='menuitemradio']");
    for (const candidate of candidates) {
      const text = candidate.textContent
        ? candidate.textContent.replace(/\s+/g, " ").trim().toLowerCase()
        : "";

      if (!text.includes("show hidden")) {
        continue;
      }

      const removable =
        candidate.closest("a, button, [role='button'], [role='menuitemradio'], .filter-link, .pill-filter") ||
        candidate;
      removable.remove();
    }
  }

  function applyRemovals() {
    removeReadyToResellContainer();
    removePurchaseSearchControls();
    removeDeletedMessageMenuItem();
    removeShowHiddenElements();
  }

  function startObserver() {
    const observer = new MutationObserver(() => {
      applyRemovals();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  normalizePurchaseUrl();
  redirectBuyAgainToError();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyRemovals, { once: true });
  } else {
    applyRemovals();
  }

  startObserver();
})();
