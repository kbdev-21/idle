import "dotenv/config";
import { DataSource } from 'typeorm';
import {SnakeNamingStrategy} from "typeorm-naming-strategies";
import {User} from "../module/users/entity/user.entity.js";
import {Friendship} from "../module/users/entity/friendship.entity.js";

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_CONNECTION_URL,
  entities: [User, Friendship],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
});