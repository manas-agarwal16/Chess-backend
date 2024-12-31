import bcrypt from "bcrypt";

const encrptPassword =  async (password) => {
    const encrptedPassword = await bcrypt.hash(password, 10);
    return encrptedPassword;
}

export {encrptPassword};