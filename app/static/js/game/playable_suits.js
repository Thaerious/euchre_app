const oppositeSuit = {
    "♠": "♣",
    "♥": "♦",
    "♦": "♥",
    "♣": "♠"
}

export default function playableSuits(snapshot){
    if (snapshot.tricks.length === 0) return ["♠", "♥", "♦", "♣"]
    const trick = snapshot.tricks.at(-1)
    if (trick.length === 0) return ["♠", "♥", "♦", "♣"]

    const leadSuit = calcSuit(trick[0], snapshot.trump)

    for (let card of snapshot.hand) {
        const suit = calcSuit(card, snapshot.trump)        
        if (suit === leadSuit) return [leadSuit]
    }

    return ["♠", "♥", "♦", "♣"]
}

export function calcSuit(card, trump) {
    const suit = card.at(-1)
    console.log(card, card.at(0), suit, oppositeSuit[suit], trump)
    if (card.at(0) !== "J") return suit
    if (oppositeSuit[suit] === trump) return trump
    return suit
}
