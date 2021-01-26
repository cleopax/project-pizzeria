import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';  
  
class Booking {
  constructor(elem) {
    const thisBooking = this;

    thisBooking.table = null;
    thisBooking.starters = [];

    thisBooking.render(elem);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableListener();
    thisBooking.addStarters();
    thisBooking.sendBooking();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + thisBooking.datePicker.minDate;

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getDataparams',params)

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
                               + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                               + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
                               + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventRepeatResponse .json()
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log('bo', bookings);
        // console.log(eventsCurrent);
        //console.log('ev',eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    //console.log('bookings', bookings);

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    //console.log('thisBooking.datePicker.minDate', thisBooking.datePicker.minDate);
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log(eventsRepeat)

    thisBooking.updateDom();

    console.log('thisBooking.booked', thisBooking.booked);
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDom() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    thisBooking.table = null;

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
        //console.log('tableId', tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

    thisBooking.setBgc();
    //console.log('thisBooking.booked[thisBooking.date][thisBooking.hour]', thisBooking.booked[thisBooking.date][thisBooking.hour]);
  }

  render(elem) {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = elem;
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.people = thisBooking.dom.peopleAmount.querySelector('input');
    thisBooking.dom.hours = thisBooking.dom.hoursAmount.querySelector('input');
    thisBooking.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('.booking-form');
    thisBooking.dom.checkboxes = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDom();
    });
  }

  tableListener() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function () {
        if (table.getAttribute(settings.booking.tableIdAttribute) === thisBooking.table) {
          thisBooking.table = null;
          table.classList.toggle(classNames.booking.tableBooked);
        } else if(table.classList.contains(classNames.booking.tableBooked)){
          alert(`The table's already booked`);
        } else {
          if (thisBooking.table) thisBooking.dom.wrapper.querySelector(select.booking.tables + '[' + settings.booking.tableIdAttribute + '="' + thisBooking.table + '"]').classList.remove(classNames.booking.tableBooked);
          thisBooking.table = table.getAttribute(settings.booking.tableIdAttribute);
          table.classList.toggle(classNames.booking.tableBooked);
        }
      });
    }
  }

  addStarters() {
    const thisBooking = this;
    for (let checkbox of thisBooking.dom.checkboxes) {
      checkbox.addEventListener('click', function () {
        if (checkbox.checked == true) thisBooking.starters.push(checkbox.value);
      });
    }
  }


  bookingPayload() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      address: thisBooking.address.value,
      phone: thisBooking.phone.value,
      peopleAmount: parseInt(thisBooking.dom.people.value),
      hoursAmount: parseInt(thisBooking.dom.hours.value),
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      TableID: parseInt(thisBooking.table),
      starters: thisBooking.starters,
    };

    if (!thisBooking.table) {
      alert('Choose a table');
    } else {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function (response) {
          return response.json();
        }).then(function (parsedResponse) {
          console.log('parsedResponse send', parsedResponse);
        });
    }

  }

  sendBooking() {
    const thisBooking = this;

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.bookingPayload();
    });
  }

  setBgc() {
    const thisBooking = this;

    //find rangerSlider
    thisBooking.dom.form.bgc = thisBooking.dom.form.querySelector(select.widgets.hourPicker.rangeSlider);

    const open = settings.hours.open;
    const close = settings.hours.close;
    const hours = [];
    const tableAmount = [];
    const colours = [];
    const linearStyle = [];

    for (let i = open; i < close; i += 0.5){
      hours.push(i);
    }

    for (let hour of hours) {
      if (!thisBooking.booked[thisBooking.date][hour]) {
        tableAmount.push(0);
      } else {
        tableAmount.push(thisBooking.booked[thisBooking.date][hour].length);
      }
    }

    for (let table of tableAmount) {
      if (table === 3) {
        colours.push(settings.colours.red);
      } else if (table === 2) {
        colours.push(settings.colours.orange);
      } else {
        colours.push(settings.colours.green);
      }
    }

    let avg = Math.round(100 / colours.length);
    let auxiliary = Math.round(100 / colours.length);
    let begin = 0;

    for (let colour of colours) {
      linearStyle.push(colour + ' ' + begin + '%' + ' ' + avg + '%');
      begin += auxiliary;
      avg += auxiliary;
    }

    const colorStyle = linearStyle.join(', ');

    thisBooking.dom.form.bgc.style.background = 'linear-gradient(to right,' + colorStyle + ')';

    console.log('colorStyle', colorStyle);
  }
}

export default Booking;
