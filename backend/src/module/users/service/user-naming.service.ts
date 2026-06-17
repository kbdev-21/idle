import 'dotenv/config';
import {randomXtoY} from "../../../core/utils.js";

const storageUrl = process.env.SUPABASE_URL;
if(!storageUrl){
  throw new Error("Missing env variables");
}

const adjectives = [
  "Lazy",
  "Angry",
  "Silly",
  "Sleepy",
  "Chubby",
  "Happy",
  "Fluffy",
  "Fancy",
  "Lucky",
  "Chilly",
  "Grumpy"
];

const animals = [
  { name: "Bunny", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Rabbit.png` },
  { name: "Kitten", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Kitten.png` },
  { name: "Grizzle", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Grizzle.png` },
  { name: "Hamster", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Hamster.png` },
  { name: "Monkey", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Monkey.png` },
];

export function randomGuestIdentify(): {
  name: string;
  avtUrl: string;
} {
  const randomAdjectivesIndex = randomXtoY(0, adjectives.length - 1);
  const randomAnimalsIndex = randomXtoY(0, animals.length - 1);
  const randomNumber = randomXtoY(100, 999);

  const animal = animals[randomAnimalsIndex];

  const name = adjectives[randomAdjectivesIndex] + animal.name + randomNumber;
  const avtUrl = animal.imgUrl;
  return { name, avtUrl }
}