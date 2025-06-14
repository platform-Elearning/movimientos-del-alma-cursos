import { instanceReports } from "./axiosInstances";

export const createReport = async (data) => {
  try {
    const response = await instanceReports.post("/create-report", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
