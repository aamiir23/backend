const redis = require('redis');

async function testRedis() {
  const client = redis.createClient({
    url: 'redis://localhost:6380'
  });

  await client.connect();

  console.log('Redis connected successfully');

  await client.set('test_key', 'Hello from Redis on 6380');
  const value = await client.get('test_key');

  console.log('Stored value:', value);

  await client.quit();
}

testRedis();
