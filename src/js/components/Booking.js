import {
  templates,
  select
} from '../settings.js';
import AmountWidget from './AmountWidget.js';
  
  
class Booking {
  constructor(elem) {
    const thisBooking = this;

    thisBooking.table = null;
    thisBooking.starters = [];

    thisBooking.render(elem);
    thisBooking.initWidgets();
  }

  render(elem) {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = elem;
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
    

export default Booking;
