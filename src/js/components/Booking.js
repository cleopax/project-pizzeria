import {
    templates,
    select,
    settings,
    classNames,
  } from '../settings.js';
  import utils from '../utils.js';
  import AmountWidget from './AmountWidget.js';
  
  
  class Booking {
    constructor(widgetOrderSite) {
      const thisBooking = this;

    thisBooking.table = null;
    thisBooking.starters = [];

    thisBooking.render(widgetOrderSite);
    thisBooking.initWidgets();
      
    }
    }
    

    export default Booking;
