// GitHub Pagesのプロジェクトページ(astro.config.mjsのbase設定)配下で
// 内部リンク・アセットパスを組み立てるための共通ヘルパー。
// import.meta.env.BASE_URLは末尾スラッシュの有無がAstroのバージョン・設定により
// 揺れることがあるため、ここで正規化してから連結する。
export function withBase(path = ''): string {
	const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
	const suffix = path.replace(/^\/+/, '');
	return suffix ? `${base}/${suffix}` : `${base}/`;
}
