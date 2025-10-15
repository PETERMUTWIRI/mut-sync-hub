import redis, os
redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379"), decode_responses=True)
