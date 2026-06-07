import {dataSource} from "../core/data-source.js";

await dataSource.initialize();
await dataSource.dropDatabase();
await dataSource.destroy();