'use strict';

const TURTLE_WISHLIST_KEY = 'turtleBakesWishlist';
const TURTLE_WHATSAPP_NUMBER = '916383881006';

const TURTLE_PRODUCT_CATALOG = [
  {
    id: 'chocotruffle-cake',
    name: 'Chocotruffle Cake',
    description: 'Decadent triple-layered chocolate dream.',
    fullDescription: 'A luxurious dark chocolate truffle cake layered with soft sponge, silky cream, and a rich chocolate finish. Perfect for birthdays, anniversaries, and custom celebration designs.',
    price: 'From ₹480',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=900&q=85'
  },
  {
    id: 'classic-vanilla',
    name: 'Classic Vanilla',
    description: 'Timeless, fluffy and perfectly sweetened.',
    fullDescription: 'A soft vanilla sponge cake with light cream and a clean, elegant flavour profile. A beautiful base for custom colours, names, florals, and celebration themes.',
    price: 'From ₹380',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=85'
  },
  {
    id: 'vanilla-cake',
    name: 'Vanilla Cake',
    description: 'Classic, light and perfectly sweet.',
    fullDescription: 'A classic homemade vanilla cake with airy sponge and smooth cream. Simple, elegant, and easy to customize for birthdays, anniversaries, and small gatherings.',
    price: '₹380',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=85'
  },
  {
    id: 'strawberry-cake',
    name: 'Strawberry Cake',
    description: 'Fresh strawberry and whipped cream.',
    fullDescription: 'A cheerful strawberry cake layered with soft sponge and fresh cream. Lovely for pastel themes, fruit designs, and sweet celebration moments.',
    price: 'From ₹390',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85'
  },
  {
    id: 'black-forest-cake',
    name: 'Black Forest Cake',
    description: 'Chocolate sponge with cherries.',
    fullDescription: 'Chocolate sponge, whipped cream, and cherry notes come together in this classic favourite. A dependable crowd-pleaser for family celebrations.',
    price: 'From ₹430',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=900&q=85'
  },
  {
    id: 'black-forest',
    name: 'Black Forest',
    description: 'Cherries, cream and chocolate sponge.',
    fullDescription: 'A rich black forest cake with chocolate sponge, cream, and cherry accents. Finished to suit your celebration style, from classic to custom themed.',
    price: 'From ₹430',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=900&q=85'
  },
  {
    id: 'white-forest-cake',
    name: 'White Forest Cake',
    description: 'Light white chocolate and cream.',
    fullDescription: 'A delicate white forest cake with soft sponge, white chocolate cream, and a refined finish. Ideal for elegant celebrations and gentle colour palettes.',
    price: '₹430',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=900&q=85'
  },
  {
    id: 'butterscotch-cake',
    name: 'Butterscotch Cake',
    description: 'Caramel crunch and cream delight.',
    fullDescription: 'Butterscotch cream, caramel notes, and crunchy accents make this cake warm, rich, and celebration-ready. Great for both classic and custom designs.',
    price: '₹440',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=900&q=85'
  },
  {
    id: 'pista-flavour-cake',
    name: 'Pista Flavour Cake',
    description: 'Rich pistachio and light sponge.',
    fullDescription: 'A nutty pistachio cake with soft sponge and smooth cream. Its gentle flavour and premium finish make it a beautiful choice for special occasions.',
    price: '₹450',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=900&q=85'
  },
  {
    id: 'rasamalai-cake',
    name: 'Rasamalai Cake',
    description: 'Traditional rasamalai infused.',
    fullDescription: 'A festive fusion cake inspired by rasamalai, with soft sponge, creamy layers, and Indian dessert notes. Perfect for family celebrations and traditional themes.',
    price: '₹480',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&q=85'
  },
  {
    id: 'classic-brownie',
    name: 'Classic Brownie',
    description: 'Fudgy, dense and perfectly rich.',
    fullDescription: 'A rich homemade brownie with a fudgy centre and deep chocolate flavour. A lovely add-on for dessert boxes, gifting, or everyday indulgence.',
    price: '₹220',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&q=85'
  },
  {
    id: 'milk-chocolate-brownie',
    name: 'Milk Chocolate Brownie',
    description: 'Creamy milk chocolate swirled.',
    fullDescription: 'A soft, fudgy brownie with creamy milk chocolate notes. Sweet, smooth, and made for chocolate lovers who enjoy a gentler cocoa finish.',
    price: '₹235',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=900&q=85'
  },
  {
    id: 'double-chocolate-brownie',
    name: 'Double Chocolate Brownie',
    description: 'Double the chocolate, double the joy.',
    fullDescription: 'A richer brownie packed with extra chocolate flavour. Dense, indulgent, and ideal for dessert tables or premium brownie boxes.',
    price: '₹245',
    image: 'https://images.unsplash.com/photo-1551879400-111a9087cd86?w=900&q=85'
  },
  {
    id: 'triple-chocolate-brownie',
    name: 'Triple Chocolate Brownie',
    description: 'Rich, fudgy and intensely chocolatey.',
    fullDescription: 'The most indulgent brownie in the Turtle Bakes menu, with layered chocolate depth and a dense fudgy bite. A treat for serious chocolate fans.',
    price: '₹255',
    image: 'https://images.unsplash.com/photo-1551879400-111a9087cd86?w=900&q=85'
  },
  {
    id: 'bento-cake',
    name: 'Bento Cake',
    description: 'Adorable mini cakes for every occasion.',
    fullDescription: 'A compact mini cake made for sweet surprises, cute messages, and intimate celebrations. Designed fresh with your preferred flavour and style.',
    price: 'From ₹270',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=900&q=85'
  },
  {
    id: 'vanilla-bento',
    name: 'Vanilla Bento',
    description: 'Sweet, simple and adorable.',
    fullDescription: 'A mini vanilla cake with soft sponge and smooth cream, made for compact celebrations, gifting, and cute custom messages.',
    price: '₹270',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=85'
  },
  {
    id: 'white-forest-bento',
    name: 'White Forest Bento',
    description: 'Delicate white chocolate cream.',
    fullDescription: 'A small white forest-style bento cake with soft sponge and delicate cream. Elegant, compact, and easy to personalize.',
    price: '₹280',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=900&q=85'
  },
  {
    id: 'rasamalai-bento',
    name: 'Rasamalai Bento',
    description: 'Indian flavour in a mini box.',
    fullDescription: 'A mini rasamalai-inspired cake with festive flavour and creamy layers. A charming choice for small celebrations with a traditional touch.',
    price: '₹290',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&q=85'
  },
  {
    id: 'butterscotch-bento',
    name: 'Butterscotch Bento',
    description: 'Caramel crunch in every bite.',
    fullDescription: 'A cute mini butterscotch cake with caramel notes and cream. Sweet, compact, and celebration-ready.',
    price: '₹290',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=900&q=85'
  },
  {
    id: 'pista-bento',
    name: 'Pista Bento',
    description: 'Nutty pistachio perfection.',
    fullDescription: 'A mini pistachio cake with nutty flavour and smooth cream. Designed for small celebrations and premium gifting.',
    price: '₹300',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=900&q=85'
  },
  {
    id: 'rosemilk-bento',
    name: 'Rosemilk Bento',
    description: 'Floral rose and sweet milk.',
    fullDescription: 'A soft mini cake with gentle rosemilk flavour, creamy layers, and a sweet floral finish. Beautiful for pastel and romantic themes.',
    price: '₹300',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85'
  },
  {
    id: 'chocotruffle-bento',
    name: 'Chocotruffle Bento',
    description: 'Intense truffle in mini form.',
    fullDescription: 'A compact chocolate truffle bento cake with rich sponge and creamy chocolate layers. Small in size, big on indulgence.',
    price: '₹320',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=900&q=85'
  }
];

const TurtleWishlist = (() => {
  const byId = new Map(TURTLE_PRODUCT_CATALOG.map(product => [product.id, product]));

  function slugify(value) {
    return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TURTLE_WISHLIST_KEY)) || [];
      if (!Array.isArray(parsed)) return [];

      const validItems = parsed.filter(item => {
        if (!item || typeof item !== 'object') return false;
        return [item.id, item.name, item.description, item.price, item.image].every(value => {
          return typeof value === 'string' && value.trim() && value !== 'undefined';
        });
      });

      if (validItems.length !== parsed.length) {
        localStorage.setItem(TURTLE_WISHLIST_KEY, JSON.stringify(validItems));
      }

      return validItems;
    } catch (error) {
      localStorage.removeItem(TURTLE_WISHLIST_KEY);
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(TURTLE_WISHLIST_KEY, JSON.stringify(items));
    updateCount();
    window.dispatchEvent(new CustomEvent('turtle:wishlist-updated', { detail: items }));
  }

  function getAll() {
    return read();
  }

  function has(id) {
    return read().some(item => item.id === id);
  }

  function add(product) {
    const items = read();
    if (items.some(item => item.id === product.id)) return false;
    write([...items, product]);
    return true;
  }

  function remove(id) {
    write(read().filter(item => item.id !== id));
  }

  function toggle(product) {
    if (has(product.id)) {
      remove(product.id);
      return false;
    }
    add(product);
    return true;
  }

  function fromCard(card) {
    const title = card.querySelector('h3, h4')?.textContent.trim() || 'Turtle Bakes Cake';
    const id = slugify(title);
    const catalogProduct = byId.get(id);
    if (catalogProduct) return catalogProduct;

    const description = card.querySelector('.feat-info p, .menu-card-body > p')?.textContent.trim() || 'Freshly baked Turtle Bakes favourite.';
    const price = card.querySelector('.feat-price, .menu-price')?.textContent.trim() || 'Price on request';
    const image = card.querySelector('img')?.getAttribute('src') || 'cake1.png';

    return {
      id,
      name: title,
      description,
      fullDescription: `${description} Made fresh by Turtle Bakes and available for custom celebration designs.`,
      price: price.startsWith('From') ? price : price,
      image
    };
  }

  function updateCount() {
    const count = read().length;
    document.querySelectorAll('[data-wishlist-count]').forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('is-empty', count === 0);
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
    });
  }

  function toast(message) {
    let wrap = document.querySelector('.wishlist-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'wishlist-toast-wrap';
      document.body.appendChild(wrap);
    }

    const item = document.createElement('div');
    item.className = 'wishlist-toast';
    item.innerHTML = `<i class="fas fa-heart"></i><span>${message}</span>`;
    wrap.appendChild(item);

    setTimeout(() => item.classList.add('show'), 20);
    setTimeout(() => {
      item.classList.remove('show');
      setTimeout(() => item.remove(), 320);
    }, 2300);
  }

  function initProductButtons() {
    document.querySelectorAll('.feat-card, .menu-card').forEach(card => {
      if (card.querySelector('.wishlist-btn')) return;
      const product = fromCard(card);
      const media = card.querySelector('.feat-img-wrap, .menu-card-img');
      if (!media) return;

      media.classList.add('wishlist-media');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wishlist-btn';
      button.setAttribute('aria-label', `Add ${product.name} to wishlist`);
      button.innerHTML = '<i class="far fa-heart"></i>';
      media.appendChild(button);

      const sync = () => {
        const saved = has(product.id);
        button.classList.toggle('saved', saved);
        button.innerHTML = saved ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        button.setAttribute('aria-label', saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`);
      };

      sync();
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const saved = toggle(product);
        sync();
        button.classList.add('heart-pop');
        setTimeout(() => button.classList.remove('heart-pop'), 520);
        toast(saved ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`);
      });
    });
  }

  function findProduct(id) {
    return read().find(product => product.id === id) || byId.get(id);
  }

  function whatsAppUrl(productName) {
    const message = `Hi Turtle Bakes, I am interested in ${productName}. Please share price for custom design.`;
    return `https://wa.me/${TURTLE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  return { add, remove, toggle, has, getAll, findProduct, updateCount, initProductButtons, toast, whatsAppUrl };
})();

document.addEventListener('DOMContentLoaded', () => {
  TurtleWishlist.updateCount();
  TurtleWishlist.initProductButtons();
});

window.addEventListener('storage', event => {
  if (event.key === TURTLE_WISHLIST_KEY) TurtleWishlist.updateCount();
});
