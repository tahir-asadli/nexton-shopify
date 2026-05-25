const EVENTS = {
  CART_UPDATED: 'cart-updated',
  PRODUCT_ADDED: 'product-added',
  OPEN_CART_DRAWER: 'open-cart-drawer',
  CLOSE_CART_DRAWER: 'close-cart-drawer',
  OPEN_IMAGE_VIEWER: 'open-image-viewer',
  CLOSE_IMAGE_VIEWER: 'close-image-viewer',
  SHOW_NOTIFICATION: 'show-notification',
  HIDE_NOTIFICATION: 'hide-notification',
  OPEN_PRODUCT_DIALOG: 'open-product-dialog',
  CLOSE_PRODUCT_DIALOG: 'close-product-dialog',
  UPDATE_CART_BUTTON: 'update-cart-button',
}

class Announcement extends HTMLElement {

  constructor() {
    super();
    this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
  }

  connectedCallback() {
    this.closeButton = this.querySelector('button');
    this.closeButton?.addEventListener('click', this.handleCloseButtonClick);
    document.documentElement.classList.add('has-announcement');
  }

  disconnectedCallback() {
    this.closeButton?.removeEventListener('click', this.handleCloseButtonClick);
    document.documentElement.classList.remove('has-announcement');
  }

  handleCloseButtonClick(event) {
    this.remove();
  }

}
customElements.define('announcement-bar', Announcement);

class Notification extends HTMLElement {

  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  connectedCallback() {
    this.messageEl = this.querySelector('span[data-message]');
    this.containerEl = this.querySelector('.container');
    document.addEventListener(EVENTS.SHOW_NOTIFICATION, this.open);
    document.addEventListener(EVENTS.HIDE_NOTIFICATION, this.close);
  }

  disconnectedCallback() {
    document.removeEventListener(EVENTS.SHOW_NOTIFICATION, this.open);
    document.removeEventListener(EVENTS.HIDE_NOTIFICATION, this.close);
  }

  open(e) {
    this.messageEl.innerHTML = e.detail.message;
    this.containerEl.classList.remove(e.detail.type == 'error' ? 'success' : 'error')
    this.containerEl.classList.add(e.detail.type == 'success' ? 'success' : 'error')
    this.style.display = 'block'
  }

  close() {
    this.style.display = 'none'
    this.messageEl.innerHTML = '';
    this.containerEl.classList.remove('success')
    this.containerEl.classList.remove('error')
  }

}

customElements.define('notification-bar', Notification)

class SearchBar extends HTMLElement {

  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.input = this.form.querySelector('input[name="q"]');
    this.clearButton = this.form.querySelector('[data-clear]');

    this.input?.addEventListener('input', this.handleInput);
    this.clearButton?.addEventListener('click', this.handleClear);

    if (this.input && this.clearButton) {
      if (this.input.value.trim() !== '') {
        this.clearButton.classList.remove('hidden');
        this.classList.add('search-active');
      } else {
        this.clearButton.classList.add('hidden');
        this.classList.remove('search-active');
      }
    }

  }

  disconnectedCallback() {
    this.clearButton?.removeEventListener('click', this.handleClearButtonClick);
  }

  handleInput() {
    if (this.input && this.clearButton) {
      if (this.input.value.trim() !== '') {
        this.clearButton?.classList.remove('hidden');
      } else {
        this.clearButton?.classList.add('hidden');
      }
    }
  }

  handleClear() {
    if (this.input && this.clearButton) {
      this.input.value = '';
      this.clearButton.classList.add('hidden');
      this.input.focus();
    }
  }

}

customElements.define('search-bar', SearchBar);

class HeroSlider extends HTMLElement {
  constructor() {
    super();
    this.splide = null;
    this.initSlider = this.initSlider.bind(this);
  }

  connectedCallback() {
    this.sliderEl = this.querySelector('.hero-splide');
    this.initSlider();
  }

  disconnectedCallback() {
    if (!this.splide) return;
    this.splide.destroy();
  }

  initSlider() {
    if (!this.sliderEl) return;
    this.splide = new Splide(this.sliderEl, {
      type: 'loop',
      perPage: 1,
      perMove: 1,
      pagination: true,
      arrows: false,
      autoplay: true,
      interval: 2000,
      speed: 2000

    }).mount();

    this.splide.on('move', (newIndex, prevIndex, destIndex) => {
      const slides = this.splide.Components.Elements.slides;
      const slide = slides[newIndex];
      const title = slide.querySelector('h2');
      const subtitle = slide.querySelector('h4');
      const button = slide.querySelector('.button-container');
      const img = slide.querySelector('img');
      gsap.fromTo(img,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
      );
      gsap.fromTo(subtitle,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.2 }
      );
      gsap.fromTo(title,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.2 }
      );
      gsap.fromTo(button,
        { y: -30 },
        { y: 0, duration: 0.3, delay: 0.1 }
      );
    });
  }

}

customElements.define('hero-slider', HeroSlider)

class MobileMenu extends HTMLElement {

  constructor() {
    super();
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  connectedCallback() {
    document.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleClick)
  }

  handleClick(event) {
    if (event.target.closest('.open-mobile-menu') && !document.documentElement.classList.add('mobile-menu-open')) {
      this.open();
    } else if (!event.target.closest('mobile-menu')) {
      this.close();
    }
  }

  open() {
    document.documentElement.classList.add('mobile-menu-open');
  }

  close() {
    document.documentElement.classList.remove('mobile-menu-open');
  }

}

customElements.define('mobile-menu', MobileMenu)

class ProductForm extends HTMLElement {

  constructor() {
    super();
    this.addToCart = this.addToCart.bind(this);
    this.updateInfo = this.updateInfo.bind(this);
    this.openImageViewer = this.openImageViewer.bind(this)
    this.changeVariant = this.changeVariant.bind(this);
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.fieldset = this.form.querySelector('fieldset');
    this.variantInputs = this.fieldset.querySelectorAll('[data-variant-input]')
    this.productHandle = this.dataset.productHandle;
    this.sectionId = this.dataset.sectionId;
    this.quantityInput = this.form.querySelector("input[name='quantity']");
    this.variantIdInput = this.form.querySelector("input[name='id']");
    this.addToCartButton = this.querySelector('button[data-add-to-cart]')
    this.quantity = this.querySelector('span[data-quantity]')
    this.subtotal = this.querySelector('span[data-sub-total]')
    this.total = this.querySelector('span[data-total]')
    this.thumbnailSlider = this.querySelector('.product-thumbnail-slider')
    this.mainSlider = this.querySelector('.product-main-slider')
    this.sliderImages = this.mainSlider.querySelectorAll('li')


    this.addToCartButton?.addEventListener("click", this.addToCart);
    this.quantityInput?.addEventListener("change", this.updateInfo);
    this.variantInputs?.forEach((variantInput) => {
      variantInput.addEventListener('change', this.changeVariant)
    });
    this.sliderImages?.forEach((sliderImage, index) => {
      sliderImage.addEventListener('click', this.openImageViewer)
    })

    this.initSlider();
  }

  disconnectedCallback() {
    this.addToCartButton?.removeEventListener("click", this.addToCart);
    this.quantityInput?.removeEventListener("change", this.updateInfo);
    this.variantInputs?.forEach((variantInput) => {
      variantInput.removeEventListener('change', this.changeVariant)
    });

    this.sliderImages?.forEach((sliderImage) => {
      sliderImage.removeEventListener('click', this.openImageViewer)
    })
  }

  changeVariant(e) {
    const variantId = e.target.value;
    const url = `${window.Shopify.routes.root}products/${this.productHandle}?variant=${variantId}&section_id=${this.sectionId}`;
    this.fieldset.disabled = true;
    const currentSection = e.target.closest('section');

    fetch(url)
      .then(res => res.text())
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newSection = tempDiv.querySelector(`[section-id="${this.sectionId}"]`);
        if (newSection && currentSection) {
          currentSection.replaceWith(newSection);
        }
        const newURL = new URL(url, window.location.origin);
        newURL.searchParams.delete('section_id');
        window.history.replaceState({}, '', newURL);
      })
      .catch(err => console.error('Error fetching variant data:', err)).finally(() => {
        this.fieldset.disabled = false;
      });

  }

  updateInfo(e) {
    const quantity = Number(e.target.value);
    const price = Number(this.dataset.price);
    const total = Math.round(quantity * price * 100) / 100 / 100;
    this.quantity.innerHTML = quantity;
    this.subtotal.innerHTML = `${this.dataset.currency}${total.toFixed(2)}`;
    this.total.innerHTML = `${this.dataset.currency}${total.toFixed(2)}`;
  }

  addToCart(e) {
    e.preventDefault();
    this.fieldset.disabled = true;
    const url = `${window.Shopify.routes.root}cart/add.js`;
    const formData = {
      items: [{
        quantity: this.quantityInput.value,
        id: this.variantIdInput.value
      }],
      sections: 'cart-drawer'
    }
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.description || 'Could not add item to cart');
          });
        }
        return res.json();
      })
      .then(data => {
        if (data?.sections["cart-drawer"]) {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.parentNode.innerHTML = data?.sections["cart-drawer"];
          }
        }
        document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
          detail: {
            type: 'success',
            message: 'Product added to the cart.',
          }, bubbles: true
        }));
        document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
          bubbles: true
        }));
        document.dispatchEvent(new CustomEvent(EVENTS.CLOSE_PRODUCT_DIALOG, {
          bubbles: true
        }));
      })
      .catch(err => {
        document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
          detail: {
            type: 'error',
            message: err,
          }, bubbles: true
        }));
      })
      .finally(() => {
        this.fieldset.disabled = false;
      });


  }

  openImageViewer(e) {
    const target = e.target.closest('li');
    const siblings = Array.from(target.closest('ul').children);
    const index = siblings.indexOf(target)
    document.dispatchEvent(new CustomEvent(EVENTS.OPEN_IMAGE_VIEWER, {
      detail: {
        index: index
      },
      bubbles: true
    }));
  }

  initSlider() {

    if (!this.mainSlider || !this.thumbnailSlider) {
      return;
    }

    var main = new Splide(this.mainSlider, {
      type: 'fade',
      rewind: true,
      pagination: false,
      arrows: false,
    });

    var thumbnails = new Splide(this.thumbnailSlider, {
      fixedHeight: 148,
      gap: 10,
      rewind: true,
      pagination: false,
      arrows: false,
      isNavigation: true,
      direction: 'ttb',
      height: '640px',
      breakpoints: {
        640: {
          fixedWidth: 50,
          fixedHeight: 60,
        },
        768: {
          fixedWidth: 60,
          fixedHeight: 60,
        },
        1024: {
          fixedWidth: 70,
          fixedHeight: 70,
        },
        1280: {
          fixedWidth: 80,
          fixedHeight: 80,
        },
        1536: {
          fixedWidth: 90,
          fixedHeight: 90,
        },
      },
    });

    main.sync(thumbnails);
    main.mount();
    thumbnails.mount();
  }

}

customElements.define('product-form', ProductForm)

class ProductCard extends HTMLElement {

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  connectedCallback() {
    this.button = this.querySelector('button')
    this.type = this.button?.dataset.type;
    this.variantId = this.button?.dataset.variantId;
    this.productHandle = this.button?.dataset.productHandle;
    this.button?.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.button?.removeEventListener('click', this.handleClick);
  }

  handleClick() {
    if (this.type == 'choose-options') {
      this.button.classList.remove('adding')
      document.dispatchEvent(new CustomEvent(EVENTS.OPEN_PRODUCT_DIALOG, {
        detail: {
          productHandle: this.productHandle
        },
        bubbles: true
      }));

    } else {
      const url = `${window.Shopify.routes.root}cart/add.js`;
      this.button.classList.add('adding')
      const formData = {
        items: [{
          quantity: 1,
          id: this.variantId
        }],
        sections: 'cart-drawer'
      }
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.description || 'Could not add item to cart');
            });
          }
          return res.json();
        })
        .then(data => {
          if (data?.sections["cart-drawer"]) {

            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              cartDrawer.parentNode.innerHTML = data?.sections["cart-drawer"];
            }
          }
          document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
            detail: {
              type: 'success',
              message: 'Product added to the cart.',
            }, bubbles: true
          }));
          document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
            bubbles: true
          }));
          document.dispatchEvent(new CustomEvent(EVENTS.CLOSE_PRODUCT_DIALOG, {
            bubbles: true
          }));
        })
        .catch(err => {
          document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
            detail: {
              type: 'error',
              message: err,
            }, bubbles: true
          }));
        }).finally(() => {
          this.button.classList.remove('adding')
        })
    }
  }
}

customElements.define('product-card', ProductCard)

class ProductDialog extends HTMLElement {

  constructor() {
    super();
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.loadProduct = this.loadProduct.bind(this);
  }

  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.dialogContent = this.dialog.querySelector('.dialog-content');
    this.dialogMessage = this.dialog.querySelector('.dialog-message');
    this.closeButton = this.dialog.querySelector('#close-dialog');
    this.closeButton?.addEventListener('click', this.closeDialog);
    this.dialog?.addEventListener('close', this.closeDialog);
    document.addEventListener(EVENTS.OPEN_PRODUCT_DIALOG, this.openDialog);
    document.addEventListener(EVENTS.CLOSE_PRODUCT_DIALOG, this.closeDialog);
  }

  disconnectedCallback() {
    this.closeButton?.removeEventListener('click', this.closeDialog);
    this.dialog?.removeEventListener('close', this.closeDialog);
    document.removeEventListener(EVENTS.OPEN_PRODUCT_DIALOG, this.openDialog);
    document.removeEventListener(EVENTS.CLOSE_PRODUCT_DIALOG, this.closeDialog);
  }

  closeDialog() {
    this.dialog.close();
    document.documentElement.classList.remove('dialog-open');
    this.dialogContent.innerHTML = '';
    this.dialogMessage.innerHTML = '';
  }

  openDialog(e) {
    this.dialogMessage.innerHTML = 'Loading';
    this.dialog.showModal();
    document.documentElement.classList.add('dialog-open');
    this.loadProduct(e.detail.productHandle)
  }

  loadProduct(productHandle) {
    const url = `${window.Shopify.routes.root}products/${productHandle}`;
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch product dialog content');
        }
        return res.text();
      })
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const productFormEl = tempDiv.querySelector('[data-main-product]');
        if (productFormEl) {
          this.dialogContent.innerHTML = productFormEl.outerHTML;
          this.dialogMessage.innerHTML = '';
        }
      })
      .catch(err => {
        console.error('Error fetching product dialog content:', err);
        this.dialogMessage.innerHTML = err;
      });
  }

}

customElements.define('product-dialog', ProductDialog)

class QuantityInput extends HTMLElement {

  constructor() {
    super();
    this.handleMinusClick = this.handleMinusClick.bind(this);
    this.handlePlusClick = this.handlePlusClick.bind(this);
  }

  connectedCallback() {
    this.quantityInput = this.querySelector("[type=\"number\"]");
    this.minusButton = this.querySelector("[data-minus]");
    this.plusButton = this.querySelector("[data-plus]");
    this.minusButton?.addEventListener("click", this.handleMinusClick);
    this.plusButton?.addEventListener("click", this.handlePlusClick);
  }

  disconnectedCallback() {
    this.minusButton?.removeEventListener("click", this.handleMinusClick);
    this.plusButton?.removeEventListener("click", this.handlePlusClick);
  }

  handleMinusClick() {
    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
    this.quantityInput?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  handlePlusClick() {
    const maxQuantity = parseInt(this.quantityInput.getAttribute('max'));
    if (parseInt(this.quantityInput.value) === maxQuantity) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
    this.quantityInput?.dispatchEvent(new Event('change', { bubbles: true }));
  }

}

customElements.define('quantity-input', QuantityInput)

class CartDrawer extends HTMLElement {

  constructor() {
    super();
    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.onEscape = this.onEscape.bind(this);
  }

  connectedCallback() {
    this.closeButton = this.querySelector('[data-close]')
    this.drawer = this.querySelector('[data-drawer]')
    this.drawerContainer = this.querySelector('[data-drawer-container]')
    this.drawerContainerInner = this.querySelector('[data-drawer-container-inner]')
    this.drawerContent = this.querySelector('[data-drawer-content]')
    this.drawerItems = this.querySelector('[data-drawer-items]')
    this.overlay = this.querySelector('[data-overlay]')

    document.addEventListener(EVENTS.OPEN_CART_DRAWER, this.openDrawer)
    document.addEventListener(EVENTS.CLOSE_CART_DRAWER, this.closeDrawer)
    document.addEventListener('keydown', this.onEscape);
    document.addEventListener('click', this.onEscape)
    this.overlay?.addEventListener('click', this.closeDrawer)
  }


  disconnectedCallback() {
    document.removeEventListener(EVENTS.OPEN_CART_DRAWER, this.openDrawer);
    document.removeEventListener(EVENTS.CLOSE_CART_DRAWER, this.closeDrawer);
    document.removeEventListener('keydown', this.onEscape);
    document.removeEventListener('click', this.onEscape);
    this.overlay?.removeEventListener('click', this.closeDrawer)
  }

  onEscape(event) {
    if (event.key === 'Escape') {
      this.closeDrawer();
    } else {
      if (!event.target.closest('cart-button') && !event.target.closest('cart-drawer') && !event.target.closest('button[data-add-to-cart]') && !event.target.closest('button[data-remove]')) {
        this.closeDrawer();
      }
    }
  }

  openDrawer(event) {
    document.documentElement.classList.add('cart-drawer-open');
    const contentHeight = this.drawerContainerInner.scrollHeight;
    this.drawerContainer.style.height = (contentHeight) + 'px';
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  closeDrawer() {
    this.drawerContainer.style.height = '0px';
    document.documentElement.classList.remove('cart-drawer-open');
  }
}

customElements.define('cart-drawer', CartDrawer)

class CartButton extends HTMLElement {

  constructor() {
    super();
    this.updateCartCount = this.updateCartCount.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  connectedCallback() {
    this.cartButton = this.querySelector('[data-button]');
    this.cartCount = this.cartButton?.querySelector('[data-cart-count]');
    this.updateCartCount(this, true)
    document.addEventListener(EVENTS.CART_UPDATED, this.updateCartCount)
    this.cartButton?.addEventListener('click', this.toggleDrawer)
  }

  disconnectedCallback() {
    document.removeEventListener(EVENTS.CART_UPDATED, this.updateCartCount);
    this.cartButton?.removeEventListener('click', this.toggleDrawer);
  }

  updateCartCount(event, initial = false) {
    fetch(`${window.Shopify.routes.root}cart.js`)
      .then(response => response.json())
      .then(cart => {
        this.cartCount.textContent = cart.item_count;
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
      });
    if (initial !== true) {
      if (!this.cartButton) return;
      document.dispatchEvent(new CustomEvent(EVENTS.OPEN_CART_DRAWER, {
        bubbles: true
      }));
    }
  }

  toggleDrawer() {
    document.dispatchEvent(new CustomEvent(document.documentElement.classList.contains('cart-drawer-open') ? EVENTS.CLOSE_CART_DRAWER : EVENTS.OPEN_CART_DRAWER, {
      bubbles: true
    }));
  }
}

customElements.define('cart-button', CartButton)

class CartItem extends HTMLElement {

  constructor() {
    super();
    this.removeItem = this.removeItem.bind(this);
  }

  connectedCallback() {
    this.removeButton = this.querySelector('[data-remove]');
    this.itemKey = this.dataset.key;
    this.removeButton?.addEventListener('click', this.removeItem, true)
  }


  disconnectedCallback() {
    this.removeButton?.removeEventListener('click', this.removeItem)
  }

  removeItem() {
    const url = `${window.Shopify.routes.root}cart/change.js`;

    const formData = {
      quantity: 0,
      id: this.itemKey,
      sections: 'cart-drawer'
    }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.description || 'Could not add item to cart');
          });
        }
        return res.json();
      })
      .then(data => {
        if (data?.sections["cart-drawer"]) {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.parentNode.innerHTML = data?.sections["cart-drawer"];
          }
        }
        document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
          detail: {
            type: 'success',
            message: 'Product removed from the cart.',
          }, bubbles: true
        }));
        document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
          bubbles: true
        }));
      })
      .catch(err => {
        document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
          detail: {
            type: 'error',
            message: err,
          }, bubbles: true
        }));
      })
  }
}

customElements.define('cart-item', CartItem)

class ProductCart extends HTMLElement {

  constructor() {
    super();
    this.updateCart = this.updateCart.bind(this);
    this.updateCartSection = this.updateCartSection.bind(this);

  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.formFieldset = this.form.querySelector('fieldset');
    this.updateButton = this.form.querySelector('[data-update-button]');
    this.sectionId = this.dataset.sectionId;
    this.quantityInputs = this.querySelectorAll("[data-quantity-input]");
    this.sectionId = this.dataset.sectionId;
    this.updateButton?.addEventListener('click', this.updateCart, true)
  }


  disconnectedCallback() {
    this.updateButton?.removeEventListener('click', this.updateCart)
  }

  updateCart(event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    formData.append('sections', 'cart-drawer')
    this.formFieldset.disabled = true;
    fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.description || 'Could not update cart');
          });
        }
        return res.json();
      })
      .then(data => {
        if (data?.sections["cart-drawer"]) {
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.parentNode.innerHTML = data?.sections["cart-drawer"];
          }
        }
        this.updateCartSection();
      })
      .catch(err => {
        console.error('Error updating cart:', err);
        this.formFieldset.disabled = false;
      });
  }

  updateCartSection() {
    const url = `${window.Shopify.routes.root}cart?section_id=${this.sectionId}`;
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch cart section');
        }
        return res.text();
      })
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newSection = tempDiv.querySelector(`#shopify-section-${this.sectionId}`);
        const currentSection = document.querySelector(`#shopify-section-${this.sectionId}`);
        if (newSection && currentSection) {
          currentSection.replaceWith(newSection);
          document.dispatchEvent(new CustomEvent(EVENTS.SHOW_NOTIFICATION, {
            detail: {
              type: 'success',
              message: 'Cart updated!',
            }, bubbles: true
          }));

          document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
            bubbles: true
          }));
        }
        this.formFieldset.disabled = false;
      })
      .catch(err => {
        console.error('Error fetching cart section:', err);
        this.formFieldset.disabled = false;
      });
  }
}

customElements.define('product-cart', ProductCart)

class ImageViewerWindow extends HTMLElement {

  constructor() {
    super();
    this.navigate = this.navigate.bind(this);
    this.close = this.close.bind(this)
    this.open = this.open.bind(this)

  }

  connectedCallback() {
    this.content = this.querySelector('main')
    this.innerContent = this.querySelector('&>div>div')
    this.nav = this.querySelector('nav')
    this.closeButton = this.querySelector('button.close')
    this.images = this.nav.querySelectorAll('img') ?? [];

    this?.images.forEach((image, index) => {
      image.addEventListener('click', this.navigate)
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = Array.from(entry.target.parentNode.children);
          const index = children.indexOf(entry.target)
          const navChildren = Array.from(this.images);
          if (navChildren.length && navChildren[index]) {
            navChildren.forEach(element => {
              element.classList.remove('in-view')
            });
            navChildren[index].classList.add('in-view')
          }
          entry.target.classList.add('in-view');
        }
      });
    });

    this.content.querySelectorAll('img').forEach(el => observer.observe(el));

    this.closeButton?.addEventListener('click', this.close)

    document.addEventListener('keydown', this.close);
    document.addEventListener(EVENTS.OPEN_IMAGE_VIEWER, (e) => {
      this.open(e.detail.index)
    })

    this.addEventListener('click', this.close)
  }

  disconnectedCallback() {
    this?.images.forEach((image, index) => {
      image.removeEventListener('click', this.navigate)
    });
    this?.closeButton.removeEventListener('click', this.close)
    document.removeEventListener('keydown', this.onEscape);
  }

  navigate(event) {
    const target = event.target;
    const navChildren = Array.from(target.parentNode.children);
    const index = navChildren.indexOf(target)
    const contentChildren = Array.from(this.content.children);
    if (contentChildren.length && contentChildren[index]) {
      contentChildren[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  open(index) {
    const images = Array.from(this.content.children);
    document.documentElement.classList.add('image-viewer-open')
    if (images.length > 0 && images[index]) {
      images[index].scrollIntoView({})
    }
  }

  close(e) {
    if (e.target.tagName == 'IMAGE-VIEWER-WINDOW' || e.key === 'Escape') {
      document.documentElement.classList.remove('image-viewer-open')
    }
  }

}

customElements.define('image-viewer-window', ImageViewerWindow)