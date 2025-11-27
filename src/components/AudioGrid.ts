import type { AudioItem } from '../types'

export class AudioGrid {
    private audios: AudioItem[]
    private onSelect: (audio: AudioItem) => void

    constructor(audios: AudioItem[], onSelect: (audio: AudioItem) => void) {
        this.audios = audios
        this.onSelect = onSelect
    }

    render(): HTMLElement {
        const grid = document.createElement('div')
        grid.className = 'audio-grid'

        this.audios.forEach(audio => {
            const item = this.createAudioItem(audio)
            grid.appendChild(item)
        })

        return grid
    }

    private createAudioItem(audio: AudioItem): HTMLElement {
        const item = document.createElement('div')
        item.className = 'audio-item'

        const iconWrapper = document.createElement('div')
        iconWrapper.className = 'audio-icon-wrapper'

        const icon = document.createElement('div')
        icon.className = 'audio-icon'
        icon.style.backgroundImage = `url(${audio.coverImage})`

        const title = document.createElement('div')
        title.className = 'audio-title'
        title.textContent = audio.title

        iconWrapper.appendChild(icon)
        item.appendChild(iconWrapper)
        item.appendChild(title)

        // タップ時のアニメーション
        let touchStartTime = 0

        item.addEventListener('touchstart', (e) => {
            e.preventDefault()
            touchStartTime = Date.now()
            item.classList.add('active')
        })

        item.addEventListener('touchend', (e) => {
            e.preventDefault()
            const touchDuration = Date.now() - touchStartTime

            // 長押しではなく、短いタップの場合のみ実行
            if (touchDuration < 500) {
                setTimeout(() => {
                    item.classList.remove('active')
                    this.onSelect(audio)
                }, 100)
            } else {
                item.classList.remove('active')
            }
        })

        item.addEventListener('touchcancel', () => {
            item.classList.remove('active')
        })

        // デスクトップ環境用（開発時）
        item.addEventListener('mousedown', () => {
            item.classList.add('active')
        })

        item.addEventListener('mouseup', () => {
            setTimeout(() => {
                item.classList.remove('active')
                this.onSelect(audio)
            }, 100)
        })

        item.addEventListener('mouseleave', () => {
            item.classList.remove('active')
        })

        return item
    }
}
