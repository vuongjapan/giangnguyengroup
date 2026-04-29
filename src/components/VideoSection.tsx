import { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Link } from 'react-router-dom';

interface VideoSectionData {
  videoUrl: string;
  title: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
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
    <section className="relative w-full bg-foreground overflow-hidden">
      {/* Video or placeholder background */}
      <div className="relative w-full aspect-video max-h-[500px] md:max-h-[560px]">
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              src={data.videoUrl}
              className="w-full h-full object-cover"
              muted={muted}
              loop
              playsInline
              poster=""
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {/* Play overlay when not playing */}
            {!playing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-foreground/40 transition-opacity z-10"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </button>
            )}
            {/* Video controls */}
            {playing && (
              <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                <button onClick={() => setMuted(!muted)}
                  className="w-9 h-9 rounded-full bg-foreground/60 flex items-center justify-center text-background hover:bg-foreground/80 transition-colors">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Placeholder when no video uploaded */
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center min-h-[280px] md:min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Play className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">Admin tải video phóng sự tại đây</p>
            </div>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent z-[5] pointer-events-none" />
        <div className="absolute inset-0 z-[6] flex items-center pointer-events-none">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-lg pointer-events-auto">
              <span className="inline-block bg-primary/90 text-primary-foreground text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                📹 Video phóng sự
              </span>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-background leading-tight mb-3 md:mb-4 drop-shadow-lg">
                {data.title}
              </h2>
              <ul className="space-y-2 mb-4 md:mb-6">
                {data.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-background/90 text-xs md:text-sm">
                    <span className="text-accent mt-0.5 flex-shrink-0">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={data.ctaLink}
                className="inline-flex items-center gap-2 ocean-gradient text-primary-foreground font-bold px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity shadow-lg"
              >
                🛒 {data.ctaText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
