import axios from 'axios';

const api = axios.create({
   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

export const getRecordings = async () => {
  const response = await api.get('/api/recordings');
  return response.data;
};

export const getDownloadUrl = async (id) => {
  const response = await api.get(`/api/recordings/${id}/download`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data);
};

export const deleteRecording = async (id) => {
  await api.delete(`/api/recordings/${id}`);
};