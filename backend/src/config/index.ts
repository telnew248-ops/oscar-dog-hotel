import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  hotelTimezone: process.env.HOTEL_TIMEZONE || 'Europe/Nicosia',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/oscar_dog_hotel',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    secret: process.env.JWT_SECRET || 'oscar_dog_hotel_jwt_secret_dev_key_2026!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'oscar_dog_hotel_jwt_refresh_dev_key_2026!',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  backup: {
    clientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL || '',
    privateKey: (process.env.GOOGLE_DRIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '14', 10),
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || 'oscar_hotel_backup_aes256_secret_key_32_bytes!'
  }
};
