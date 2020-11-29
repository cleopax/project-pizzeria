/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.initAcordion();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      console.log('new Product:', thisProduct);
      thisProduct.processOrder();
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }

    initOrderForm() {

      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

    }

    processOrder(){
      const thisProduct = this;

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for(const paramId in thisProduct.data.params) {
      /* save the element in thisProduct.data.params with key paramId as const param */

        const param = thisProduct.data.params[paramId];
        if(!formData[paramId]) formData[paramId] = []

        /* START LOOP: for each optionId in param.options */
        for(const optionId in param.options) {
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];

          if(formData[paramId].includes(optionId) && !option.default) {
            price += option.price;
          }
          else if(!formData[paramId].includes(optionId) && option.default) {
            price -= option.price;
          }

          const selector = '.' + paramId + '-' + optionId;
          const image = thisProduct.element.querySelector(selector)

          if(image) {
            if(formData[paramId].includes(optionId)) {
              image.classList.add('active');
            }
            else {
              image.classList.remove('active');
            }
          }

        }
      /* END LOOP: for each paramId in thisProduct.data.params */
      }
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = price;
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate html based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    initAcordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTriggers = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */
      clickableTriggers.addEventListener('click', function (event){
        console.log('kliknięto');

        /* prevent default action for event */
        event.preventDefault();
        console.log('Element kliknięty! Zawartość event:', event);

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        /* find all active products */
        const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);

        /* START LOOP: for each active product */
        for (let activeProduct of allActiveProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {

            /* remove class active for the active product */
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);

          /* END: if the active product isn't the element of thisProduct */
          }
          classNames.menuProduct.imageVisible
        /* END LOOP: for each active product */
        }
      /* END: click event listener to trigger */
      });
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    }
  };

  app.init();

}