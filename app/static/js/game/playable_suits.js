
export default function playable_suits(snapshot){
    if (snapshot.tricks.length === 0) return ["♠", "♥", "♦", "♣"]
    const trick = snapshot.tricks.at(-1)
    if (trick.length === 0) return ["♠", "♥", "♦", "♣"]

    const leadSuit = trick[0].at(-1)

    for (let card of snapshot.hand) {
        const suit = card.at(-1)
        if (suit === leadSuit) return [leadSuit]
    }

    return ["♠", "♥", "♦", "♣"]
}
