export interface ConfigurationOptions {
    user_table: string;
    swipe_table: string; 
}
export default (): ConfigurationOptions => ({
    user_table: process.env.USER_TABLE ?? 'users-table' ,
    swipe_table: process.env.SWIPE_TABLE ?? 'swipe-table' ,
    
});