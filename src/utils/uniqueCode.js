export const uniqueCode = () => {
    const min = 100000 , max = 999999;
    const code = Math.floor(Math.random() * (max - min) + min);
    return code;
}