import { instanceReports } from "./axiosInstances";
import Cookies from "js-cookie";

export const createReport = async (data) => {
  try {
    const token = Cookies.get("token");
    const response = await instanceReports.post("/report-problem/create-report", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReports = async () => {
  try {
    const token = Cookies.get("token");
    const response = await instanceReports.get("/report-problem/get-reports", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    throw error;
  }
};

export const deleteReport = async (id) => {
  try {
    const token = Cookies.get("token");
    const response = await instanceReports.delete(`/report-problem/delete-report/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    throw error;
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    const token = Cookies.get("token");
    const response = await instanceReports.patch(
      `/report-problem/update-status/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado del reporte:', error);
    throw error;
  }
};
