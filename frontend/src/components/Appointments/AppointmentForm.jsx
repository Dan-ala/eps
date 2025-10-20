import { useState } from "react";
import { safeFetch } from "../../utils/safeFetch";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000/api/appointments";

export default function AppointmentForm({ onAppointmentCreated }) {
  const [form, setForm] = useState({
    usersId: "",
    providerId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    status: "scheduled",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await safeFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.success) {
        toast.success("Appointment created!");
        onAppointmentCreated();
        setForm({
          usersId: "",
          providerId: "",
          appointmentDate: "",
          appointmentTime: "",
          reason: "",
          status: "scheduled",
        });
      } else toast.error(res.message);
    } catch (err) {
      toast.error("Error creating appointment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>New Appointment</h3>

      <input
        type="number"
        name="usersId"
        placeholder="User ID"
        value={form.usersId}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="providerId"
        placeholder="Provider ID"
        value={form.providerId}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="appointmentDate"
        value={form.appointmentDate}
        onChange={handleChange}
        required
      />
      <input
        type="time"
        name="appointmentTime"
        value={form.appointmentTime}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="reason"
        placeholder="Reason"
        value={form.reason}
        onChange={handleChange}
        required
      />
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <button type="submit" className="btn btn-primary">
        Save
      </button>
    </form>
  );
}
