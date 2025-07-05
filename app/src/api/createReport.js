import { instanceReports } from "./axiosInstances";

export const createReport = async (data) => {
  try {
    const response = await instanceReports.post("/create-report", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReports = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await instanceReports.get("/get-reports", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
