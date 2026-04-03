// server/game/cards.js
// ── Shared card utility for Teen Patti & Rummy ──

export const SUITS = ['♠', '♥', '♦', '♣']
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
export const VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }

// Create a standard 52-card deck
export function createDeck() {
    const deck = []
    for (const suit of SUITS)
        for (const rank of RANKS)
            deck.push({ suit, rank, value: VALUES[rank] })
    return deck
}

// Fisher-Yates shuffle
export function shuffle(deck) {
    const d = [...deck]
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [d[i], d[j]] = [d[j], d[i]]
    }
    return d
}

export function cardKey(c) { return `${c.rank}${c.suit}` }

// ── Teen Patti Hand Evaluator ─────────────────────────────────────────────

// Returns {rank: number, name: string} — higher rank = better hand
export function evalTeenPatti(hand) {
    const [a, b, c] = hand.map(x => x.value).sort((x, y) => x - y)
    const [sa, sb, sc] = hand.map(x => x.suit)
    const sameSuit = sa === sb && sb === sc
    const isSeq = c - b === 1 && b - a === 1
    const isAceSeq = (a === 2 && b === 3 && c === 14) // A-2-3

    if (a === b && b === c) return { rank: 6, name: 'Trail / Three of a Kind', cards: [c, b, a] }
    if (sameSuit && (isSeq || isAceSeq)) return { rank: 5, name: 'Pure Sequence', cards: [c, b, a] }
    if (isSeq || isAceSeq) return { rank: 4, name: 'Sequence', cards: [c, b, a] }
    if (sameSuit) return { rank: 3, name: 'Color', cards: [c, b, a] }
    if (a === b || b === c) return { rank: 2, name: 'Pair', cards: [c, b, a] }
    return { rank: 1, name: 'High Card', cards: [c, b, a] }
}

// Compare two Teen Patti hands — returns 1 if h1 wins, -1 if h2 wins, 0 tie
export function compareTeenPatti(h1, h2) {
    const e1 = evalTeenPatti(h1), e2 = evalTeenPatti(h2)
    if (e1.rank !== e2.rank) return e1.rank > e2.rank ? 1 : -1
    // Same rank — compare highest card, then next
    for (let i = 0; i < e1.cards.length; i++) {
        if (e1.cards[i] !== e2.cards[i]) return e1.cards[i] > e2.cards[i] ? 1 : -1
    }
    return 0
}

// ── Rummy Hand Validator ──────────────────────────────────────────────────

const RANK_ORDER = '2 3 4 5 6 7 8 9 10 J Q K A'.split(' ')
function rankIndex(r) { return RANK_ORDER.indexOf(r) }

// Check if array of cards (same suit) is a pure sequence
function isPureSeq(cards) {
    if (cards.length < 3) return false
    const sorted = [...cards].sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank))
    for (let i = 1; i < sorted.length; i++)
        if (rankIndex(sorted[i].rank) !== rankIndex(sorted[i - 1].rank) + 1) return false
    return true
}

// Check if array of cards is a set (same rank, different suits)
function isSet(cards) {
    if (cards.length < 3 || cards.length > 4) return false
    const rank = cards[0].rank
    const suits = new Set(cards.map(c => c.suit))
    return cards.every(c => c.rank === rank) && suits.size === cards.length
}

// Check if group is a valid meld (pure seq, impure seq with jokers, or set)
export function isValidMeld(cards, jokers = []) {
    const nonJokers = cards.filter(c => !jokers.some(j => cardKey(j) === cardKey(c)))
    const jokerCount = cards.length - nonJokers.length
    if (jokerCount === 0) return isPureSeq(cards) || isSet(cards)
    // With jokers — try sequence with gaps filled
    if (nonJokers.length === 0) return false
    const sameSuit = nonJokers.every(c => c.suit === nonJokers[0].suit)
    if (sameSuit && nonJokers.length >= 2) {
        const sorted = [...nonJokers].sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank))
        const span = rankIndex(sorted.at(-1).rank) - rankIndex(sorted[0].rank) + 1
        const needed = span - nonJokers.length  // gaps to fill with jokers
        if (needed <= jokerCount && span <= 13) return true
    }
    // Set with jokers
    const sameRank = nonJokers.every(c => c.rank === nonJokers[0].rank)
    const totalSize = cards.length
    if (sameRank && totalSize >= 3 && totalSize <= 4) return true
    return false
}

// Validate a full rummy declaration
// melds: [[card,card,...], ...] — all 13 cards partitioned
// jokers: which cards are jokers
export function validateRummyDeclaration(melds, jokers = []) {
    if (melds.flat().length !== 13) return { valid: false, msg: 'Must use exactly 13 cards' }
    const pureSeqs = melds.filter(m => {
        const nonJ = m.filter(c => !jokers.some(j => cardKey(j) === cardKey(c)))
        return isPureSeq(nonJ) && nonJ.length === m.length
    })
    if (pureSeqs.length < 1) return { valid: false, msg: 'Need at least 1 pure sequence' }
    const allValid = melds.every(m => isValidMeld(m, jokers))
    if (!allValid) return { valid: false, msg: 'One or more melds are invalid' }
    const seqs = melds.filter(m => {
        const nonJ = m.filter(c => !jokers.some(j => cardKey(j) === cardKey(c)))
        return isPureSeq(nonJ) || (nonJ.length >= 2 && nonJ.every(c => c.suit === nonJ[0].suit))
    })
    if (seqs.length < 2) return { valid: false, msg: 'Need at least 2 sequences' }
    return { valid: true, msg: 'Valid declaration!' }
}

// Calculate deadwood points for unmelded cards (for losing players)
export function calcDeadwood(cards, jokers = []) {
    const POINTS = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 10 }
    return cards
        .filter(c => !jokers.some(j => cardKey(j) === cardKey(c)))
        .reduce((sum, c) => sum + (POINTS[c.rank] || 0), 0)
}