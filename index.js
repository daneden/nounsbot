// @flow
import Twit from "twit"
import fs from "fs"

require('dotenv').config()

type Noun = {
  word: string,
  popularity: number,
  complexity: Array<string>,
}

const {
  TWIT_CONSUMER_KEY,
  TWIT_CONSUMER_SECRET,
  TWIT_ACCESS_TOKEN,
  TWIT_ACCESS_TOKEN_SECRET,
} = process.env

const TWIT_CONFIG = {
  consumer_key: TWIT_CONSUMER_KEY,
  consumer_secret: TWIT_CONSUMER_SECRET,
  access_token: TWIT_ACCESS_TOKEN,
  access_token_secret: TWIT_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000,
}

const T = new Twit(TWIT_CONFIG);

const fileContents = fs.readFileSync("nouns.csv")
const lines: Array<string> = fileContents.toString().split('\n')

let nouns: Array<Noun> = []

// Construct list of nouns from the data
for(let i = 0; i < lines.length; i++) {
  const entry = lines[i].toString().split(',')

  const noun = {
    word: entry[0],
    popularity: Number(entry[1]),
    complexity: entry[2].toString()
      .replace('\r', '')
      .split(';'),
  }

  nouns.push(noun)
}

function pickSomeWords(list: Array<Noun>): string {
  // masterpiece will be an array of chosen words
  let masterpiece: Array<string> = []
  // n defines the number of words we'll choose
  const n = Math.floor(Math.random() * 2 + 2)

  while(masterpiece.length < n) {
    // Pick a random word from the list
    const choice: Noun = list[Math.floor(Math.random() * list.length)]

    // If the word is a noun OR if it's the first choice, add it to the array
    if(choice.complexity.length === 1 ||
      (choice.complexity.length > 1 && masterpiece.length === 0)) {
      masterpiece.push(choice.word)
    }

    // Filter out duplicates. with this dataset size, dupes are unlikely but not impossible.
    masterpiece = masterpiece
      .filter((item, pos) => masterpiece.indexOf(item) == pos);
  }

  // Capitalise the first letter of the first word
  let result = masterpiece[0].charAt(0).toUpperCase() + masterpiece[0].slice(1);

  // Finally, complete the sentence
  masterpiece.shift();
  result += ` ${masterpiece.join(' ')}.`;

  return result;
}

function tweetIdea(idea: string, imgData: string) {
  T.post('statuses/update', {
    status: idea,
  }, (err, data, response) => {
    if(!err) console.log(`Tweeted "${idea}"`);
    else console.log(err);
  })
}

tweetIdea(pickSomeWords(nouns))
