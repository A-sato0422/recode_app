export interface AudioItem {
    id: number
    title: string
    coverImage: string
    recordedAt: string
    audioFile: string  // 音声ファイル名（例: "good_morning.m4a"）
}

export interface PageConfig {
    id: string
    title: string
    accentColor: string
    storageKey: string
    audioListSource: AudioItem[]
}
