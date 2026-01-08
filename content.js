/**
 * 設定：既知の動画（視聴済み・視聴中）を削除する確率 (0.0 ～ 1.0)
 * 0.7 に設定すると、既知の動画の約7割が消え、3割が残ります。
 * @constant {number}
 */
const REMOVE_PROBABILITY = 0.7;

/**
 * 処理対象とする動画カードのコンテナセレクタ
 * @constant {string}
 */
const VIDEO_CONTAINER_SELECTOR = 'ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-video-renderer';

/**
 * 視聴済み判定に使う要素のセレクタ（サムネイル下の赤いバー、または視聴済みオーバーレイ）
 * @constant {string}
 */
const WATCHED_INDICATOR_SELECTOR = 'ytd-thumbnail-overlay-resume-playback-renderer, #progress';

/**
 * 処理済みであることを示すためのカスタム属性名
 * @constant {string}
 */
const PROCESSED_ATTR = 'data-extension-processed';

/**
 * 指定された要素が「既知（視聴済み・視聴中）」かどうかを判定します。
 * @param {HTMLElement} element - 動画カード要素
 * @returns {boolean} 既知であればtrue
 */
function isWatchedVideo(element) {
    // 要素内に「視聴状況バー」が存在するかチェック
    return element.querySelector(WATCHED_INDICATOR_SELECTOR) !== null;
}

/**
 * 動画カードを処理し、確率に基づいて表示・非表示を切り替えます。
 * @param {HTMLElement} element - 動画カード要素
 */
function processVideoElement(element) {
    // すでに処理済みの要素はスキップ（再判定によるチラつき防止）
    if (element.getAttribute(PROCESSED_ATTR)) return;

    // 処理済みマークをつける
    element.setAttribute(PROCESSED_ATTR, 'true');

    // 既知の動画でなければ何もしない（未視聴は常に残す）
    if (!isWatchedVideo(element)) return;

    // サイコロを振る (0.0 ～ 1.0 のランダムな数値)
    const dice = Math.random();

    // 設定した確率以下なら削除（非表示）
    if (dice < REMOVE_PROBABILITY) {
        element.style.display = 'none';
        console.log('[Filter] 既知の動画を間引きました');
    } else {
        // 残す場合はわかりやすくするために少し透明度を下げる等の処理も可能（今回は何もしない）
        console.log('[Filter] 既知の動画ですが、表示を残しました');
    }
}

/**
 * ページ内の全動画をスキャンして処理を実行します。
 */
function scanAndFilterVideos() {
    const videos = document.querySelectorAll(VIDEO_CONTAINER_SELECTOR);
    videos.forEach(processVideoElement);
}

/**
 * DOMの変更を監視し、新しく読み込まれた動画に対して処理を実行します。
 */
function observeDomChanges() {
    const observer = new MutationObserver((mutations) => {
        // パフォーマンスのため、DOM変化時は軽量にスキャンを実行
        scanAndFilterVideos();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// --- 実行 ---
console.log('既知動画フィルターを開始します。除去率:', REMOVE_PROBABILITY);
scanAndFilterVideos();
observeDomChanges();