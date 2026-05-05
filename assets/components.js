const EVENTS = {
  CART_UPDATED: 'cart-updated',
  PRODUCT_ADDED: 'product-added',
  OPEN_CART_DRAWER: 'open-cart-drawer',
  CLOSE_CART_DRAWER: 'close-cart-drawer',
  OPEN_IMAGE_VIEWER: 'open-image-viewer',
  CLOSE_IMAGE_VIEWER: 'close-image-viewer',
}

const VARIABLES = {
  cart: []
}

class SearchBar extends HTMLElement {
  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.form = this.querySelector('form');
    this.input = this.form.querySelector('input[name="q"]');
    this.clearButton = this.form.querySelector('[data-clear]');
  }

  connectedCallback() {
    this.input.addEventListener('input', this.handleInput);
    this.clearButton.addEventListener('click', this.handleClear);
    if (this.input.value.trim() !== '') {
      this.clearButton.classList.remove('hidden');
      this.classList.add('search-active');
    } else {
      this.clearButton.classList.add('hidden');
      this.classList.remove('search-active');
    }
  }

  disconnectedCallback() {
    this.clearButton?.removeEventListener('click', this.handleClearButtonClick);
  }

  handleInput() {
    if (this.input.value.trim() !== '') {
      this.clearButton.classList.remove('hidden');
    } else {
      this.clearButton.classList.add('hidden');
    }
  }

  handleClear() {
    this.input.value = '';
    this.clearButton.classList.add('hidden');
    this.input.focus();
  }
}
customElements.define('search-bar', SearchBar);

class CartButton extends HTMLElement {
  constructor() {
    super();
    this.cartCount = this.querySelector('[data-cart-count]');
    this.cartButton = this.querySelector('[data-button]');

    this.updateCart = this.updateCart.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  connectedCallback() {
    this.updateCart(this, true)
    document.addEventListener(EVENTS.CART_UPDATED, this.updateCart)
    this.cartButton.addEventListener('click', this.toggleDrawer)
  }

  disconnectedCallback() {
    document.removeEventListener(EVENTS.CART_UPDATED, this.updateCart);
    this.cartButton.removeEventListener('click', this.toggleDrawer);
  }

  updateCart(event, initial = false) {

    this.cartCount.textContent = cart.count ? cart.count : '';
    if (initial !== true) {
      this.cartCount.classList.add('animate-cart');
      this.cartCount.classList.remove('animate-cart');
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

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.closeButton = this.querySelector('[data-close]')
    this.drawer = this.querySelector('[data-drawer]')
    this.drawerContainer = this.querySelector('[data-drawer-container]')
    this.drawerContainerInner = this.querySelector('[data-drawer-container-inner]')
    this.drawerContent = this.querySelector('[data-drawer-content]')
    this.drawerItems = this.querySelector('[data-drawer-items]')
    this.overlay = this.querySelector('[data-overlay]')

    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.onEscape = this.onEscape.bind(this);
  }

  connectedCallback() {
    document.addEventListener(EVENTS.OPEN_CART_DRAWER, this.openDrawer)
    document.addEventListener(EVENTS.CLOSE_CART_DRAWER, this.closeDrawer)
    document.addEventListener('keydown', this.onEscape);
    document.addEventListener('click', this.onEscape)
    // this.closeButton.addEventListener('click', this.closeDrawer)
    this.overlay.addEventListener('click', this.closeDrawer)
  }


  disconnectedCallback() {
    document.removeEventListener(EVENTS.OPEN_CART_DRAWER, this.openDrawer);
    document.removeEventListener(EVENTS.CLOSE_CART_DRAWER, this.closeDrawer);
    document.removeEventListener('keydown', this.onEscape);
    document.removeEventListener('click', this.onEscape);
    // this.closeButton.removeEventListener('click', this.closeDrawer)
    this.overlay.removeEventListener('click', this.closeDrawer)
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
    const items = cart.items();
    if (items.length) {
      this.drawerItems.innerHTML = ''
      items.map((item, index) => {
        this.drawerItems.innerHTML += `<cart-item data-index="${index}">
        <div class="flex gap-3 relative py-2">
                  <div class="flex w-20 h-20 shrink-0">
                    <img class="w-full h-full object-contain" src="${item.image}" alt="">
                  </div>
                  <div class="flex flex-col justify-between">
                    <h3 class="font-normal text-sm">${item.title}</h3>
                   <div>
                      <div class="font-semibold">$${item.price}</div>
                      <div class="text-sm text-brand-gray"><s>$${item.price}</s></div>
                    </div>
                  </div>
                  <button data-remove class="absolute top-2 right-0 size-6 rounded-full flex justify-center items-center cursor-pointer">
                    <svg class="size-4" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                      <path d="M216,50H174V40a22,22,0,0,0-22-22H104A22,22,0,0,0,82,40V50H40a6,6,0,0,0,0,12H50V208a14,14,0,0,0,14,14H192a14,14,0,0,0,14-14V62h10a6,6,0,0,0,0-12ZM94,40a10,10,0,0,1,10-10h48a10,10,0,0,1,10,10V50H94ZM194,208a2,2,0,0,1-2,2H64a2,2,0,0,1-2-2V62H194ZM110,104v64a6,6,0,0,1-12,0V104a6,6,0,0,1,12,0Zm48,0v64a6,6,0,0,1-12,0V104a6,6,0,0,1,12,0Z"></path>
                    </svg>
                  </button>
                  <div class="flex items-center ml-auto">
                    
                  </div>
                </div>
                </cart-item>`;

      })
    } else {
      this.drawerItems.innerHTML = `<div class="py-6 text-center text-brand-gray">Cart is empty</div>`;
    }
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


class CartItem extends HTMLElement {
  constructor() {
    super();
    this.removeButton = this.querySelector('[data-remove]');
    this.removeItem = this.removeItem.bind(this);
  }

  connectedCallback() {
    this.removeButton.addEventListener('click', this.removeItem, true)
  }


  disconnectedCallback() {
    this.removeButton.removeEventListener('click', this.removeItem)
  }

  removeItem() {
    const items = cart.remove(this.dataset.index);
    this.removeButton.closest('cart-item').remove();
    document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
      bubbles: true
    }));
  }
}

customElements.define('cart-item', CartItem)

class HeroSlider extends HTMLElement {
  constructor() {
    super();
    this.sliderEl = this.querySelector('.hero-splide');
    this.splide = null;
    this.initSlider = this.initSlider.bind(this);
  }

  connectedCallback() {
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

class SplideExplore extends HTMLElement {
  constructor() {
    super();
    this.sliderEl = this.querySelector('.splide-explore');
    this.splide = null;
    this.initSlider = this.initSlider.bind(this);
  }

  connectedCallback() {
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
      perPage: 3,
      perMove: 1,
      pagination: true,
      arrows: false,
      autoplay: true,
      interval: 20000,
      speed: 2000,
      gap: 20,
      breakpoints: {
        1024: {
          perPage: 1,
        },
        1280: {
          perPage: 2,
        },
      }
    }).mount();

  }
}

customElements.define('splide-explore', SplideExplore)

class ProductCard extends HTMLElement {
  constructor() {
    super();

    this.addToCartButton = this.querySelector('[data-add-to-cart]')
    this.addToCart = this.addToCart.bind(this)
    this.dataUrl = this.querySelector('[data-url]');
    this.dataImg = this.querySelector('[data-img]');
    this.dataTitle = this.querySelector('[data-title]');
    this.dataPrice = this.querySelector('[data-price]');

  }

  connectedCallback() {
    this.addToCartButton.addEventListener('click', this.addToCart);
  }

  disconnectedCallback() {
    this.addToCartButton.removeEventListener('click', this.addToCart);
  }

  addToCart() {
    const items = cart.add({
      title: this.dataTitle.textContent,
      quantity: 1,
      price: this.dataPrice.textContent.replace('$', ''),
      image: this.dataImg.src
    })
    document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
      bubbles: true
    }));
  }
}

customElements.define('product-card', ProductCard)

class QuantityInput extends HTMLElement {
  constructor() {
    super();

    this.quantityInput = this.querySelector("[type=\"number\"]");
    this.minusButton = this.querySelector("[data-minus]");
    this.plusButton = this.querySelector("[data-plus]");
    this.handleMinusClick = this.handleMinusClick.bind(this);
    this.handlePlusClick = this.handlePlusClick.bind(this);
  }

  connectedCallback() {
    this.minusButton.addEventListener("click", this.handleMinusClick);
    this.plusButton.addEventListener("click", this.handlePlusClick);
  }

  disconnectedCallback() {
    this.minusButton.removeEventListener("click", this.handleMinusClick);
    this.plusButton.removeEventListener("click", this.handlePlusClick);
  }

  handleMinusClick() {
    if (parseInt(this.quantityInput.value) === 1) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
    this.quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  handlePlusClick() {
    const maxQuantity = parseInt(this.quantityInput.getAttribute('max'));
    if (parseInt(this.quantityInput.value) === maxQuantity) {
      return;
    }
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
    this.quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

}
customElements.define('quantity-input', QuantityInput)

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.quantityInput = this.querySelector("[type=\"number\"]");
    this.quantityPrice = this.querySelector("[name=\"price\"]");
    this.addToCartButton = this.querySelector('button[data-add-to-cart]')
    this.quantities = this.querySelectorAll('span[data-quantity]')
    this.totals = this.querySelectorAll('span[data-total]')
    this.productTitle = this.querySelector('h1[data-title]')
    this.productImage = this.querySelector('img[data-img]')
    this.thumbnailSlider = this.querySelector('.product-thumbnail-slider')
    this.mainSlider = this.querySelector('.product-main-slider')
    this.sliderImages = this.mainSlider.querySelectorAll('li')
    this.addToCart = this.addToCart.bind(this);
    this.updateInfo = this.updateInfo.bind(this);
    this.openImageViewer = this.openImageViewer.bind(this)
    this.images = this.querySelectorAll('img')
    this.featuredImage = this.productImage ? this.productImage.src : this.images.length ? this.images[0].src : null;

  }

  connectedCallback() {
    this.addToCartButton.addEventListener("click", this.addToCart);
    this.quantityInput.addEventListener("change", this.updateInfo);
    this.sliderImages?.forEach((sliderImage, index) => {
      sliderImage.addEventListener('click', this.openImageViewer)
    })

    var main = new Splide(this.mainSlider, {
      type: 'fade',
      rewind: true,
      pagination: false,
      arrows: false,
    });

    // 2. Initialize the thumbnail slider
    var thumbnails = new Splide(this.thumbnailSlider, {
      // fixedWidth: 100,
      fixedHeight: 148,
      gap: 10,
      rewind: true,
      pagination: false,
      arrows: false,
      isNavigation: true, // Critical for clickable thumbs
      direction: 'ttb', // Vertical direction
      height: '640px', // Must specify a height for vertical mode
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

    // 3. Sync them
    main.sync(thumbnails);
    main.mount();
    thumbnails.mount();
  }

  disconnectedCallback() {
    this.addToCartButton.removeEventListener("click", this.addToCart);
    this.quantityInput.removeEventListener("change", this.updateInfo);
    this.sliderImages?.forEach((sliderImage) => {
      sliderImage.removeEventListener('click', this.openImageViewer)
    })
  }

  updateInfo() {
    this.quantities.forEach((el) => {
      el.innerHTML = this.quantityInput.value
    })
    this.totals.forEach((el) => {
      el.innerHTML = Math.round(this.quantityInput.value * this.quantityPrice.value * 100) / 100
    })
  }

  addToCart(e) {
    e.preventDefault();

    const items = cart.add({
      title: this.productTitle.textContent,
      price: this.quantityPrice.value,
      quantity: this.quantityInput.value,
      image: this.featuredImage
    })

    document.dispatchEvent(new CustomEvent(EVENTS.CART_UPDATED, {
      bubbles: true
    }));
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

}
customElements.define('product-form', ProductForm)

class ImageViewerWindow extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('main')
    this.innerContent = this.querySelector('&>div>div')

    this.nav = this.querySelector('nav')
    this.closeButton = this.querySelector('button.close')

    this.images = this.nav.querySelectorAll('img') ?? [];
    this.navigate = this.navigate.bind(this);
    this.close = this.close.bind(this)
    this.open = this.open.bind(this)

  }
  connectedCallback() {
    this.images.forEach((image, index) => {
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
    this.images.forEach((image, index) => {
      image.removeEventListener('click', this.navigate)
    });
    this.closeButton.removeEventListener('click', this.close)
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

class PriceSlider extends HTMLElement {
  constructor() {
    super();
    this.sliderEl = this.querySelector('[data-slider]');
    this.priceMinEl = this.querySelector('[price-min]');
    this.priceMaxEl = this.querySelector('[price-max]');
    // this.min = Number(this.priceMinEl.min) || 1;
    // this.max = Number(this.priceMinEl.max) || 100;
    // this.minValue = this.priceMinEl.value ? Number(this.priceMinEl.value) : undefined;
    // this.maxValue = this.priceMaxEl.value ? Number(this.priceMaxEl.value) : undefined;
    this.min = this.sliderEl.dataset.min ? Number(this.sliderEl.dataset.min) : 1
    this.max = this.sliderEl.dataset.max ? Number(this.sliderEl.dataset.max) : 100
    this.minValue = this.sliderEl.dataset.minValue ? Number(this.sliderEl.dataset.minValue) : undefined;
    this.maxValue = this.sliderEl.dataset.maxValue ? Number(this.sliderEl.dataset.maxValue) : undefined;
    this.slider = null;

  }
  connectedCallback() {
    if (this.sliderEl) {
      this.slider = createRangeSlider(this.sliderEl, {
        min: this.min,
        max: this.max,
        step: 1,
        minValue: this.minValue,
        maxValue: this.maxValue,
        labelPrefix: '',
        labelSuffix: '',
        label: false,
      });
      this.slider.sliderElement.addEventListener('rangeChange', (e) => {
        if (this.priceMinEl) {
          this.priceMinEl.value = e.detail.min;
          this.priceMaxEl.value = e.detail.max;
        }
      });
      this.slider.sliderElement.addEventListener('rangeChanging', (e) => {
        if (this.priceMinEl) {
          this.priceMinEl.value = e.detail.min;
          this.priceMaxEl.value = e.detail.max;
        }
      });
    }
    if (this.priceMaxEl) {
      this.priceMaxEl.addEventListener('change', () => {
        this.slider.update(this.priceMinEl.value,
          this.priceMaxEl.value);
      })
    }
    if (this.priceMinEl) {
      this.priceMinEl.addEventListener('change', () => {
        this.slider.update(this.priceMinEl.value,
          this.priceMaxEl.value)
      })
    }
  }

  disconnectedCallback() {
  }
}

customElements.define('price-slider', PriceSlider);

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


class ProductFilter extends HTMLElement {
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
    if (event.target.closest('.open-product-filter') && !document.documentElement.classList.add('product-filter-open')) {
      this.open();
    } else if (event.target.closest('.close-product-filter') && !document.documentElement.classList.add('product-filter-open')) {
      this.close();
    } else if (event.target.closest('product-filter') == event.target.parentNode) {
      this.close();
    }
  }
  open() {
    document.documentElement.classList.add('product-filter-open');
  }
  close() {
    document.documentElement.classList.remove('product-filter-open');
  }
}

customElements.define('product-filter', ProductFilter)

