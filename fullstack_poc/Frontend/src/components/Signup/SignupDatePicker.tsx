import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { FaCalendarAlt } from 'react-icons/fa';

interface SignupDatePickerProps {
  value: { startDate: Date; endDate: Date } | null;
  onChange: (val: { startDate: Date; endDate: Date } | null) => void;
  maxDate?: Date;
  inputClassName?: string;
}

type Mode = 'DATE' | 'MONTH' | 'YEAR';

const MONTHS = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function SignupDatePicker({ value, onChange, maxDate, inputClassName }: SignupDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('DATE');
  const [viewDate, setViewDate] = useState(dayjs(value?.startDate || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value?.startDate ? dayjs(value.startDate) : null;

  // Helpers for generation
  const startOfMonth = viewDate.startOf('month');
  const daysInMonth = viewDate.daysInMonth();
  // day() returns 0 for Sunday, 1 for Monday. We want Monday=0, Sunday=6
  const startDayOfWeek = (startOfMonth.day() + 6) % 7; 

  const handleDateSelect = (day: number) => {
    const newDate = viewDate.date(day).toDate();
    if (maxDate && dayjs(newDate).isAfter(maxDate, 'day')) return;
    onChange({ startDate: newDate, endDate: newDate });
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(viewDate.month(monthIndex));
    setMode('DATE');
  };

  const handleYearSelect = (year: number) => {
    setViewDate(viewDate.year(year));
    setMode('DATE');
  };

  const handlePrev = () => {
    if (mode === 'DATE') setViewDate(viewDate.subtract(1, 'month'));
    if (mode === 'MONTH') setViewDate(viewDate.subtract(1, 'year'));
    if (mode === 'YEAR') setViewDate(viewDate.subtract(12, 'year'));
  };

  const handleNext = () => {
    if (mode === 'DATE') setViewDate(viewDate.add(1, 'month'));
    if (mode === 'MONTH') setViewDate(viewDate.add(1, 'year'));
    if (mode === 'YEAR') setViewDate(viewDate.add(12, 'year'));
  };

  const currentYear = viewDate.year();
  const yearStart = currentYear - (currentYear % 12);
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          readOnly
          value={selectedDate ? selectedDate.format('DD/MM/YYYY') : ''}
          placeholder="DD/MM/YYYY"
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer ${inputClassName}`}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-[320px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setMode('MONTH')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                  mode === 'DATE' || mode === 'YEAR'
                    ? 'bg-[#E0E7FF] text-[#1A202C]'
                    : 'bg-[#F3F4F6] text-[#707070]' /* When in month mode, month button is passive gray */
                }`}
              >
                {mode === 'MONTH' ? 'Month' : viewDate.format('MMMM')}
              </button>
              <button
                onClick={() => setMode('YEAR')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                  mode === 'MONTH' || mode === 'DATE'
                    ? mode === 'MONTH' ? 'bg-[#E0E7FF]' : 'bg-[#E0E7FF] text-[#1A202C]'
                    : 'bg-[#F3F4F6] text-[#707070]' /* When in year mode, year button is passive gray */
                }`}
              >
                {mode === 'YEAR' ? 'Year' : viewDate.format('YYYY')}
              </button>
            </div>
            <div className="flex space-x-1">
              <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* DATE Grid */}
          {mode === 'DATE' && (
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate && selectedDate.month() === viewDate.month() && selectedDate.year() === viewDate.year() && selectedDate.date() === day;
                  const isFuture = maxDate && viewDate.date(day).isAfter(maxDate, 'day');
                  
                  return (
                    <button
                      key={day}
                      disabled={!!isFuture}
                      onClick={() => handleDateSelect(day)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#00BFFF] text-white shadow-sm font-semibold'
                          : isFuture
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-[#1A202C] hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MONTH Grid */}
          {mode === 'MONTH' && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {MONTHS.map((month, idx) => {
                const isSelected = selectedDate && selectedDate.month() === idx && selectedDate.year() === viewDate.year();
                return (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(idx)}
                    className={`py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? 'bg-[#00BFFF] text-white font-semibold'
                        : 'text-[#1A202C] hover:bg-gray-100'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          )}

          {/* YEAR Grid */}
          {mode === 'YEAR' && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {years.map((y) => {
                const isSelected = selectedDate && selectedDate.year() === y;
                return (
                  <button
                    key={y}
                    onClick={() => handleYearSelect(y)}
                    className={`py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? 'bg-[#00BFFF] text-white font-semibold'
                        : 'text-[#1A202C] hover:bg-[#F3F4F6] bg-transparent'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
