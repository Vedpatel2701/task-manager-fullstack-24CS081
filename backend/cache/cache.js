const NodeCache = require('node-cache');

const DEFAULT_TTL_SECONDS = 60;
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL_SECONDS,
  checkperiod: 0,
});

let hits = 0;
let misses = 0;

function taskListKey(userId) {
  return `tasks:user:${userId}:list`;
}

function taskDetailKey(userId, taskId) {
  return `tasks:user:${userId}:detail:${taskId}`;
}

function get(key) {
  const value = cache.get(key);
  if (typeof value === 'undefined') {
    misses += 1;
    return undefined;
  }

  hits += 1;
  return value;
}

function set(key, value) {
  cache.set(key, value, DEFAULT_TTL_SECONDS);
}

function invalidateTaskCaches(userId, taskId) {
  const keys = [taskListKey(userId)];
  if (taskId) keys.push(taskDetailKey(userId, taskId));
  cache.del(keys);
}

function getStats() {
  return {
    hits,
    misses,
    totalRequests: hits + misses,
    keys: cache.getStats().keys,
    ttlSeconds: DEFAULT_TTL_SECONDS,
  };
}

module.exports = {
  get,
  set,
  taskListKey,
  taskDetailKey,
  invalidateTaskCaches,
  getStats,
};
