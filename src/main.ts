import './style.css'
import { AudioGrid } from './components/AudioGrid'
import { PlayerModal } from './components/PlayerModal'
import type { AudioItem } from './types'
import audioListData from './audioList.json'

// JSONファイルから音声データを読み込み
const audioList: AudioItem[] = audioListData as AudioItem[]

// アプリケーションの初期化
class App {
    private audioGrid: AudioGrid
    private playerModal: PlayerModal
    private overlay: HTMLElement

    constructor() {
        this.overlay = document.getElementById('overlay')!
        this.audioGrid = new AudioGrid(audioList, this.onAudioSelect.bind(this))
        this.playerModal = new PlayerModal(this.onCloseModal.bind(this))

        this.init()
    }

    private init() {
        // グリッドをレンダリング
        const container = document.getElementById('audio-grid-container')!
        container.appendChild(this.audioGrid.render())

        // モーダルをレンダリング
        const modalContainer = document.getElementById('player-modal-container')!
        modalContainer.appendChild(this.playerModal.render())

        // オーバーレイのクリックイベント
        this.overlay.addEventListener('click', () => {
            this.onCloseModal()
        })
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
}

// アプリケーションを起動
new App()