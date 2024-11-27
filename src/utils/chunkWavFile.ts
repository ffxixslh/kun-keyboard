// 常量定义
export const HEADER_SIZE = 44

// 验证WAV头部
export function isValidWavHeader(header: DataView) {
  const riff = String.fromCharCode(
    header.getUint8(0),
    header.getUint8(1),
    header.getUint8(2),
    header.getUint8(3),
  )
  const wave = String.fromCharCode(
    header.getUint8(8),
    header.getUint8(9),
    header.getUint8(10),
    header.getUint8(11),
  )

  return riff === 'RIFF' && wave === 'WAVE'
}

export function createWavHeader(
  originalHeader: DataView,
  chunkSize: number,
): ArrayBuffer {
  const header = new ArrayBuffer(44) // WAV头固定44字节
  const view = new DataView(header)

  // RIFF chunk
  view.setUint32(0, 0x52494646, false) // "RIFF"
  view.setUint32(4, 36 + chunkSize, true) // 文件大小
  view.setUint32(8, 0x57415645, false) // "WAVE"

  // fmt chunk (复制原始头的fmt部分)
  for (let i = 12; i < 36; i++) {
    view.setUint8(i, originalHeader.getUint8(i))
  }

  // data chunk
  view.setUint32(36, 0x64617461, false) // "data"
  view.setUint32(40, chunkSize, true) // data大小

  return header
}

export function createWavChunk(
  audioData: ArrayBuffer,
  originalHeader: DataView,
): ArrayBuffer {
  const chunkSize = audioData.byteLength
  const header = createWavHeader(originalHeader, chunkSize)
  const chunk = new ArrayBuffer(44 + chunkSize)

  // 复制头部
  new Uint8Array(chunk).set(new Uint8Array(header))
  // 复制音频数据
  new Uint8Array(chunk).set(new Uint8Array(audioData), 44)

  return chunk
}
