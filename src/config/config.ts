import { IConfigurationOptions } from "src/interfaces/IConfigurationOption";

export default (): IConfigurationOptions => ({
    user_table: process.env.USER_TABLE ?? 'users-table' ,
    swipe_table: process.env.SWIPE_TABLE ?? 'swipe-table' ,
    
});