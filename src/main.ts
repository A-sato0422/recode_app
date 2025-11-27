import './style.css'
import { AudioGrid } from './components/AudioGrid'
import { PlayerModal } from './components/PlayerModal'
import type { AudioItem } from './types'

// 音声データ
const dummyAudios: AudioItem[] = [
    {
        id: 1,
        title: "おはよう",
        coverImage: "https://via.placeholder.com/300/FF6B9D/FFFFFF?text=おはよう",
        recordedAt: "2025-11-20 07:30",
        audioFile: "good_morning.m4a"
    },
    {
        id: 2,
        title: "おやすみ",
        coverImage: "https://via.placeholder.com/300/C44569/FFFFFF?text=おやすみ",
        recordedAt: "2025-11-21 22:15",
        audioFile: "good_morning.m4a"  // 一旦同じファイルを使用
    },
    {
        id: 3,
        title: "ありがとう",
        coverImage: "https://via.placeholder.com/300/A83256/FFFFFF?text=ありがとう",
        recordedAt: "2025-11-22 14:45",
        audioFile: "good_morning.m4a"
    },
    {
        id: 4,
        title: "大好き",
        coverImage: "https://via.placeholder.com/300/801F3F/FFFFFF?text=大好き",
        recordedAt: "2025-11-23 18:20",
        audioFile: "good_morning.m4a"
    },
    {
        id: 5,
        title: "がんばって",
        coverImage: "https://via.placeholder.com/300/5C1F2E/FFFFFF?text=がんばって",
        recordedAt: "2025-11-24 09:00",
        audioFile: "good_morning.m4a"
    },
    {
        id: 6,
        title: "いってらっしゃい",
        coverImage: "https://via.placeholder.com/300/3D1420/FFFFFF?text=いってらっしゃい",
        recordedAt: "2025-11-25 08:15",
        audioFile: "good_morning.m4a"
    },
]

// アプリケーションの初期化
class App {
    private audioGrid: AudioGrid
    private playerModal: PlayerModal
    private overlay: HTMLElement

    constructor() {
        this.overlay = document.getElementById('overlay')!
        this.audioGrid = new AudioGrid(dummyAudios, this.onAudioSelect.bind(this))
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