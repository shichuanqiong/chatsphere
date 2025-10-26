import React, { useState, useEffect, useRef } from 'react';

function unsplashUrl() {
  const tags = [
    "black and white portrait",
    "black and white city street",
    "black and white fashion",
    "black and white mood",
    "black and white architecture",
    "black and white dramatic"
  ];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(tag)}&t=${Date.now()}`;
}

function picsumUrl() {
  const r = Math.floor(Math.random() * 1e8);
  return `https://picsum.photos/1600/900?grayscale&blur=1&random=${r}`;
}

function getNextUrl() {
  return Math.random() < 0.8 ? unsplashUrl() : picsumUrl();
}

async function preloadImg(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject();
    img.src = url;
  });
}

const RotatingBackground: React.FC = () => {
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [bgNextStyle, setBgNextStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const isInitialMount = useRef(true);

  useEffect(() => {
    let isMounted = true;

    const switchBg = async () => {
      if (!isMounted) return;
      let url = getNextUrl();
      try {
        url = await preloadImg(url);
      } catch {
        url = picsumUrl();
      }
      if (!isMounted) return;

      if (isInitialMount.current) {
        setBgStyle({ backgroundImage: `url("${url}")`, opacity: 1 });
        isInitialMount.current = false;
      } else {
        setBgNextStyle({ backgroundImage: `url("${url}")`, opacity: 1 });
        setBgStyle(prev => ({ ...prev, opacity: 0 }));

        setTimeout(() => {
          if (!isMounted) return;
          setBgStyle({ backgroundImage: `url("${url}")`, opacity: 1 });
          setBgNextStyle({ opacity: 0 });
        }, 1000);
      }
    };

    switchBg();
    const intervalId = setInterval(switchBg, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <div className="bg" style={bgStyle}></div>
      <div className="bg-next" style={bgNextStyle}></div>
    </>
  );
};

export default RotatingBackground;
