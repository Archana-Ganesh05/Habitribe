import API from "./api";

export const getMe = async () => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/me`, {
    headers: {
      Authorization: token,
    },
  });

  return res.json();
};

export const createProfile = async (profileData) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(profileData),
  });

  return res.json();
};