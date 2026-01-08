/**
 * 削除対象となるリンクに含まれるURLパラメータのキーワード
 * @constant {string[]}
 */
const TARGET_URL_KEYWORDS = [
    'start_radio=1',
    'list=RD'
];

/**
 * 削除対象となるコンテナ要素のセレクタリスト
 * @constant {string[]}
 */
const TARGET_CONTAINER_SELECTORS = [
    'ytd-rich-item-renderer',       // ホーム画面の動画カード
    'ytd-compact-radio-renderer',   // サイドバーのミックスリスト
    'ytd-radio-renderer',           // 検索結果のミックスリスト
    'ytd-compact-video-renderer'    // サイドバーの動画カード（念のため）
];

/**
 * 指定された要素がミックスリストかどうかを判定します。
 * 要素内のリンク(aタグ)を検索し、特定のキーワードが含まれているか確認します。
 * * @param {HTMLElement} element - 判定対象のDOM要素
 * @returns {boolean} ミックスリストであればtrue、そうでなければfalse
 */
function isMixListElement(element) {
    // 要素内のすべてのリンクを取得
    const links = element.querySelectorAll('a');
    
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        // 特定のキーワードがURLに含まれているかチェック
        if (TARGET_URL_KEYWORDS.some(keyword => href.includes(keyword))) {
            return true;
        }
    }
    return false;
}

/**
 * ページ内のミックスリスト要素を検索し、削除（非表示）処理を行います。
 * * @returns {void}
 */
function removeMixLists() {
    // 対象となる候補要素をすべて取得
    const candidates = document.querySelectorAll(TARGET_CONTAINER_SELECTORS.join(','));

    candidates.forEach(element => {
        // すでに非表示処理済みの場合はスキップ（処理負荷軽減）
        if (element.style.display === 'none') return;

        if (isMixListElement(element)) {
            element.style.display = 'none';
            // 開発者ツールで見つけやすいようにログを出力（本番では削除可）
            console.log('[NoMix] Removed a mix list element.');
        }
    });
}

/**
 * DOMの変更を監視し、新しい要素が追加されたら削除処理を実行します。
 * YouTubeはスクロール時に動的に要素が追加されるため、この処理が必要です。
 * * @returns {void}
 */
function observeDomChanges() {
    const observer = new MutationObserver((mutations) => {
        // 変更があるたびに実行すると重くなる可能性があるため、
        // 実際はthrottle（間引き）処理を入れるのがベストですが、
        // ここではシンプルに実行します。
        removeMixLists();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// --- メイン処理の実行 ---

// 初回読み込み時の実行
removeMixLists();

// 動的な変更の監視を開始
observeDomChanges();