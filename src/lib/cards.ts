// カード表記(ランク+スート)の共通パース・整形ユーティリティ。
//
// このメディアの記事は元々「A♠A♦」「K♠K♥7♦」のように、ランクの直後にスート記号
// (♠♥♦♣)を続けて書く表記が本文中で自然に使われている(既存記事7本すべてで統一)。
// この慣習をそのまま活かし、新しい表記ルールを執筆側に覚えさせないことを優先している。
//
// - `src/components/CardBadge.astro`: フロントマターの構造化データ(handProgression の
//   board 等)をAstroコンポーネント側で明示的にバッジ表示する際に使う
// - `src/lib/rehype-card-badges.ts`: Markdown本文中の「A♠」表記を自動検出し、
//   同じ見た目のバッジへ変換する(astro.config.mjs に登録)
//
// 両者で見た目・パース結果がずれないよう、パースロジックをここに集約する。

export type Suit = 's' | 'h' | 'd' | 'c';

export interface ParsedCard {
	/** 表示用ランク文字列("A" "K" "Q" "J" "10" "9"…"2") */
	rank: string;
	suit: Suit;
	/** スート記号(♠♥♦♣) */
	suitSymbol: string;
	/** ハート/ダイヤ = 赤、スペード/クラブ = 黒(濃色)の色分けクラス */
	colorClass: 'card-badge--red' | 'card-badge--black';
}

const SUIT_SYMBOL: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

const SUIT_ALIAS: Record<string, Suit> = {
	'♠': 's',
	s: 's',
	S: 's',
	'♥': 'h',
	h: 'h',
	H: 'h',
	'♦': 'd',
	d: 'd',
	D: 'd',
	'♣': 'c',
	c: 'c',
	C: 'c',
};

/**
 * "A♠" "Kh" "10d" "Ts" のような1枚分のカード表記をパースする。
 * ランクは表示上つねに "10" に正規化する("T"表記の入力も許容する)。
 * 解釈できない入力(タイポ等)は null を返す。
 */
export function parseCard(input: string): ParsedCard | null {
	const trimmed = input.trim();
	const match = trimmed.match(/^(10|[2-9TJQKAtjqka])([♠♥♦♣shdcSHDC])$/);
	if (!match) return null;

	const [, rankRaw, suitRaw] = match;
	const suit = SUIT_ALIAS[suitRaw];
	if (!suit) return null;

	const rank = rankRaw.toUpperCase() === 'T' ? '10' : rankRaw.toUpperCase();
	return {
		rank,
		suit,
		suitSymbol: SUIT_SYMBOL[suit],
		colorClass: suit === 'h' || suit === 'd' ? 'card-badge--red' : 'card-badge--black',
	};
}

/**
 * Markdown本文からカード表記を自動検出するための正規表現(グローバル一致・破壊的 lastIndex 利用)。
 * 誤検出防止のため、スート記号(♠♥♦♣)を伴う表記のみを対象とする
 * (アルファベット表記の "Ah" 等は本文中の通常の単語と区別できないため対象外)。
 */
export const CARD_TEXT_PATTERN = /(10|[2-9TJQKA])([♠♥♦♣])/g;

export function suitSymbolColorClass(suitSymbol: string): 'card-badge--red' | 'card-badge--black' {
	return suitSymbol === '♥' || suitSymbol === '♦' ? 'card-badge--red' : 'card-badge--black';
}
