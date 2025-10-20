import { useEffect, useState } from "react";
import { safeFetch } from "../../utils/safeFetch";

const API_URL = "http://localhost:3000/api/appointments";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // ✅ Token from login response

    const fetchAppointments = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ✅ Correct format
          }
        });

        if (res.status === 403) {
          console.warn("Access forbidden: missing or invalid token");
        }

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setAppointments(data.data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div>
      <h1>Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((a) => (
          <div key={a.appointmentId}>
            <strong>{a.reason}</strong> - {a.appointmentDate}
          </div>
        ))
      )}
    </div>
  );
}
