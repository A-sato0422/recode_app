import './style.css'
import { AudioGrid } from './components/AudioGrid'
import { PlayerModal } from './components/PlayerModal'
import type { AudioItem, PageConfig } from './types'
import audioListSato from './audioList.json'
import audioListMina from './audioListMina.json'

// ページ設定
const PAGES: PageConfig[] = [
    {
        id: 'sato',
        title: 'サトボイス',
        accentColor: '#6BCF7F',
        storageKey: 'recode_app_sato_audio_list',
        audioListSource: audioListSato as AudioItem[]
    },
    {
        id: 'mina',
        title: 'ミナボイス',
        accentColor: '#4A90E2',
        storageKey: 'recode_app_mina_audio_list',
        audioListSource: audioListMina as AudioItem[]
    }
]

// アプリケーションの初期化
class App {
    private playerModal: PlayerModal
    private overlay: HTMLElement
    private currentPageIndex: number = 0
    private pages: PageConfig[] = PAGES
    private audioGrids: Map<string, AudioGrid> = new Map()
    private audioLists: Map<string, AudioItem[]> = new Map()
    private isEditMode: boolean = false
    private editButton: HTMLElement
    private pagesContainer: HTMLElement
    private touchStartX: number = 0
    private touchEndX: number = 0

    constructor() {
        this.overlay = document.getElementById('overlay')!
        this.editButton = document.querySelector('.edit-button')!
        this.pagesContainer = document.querySelector('.pages-container')!

        // 各ページの音声リストを読み込み
        this.pages.forEach(page => {
            this.audioLists.set(page.id, this.loadAudioList(page))
        })

        this.playerModal = new PlayerModal(this.onCloseModal.bind(this))

        this.init()
    }

    private init() {
        // 各ページをレンダリング
        this.pages.forEach((page, index) => {
            const pageElement = this.createPage(page, index)
            this.pagesContainer.appendChild(pageElement)
        })

        // ページネーションを作成
        this.createPagination()

        // 初期ページを表示
        this.updatePage(0)

        // モーダルをレンダリング
        const modalContainer = document.getElementById('player-modal-container')!
        modalContainer.appendChild(this.playerModal.render())

        // イベントリスナー
        this.overlay.addEventListener('click', () => {
            this.onCloseModal()
        })

        this.editButton.addEventListener('click', () => {
            this.toggleEditMode()
        })

        const resetButton = document.querySelector('.reset-button')
        resetButton?.addEventListener('click', () => {
            this.resetToDefault()
        })

        // スワイプイベント（改善版）
        let touchStartX = 0
        let touchStartY = 0
        let touchMoveX = 0
        let touchMoveY = 0
        let isSwiping = false

        this.pagesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
            isSwiping = false
        }, { passive: true })

        this.pagesContainer.addEventListener('touchmove', (e) => {
            if (!touchStartX) return
            
            touchMoveX = e.touches[0].clientX
            touchMoveY = e.touches[0].clientY
            
            const deltaX = Math.abs(touchMoveX - touchStartX)
            const deltaY = Math.abs(touchMoveY - touchStartY)
            
            // 横方向の動きが縦方向より大きい場合、スワイプとして認識
            if (deltaX > deltaY && deltaX > 10) {
                isSwiping = true
            }
        }, { passive: true })

        this.pagesContainer.addEventListener('touchend', (e) => {
            if (!isSwiping) return
            
            this.touchStartX = touchStartX
            this.touchEndX = touchMoveX || e.changedTouches[0].clientX
            this.handleSwipe()
            
            // リセット
            touchStartX = 0
            touchStartY = 0
            touchMoveX = 0
            touchMoveY = 0
            isSwiping = false
        }, { passive: true })

        // マウスでのドラッグもサポート
        let isDragging = false
        let startX = 0

        this.pagesContainer.addEventListener('mousedown', (e) => {
            isDragging = true
            startX = e.clientX
            this.pagesContainer.style.cursor = 'grabbing'
        })

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return
            e.preventDefault()
        })

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return
            isDragging = false
            this.pagesContainer.style.cursor = ''

            const endX = e.clientX
            const diff = startX - endX
            const threshold = 50

            if (Math.abs(diff) > threshold) {
                if (diff > 0 && this.currentPageIndex < this.pages.length - 1) {
                    this.updatePage(this.currentPageIndex + 1)
                } else if (diff < 0 && this.currentPageIndex > 0) {
                    this.updatePage(this.currentPageIndex - 1)
                }
            }
        })
    }

    private createPage(page: PageConfig, index: number): HTMLElement {
        const pageElement = document.createElement('div')
        pageElement.className = 'page'
        pageElement.dataset.pageId = page.id
        pageElement.dataset.index = String(index)

        const audioList = this.audioLists.get(page.id)!
        const audioGrid = new AudioGrid(
            audioList,
            this.onAudioSelect.bind(this),
            (audioId) => this.onAudioDelete(page.id, audioId),
            (newOrder) => this.onAudioReorder(page.id, newOrder)
        )

        this.audioGrids.set(page.id, audioGrid)
        pageElement.appendChild(audioGrid.render())

        return pageElement
    }

    private createPagination() {
        const pagination = document.createElement('div')
        pagination.className = 'pagination'

        this.pages.forEach((_, index) => {
            const dot = document.createElement('button')
            dot.className = 'pagination-dot'
            if (index === 0) dot.classList.add('active')
            dot.addEventListener('click', () => {
                this.updatePage(index)
            })
            pagination.appendChild(dot)
        })

        const mainElement = document.querySelector('main')!
        mainElement.appendChild(pagination)
    }

    private handleSwipe() {
        const diff = this.touchStartX - this.touchEndX
        const threshold = 50

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && this.currentPageIndex < this.pages.length - 1) {
                // 左スワイプ：次のページ
                this.updatePage(this.currentPageIndex + 1)
            } else if (diff < 0 && this.currentPageIndex > 0) {
                // 右スワイプ：前のページ
                this.updatePage(this.currentPageIndex - 1)
            }
        }
    }

    private updatePage(index: number) {
        this.currentPageIndex = index
        const page = this.pages[index]

        // ページをスライド
        this.pagesContainer.style.transform = `translateX(-${index * 100}%)`

        // ヘッダータイトルを更新
        const headerTitle = document.querySelector('.app-header h1')!
        headerTitle.textContent = page.title

        // アクセントカラーを更新
        document.documentElement.style.setProperty('--accent-color', page.accentColor)

        // 背景色を更新（アクセントカラーの薄い色）
        const bgColor = this.getLightBackgroundColor(page.accentColor)
        document.documentElement.style.setProperty('--bg-primary', bgColor)

        // ページネーションを更新
        const dots = document.querySelectorAll('.pagination-dot')
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index)
        })
    }

    private getLightBackgroundColor(accentColor: string): string {
        // アクセントカラーから明るい背景色を生成
        const colorMap: { [key: string]: string } = {
            '#6BCF7F': '#e8f5ea', // 緑系の明るい背景
            '#4A90E2': '#e8f2fb'  // 青系の明るい背景
        }
        return colorMap[accentColor] || '#121212'
    }

    private loadAudioList(page: PageConfig): AudioItem[] {
        const stored = localStorage.getItem(page.storageKey)
        if (stored) {
            return JSON.parse(stored)
        }
        return page.audioListSource
    }

    private saveAudioList(pageId: string) {
        const page = this.pages.find(p => p.id === pageId)!
        const audioList = this.audioLists.get(pageId)!
        localStorage.setItem(page.storageKey, JSON.stringify(audioList))
    }

    private onAudioSelect(audio: AudioItem) {
        // bodyのスクロールを無効化
        document.body.style.overflow = 'hidden'

        // モーダルを表示
        this.playerModal.show(audio)

        // オーバーレイを表示
        this.overlay.classList.add('active')
    }

    private onCloseModal() {
        // bodyのスクロールを有効化
        document.body.style.overflow = ''

        // モーダルを非表示
        this.playerModal.hide()

        // オーバーレイを非表示
        this.overlay.classList.remove('active')
    }

    private onAudioDelete(pageId: string, audioId: number) {
        const audioList = this.audioLists.get(pageId)!
        const audio = audioList.find(a => a.id === audioId)
        if (!audio) return

        const confirmed = confirm(`「${audio.title}」を削除しますか？\nこの操作は取り消せません。`)
        if (!confirmed) return

        const newList = audioList.filter(a => a.id !== audioId)
        this.audioLists.set(pageId, newList)
        this.saveAudioList(pageId)

        this.reloadGrid(pageId)
    }

    private onAudioReorder(pageId: string, newOrder: AudioItem[]) {
        this.audioLists.set(pageId, newOrder)
        this.saveAudioList(pageId)
    }

    private resetToDefault() {
        const currentPage = this.pages[this.currentPageIndex]
        const confirmed = confirm('音声リストを初期状態に戻しますか？\n削除した音声が復元されます。')
        if (!confirmed) return

        localStorage.removeItem(currentPage.storageKey)
        location.reload()
    }

    private reloadGrid(pageId: string) {
        const audioList = this.audioLists.get(pageId)!
        const pageElement = this.pagesContainer.querySelector(`[data-page-id="${pageId}"]`)!

        pageElement.innerHTML = ''

        const audioGrid = new AudioGrid(
            audioList,
            this.onAudioSelect.bind(this),
            (audioId) => this.onAudioDelete(pageId, audioId),
            (newOrder) => this.onAudioReorder(pageId, newOrder)
        )

        this.audioGrids.set(pageId, audioGrid)
        pageElement.appendChild(audioGrid.render())

        if (this.isEditMode) {
            audioGrid.setEditMode(true)
        }
    }

    private toggleEditMode() {
        this.isEditMode = !this.isEditMode
        this.editButton.textContent = this.isEditMode ? '完了' : '編集'

        this.audioGrids.forEach(grid => {
            grid.setEditMode(this.isEditMode)
        })
    }
}

// アプリケーションを起動
new App()