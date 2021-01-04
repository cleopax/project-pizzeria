import {select, classNames, templates, settings} from './settigs.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.initAcordion();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      }
      );
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
        thisProduct.addToCart();
      });

    }

    processOrder(){
      const thisProduct = this;

      thisProduct.params = {};

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for(const paramId in thisProduct.data.params) {
      /* save the element in thisProduct.data.params with key paramId as const param */

        const param = thisProduct.data.params[paramId];
        if(!formData[paramId]) formData[paramId] = [];

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


          if(formData[paramId].includes(optionId)) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {}
            };
            thisProduct.params[paramId].options[optionId] = option.label;
          }

          const selector = '.' + paramId + '-' + optionId;
          const image = thisProduct.element.querySelector(selector);

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
      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
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
          classNames.menuProduct.imageVisible;
        /* END LOOP: for each active product */
        }
      /* END: click event listener to trigger */
      });
    }

    addToCart() {
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      //app.cart.add(thisProduct);

      const event = new CustomEvent('add-to-cart', {
          bubbles: true,
          detail: {
              product: thisProduct,
          },
     });
    
     thisProduct.element.dispatchEvent(event);
    
    }


  }

  export default Product; 