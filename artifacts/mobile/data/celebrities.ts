export interface Celebrity {
  id: string;
  name: string;
  nameAr?: string;
  role: string;
  nationality: "egyptian" | "international";
  emoji: string;
  quotes: string[];
}

export const CELEBRITIES: Celebrity[] = [
  {
    id: "adel-imam",
    name: "Adel Imam",
    nameAr: "عادل إمام",
    role: "Egyptian Comedy Legend",
    nationality: "egyptian",
    emoji: "🎭",
    quotes: [
      "I'm not stupid… I'm just not smart enough!",
      "Why are you staring at me like I'm a ghost? Am I not real enough for you?",
      "My doctor said I need more rest. So I fired my doctor.",
      "I've been wrongly accused my whole life. And I'm fine with that.",
      "The problem isn't that I'm late — the problem is you came early!",
      "I did nothing wrong. I was simply in the wrong place at the right time.",
    ],
  },
  {
    id: "bassem-youssef",
    name: "Bassem Youssef",
    role: "The Egyptian Jon Stewart",
    nationality: "egyptian",
    emoji: "🎙️",
    quotes: [
      "I'm not mocking anyone. I'm just asking very loud questions.",
      "We didn't leave our revolution for THIS to happen.",
      "Breaking news: I have no news. The news has no news. We are all lost.",
      "If satire is dangerous, maybe what I'm satirizing is the real danger.",
      "I was a heart surgeon. I left to fix something even more broken.",
      "My sources? My eyes. My sources are my own two working eyes.",
    ],
  },
  {
    id: "mohamed-henedy",
    name: "Mohamed Henedy",
    role: "Egyptian Comedy Star",
    nationality: "egyptian",
    emoji: "😂",
    quotes: [
      "I swear on my mother's life I didn't eat the last piece of koshary.",
      "I'm innocent! The evidence is lying. Furniture can lie, you know.",
      "Are you doubting ME? Me, specifically? Why always me??",
      "I didn't run — I was walking with extreme urgency.",
      "My plan is perfect. The only flaw is everything about the plan.",
      "I've never been more serious in my life… about doing nothing.",
    ],
  },
  {
    id: "ahmed-helmy",
    name: "Ahmed Helmy",
    role: "Egyptian Actor & Comedian",
    nationality: "egyptian",
    emoji: "🌟",
    quotes: [
      "I was normal once. I have photos.",
      "No one understands me. And honestly? I support them.",
      "I'm not overthinking — I'm EXACTLY thinking the right amount.",
      "My brain took a day off and forgot to come back.",
      "I handle stress by pretending it doesn't exist. So far, zero results.",
      "I wasn't arguing. I was passionately explaining why I'm correct.",
    ],
  },
  {
    id: "jim-carrey",
    name: "Jim Carrey",
    role: "Hollywood Comedy King",
    nationality: "international",
    emoji: "🃏",
    quotes: [
      "Alrighty then! I'm outta here!",
      "Your mother was a hamster and your father smelt of elderberries!",
      "Do NOT go in there! Phew!",
      "I'm a loser, baby. No, wait — I'm Jim Carrey.",
      "Behind every great man is a woman rolling her eyes.",
      "I just want to be myself. Unfortunately, myself is a lot.",
    ],
  },
  {
    id: "kevin-hart",
    name: "Kevin Hart",
    role: "Stand-Up Comedy Legend",
    nationality: "international",
    emoji: "🎤",
    quotes: [
      "Everybody wants to be famous, but nobody wants to do the work.",
      "I'm not short. I'm fun-sized.",
      "You can plan a pretty picnic, but you can't predict the weather.",
      "My father ran for president of the family couch. He won by a landslide.",
      "Fear is a little voice in your head. I told it to shut up.",
      "I wake up every morning and say: Today is going to be AMAZING. Then I look in the mirror.",
    ],
  },
  {
    id: "will-smith",
    name: "Will Smith",
    role: "Hollywood A-Lister",
    nationality: "international",
    emoji: "🕶️",
    quotes: [
      "In West Philadelphia, born and raised—",
      "You want to know what my biggest fear is? Nothing. That's what.",
      "I'm sorry, my last name is Smith. We don't lose.",
      "Stop. Look at me. I said stop. Now look at me again.",
      "I'm not sure exactly what heaven looks like, but I hope it has WiFi.",
      "I make this look good.",
    ],
  },
  {
    id: "morgan-freeman",
    name: "Morgan Freeman",
    role: "Voice of God Himself",
    nationality: "international",
    emoji: "🎬",
    quotes: [
      "I can narrate anything. Anything. Even this awkward silence.",
      "And so it was... that nothing happened. But somehow, that was enough.",
      "In the beginning, there was a fridge. And it was full.",
      "I don't need to say much. My voice does the heavy lifting.",
      "There are those who look at things the way they are... and I narrate them.",
      "Life. It moves. Slowly. But with incredible narration.",
    ],
  },
  {
    id: "rowan-atkinson",
    name: "Rowan Atkinson",
    role: "Mr. Bean Himself",
    nationality: "international",
    emoji: "🐻",
    quotes: [
      "...",
      "Mmmmm.",
      "Oh dear.",
      "*stares intensely at a small problem for 45 seconds*",
      "Ahem. Quite.",
      "I will fix this. I will absolutely make this worse.",
    ],
  },
  {
    id: "dina-el-sherbiny",
    name: "Dina El Sherbiny",
    role: "Egyptian Drama Queen",
    nationality: "egyptian",
    emoji: "👑",
    quotes: [
      "I'm not crying — there's something in both of my eyes.",
      "I trusted you. And you failed me. And I'm fine. I'm absolutely fine.",
      "I built this with my own hands. You better not touch it.",
      "I don't need anyone. I never needed anyone. I'm going home now.",
      "My patience has a limit and we just reached it three minutes ago.",
      "I said what I said. And I'll say it again slower if needed.",
    ],
  },
];

export const getCelebrityById = (id: string): Celebrity | undefined =>
  CELEBRITIES.find((c) => c.id === id);

export const getEgyptianCelebrities = (): Celebrity[] =>
  CELEBRITIES.filter((c) => c.nationality === "egyptian");

export const getInternationalCelebrities = (): Celebrity[] =>
  CELEBRITIES.filter((c) => c.nationality === "international");
