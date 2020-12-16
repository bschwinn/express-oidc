import redis from 'ioredis';

const mapName = "tackingdata"

export default () => {
    const redHost = process.env.REDIS_HOST;
    const redPort = process.env.REDIS_PORT || 6379;
    console.log(`connecting to redis at: ${redHost}:${redPort}`);

    const redCli = new redis({ host: redHost, port: redPort });

    redCli.on('connect', function() {
      console.log('Redis client connected');
    });
    
    redCli.on('error', function(err) {
      console.error('Redis client error', err);
    });

    return {
        client: redCli,
        getData: async () => {
            return new Promise((res, rej) => {
                redCli.hgetall(mapName, (err, result) => {
                    if (err) return rej(err);
                    let ret = { count: 0, results: [] }
                    for (let i in result) {
                        const res = JSON.parse(result[i])
                        ret.count += res
                        ret.results[ret.results.length] = { color: i, value: res }
                    }
                    res(ret);
                });
            });
        },
        logData: async (d) => {
            await redCli.hincrby(mapName, d.color, 1)
        }
    }
}