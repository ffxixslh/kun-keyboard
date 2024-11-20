# Kun Keyboard

Kun keyboard for ikuns.

## WIP

这种情况很可能是因为音频切片的大小和WAV文件的头部信息处理有关。WAV文件有特定的文件头结构，不当的切片可能会破坏音频数据的完整性。

以下是处理方案：

```typescript
class AudioChunkHandler {
  private readonly HEADER_SIZE = 44; // WAV 标准头部大小
  private readonly CHUNK_SIZE = 32 * 1024; // 32KB 默认切片大小

  async processWavFile(arrayBuffer: ArrayBuffer) {
    const totalLength = arrayBuffer.byteLength;

    // 如果文件小于特定大小，直接完整处理
    if (totalLength < this.CHUNK_SIZE * 2) {
      return [arrayBuffer];
    }

    // 保存WAV头部信息
    const header = arrayBuffer.slice(0, this.HEADER_SIZE);
    const audioData = arrayBuffer.slice(this.HEADER_SIZE);

    // 计算实际音频数据的切片大小（确保是采样率的整数倍）
    const sampleRate = new DataView(header).getUint32(24, true);
    const channels = new DataView(header).getUint16(22, true);
    const bytesPerSample = new DataView(header).getUint16(34, true) / 8;

    // 确保切片大小是采样帧的整数倍
    const samplesPerChunk = Math.floor(this.CHUNK_SIZE / (channels * bytesPerSample));
    const adjustedChunkSize = samplesPerChunk * channels * bytesPerSample;

    const chunks: ArrayBuffer[] = [];
    let offset = 0;

    while (offset < audioData.byteLength) {
      const chunkSize = Math.min(adjustedChunkSize, audioData.byteLength - offset);
      const chunk = new ArrayBuffer(this.HEADER_SIZE + chunkSize);

      // 复制头部信息
      new Uint8Array(chunk).set(new Uint8Array(header));

      // 复制音频数据
      new Uint8Array(chunk).set(
        new Uint8Array(audioData.slice(offset, offset + chunkSize)),
        this.HEADER_SIZE
      );

      // 更新头部中的数据大小信息
      const chunkView = new DataView(chunk);
      chunkView.setUint32(4, chunkSize + 36, true); // 更新文件大小
      chunkView.setUint32(40, chunkSize, true);     // 更新数据块大小

      chunks.push(chunk);
      offset += chunkSize;
    }

    return chunks;
  }
}

// 使用示例
const audioHandler = new AudioChunkHandler();

async function handleWavFile(arrayBuffer: ArrayBuffer) {
  try {
    const chunks = await audioHandler.processWavFile(arrayBuffer);

    // 处理每个切片
    for (const chunk of chunks) {
      await audioContext.decodeAudioData(chunk);
      // 进行其他处理...
    }
  } catch (error) {
    console.error('Error processing WAV file:', error);
  }
}
```

改进建议：

1. 对于小文件使用完整处理：
```typescript
if (arrayBuffer.byteLength <= this.CHUNK_SIZE) {
  return [arrayBuffer];
}
```

2. 添加格式检查：
```typescript
private isValidWavFile(header: ArrayBuffer): boolean {
  const view = new DataView(header);
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );

  return riff === 'RIFF';
}
```

3. 优化切片大小计算：
```typescript
private calculateOptimalChunkSize(sampleRate: number, channels: number, bytesPerSample: number): number {
  // 确保切片大小是完整帧的整数倍
  const bytesPerFrame = channels * bytesPerSample;
  const framesPerChunk = Math.floor(this.CHUNK_SIZE / bytesPerFrame);
  return framesPerChunk * bytesPerFrame;
}
```

4. 添加错误处理：
```typescript
async decodeChunk(chunk: ArrayBuffer): Promise<AudioBuffer> {
  try {
    return await audioContext.decodeAudioData(chunk);
  } catch (error) {
    if (chunk.byteLength < this.HEADER_SIZE + 1024) {
      throw new Error('Chunk too small to be valid WAV data');
    }
    throw error;
  }
}
```

关键注意点：
1. WAV文件头部需要完整保留且正确修改
2. 切片大小应该是采样帧的整数倍
3. 每个切片都需要包含完整的WAV头部信息
4. 需要正确计算并更新每个切片的数据大小

这样处理后，应该能够正确处理各种大小的WAV文件。如果仍有问题，可以：

1. 检查具体的WAV文件格式：
```typescript
function analyzeWavFile(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  console.log({
    format: String.fromCharCode(...new Uint8Array(arrayBuffer.slice(0, 4))),
    fileSize: view.getUint32(4, true),
    channels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    bitsPerSample: view.getUint16(34, true)
  });
}
```

2. 调整切片大小：
```typescript
this.CHUNK_SIZE = 64 * 1024; // 尝试更大的切片大小
```

3. 添加日志调试：
```typescript
console.log('Chunk details:', {
  originalSize: arrayBuffer.byteLength,
  chunkSize: chunk.byteLength,
  samplesInChunk: (chunk.byteLength - this.HEADER_SIZE) / (channels * bytesPerSample)
});
```
