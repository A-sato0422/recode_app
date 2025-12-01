import type { AudioItem } from '../types'

export class AudioGrid {
    private audios: AudioItem[]
    private onSelect: (audio: AudioItem) => void
    private onDelete: (audioId: number) => void
    private onReorder: (newOrder: AudioItem[]) => void
    private isEditMode: boolean = false
    private gridElement: HTMLElement | null = null
    private draggedItem: HTMLElement | null = null
    private draggedIndex: number = -1

    constructor(
        audios: AudioItem[],
        onSelect: (audio: AudioItem) => void,
        onDelete: (audioId: number) => void,
        onReorder: (newOrder: AudioItem[]) => void
    ) {
        this.audios = audios
        this.onSelect = onSelect
        this.onDelete = onDelete
        this.onReorder = onReorder
    }

    render(): HTMLElement {
        const grid = document.createElement('div')
        grid.className = 'audio-grid'
        this.gridElement = grid

        this.audios.forEach((audio, index) => {
            const item = this.createAudioItem(audio, index)
            grid.appendChild(item)
        })

        return grid
    }

    setEditMode(isEdit: boolean) {
        this.isEditMode = isEdit
        if (this.gridElement) {
            this.gridElement.classList.toggle('edit-mode', isEdit)

            const items = this.gridElement.querySelectorAll('.audio-item')
            items.forEach((item, index) => {
                const deleteBtn = item.querySelector('.delete-button')
                if (deleteBtn) {
                    (deleteBtn as HTMLElement).style.display = isEdit ? 'flex' : 'none'
                }

                // ドラッグ機能の有効化/無効化
                if (isEdit) {
                    item.setAttribute('draggable', 'true')
                    this.setupDragEvents(item as HTMLElement, index)
                } else {
                    item.removeAttribute('draggable')
                }
            })
        }
    }

    private createAudioItem(audio: AudioItem, index: number): HTMLElement {
        const item = document.createElement('div')
        item.className = 'audio-item'
        item.dataset.audioId = String(audio.id)
        item.dataset.index = String(index)

        // 削除ボタン
        const deleteButton = document.createElement('button')
        deleteButton.className = 'delete-button'
        deleteButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `
        deleteButton.style.display = 'none'
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation()
            this.onDelete(audio.id)
        })

        const iconWrapper = document.createElement('div')
        iconWrapper.className = 'audio-icon-wrapper'

        const icon = document.createElement('div')
        icon.className = 'audio-icon'
        icon.style.backgroundImage = `url(${audio.coverImage})`

        const title = document.createElement('div')
        title.className = 'audio-title'
        title.textContent = audio.title

        item.appendChild(deleteButton)
        iconWrapper.appendChild(icon)
        item.appendChild(iconWrapper)
        item.appendChild(title)

        // タップ時のアニメーション
        let touchStartTime = 0

        item.addEventListener('touchstart', (e) => {
            if (this.isEditMode) return
            e.preventDefault()
            touchStartTime = Date.now()
            item.classList.add('active')
        })

        item.addEventListener('touchend', (e) => {
            if (this.isEditMode) return
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
            if (this.isEditMode) return
            item.classList.add('active')
        })

        item.addEventListener('mouseup', () => {
            if (this.isEditMode) return
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

    private setupDragEvents(item: HTMLElement, index: number) {
        item.addEventListener('dragstart', (e) => {
            this.draggedItem = item
            this.draggedIndex = index
            item.classList.add('dragging')
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move'
            }
        })

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging')
            this.draggedItem = null
            this.draggedIndex = -1
        })

        item.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move'
            }

            if (this.draggedItem && this.draggedItem !== item) {
                const targetIndex = Number(item.dataset.index)
                this.reorderItems(this.draggedIndex, targetIndex)
                this.draggedIndex = targetIndex
            }
        })
    }

    private reorderItems(fromIndex: number, toIndex: number) {
        if (fromIndex === toIndex) return

        const newOrder = [...this.audios]
        const [removed] = newOrder.splice(fromIndex, 1)
        newOrder.splice(toIndex, 0, removed)

        this.audios = newOrder
        this.onReorder(newOrder)

        // グリッドを更新
        if (this.gridElement) {
            this.gridElement.innerHTML = ''
            this.audios.forEach((audio, index) => {
                const item = this.createAudioItem(audio, index)
                this.gridElement!.appendChild(item)
            })
            this.setEditMode(true)
        }
    }
}
