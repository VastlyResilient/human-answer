// The Ask Matt engine's knowledge base.
//
// HONESTY NOTE: these responses encode the STYLE and PHILOSOPHY of WolfSpirit99's
// public writing - direct answer first, lived-story framing underneath, dry humor,
// zero filler. They are original compositions in that style, NOT verbatim Quora
// answers. When Matt's archive export lands, entries here can be replaced or
// grounded with his actual wording one-for-one.

export interface KbEntry {
  id: string
  keywords: string[]
  answer: string
}

export const KB: KbEntry[] = [
  {
    id: 'start-over',
    keywords: ['start over', 'starting over', 'change careers', 'career', 'too late', 'age', 'old', 'forty', 'fifty', 'fresh start', 'restart'],
    answer: "No - it is not too late. But the toll goes up every year you leave the road forked.\n\nI changed paths at forty-one, and the math felt impossible right up until I noticed I was paying that cost either way: in money now, or in regret later. Regret compounds faster. Pick the bill you can live with and start paying it this week - not Monday. This week.",
  },
  {
    id: 'courage',
    keywords: ['courage', 'brave', 'afraid', 'scared', 'fear', 'anxiety', 'leap', 'risk'],
    answer: "Courage is rented, never owned. You return it tired every night and renew it again the next morning - that is the whole trick nobody tells you.\n\nThe night before my biggest leap I did not feel brave. I felt like a man on a diving board doing math. What got me off the board was smaller than courage: I made a list of what happens if it fails, and the list came out shorter than the one called staying.",
  },
  {
    id: 'loss',
    keywords: ['loss', 'died', 'death', 'grief', 'grieving', 'funeral', 'missing', 'passed away', 'dying', 'goodbye'],
    answer: "Say less than you think you need to. Presence beats prose. Sit down, hold on, speak plain.\n\nWhen I ran out of words at the worst goodbye of my life, what worked was showing up anyway - bad coffee, bad jokes at exactly the right moment, and no attempt to fix anything. Grief is not a wave you ride, by the way. It is a language. You get fluent slowly, and then one day you catch yourself translating for someone else.",
  },
  {
    id: 'parent',
    keywords: ['parent', 'kids', 'children', 'son', 'daughter', 'father', 'mother', 'dad', 'mom', 'raising'],
    answer: "Nobody warns you that the hardest part arrives only after the house goes quiet.\n\nEveryone braces you for sleepless nights and tantrums. Nobody mentions eighteen years later - the hallway that echoes, the chair nobody sits in. You raise them to leave. Doing it well and letting go well turn out to be the same job.",
  },
  {
    id: 'money',
    keywords: ['money', 'rich', 'wealth', 'enough', 'salary', 'afford', 'broke', 'debt', 'savings'],
    answer: "Wealth is the gap between what you want and what you already have. You can widen it from both ends - earn more, want less - and the second lever works today, for free.\n\nThe poorest I ever felt was not my lowest balance; it was the month I kept measuring my Tuesdays against strangers' highlight reels. Buy the good coffee you actually drink. Skip the things you buy to be seen holding.",
  },
  {
    id: 'neighbors',
    keywords: ['neighbor', 'neighbour', 'community', 'lonely', 'loneliness', 'friends', 'new town', 'moved', 'isolation'],
    answer: "A street becomes a home the day someone borrows a ladder and returns soup. That is the whole formula.\n\nMove somewhere new and do not wait to be invited - be useful first and be specific about it. Learn one name per week and bring the thing people actually need: a snow shovel, a casserole, ten quiet minutes on their porch. Loneliness rarely survives usefulness.",
  },
  {
    id: 'mistake',
    keywords: ['mistake', 'regret', 'forgive myself', 'guilt', 'shame', 'failure', 'failed', 'ruined'],
    answer: "Your worst mistake is the only teacher that grades you honestly - flunk the lesson twice and the third try usually sticks.\n\nThe guilt means your conscience still has a pulse; shame is just guilt wearing a heavier coat. Tell the truth about it to one safe person, fix what can still be fixed, then let the scar do its job instead of picking at it daily.",
  },
  {
    id: 'gratitude',
    keywords: ['grateful', 'gratitude', 'ordinary', 'taken for granted', 'appreciate', 'normal day', 'wednesday'],
    answer: "You never know the last ordinary day until it has been gone a long while.\n\nThe dishes in the sink, the second-hand noise of family, the commute you complain about - most of life's best material wears work clothes. Once a week, look around your average Wednesday and take inventory like you will miss it. Because someday, you will.",
  },
  {
    id: 'kindness',
    keywords: ['kindness', 'kind', 'help', 'helping', 'volunteer', 'give back', 'compassion', 'stranger'],
    answer: "One extra chair has ended more loneliness than a thousand good intentions.\n\nKindness does not need a nonprofit. It needs a name and a Tuesday: invite the new coworker who eats alone, learn the mail carrier's name, return the borrowed tool with something extra in the box. Small and repeated beats grand and once.",
  },
  {
    id: 'writing',
    keywords: ['writing', 'write', 'writer', 'blog', 'answers', 'quora', 'advice'],
    answer: "Give the point away in the first two sentences, then earn the rest with something that actually happened to you.\n\nReaders forgive imperfect grammar; they never forgive wasted time. Cut every sentence that exists to decorate. And write like you talk when the cameras are off - that odd specific voice is the one thing nobody else can synthesize.",
  },
  {
    id: 'who-are-you',
    keywords: ['who are you', 'are you matt', 'are you real', 'human?', ' bot', ' ai', 'robot'],
    answer: "Fair question, straight answer: I am an AI built to answer in the spirit of Matt - WolfSpirit99 - his public style and philosophy. Direct answer first, story underneath. Not the man himself, and I will not pretend otherwise.\n\nThe real one is out there answering strangers at 1 a.m. When his full archive export lands, this engine gets grounded word-for-word in the genuine article.",
  },
]

export const FALLBACKS = [
  "That one sits outside the shelf of things I know cold - and I would rather admit that than improvise wisdom. Try me on starting over, fear, loss, money, family, neighbors, mistakes, gratitude, kindness, or writing.",
  "I do not have lived material for that yet - and around here we do not fake the lived part. Point me at beginning again, courage, grief, enough money, raising kids, being a neighbor, forgiving yourself, ordinary days, kindness, or writing.",
]
