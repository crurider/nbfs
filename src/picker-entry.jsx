import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DatePicker from 'react-datepicker';
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
  if (!str) {
    const now = new Date();
    return new Date(2000, 0, 1, now.getHours(), now.getMinutes());
  }
  const [h, m] = str.split(':').map(Number);
  if (!isNaN(h) && !isNaN(m)) return new Date(2000, 0, 1, h, m);
  return new Date(2000, 0, 1, 0, 0);
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

function SrTimePicker({ pickerId, initialValue, onChange }) {
  const [selectedTime, setSelectedTime] = useState(() => parseTime(initialValue));

  useEffect(() => {
    NBFSDatePickers.registerSetter(pickerId, (value) => setSelectedTime(parseTime(value)));
    return () => NBFSDatePickers.unregisterSetter(pickerId);
  }, [pickerId]);

  const handleChange = (time) => {
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
      placeholderText="Izaberi vreme"
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

const NBFSDatePickers = {
  registerSetter(pickerId, setter) {
    setters[pickerId] = setter;
  },
  unregisterSetter(pickerId) {
    delete setters[pickerId];
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
  mountTimePicker(pickerId, containerId, initialValue, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (roots[pickerId]) {
      roots[pickerId].unmount();
    }
    const root = createRoot(container);
    roots[pickerId] = root;
    root.render(<SrTimePicker pickerId={pickerId} initialValue={initialValue} onChange={onChange} />);
  },
  setValue(pickerId, value) {
    if (setters[pickerId]) setters[pickerId](value);
  },
  unmount(pickerId) {
    if (roots[pickerId]) {
      roots[pickerId].unmount();
      delete roots[pickerId];
    }
  }
};

window.NBFSDatePickers = NBFSDatePickers;
