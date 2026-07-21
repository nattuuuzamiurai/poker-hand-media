// favicon.svg(チップの縁+スペード記号)を単一のソースとして、各種アイコン・デフォルトOGP画像を
// 生成するスクリプト。デザインを変更したい場合は public/favicon.svg を編集してこのスクリプトを
// 再実行するだけでよい(生成物はすべて public/ 直下にコミットして使う静的アセット)。
//
// 実行: npm run generate:assets
// 依存: devDependencies の sharp(SVGラスタライズ用。ビルド本体では使わない一度きりのツール)
//
// 生成物:
//   - public/favicon.ico          (16/32/48pxを埋め込んだマルチサイズICO。透過背景のまま)
//   - public/apple-touch-icon.png (180x180。iOSは透過部分を黒く塗りつぶすことがあるため不透明化)
//   - public/icon-192.png / icon-512.png (site.webmanifest用。同じく不透明化)
//   - public/og-image.png         (1200x630のデフォルトOGP画像。フェルトグリーン+ゴールドのテーマ)
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const BRAND_INK = '#10231a'; // favicon.svgの円背景と同じ色(不透明化時の余白塗りつぶしに使う)
const GOLD_LIGHT = '#f0d38f';
const GOLD_ACCENT_BORDER = '#e3b566';

async function renderPng(svg, size) {
	return sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();
}

// --- ICO(Vista以降が対応するPNG埋め込み形式)を組み立てる ---
// 外部パッケージに頼らず、ICOフォーマット(ICONDIR + ICONDIRENTRY[] + 画像データ)を直接組み立てる。
function buildIco(entries) {
	const count = entries.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: 1 = icon
	header.writeUInt16LE(count, 4);

	const dirEntries = [];
	let offset = 6 + count * 16;
	for (const { size, buffer } of entries) {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
		entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
		entry.writeUInt8(0, 2); // color count (0 = >=8bpp)
		entry.writeUInt8(0, 3); // reserved
		entry.writeUInt16LE(1, 4); // color planes
		entry.writeUInt16LE(32, 6); // bits per pixel
		entry.writeUInt32LE(buffer.length, 8); // 画像データのバイト数
		entry.writeUInt32LE(offset, 12); // ファイル先頭からのオフセット
		dirEntries.push(entry);
		offset += buffer.length;
	}

	return Buffer.concat([header, ...dirEntries, ...entries.map((e) => e.buffer)]);
}

async function main() {
	const svgSource = await readFile(path.join(publicDir, 'favicon.svg'), 'utf8');

	// apple-touch-icon / マニフェスト用アイコンは不透明にする。
	// favicon.svgは circle(r=16, 32x32のviewBox) のため四隅が透過しており、
	// iOS/Androidでは透過部分が黒く表示されることがあるため、同色の矩形を背面に敷いて塞ぐ。
	const opaqueSvg = svgSource.replace(
		'<circle cx="16" cy="16" r="16" fill="#10231a"/>',
		`<rect width="32" height="32" fill="${BRAND_INK}"/><circle cx="16" cy="16" r="16" fill="${BRAND_INK}"/>`,
	);
	if (opaqueSvg === svgSource) {
		throw new Error(
			'favicon.svgの想定していた構造(<circle cx="16" cy="16" r="16" fill="#10231a"/>)が見つかりませんでした。デザイン変更時はこのスクリプトの置換対象も更新してください。',
		);
	}

	// --- favicon.ico (16/32/48。透過背景のまま) ---
	const icoSizes = [16, 32, 48];
	const icoEntries = [];
	for (const size of icoSizes) {
		icoEntries.push({ size, buffer: await renderPng(svgSource, size) });
	}
	await writeFile(path.join(publicDir, 'favicon.ico'), buildIco(icoEntries));
	console.log('generated public/favicon.ico (16/32/48)');

	// --- apple-touch-icon.png (180x180。不透明) ---
	await writeFile(path.join(publicDir, 'apple-touch-icon.png'), await renderPng(opaqueSvg, 180));
	console.log('generated public/apple-touch-icon.png (180x180)');

	// --- site.webmanifest 用アイコン (192/512。不透明) ---
	await writeFile(path.join(publicDir, 'icon-192.png'), await renderPng(opaqueSvg, 192));
	await writeFile(path.join(publicDir, 'icon-512.png'), await renderPng(opaqueSvg, 512));
	console.log('generated public/icon-192.png / icon-512.png');

	// --- デフォルトOGP画像 (1200x630) ---
	// 既存のフェルトグリーン(--gradient-felt)+ゴールドアクセントのデザイントーンに合わせる。
	// ロゴバッジはfavicon.svgのデザイン(チップの縁+スペード)を縮小せず流用する。
	const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<defs>
		<linearGradient id="bg" x1="0%" y1="0%" x2="65%" y2="100%">
			<stop offset="0%" stop-color="#0f3a28"/>
			<stop offset="55%" stop-color="#10231a"/>
			<stop offset="100%" stop-color="#1a1512"/>
		</linearGradient>
		<linearGradient id="rail" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" stop-color="${GOLD_LIGHT}" stop-opacity="0"/>
			<stop offset="20%" stop-color="${GOLD_LIGHT}"/>
			<stop offset="50%" stop-color="${GOLD_ACCENT_BORDER}"/>
			<stop offset="80%" stop-color="${GOLD_LIGHT}"/>
			<stop offset="100%" stop-color="${GOLD_LIGHT}" stop-opacity="0"/>
		</linearGradient>
	</defs>

	<rect width="1200" height="630" fill="url(#bg)"/>
	<text x="1180" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="460" fill="rgba(255,255,255,0.05)" text-anchor="end">&#9824;</text>

	<rect x="0" y="0" width="1200" height="6" fill="url(#rail)" opacity="0.9"/>
	<rect x="0" y="624" width="1200" height="6" fill="url(#rail)" opacity="0.9"/>

	<circle cx="600" cy="185" r="88" fill="${BRAND_INK}" stroke="${GOLD_ACCENT_BORDER}" stroke-width="4" stroke-dasharray="10 9"/>
	<circle cx="600" cy="185" r="70" fill="none" stroke="${GOLD_ACCENT_BORDER}" stroke-width="2.5"/>
	<text x="600" y="215" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700" fill="#ffffff" text-anchor="middle">&#9824;</text>

	<text x="600" y="392" font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif" font-size="66" font-weight="700" fill="#ffffff" text-anchor="middle">ポーカーハンドメディア</text>
	<text x="600" y="446" font-family="'Hiragino Sans', 'Yu Gothic', sans-serif" font-size="28" fill="${GOLD_LIGHT}" text-anchor="middle">WSOP・トリトンの名場面ハンド解説</text>

	<text x="600" y="512" font-family="Georgia, serif" font-size="34" fill="${GOLD_LIGHT}" text-anchor="middle" letter-spacing="14">&#9824; &#9829; &#9830; &#9827;</text>
</svg>
`;
	await writeFile(path.join(publicDir, 'og-image.png'), await sharp(Buffer.from(ogSvg)).png().toBuffer());
	console.log('generated public/og-image.png (1200x630)');
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
