export const wFactor = (rating) => {
  if (rating >= 1200 && rating <= 1249) return 60;
  if (rating >= 1250 && rating <= 1299) return 50;
  if (rating >= 1300 && rating <= 1349) return 40;
  if (rating >= 1350 && rating <= 1399) return 35;
  if (rating >= 1400 && rating <= 1449) return 27;
  if (rating >= 1450 && rating <= 1499) return 20;
  if (rating >= 1500 && rating <= 1599) return 15;
  if (rating >= 1600 && rating <= 1799) return 10;
  if (rating >= 1800 && rating <= 1899) return 8;
  if (rating >= 1900 && rating <= 1949) return 5;
  if (rating >= 1950) return 4;
};

export const lFactor = (rating) => {
  if (rating >= 1200 && rating <= 1250) return 10;
  if (rating >= 1251 && rating <= 1299) return 20;
  if (rating >= 1300 && rating <= 1349) return 30;
  if (rating >= 1350 && rating <= 1399) return 40;
  if (rating >= 1400 && rating <= 1499) return 50;
  if (rating >= 1400 && rating <= 1599) return 60;
  if (rating >= 1600 && rating <= 1799) return 75;
  if (rating >= 1800 && rating <= 1899) return 85;
  if (rating >= 1900 && rating <= 1949) return 90;
  if (rating >= 1950) return 100;
};
