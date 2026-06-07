import 'dotenv/config';

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
  { name: "Rabbit", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Rabbit.png` },
  { name: "Kitten", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Kitten.png` },
  { name: "Grizzle", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Grizzle.png` },
  { name: "Hamster", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Hamster.png` },
  { name: "Monkey", imgUrl: `${storageUrl}/storage/v1/object/public/avt/Monkey.png` },
];

export function randomGuestIdentify(): {
  name: string;
  avtUrl: string;
} {
  const randomAdjectivesIndex = Math.floor(Math.random() * adjectives.length);
  const randomAnimalsIndex = Math.floor(Math.random() * animals.length);
  const randomNumber = Math.floor(Math.random() * 900) + 100;
  const name = adjectives[randomAdjectivesIndex] + animals[randomAnimalsIndex].name + randomNumber;
  const avtUrl = animals[randomAnimalsIndex].imgUrl;
  return { name, avtUrl }
}