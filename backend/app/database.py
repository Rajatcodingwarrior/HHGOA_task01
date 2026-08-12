import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.config import settings

logger = logging.getLogger(__name__)

# Global instances
client: AsyncIOMotorClient = None
db = None
fs = None

async def connect_to_mongo():
    global client, db, fs
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DATABASE]
        fs = AsyncIOMotorGridFSBucket(db)
        
        # Verify connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB!")

        # Initialize indexes
        # 1. Unique index on public_result_id for fast lookups
        await db.generations.create_index("public_result_id", unique=True)
        # 2. TTL Index on expires_at for automatic cleanup
        try:
            await db.generations.create_index("expires_at", expireAfterSeconds=0)
        except Exception as e:
            if "IndexOptionsConflict" in str(e) or "different options" in str(e):
                logger.warning("Conflicting expires_at index options detected. Dropping and recreating index...")
                try:
                    await db.generations.drop_index("expires_at_1")
                    await db.generations.create_index("expires_at", expireAfterSeconds=0)
                except Exception as drop_err:
                    logger.error(f"Failed to resolve index conflict: {drop_err}")
            else:
                logger.error(f"Index creation failed: {e}")
        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")

def get_db():
    return db

def get_gridfs():
    return fs
