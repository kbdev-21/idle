import {randomXtoY} from "../../../core/utils.js";
import type {UserAvtCode} from "../../../database/schema.js";

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
  "Grumpy"
];

const animals: {name: string; code: UserAvtCode}[] = [
  {name: "Bunny", code: "BUNNY"},
  {name: "Kitten", code: "KITTEN"},
  {name: "Grizzle", code: "GRIZZLE"},
  {name: "Hamster", code: "HAMSTER"},
  {name: "Monkey", code: "MONKEY"}
];

export function randomGuestIdentify(): {
  name: string;
  avtCode: UserAvtCode;
} {
  const randomAdjectivesIndex = randomXtoY(0, adjectives.length - 1);
  const randomAnimalsIndex = randomXtoY(0, animals.length - 1);
  const randomNumber = randomXtoY(100, 999);

  const animal = animals[randomAnimalsIndex];

  const name = adjectives[randomAdjectivesIndex] + animal.name + randomNumber;
  const avtCode = animal.code;
  return { name, avtCode }
}
