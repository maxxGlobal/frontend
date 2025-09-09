/* eslint-disable no-underscore-dangle */
import { useEffect, useState } from "react";

type CountDownReturn = {
  showDate: number;
  showHour: number;
  showMinute: number;
  showSecound: number;
};

export default function useCountDown(lastDate: string): CountDownReturn {
  const [showDate, setDate] = useState<number>(0);
  const [showHour, setHour] = useState<number>(0);
  const [showMinute, setMinute] = useState<number>(0);
  const [showSecound, setDateSecound] = useState<number>(0);

  // parse date
  const provideDate = new Date(lastDate);
  const year = provideDate.getFullYear();
  const month = provideDate.getMonth();
  const date = provideDate.getDate();
  const hours = provideDate.getHours();
  const minutes = provideDate.getMinutes();
  const seconds = provideDate.getSeconds();

  // constants
  const _seconds = 1000;
  const _minutes = _seconds * 60;
  const _hours = _minutes * 60;
  const _date = _hours * 24;

  // interval function
  const startInterval = () => {
    const timer = setInterval(() => {
      const now = new Date();
      const distance =
        new Date(year, month, date, hours, minutes, seconds).getTime() -
        now.getTime();

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setDate(Math.floor(distance / _date));
      setHour(Math.floor((distance % _date) / _hours));
      setMinute(Math.floor((distance % _hours) / _minutes));
      setDateSecound(Math.floor((distance % _minutes) / _seconds));
    }, 1000);

    return () => clearInterval(timer);
  };

  // effect
  useEffect(() => {
    if (lastDate) {
      const cleanup = startInterval();
      return cleanup;
    }
  }, [lastDate]);

  return { showDate, showHour, showMinute, showSecound };
}
