import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chats';

export const getChatSessions = (user_uid) =>
  axios.get(`${API_URL}/sessions/${user_uid}`);

export const getChatMessages = (session_id) =>
  axios.get(`${API_URL}/messages/${session_id}`);

export const createSession = (user_uid, title) =>
  console.log('Creating session for user:', user_uid, 'with title:', title) ||
  axios.post(`${API_URL}/session`, { user_uid, title });

export const sendMessage = (session_id, user_uid, message, sender) =>
  axios.post(`${API_URL}/message`, { session_id, user_uid, message, sender });

export const getUserMetadata = (user_uid) =>
  axios.get(`${API_URL}/metadata/${user_uid}`);
