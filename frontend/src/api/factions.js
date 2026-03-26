import API from "./api";

export const getFactions = async () => {
  const res = await fetch(`${API}/factions`);
  return res.json();
};

export const joinFaction = async (factionId) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/factions/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ factionId }),
  });

  return res.json();
};