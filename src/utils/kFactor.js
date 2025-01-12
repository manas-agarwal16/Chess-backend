export const kFactor = (rating) => {
    if(rating >= 1200 && rating <= 1399) return 100;
    if(rating >= 1400 && rating <= 1599) return 50;
    if(rating >= 1600 && rating <= 1799) return 25;
    if(rating >= 1800 && rating <= 1899) return 10;
    if(rating >= 1900 && rating <= 1949) return 7;
    if(rating >= 1950) return 3;
}