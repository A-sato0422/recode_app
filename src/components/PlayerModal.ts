import type { AudioItem } from '../types'

export class PlayerModal {
  private modal: HTMLElement | null = null
  private onClose: () => void
  private currentAudio: AudioItem | null = null
  private audioElement: HTMLAudioElement | null = null
  private isPlaying = false
  private currentTime = 0
  private duration = 0
  private progressUpdateInterval: number | null = null

  constructor(onClose: () => void) {
    this.onClose = onClose
  }

  render(): HTMLElement {
    this.modal = document.createElement('div')
    this.modal.className = 'player-modal'
    this.modal.innerHTML = `
      <div class="player-modal-content">
        <button class="close-button" aria-label="閉じる">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12L5 12"/>
            <path d="M12 19L5 12L12 5"/>
          </svg>
        </button>
        
        <div class="player-cover-container">
          <div class="player-cover"></div>
        </div>
        
        <div class="player-info">
          <h2 class="player-title"></h2>
          <p class="player-date"></p>
        </div>
        
        <div class="player-controls">
          <div class="progress-container">
            <div class="progress-time">
              <span class="current-time">0:00</span>
              <span class="total-time">3:00</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill"></div>
              </div>
              <div class="progress-thumb"></div>
            </div>
          </div>
          
          <div class="control-buttons">
            <button class="control-btn backward-btn" aria-label="10秒戻る">
              <div class="control-btn-content">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
                <span class="control-btn-label">10</span>
              </div>
            </button>
            
            <button class="control-btn play-btn" aria-label="再生">
              <svg class="play-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg class="pause-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
            
            <button class="control-btn forward-btn" aria-label="10秒進む">
              <div class="control-btn-content">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                </svg>
                <span class="control-btn-label">10</span>
              </div>
            </button>
          </div>
        </div>
        
        <audio class="audio-element" preload="metadata"></audio>
      </div>
    `

    this.attachEventListeners()
    this.setupAudioElement()
    return this.modal
  }

  private attachEventListeners() {
    if (!this.modal) return

    // 閉じるボタン
    const closeBtn = this.modal.querySelector('.close-button')
    closeBtn?.addEventListener('click', () => {
      this.onClose()
    })

    // 再生/一時停止ボタン
    const playBtn = this.modal.querySelector('.play-btn')
    playBtn?.addEventListener('click', () => {
      this.togglePlay()
    })

    // 10秒戻るボタン
    const backwardBtn = this.modal.querySelector('.backward-btn')
    backwardBtn?.addEventListener('click', () => {
      this.seekBackward()
    })

    // 10秒進むボタン
    const forwardBtn = this.modal.querySelector('.forward-btn')
    forwardBtn?.addEventListener('click', () => {
      this.seekForward()
    })

    // プログレスバーのクリック/タップ
    const progressBar = this.modal.querySelector('.progress-bar')
    progressBar?.addEventListener('click', (e) => {
      this.seekToPosition(e as MouseEvent)
    })
  }

  private setupAudioElement() {
    if (!this.modal) return

    this.audioElement = this.modal.querySelector('.audio-element')
    if (!this.audioElement) return

    // 音声のメタデータ読み込み完了
    this.audioElement.addEventListener('loadedmetadata', () => {
      if (!this.audioElement) return
      this.duration = this.audioElement.duration
      this.updateTotalTime()
    })

    // 再生位置の更新
    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.audioElement) return
      this.currentTime = this.audioElement.currentTime
      this.updateProgress()
    })

    // 再生終了
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false
      this.updatePlayButton()
      this.currentTime = 0
      this.updateProgress()
    })

    // エラーハンドリング
    this.audioElement.addEventListener('error', (e) => {
      console.error('音声ファイルの読み込みエラー:', e)
      alert('音声ファイルを再生できませんでした')
    })
  }

  show(audio: AudioItem) {
    if (!this.modal || !this.audioElement) return

    this.currentAudio = audio
    this.isPlaying = false
    this.currentTime = 0

    // 音声ファイルを読み込み（import.meta.env.BASE_URL を使用してベースパスを取得）
    const baseUrl = import.meta.env.BASE_URL || '/'
    const audioUrl = `${baseUrl}audio/${audio.audioFile}`
    this.audioElement.src = audioUrl
    console.log('音声ファイルを読み込み:', audioUrl)
    this.audioElement.load()

    // モーダルの内容を更新
    const cover = this.modal.querySelector('.player-cover') as HTMLElement
    const title = this.modal.querySelector('.player-title')
    const date = this.modal.querySelector('.player-date')

    if (cover) cover.style.backgroundImage = `url(${audio.coverImage})`
    if (title) title.textContent = audio.title
    if (date) date.textContent = audio.recordedAt

    // プログレスをリセット
    this.updateProgress()
    this.updatePlayButton()

    // アニメーション用のクラスを追加
    requestAnimationFrame(() => {
      this.modal?.classList.add('active')
    })
  }

  hide() {
    if (!this.modal || !this.audioElement) return

    this.modal.classList.remove('active')

    // 音声を停止
    this.audioElement.pause()
    this.isPlaying = false
    this.updatePlayButton()
  }

  private togglePlay() {
    if (!this.audioElement) return

    if (this.isPlaying) {
      this.audioElement.pause()
      this.isPlaying = false
    } else {
      this.audioElement.play()
      this.isPlaying = true
    }

    this.updatePlayButton()
  }

  private updatePlayButton() {
    if (!this.modal) return

    const playIcon = this.modal.querySelector('.play-icon') as HTMLElement
    const pauseIcon = this.modal.querySelector('.pause-icon') as HTMLElement

    if (this.isPlaying) {
      if (playIcon) playIcon.style.display = 'none'
      if (pauseIcon) pauseIcon.style.display = 'block'
    } else {
      if (playIcon) playIcon.style.display = 'block'
      if (pauseIcon) pauseIcon.style.display = 'none'
    }
  }

  private seekBackward() {
    if (!this.audioElement) return
    this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - 10)
  }

  private seekForward() {
    if (!this.audioElement) return
    this.audioElement.currentTime = Math.min(this.duration, this.audioElement.currentTime + 10)
  }

  private seekToPosition(e: MouseEvent) {
    if (!this.modal || !this.audioElement) return

    const progressBar = this.modal.querySelector('.progress-bar-bg') as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))

    this.audioElement.currentTime = percentage * this.duration
  }

  private updateProgress() {
    if (!this.modal || this.duration === 0) return

    const percentage = (this.currentTime / this.duration) * 100
    const progressFill = this.modal.querySelector('.progress-bar-fill') as HTMLElement
    const progressThumb = this.modal.querySelector('.progress-thumb') as HTMLElement
    const currentTimeEl = this.modal.querySelector('.current-time')

    if (progressFill) progressFill.style.width = `${percentage || 0}%`
    if (progressThumb) progressThumb.style.left = `${percentage || 0}%`
    if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.currentTime)
  }

  private updateTotalTime() {
    if (!this.modal) return

    const totalTimeEl = this.modal.querySelector('.total-time')
    if (totalTimeEl) totalTimeEl.textContent = this.formatTime(this.duration)
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}
