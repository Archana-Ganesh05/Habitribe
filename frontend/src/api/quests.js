import API from "./api";

export const getQuests = async (factionId) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/quests/faction/${factionId}`, {
    headers: {
      Authorization: token,
    },
  });

  return res.json();
};

export const acceptQuest = async (questId) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/quests/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ questId }),
  });

  return res.json();
};

export const completeQuest = async (questId) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/quests/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ questId }),
  });

  return res.json();
};

export const createQuest = async (factionId, questData) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/quests/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ ...questData, factionId }),
  });

  return res.json();
};

export const approveQuest = async (questId, reward) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/quests/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ questId, reward }),
  });

  return res.json();
};