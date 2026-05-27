import axios from "axios";

export const getAppointmentData = async (appointmentId, token, patientId) => {
  try {
    // The Adapter Layer endpoint requires fetching by the Patient ID: /appointments/patient/:patientId
    const response = await axios.get(
      `${process.env.ADAPTER_URL}/appointments/patient/${patientId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const appointments = response.data.data;

    // Verify if the requested appointment ID exists inside the patient's appointment list history
    const appointmentExists = appointments.find(
      (app) => app.id === appointmentId || app._id === appointmentId,
    );

    if (!appointmentExists) {
      throw new Error(
        "Appointment not found for this patient in the Legacy System",
      );
    }

    return appointmentExists;
  } catch (error) {
    console.error(
      "Adapter Integration Log:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || error.message || "Adapter Layer Error",
    );
  }
};
