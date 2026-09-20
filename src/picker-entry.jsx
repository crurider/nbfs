import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale/sr-Latn';
import 'react-datepicker/dist/react-datepicker.css';

function parseDate(str) {
  if (!str) return new Date();
  const [d, m, y] = str.split('.').map(Number);
  if (d && m && y) return new Date(y, m - 1, d);
  return new Date();
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function parseTime(str) {
  if (!str) return null;
  const [h, m] = str.split(':').map(Number);
  if (!isNaN(h) && !isNaN(m)) return new Date(2000, 0, 1, h, m);
  return null;
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function SrDatePicker({ pickerId, initialValue, onChange }) {
  const [selectedDate, setSelectedDate] = useState(() => parseDate(initialValue));

  useEffect(() => {
    NBFSDatePickers.registerSetter(pickerId, (value) => setSelectedDate(parseDate(value)));
    return () => NBFSDatePickers.unregisterSetter(pickerId);
  }, [pickerId]);

  const handleChange = (date) => {
    setSelectedDate(date);
    if (onChange) onChange(formatDate(date));
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="dd.MM.yyyy"
      locale={srLatn}
      calendarStartDay={1}
      placeholderText="Izaberi datum"
      className="nbfs-picker-input"
      wrapperClassName="nbfs-picker-wrapper"
      popperClassName="nbfs-picker-popper"
      popperPlacement="bottom-start"
      showPopperArrow={false}
    />
  );
}

function SrTimePicker({ pickerId, initialValue, initialDisabled, placeholderText, onChange }) {
  const [selectedTime, setSelectedTime] = useState(() => parseTime(initialValue));
  const [disabled, setDisabled] = useState(() => !!initialDisabled);

  useEffect(() => {
    NBFSDatePickers.registerSetter(pickerId, (value) => setSelectedTime(parseTime(value)));
    NBFSDatePickers.registerDisabler(pickerId, (value) => setDisabled(!!value));
    return () => {
      NBFSDatePickers.unregisterSetter(pickerId);
      NBFSDatePickers.unregisterDisabler(pickerId);
    };
  }, [pickerId]);

  const handleChange = (time) => {
    if (!time) {
      setSelectedTime(null);
      if (onChange) onChange('');
      return;
    }
    setSelectedTime(time);
    if (onChange) onChange(formatTime(time));
  };

  return (
    <DatePicker
      selected={selectedTime}
      onChange={handleChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={5}
      timeCaption="Vreme"
      dateFormat="HH:mm"
      locale={srLatn}
      placeholderText={placeholderText || 'Izaberi vreme'}
      disabled={disabled}
      className="nbfs-picker-input"
      wrapperClassName="nbfs-picker-wrapper"
      popperClassName="nbfs-picker-popper"
      popperPlacement="bottom-start"
      showPopperArrow={false}
    />
  );
}

const roots = {};
const setters = {};
const disablers = {};

function getSrWeekdays() {
  // Ponedeljak prvi — kratka srpska (latinica) imena dana preko date-fns srLatn.
  // 07.09.2026 je ponedeljak, koristi se kao fiksni oslonac.
  const monday = new Date(2026, 8, 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    days.push(format(d, 'EEE', { locale: srLatn }));
  }
  return days;
}

function getSrMonthLabel(year, monthIndex) {
  return format(new Date(year, monthIndex, 1), 'LLLL yyyy', { locale: srLatn });
}

const NBFSDatePickers = {
  registerSetter(pickerId, setter) {
    setters[pickerId] = setter;
  },
  unregisterSetter(pickerId) {
    delete setters[pickerId];
  },
  registerDisabler(pickerId, setter) {
    disablers[pickerId] = setter;
  },
  unregisterDisabler(pickerId) {
    delete disablers[pickerId];
  },
  mountDatePicker(pickerId, containerId, initialValue, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (roots[pickerId]) {
      roots[pickerId].unmount();
    }
    const root = createRoot(container);
    roots[pickerId] = root;
    root.render(<SrDatePicker pickerId={pickerId} initialValue={initialValue} onChange={onChange} />);
  },
  mountTimePicker(pickerId, containerId, initialValue, onChange, options) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (roots[pickerId]) {
      roots[pickerId].unmount();
    }
    const opts = typeof options === 'object' && options !== null ? options : { disabled: !!options };
    const root = createRoot(container);
    roots[pickerId] = root;
    root.render(<SrTimePicker pickerId={pickerId} initialValue={initialValue} initialDisabled={!!opts.disabled} placeholderText={opts.placeholder} onChange={onChange} />);
  },
  setValue(pickerId, value) {
    if (setters[pickerId]) setters[pickerId](value);
  },
  setDisabled(pickerId, disabled) {
    if (disablers[pickerId]) {
      disablers[pickerId](disabled);
      return;
    }
    const input = document.querySelector(`#${CSS.escape(pickerId + '-picker')} input`);
    if (input) input.disabled = !!disabled;
  },
  getSrWeekdays,
  getSrMonthLabel,
  unmount(pickerId) {
    if (roots[pickerId]) {
      roots[pickerId].unmount();
      delete roots[pickerId];
    }
  }
};

window.NBFSDatePickers = NBFSDatePickers;
