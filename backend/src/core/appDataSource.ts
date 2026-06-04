import { DataSource } from 'typeorm';
import {SnakeNamingStrategy} from "typeorm-naming-strategies";
import {User} from "../module/users/entity/User.js";
import {UserFollower} from "../module/users/entity/UserFollower.js";

export const appDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_CONNECTION_URL,
  entities: [User, UserFollower],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
});