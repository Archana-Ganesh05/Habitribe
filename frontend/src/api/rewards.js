import API from "./api";

export const getRewards = async () => {
  const res = await fetch(`${API}/rewards`);
  return res.json();
};

export const redeemReward = async (rewardId) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API}/rewards/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ rewardId }),
  });

  return res.json();
};