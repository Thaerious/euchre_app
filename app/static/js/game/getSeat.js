export default function getSeat(pindex, forPlayer) {
    return (pindex + 4 - forPlayer) % 4
}

export function getPindex(seat, forPlayer) {
    return (seat + forPlayer) % 4;
}