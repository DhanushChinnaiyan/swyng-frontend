import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers";
import { CircularProgress, Typography } from "@mui/material";
import Slots from "../Slots/Slots";
import axios from "axios";




const Calender = () => {
  const today = dayjs();
  const threeMonthsFuture = today.add(2, "month");
  const [selectedDate, setSelectedDate] = useState(dayjs)

  const isSunday = (date) => {
    return date.day() === 0;
  };

  const shouldDisableDate = (date) => {
    return date.isBefore(today, "day") || isSunday(date);
  };

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDataForDate = async (value) => {
    const day = new Date(value);
    const newFullDate = `${day.getDate()}-${
      day.getMonth() + 1
    }-${day.getFullYear()}`;

    try {
      setLoading(true);
      const response = await axios(
        `https://swyng-backend.onrender.com/api/slot?date=${newFullDate}`
      );
      const responseData = await response.data;
      const data = responseData.slots;
      let updatedBookedSlots = [];

      if (data[0] && data[0].Booking) {
        updatedBookedSlots = data[0].Booking.map((booking) => booking.time);
      } else {
        updatedBookedSlots = data;
      }

      setBookedSlots(updatedBookedSlots);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value) => {
    setSelectedDate(value)
    fetchDataForDate(value);
  };

  useEffect(() => {
    fetchDataForDate(dayjs());
  }, []);

  return (
    <Typography component="div" className="calender-container">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          className="calender"
          value={selectedDate}
          onChange={handleChange}
          shouldDisableDate={shouldDisableDate}
          views={["day"]}
          minDate={today.startOf("month")}
          maxDate={threeMonthsFuture.endOf("month")}
        />
      </LocalizationProvider>
      <Typography component="div" className="slot-container">
        {loading ? (
          <CircularProgress size="30px" />
        ) : (
          <Slots bookedSlots={bookedSlots} setBookedSlots={setBookedSlots} date = {selectedDate} />
        )}
      </Typography>
    </Typography>
  );
};

export default Calender;
