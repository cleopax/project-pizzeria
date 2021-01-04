import {settings, select, templates, classNames} from './settings';
import Product from './components/Products.js';
import Cart from ' ./components/Cart.js';
import AmountWidget from ' ./components/AmountWidget.js';
import CartProduct from ' ./components/CartProduct.js';
  
const app = {
    initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productsList = document.querySelector(select.containerOf.menu);

      thisApp.productsList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.Product);
      )};


    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(res) {
          return res.json();
        })
        .then(function(res) {
          thisApp.data.products = res;
          thisApp.initMenu();
        })
        .catch(function() {
          console.log('Jest problem!');
        });

    }
  };

  app.init();

