# Kun Keyboard

## WIP

1. 增加流式播放功能，不需要等整首歌下载完才能播放

```tsx
interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const bufferQueue = useRef<ArrayBuffer[]>([]);
  const processedBytesRef = useRef<number>(0);

  useEffect(() => {
    // 创建 AudioContext
    audioContextRef.current = new AudioContext();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const startStreaming = async () => {
    try {
      const response = await fetch(audioUrl);
      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('content-length'));

      if (!reader) {
        throw new Error('Reader not supported');
      }

      // 开始读取流
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('Stream complete');
          break;
        }

        // 将新的数据块添加到队列
        const arrayBuffer = value.buffer;
        bufferQueue.current.push(arrayBuffer);

        // 更新进度
        processedBytesRef.current += arrayBuffer.byteLength;
        setProgress((processedBytesRef.current / contentLength) * 100);

        // 如果是第一块数据，立即开始播放
        if (bufferQueue.current.length === 1) {
          processNextBuffer();
        }
      }
    } catch (error) {
      console.error('Streaming failed:', error);
    }
  };

  const processNextBuffer = async () => {
    if (!audioContextRef.current || bufferQueue.current.length === 0) {
      return;
    }

    try {
      const arrayBuffer = bufferQueue.current.shift();
      if (!arrayBuffer) return;

      // 解码音频数据
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // 创建音频源
      const sourceNode = audioContextRef.current.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContextRef.current.destination);

      // 当前片段播放完成后，处理下一个片段
      sourceNode.onended = () => {
        processNextBuffer();
      };

      // 开始播放
      sourceNode.start();
      sourceNodeRef.current = sourceNode;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error processing buffer:', error);
    }
  };

  const togglePlayPause = () => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
      setIsPlaying(true);
    } else if (audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (!audioContextRef.current) return;

    if (bufferQueue.current.length === 0) {
      // 首次播放，开始流式加载
      startStreaming();
    } else {
      // 恢复播放
      togglePlayPause();
    }
  };

  return (
    <div>
      <button onClick={handlePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div>
        Progress: {progress.toFixed(2)}%
      </div>
    </div>
  );
};
```
