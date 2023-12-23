import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import "./slots.css";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

const Slots = ({ bookedSlots, setBookedSlots, date }) => {
  const availableSlots = ["10AM", "12PM", "2PM", "4PM", "6PM"];
  const [open, setOpen] = useState(false);
  const [timing, setTiming] = useState("");
  const handleOpen = (slot) => {
    setTiming(slot);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const day = new Date(date);
  const newFullDate = `${day.getDate()}-${
    day.getMonth() + 1
  }-${day.getFullYear()}`;

  const createOrder = async () => {
    try {
      const amount = 500;
      const currency = "INR";
      const receiptId = "qwsaq1";

      const response = await axios.post(
        "https://swyng-backend.onrender.com/api/create-order",
        {
          amount,
          currency,
          receipt: receiptId,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to create order");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const initializeRazorpay = async () => {
    try {
      const order = await createOrder();

      const options = {
        key: "rzp_test_tmxiqbW7KJ5kJ6",
        amount: 10000,
        currency: "INR",
        name: "Slote Booking",
        description: "Test Transaction",
        order_id: order.id,
        handler: async (response) => {
          try {
            const validateRes = await axios.post(
              "https://swyng-backend.onrender.com/api/validate-payment",
              response
            );

            if (validateRes.status !== 200) {
              throw new Error("Failed to validate payment");
            }
            // If payment validation is successful, book the slot
            const slotBookingData = {
              ...formData,
              date: newFullDate,
              time: timing,
            };

            const slotBookingRes = await axios.post(
              "https://swyng-backend.onrender.com/api/slot/book",
              slotBookingData
            );

            if (slotBookingRes.status !== 200) {
              throw new Error("Failed to book slot");
            }

            setBookedSlots([...bookedSlots, timing]);
            setFormData({
              name: "",
              email: "",
              phoneNumber: "",
            });
            console.log(slotBookingRes.data);
          } catch (error) {
            console.error("Error validating payment:", error);
            throw error;
          } finally {
            handleClose();
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      alert("Failed to initialize payment. Please try again later.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    await initializeRazorpay();
  };

  return (
    <Typography component="div">
      <Typography component="div" className="slots">
        <Typography component="h3" className="title">
          SLOTS
        </Typography>
        {availableSlots.map((slot, index) => {
          // Check if slot is booked are not
          const isBooked = bookedSlots.includes(slot);

          return (
            <Button
              key={index}
              disabled={isBooked}
              variant="contained"
              color="success"
              className="button"
              onClick={() => handleOpen(slot)}
            >
              {isBooked ? `${slot} BOOKED` : slot}
            </Button>
          );
        })}
      </Typography>

      {/* Book slot */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box component="form" onSubmit={handleSubmit}>
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            onClick={handleClose}
          >
            <CancelIcon color="error" />
          </IconButton>
          <TextField
            id="outlined-basic"
            label="Name"
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            id="outlined-basic"
            label="Email"
            name="email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            id="outlined-basic"
            label="Phone Number"
            variant="outlined"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              minLength: 10,
              maxLength: 10,
            }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="success"
            className="button"
          >
            BOOK
          </Button>
        </Box>
      </Modal>
    </Typography>
  );
};

export default Slots;
