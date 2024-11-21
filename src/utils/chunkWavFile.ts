// 常量定义
export const HEADER_SIZE = 44
export const DEFAULT_CHUNK_DURATION = 1 // 默认1秒

// 解析WAV头部信息
export function parseWavHeader(header: DataView) {
  return {
    channelCount: header.getUint16(22, true),
    sampleRate: header.getUint32(24, true),
    byteRate: header.getUint32(28, true),
    blockAlign: header.getUint16(32, true),
    bitsPerSample: header.getUint16(34, true),
  }
}

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

// 复制WAV头部
function copyWavHeader(sourceHeader: DataView, targetHeader: DataView) {
  const headerBytes = new Uint8Array(sourceHeader.buffer, 0, HEADER_SIZE)
  const bytes = new Uint8Array(targetHeader.buffer).set(headerBytes)

  return bytes
}

// 更新WAV头部大小信息
function updateWavHeader(header: DataView, chunkSize: number) {
  header.setUint32(4, chunkSize + 36, true) // 文件大小
  header.setUint32(40, chunkSize, true) // 数据块大小
}

// 创建单个切片
export function createWavChunk(
  audioData: ArrayBuffer,
  offset: number,
  chunkSize: number,
  originalHeader: DataView,
) {
  const chunk = new ArrayBuffer(HEADER_SIZE + chunkSize)
  const chunkView = new DataView(chunk)
  const chunkBytes = new Uint8Array(chunk)

  // 复制并更新头部
  copyWavHeader(originalHeader, chunkView)
  updateWavHeader(chunkView, chunkSize)

  // 复制音频数据
  const audioChunk = new Uint8Array(audioData.slice(offset, offset + chunkSize))
  chunkBytes.set(audioChunk, HEADER_SIZE)

  return chunk
}
