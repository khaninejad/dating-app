export interface ConfigurationOptions {
    user_table: string;
    swipe_table: string; 
}
export default (): ConfigurationOptions => ({
    user_table: process.env.USER_TABLE ?? 'DYNAMODB_TABLE' ,
    swipe_table: process.env.SWIPE_TABLE ?? 'SWIPE_TABLE6' ,
});