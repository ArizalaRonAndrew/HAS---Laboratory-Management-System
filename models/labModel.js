import supabase from "../config/db.js";

export const insertLabRequest = async (appointmentId, patientId, testType) => {
  const { data, error } = await supabase
    .from("lab_requests")
    .insert([
      {
        appointmentID: appointmentId,
        patientID: patientId,
        testType: testType,
      },
    ])
    .select();

  if (error) throw error;
  return data[0].id;
};

export const fetchAllLabRequests = async () => {
  const { data, error } = await supabase.from("lab_requests").select("*");

  if (error) throw error;
  return data;
};

export const fetchLabRequestsByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from("lab_requests")
    .select("*")
    .eq("patientID", patientId);

  if (error) throw error;
  return data;
};

export const insertLabResult = async (requestId, resultData) => {
  const { data, error } = await supabase
    .from("lab_results")
    .insert([{ requestID: requestId, resultData: resultData }])
    .select();

  if (error) throw error;
  return data[0].id;
};

export const updateStatus = async (requestId, status) => {
  const { error } = await supabase
    .from("lab_requests")
    .update({ status: status })
    .eq("id", requestId);

  if (error) throw error;
};

export const fetchLabResultsByPatient = async (patientId) => {
  const { data, error } = await supabase
    .from("lab_results")
    .select(
      `
            id,
            resultData,
            createdAt,
            lab_requests!inner(
                id,
                testType,
                patientID
            )
        `,
    )
    .eq("lab_requests.patientID", patientId);

  if (error) throw error;

  return data.map((item) => ({
    resultID: item.id,
    requestID: item.lab_requests.id,
    testType: item.lab_requests.testType,
    resultData: item.resultData,
    createdAt: item.createdAt,
  }));
};
