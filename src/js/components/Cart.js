class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);


      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

    }

    update() {
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      for(const product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      for(let key of thisCart.renderTotalsKeys) {
        for(let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('remove', function(event) {
        console.log('Odbieram remove w Cart', event.detail);
        const index = thisCart.products.indexOf(event.detail);
        thisCart.products.splice(index, 1);
        thisCart.update();
      });
    }

    add(menuProduct) {

      /*const thisProduct = this;

      /* generate html based on template */
      //const generateHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      //thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      //const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      //menuContainer.appendChild(thisProduct.element);*/

      const thisCart = this;

      const generateHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generateHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();

      console.log('Menu product', menuProduct);
    }
  }

  export default Cart;