import { format, getDaysInMonth } from "date-fns";
import { useState, useEffect } from "react";

const DatePicker = ({ setDateOFBirth }) => {
  const currentDate = new Date();
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    setYears(
      generateYears(currentDate.getFullYear(), currentDate.getFullYear() - 100)
    );
    setMonths(generateMonths());
    setDays(generateDays(selectedYear, selectedMonth));
    if (selectedDay && selectedMonth && selectedYear) {
      const dateOfBirth = `${selectedDay}/${selectedMonth}/${selectedYear}`;
      setDateOFBirth(dateOfBirth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  const generateYears = (startYear, endYear) => {
    return Array.from(
      { length: startYear - endYear + 1 },
      (_, index) => startYear - index
    );
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  };

  const generateDays = (year, month) => {
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  };

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value, 10);
    setSelectedYear(selectedYear);
  };

  const handleMonthChange = (e) => {
    const selectedMonth = parseInt(e.target.value, 10);
    setSelectedMonth(selectedMonth);
  };

  const handleDayChange = (e) => {
    const selectedDay = parseInt(e.target.value, 10);
    setSelectedDay(selectedDay);
  };

  return (
    <div
      style={{ width: "100%", display: "flex", justifyContent: "space-around" }}
    >
      <select
        className="input-style"
        value={selectedDay}
        onChange={handleDayChange}
      >
        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
      <select
        className="input-style"
        value={selectedMonth}
        onChange={handleMonthChange}
      >
        {months.map((month) => (
          <option key={month} value={month}>
            {format(new Date(2000, month - 1), "MMMM")}
          </option>
        ))}
      </select>
      <select
        className="input-style"
        value={selectedYear}
        onChange={handleYearChange}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DatePicker;
