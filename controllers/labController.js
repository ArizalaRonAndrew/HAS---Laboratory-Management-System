import * as labModel from "../models/labModel.js";
import { getAppointmentData } from "../services/adapterService.js";
import { sendNotification } from "../services/notificationService.js";

export const createLabRequest = async (req, res) => {
  try {
    const { appointmentId, patientId, testType } = req.body;
    const token = req.token;

    // Pass the patientId along with the appointmentId to correctly look it up via the adapter layer route
    await getAppointmentData(appointmentId, token, patientId);

    const insertId = await labModel.insertLabRequest(
      appointmentId,
      patientId,
      testType,
    );

    await sendNotification(
      patientId,
      `Lab request for ${testType} created.`,
      token,
    );

    res.status(201).json({ success: true, requestID: insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLabRequests = async (req, res) => {
  try {
    const requests = await labModel.fetchAllLabRequests();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLabRequestsByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;
    const requests = await labModel.fetchLabRequestsByPatient(patientID);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLabResult = async (req, res) => {
  try {
    const { requestId, resultData, patientId } = req.body;
    const token = req.token;

    const resultId = await labModel.insertLabResult(requestId, resultData);
    await labModel.updateStatus(requestId, "Completed");

    await sendNotification(
      patientId,
      `Your lab results are ready to be viewed.`,
      token,
    );

    res.status(201).json({ success: true, resultID: resultId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLabRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await labModel.updateStatus(id, status);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLabResultsByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;
    const results = await labModel.fetchLabResultsByPatient(patientID);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
