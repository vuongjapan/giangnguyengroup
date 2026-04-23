import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, VideoOff, Mic, MicOff, Users, Send, Radio, Tv, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';

/**
 * P2P Live Stream via Supabase Realtime signaling.
 * - Admin (broadcaster) starts a stream → captures webcam + mic
 * - Up to 10 viewers connect via WebRTC P2P
 * - Anonymous viewers can chat (no login required)
 */

const ROOM = 'main-live';
const MAX_VIEWERS = 10;
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type ChatMsg = { id: string; name: string; text: string; ts: number };

export default function LivePage() {
  const { isAdmin } = useAuth();
  const [role, setRole] = useState<'viewer' | 'broadcaster' | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasStream, setHasStream] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [connecting, setConnecting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myIdRef = useRef<string>(crypto.randomUUID());

  // Init chat name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gn-live-name') || `Khách ${Math.floor(Math.random() * 9999)}`;
    setChatName(saved);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setStreaming(false);
    setHasStream(false);
    setRole(null);
    setViewerCount(0);
  };

  // === BROADCASTER ===
  const startBroadcast = async () => {
    if (!isAdmin) { toast.error('Chỉ admin mới được phát sóng'); return; }
    setConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const channel = supabase.channel(`live:${ROOM}`, {
        config: { broadcast: { self: false }, presence: { key: myIdRef.current } },
      });
      channelRef.current = channel;

      // Listen for viewers requesting connection
      channel.on('broadcast', { event: 'viewer-join' }, async ({ payload }) => {
        const viewerId = payload.from as string;
        if (peersRef.current.size >= MAX_VIEWERS) {
          channel.send({ type: 'broadcast', event: 'room-full', payload: { to: viewerId } });
          return;
        }
        await createPeerForViewer(viewerId);
      });

      channel.on('broadcast', { event: 'viewer-answer' }, async ({ payload }) => {
        const pc = peersRef.current.get(payload.from);
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      });

      channel.on('broadcast', { event: 'viewer-ice' }, async ({ payload }) => {
        const pc = peersRef.current.get(payload.from);
        if (pc && payload.candidate) {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
        }
      });

      channel.on('broadcast', { event: 'viewer-leave' }, ({ payload }) => {
        const pc = peersRef.current.get(payload.from);
        if (pc) { pc.close(); peersRef.current.delete(payload.from); }
        setViewerCount(peersRef.current.size);
      });

      // Chat
      channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
        setMessages(m => [...m, payload as ChatMsg].slice(-100));
      });

      // Presence – viewer count
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const ids = Object.keys(state).filter(k => k !== myIdRef.current);
        setViewerCount(ids.length);
      });

      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role: 'broadcaster', joined_at: Date.now() });
          // Announce stream is live
          channel.send({ type: 'broadcast', event: 'broadcaster-live', payload: { from: myIdRef.current } });
          setStreaming(true);
          setRole('broadcaster');
          setConnecting(false);
          toast.success('Đã bắt đầu live!');
        }
      });
    } catch (e: any) {
      toast.error('Không bật được camera: ' + e.message);
      setConnecting(false);
      stopAll();
    }
  };

  const createPeerForViewer = async (viewerId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current.set(viewerId, pc);

    localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'broadcaster-ice',
          payload: { to: viewerId, candidate: e.candidate.toJSON() },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        peersRef.current.delete(viewerId);
        setViewerCount(peersRef.current.size);
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'broadcaster-offer',
      payload: { to: viewerId, offer },
    });

    setViewerCount(peersRef.current.size);
  };

  // === VIEWER ===
  const joinAsViewer = async () => {
    setConnecting(true);
    const channel = supabase.channel(`live:${ROOM}`, {
      config: { broadcast: { self: false }, presence: { key: myIdRef.current } },
    });
    channelRef.current = channel;
    let pc: RTCPeerConnection | null = null;

    channel.on('broadcast', { event: 'broadcaster-offer' }, async ({ payload }) => {
      if (payload.to !== myIdRef.current) return;
      pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set('broadcaster', pc);

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          setHasStream(true);
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          channel.send({
            type: 'broadcast',
            event: 'viewer-ice',
            payload: { from: myIdRef.current, candidate: e.candidate.toJSON() },
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      channel.send({
        type: 'broadcast',
        event: 'viewer-answer',
        payload: { from: myIdRef.current, answer },
      });
    });

    channel.on('broadcast', { event: 'broadcaster-ice' }, async ({ payload }) => {
      if (payload.to !== myIdRef.current) return;
      if (pc && payload.candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
      }
    });

    channel.on('broadcast', { event: 'room-full' }, ({ payload }) => {
      if (payload.to === myIdRef.current) {
        toast.error('Phòng đã đủ 10 người xem, vui lòng quay lại sau');
        stopAll();
      }
    });

    channel.on('broadcast', { event: 'broadcaster-live' }, () => {
      // Re-announce that we want to join
      channel.send({ type: 'broadcast', event: 'viewer-join', payload: { from: myIdRef.current } });
    });

    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      setMessages(m => [...m, payload as ChatMsg].slice(-100));
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const ids = Object.keys(state);
      setViewerCount(ids.length - 1); // exclude broadcaster
    });

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ role: 'viewer', joined_at: Date.now() });
        // Announce we want to join
        channel.send({ type: 'broadcast', event: 'viewer-join', payload: { from: myIdRef.current } });
        setRole('viewer');
        setConnecting(false);
        // Wait a bit; if no stream after 4s, show empty state
        setTimeout(() => setConnecting(false), 4000);
      }
    });
  };

  const leaveViewer = () => {
    channelRef.current?.send({ type: 'broadcast', event: 'viewer-leave', payload: { from: myIdRef.current } });
    stopAll();
  };

  const toggleMic = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMuted(!t.enabled); }
  };
  const toggleCam = () => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setCamOff(!t.enabled); }
  };

  const sendChat = () => {
    if (!chatInput.trim() || !channelRef.current) return;
    const msg: ChatMsg = {
      id: crypto.randomUUID(),
      name: chatName.trim() || 'Khách',
      text: chatInput.trim().slice(0, 200),
      ts: Date.now(),
    };
    localStorage.setItem('gn-live-name', msg.name);
    channelRef.current.send({ type: 'broadcast', event: 'chat', payload: msg });
    setMessages(m => [...m, msg].slice(-100));
    setChatInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Live Stream | GIANG NGUYEN SEAFOOD" description="Xem live trực tiếp các phiên giới thiệu hải sản khô Sầm Sơn" />
      <Header />
      <main className="flex-1 container mx-auto px-3 py-4 md:py-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-coral/10 text-coral px-3 py-1.5 rounded-full text-xs font-bold mb-2">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE STREAM
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Phiên live trực tiếp</h1>
          <p className="text-sm text-muted-foreground mt-1">Tối đa {MAX_VIEWERS} người xem cùng lúc · Miễn phí · Không cần đăng ký</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Video panel */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="relative aspect-video bg-black">
              {role === 'broadcaster' ? (
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
              ) : role === 'viewer' ? (
                hasStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-2">
                    {connecting ? <Loader2 className="h-8 w-8 animate-spin" /> : <Tv className="h-12 w-12" />}
                    <p className="text-sm">{connecting ? 'Đang kết nối...' : 'Chờ admin bắt đầu phát sóng'}</p>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
                  <Tv className="h-12 w-12" />
                  <p className="text-sm">Chưa kết nối</p>
                </div>
              )}

              {/* Live badge */}
              {(streaming || hasStream) && (
                <div className="absolute top-3 left-3 bg-coral text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                </div>
              )}

              {/* Viewer count */}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {viewerCount}/{MAX_VIEWERS}
              </div>
            </div>

            {/* Controls */}
            <div className="p-3 flex flex-wrap gap-2 justify-center border-t border-border">
              {!role && (
                <>
                  {isAdmin && (
                    <button onClick={startBroadcast} disabled={connecting}
                      className="bg-coral text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
                      {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
                      Bắt đầu phát sóng
                    </button>
                  )}
                  <button onClick={joinAsViewer} disabled={connecting}
                    className="ocean-gradient text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
                    {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tv className="h-4 w-4" />}
                    Xem live
                  </button>
                </>
              )}

              {role === 'broadcaster' && (
                <>
                  <button onClick={toggleMic}
                    className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 ${muted ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {muted ? 'Bật mic' : 'Tắt mic'}
                  </button>
                  <button onClick={toggleCam}
                    className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 ${camOff ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {camOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    {camOff ? 'Bật cam' : 'Tắt cam'}
                  </button>
                  <button onClick={stopAll}
                    className="bg-destructive text-destructive-foreground font-bold px-4 py-2 rounded-lg text-sm">
                    Dừng phát
                  </button>
                </>
              )}

              {role === 'viewer' && (
                <button onClick={leaveViewer}
                  className="bg-muted text-foreground font-bold px-4 py-2 rounded-lg text-sm">
                  Rời phòng
                </button>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-card rounded-2xl border border-border flex flex-col h-[480px] lg:h-auto lg:max-h-[600px]">
            <div className="p-3 border-b border-border font-bold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Chat trực tiếp
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Chưa có tin nhắn. Hãy là người đầu tiên!</p>
              )}
              {messages.map(m => (
                <div key={m.id} className="text-sm">
                  <span className="font-bold text-primary">{m.name}: </span>
                  <span className="text-foreground break-words">{m.text}</span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border space-y-2">
              <input value={chatName} onChange={e => setChatName(e.target.value)}
                placeholder="Tên hiển thị"
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs" />
              <div className="flex gap-1">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  disabled={!role}
                  placeholder={role ? 'Nhập tin nhắn...' : 'Vào phòng để chat'}
                  className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm disabled:opacity-50" />
                <button onClick={sendChat} disabled={!role || !chatInput.trim()}
                  className="ocean-gradient text-primary-foreground p-2 rounded-md disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
