export type MaltaCam = {
  id: string;
  title: string;
  place: string;
  channelId: string;
  videoId: string;
};

export const MALTA_CAMS: MaltaCam[] = [
  {
    id: "harbour",
    title: "Grand Harbour",
    place: "Valletta · Birgu",
    channelId: "UCOaftBNU_PWVFLkR2LY3LPg",
    videoId: "fo4AwBLoCgo",
  },
  {
    id: "skyline",
    title: "Malta skyline",
    place: "Birds Eye View",
    channelId: "UC_JDyw-vsFmwJ35tojTiFeA",
    videoId: "lb3WryTZthg",
  },
  {
    id: "golden",
    title: "Golden Bay",
    place: "Mellieħa",
    channelId: "UCswyCUg2EN1MIz0vDTzLqug",
    videoId: "nUiLly2Lr3E",
  },
];

export function camThumb(cam: MaltaCam, bust = 0) {
  const base = `https://i.ytimg.com/vi/${cam.videoId}/hq720.jpg`;
  return bust ? `${base}?v=${bust}` : base;
}

export function camEmbedSrc(cam: MaltaCam, large = false) {
  const params = new URLSearchParams({
    channel: cam.channelId,
    autoplay: "1",
    mute: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    controls: large ? "1" : "0",
    iv_load_policy: "3",
    fs: large ? "1" : "0",
    enablejsapi: "1",
  });
  // Channel live_stream stays current when YouTube rotates the video id.
  return `https://www.youtube.com/embed/live_stream?${params}`;
}

export function camWatchUrl(cam: MaltaCam) {
  return `https://www.youtube.com/watch?v=${cam.videoId}`;
}
