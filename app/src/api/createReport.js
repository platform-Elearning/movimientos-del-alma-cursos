import { instanceReports } from "./axiosInstances";
import Cookies from "js-cookie";

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
    const token = Cookies.get("token");
    const response = await instanceReports.get("/get-reports", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
