import { useState, useRef } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Link } from 'react-router-dom';

interface VideoSectionData {
  videoUrl: string;
  title: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  poster?: string;
}

const DEFAULT_DATA: VideoSectionData = {
  videoUrl: '',
  title: 'Hành trình hải sản sạch từ biển Sầm Sơn',
  features: [
    'Đánh bắt trực tiếp từ biển Sầm Sơn',
    'Phơi nắng tự nhiên – Không sấy công nghiệp',
    'Không hóa chất – An toàn tuyệt đối',
  ],
  ctaText: 'Xem sản phẩm ngay',
  ctaLink: '/san-pham',
  isActive: true,
};

export default function VideoSection() {
  const { data } = useSiteContent<VideoSectionData>('video_section', DEFAULT_DATA);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!data?.isActive) return null;

  const hasVideo = !!data.videoUrl;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <section
      className="relative w-full overflow-hidden py-8 md:py-12"
      style={{ background: 'linear-gradient(135deg, #0f4c5c 0%, #0a3d4e 100%)' }}
    >
      <div className="container mx-auto px-4">
        {/* Heading overlay above video */}
        <div className="text-center mb-5 md:mb-7">
          <p className="inline-block bg-accent/20 text-accent text-xs md:text-sm font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
            📺 Báo Thanh Niên đưa tin
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
            Giang Nguyên Trên Báo Thanh Niên
          </h2>
          <p className="text-white/70 text-sm md:text-base mt-2 max-w-2xl mx-auto">
            Câu chuyện hải sản sạch từ Sầm Sơn đến bàn ăn Việt
          </p>
        </div>

        <div className="relative w-full aspect-video max-h-[560px] rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-5xl bg-black">
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                src={data.videoUrl}
                className="w-full h-full object-cover"
                muted={muted}
                loop
                playsInline
                poster={data.poster || ''}
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              {!playing && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10"
                  aria-label="Phát video"
                >
                  <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="h-9 w-9 md:h-11 md:w-11 text-primary ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
              {playing && (
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0f4c5c] to-[#0a3d4e] flex items-center justify-center">
              <div className="text-center">
                <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Play className="h-9 w-9 md:h-11 md:w-11 text-primary ml-1" fill="currentColor" />
                </div>
                <p className="text-white/70 text-sm">Video phóng sự sắp ra mắt</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to={data.ctaLink}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 md:px-8 py-3 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            🛒 {data.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
