import React from 'react';

interface CalendarProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  hoverDate: string | null;
  setHoverDate: (val: string | null) => void;
  bookedDates: any[];
  calendarMonth: Date;
  setCalendarMonth: (val: Date) => void;
  mode?: 'inline' | 'popup';
  isMobileView?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  hoverDate,
  setHoverDate,
  bookedDates,
  calendarMonth,
  setCalendarMonth,
  mode = 'inline',
  isMobileView = false,
}) => {
  // Допоміжна функція отримання дати без часових зсувів
  const getLocalDateString = (dateObjOrStr: Date | string) => {
    const d = new Date(dateObjOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Перевірка зайнятості для заїзду (Check-in)
  const isDateBusyForCheckIn = (dateStr: string) => {
    return bookedDates.some(bd => {
      const startStr = getLocalDateString(bd.startDate);
      const endStr = getLocalDateString(bd.endDate);
      return dateStr >= startStr && dateStr < endStr;
    });
  };

  // Перевірка зайнятості для виїзду (Check-out)
  const isDateBusyForCheckOut = (dateStr: string) => {
    return bookedDates.some(bd => {
      const startStr = getLocalDateString(bd.startDate);
      const endStr = getLocalDateString(bd.endDate);
      return dateStr > startStr && dateStr <= endStr;
    });
  };

  const isDateInPast = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today;
  };

  // Клік на день у кастомному календарі
  const handleDayClick = (dateStr: string) => {
    if (isDateInPast(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      if (isDateBusyForCheckIn(dateStr)) return;
      setStartDate(dateStr);
      setEndDate('');
    } else {
      if (dateStr < startDate) {
        if (isDateBusyForCheckIn(dateStr)) return;
        setStartDate(dateStr);
        setEndDate('');
      } else if (dateStr === startDate) {
        setStartDate('');
        setEndDate('');
      } else {
        // Перевіряємо, чи немає зайнятих дат всередині діапазону
        const hasOverlap = bookedDates.some(bd => {
          const startStr = getLocalDateString(bd.startDate);
          const endStr = getLocalDateString(bd.endDate);
          return startDate < endStr && dateStr > startStr;
        });

        const isEndBusy = isDateBusyForCheckOut(dateStr);

        if (hasOverlap || isEndBusy) {
          if (isDateBusyForCheckIn(dateStr)) return;
          setStartDate(dateStr);
          setEndDate('');
        } else {
          setEndDate(dateStr);
        }
      }
    }
  };

  // Розрахунок масиву днів для рендерингу місяця
  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    // Перший день місяця (0 - Пн, ..., 6 - Нд)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    // Кількість днів у місяці
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const daysArray = [];
    
    // Додаємо пусті комірки перед 1-м числом
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push({ type: 'empty', key: `empty-${i}` });
    }
    
    // Додаємо дні місяця
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      daysArray.push({
        type: 'day',
        day,
        dateStr,
        key: `day-${dateStr}`
      });
    }
    
    return daysArray;
  };

  // Рендеринг конкретного місяця
  const renderMonthView = (monthDate: Date, showPrev: boolean, showNext: boolean) => {
    const monthLabel = monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    const days = getMonthDays(monthDate);
    
    return (
      <div className="calendar-month-view">
        <div className="calendar-month-header">
          {showPrev ? (
            <button 
              type="button" 
              className="calendar-nav-btn"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            >
              &lt;
            </button>
          ) : <div style={{ width: '32px' }} />}
          
          <div className="calendar-month-name">{capitalizedMonth}</div>
          
          {showNext ? (
            <button 
              type="button" 
              className="calendar-nav-btn"
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            >
              &gt;
            </button>
          ) : <div style={{ width: '32px' }} />}
        </div>
        
        <div className="calendar-weekdays">
          <span>Пн</span>
          <span>Вт</span>
          <span>Ср</span>
          <span>Чт</span>
          <span>Пт</span>
          <span>Сб</span>
          <span>Нд</span>
        </div>
        
        <div className="calendar-days-grid">
          {days.map(d => {
            if (d.type === 'empty') {
              return <div key={d.key} />;
            }
            
            const { day, dateStr } = d;
            const isPast = isDateInPast(dateStr!);
            const isBusyIn = isDateBusyForCheckIn(dateStr!);
            const isBusyOut = isDateBusyForCheckOut(dateStr!);
            
            // Визначаємо, чи зайнятий цей день для кліку
            const isBusy = (() => {
              if (isPast) return false;
              if (!startDate) {
                return isBusyIn;
              } else {
                if (dateStr! < startDate) return isBusyIn;
                if (dateStr! === startDate) return false;
                const hasOverlap = bookedDates.some(bd => {
                  const startStr = getLocalDateString(bd.startDate);
                  const endStr = getLocalDateString(bd.endDate);
                  return startDate < endStr && dateStr! > startStr;
                });
                return hasOverlap || isBusyOut;
              }
            })();

            const isSelStart = startDate === dateStr;
            const isSelEnd = endDate === dateStr;
            const isInRange = startDate && endDate && dateStr! > startDate && dateStr! < endDate;
            const isHoverRange = startDate && !endDate && hoverDate && dateStr! > startDate && dateStr! <= hoverDate;
            const isSingle = isSelStart && !endDate;
            
            let classes = 'calendar-day-cell';
            if (isPast) classes += ' disabled';
            else if (isBusy) classes += ' busy';
            else if (isSelStart) classes += ' selected-start';
            else if (isSelEnd) classes += ' selected-end';
            else if (isInRange || isHoverRange) classes += ' in-range';
            
            if (isSingle) classes += ' single-day';
            
            return (
              <div 
                key={d.key} 
                className={classes}
                onClick={() => handleDayClick(dateStr!)}
                onMouseEnter={() => startDate && !endDate && setHoverDate(dateStr!)}
              >
                <span className="calendar-day-number">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const calculateSelectedNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCalendarDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (mode === 'popup') {
    return (
      <div className="calendar-grid-container" style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
        {isMobileView ? (
          renderMonthView(calendarMonth, true, true)
        ) : (
          <>
            {renderMonthView(calendarMonth, true, false)}
            {renderMonthView(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1), false, true)}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="inline-calendar-section">
      <h3>Оберіть дати оренди</h3>
      <p className="text-muted">
        {calculateSelectedNights() > 0 ? (
          <>
            Тривалість оренди:{' '}
            <strong>
              {(() => {
                const n = calculateSelectedNights();
                if (n % 10 === 1 && n % 100 !== 11) return `${n} ніч`;
                if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} ночі`;
                return `${n} ночей`;
              })()}
            </strong>{' '}
            ({formatCalendarDate(startDate)} — {formatCalendarDate(endDate)})
          </>
        ) : (
          'Вкажіть період, щоб побачити точний розрахунок вартості'
        )}
      </p>
      <div className="calendar-grid-container inline-calendar">
        {renderMonthView(calendarMonth, true, false)}
        {renderMonthView(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1), false, true)}
      </div>
      <div className="calendar-actions-row">
        {(startDate || endDate) && (
          <button 
            type="button" 
            className="calendar-clear-btn"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setHoverDate(null);
            }}
          >
            Очистити дати
          </button>
        )}
      </div>
    </div>
  );
};
