import dotenv from 'dotenv';

dotenv.config();

interface EnvConfiguration {
	port: number;
	db_string: string;
	redis_conn_string: string;
}

const env_config: EnvConfiguration = {
	port: Number(process.env.PORT) || 3000,
	db_string: process.env.DB_CONN_STRING || "mongodb+srv://aquesa:R9Jo9bLXVaGKPA7q@cluster0.akqidoi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
	redis_conn_string: process.env.REDIS_CONN_STRING || "redis://localhost:6379"
}
export default env_config;
