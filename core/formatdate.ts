export const formatDate = (date: Date) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const day = daysOfWeek[date.getUTCDay()];
  const fullDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = date.toISOString().split("T")[1].split(".")[0]; // HH:MM:SS

  return `${day}, ${fullDate}, ${time}`;
};
