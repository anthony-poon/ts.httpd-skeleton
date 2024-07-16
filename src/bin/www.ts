#!/usr/bin/env node
import http from '../http';
import database from '../persistence';

// throw new Error("Testing");
(async () => {
  await database.initialize();
  await http.initialize();
  http.listen();
})();
