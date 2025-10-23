import { useEffect, useRef } from "react";

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  className?: string;
}

/**
 * Google AdSense 배너 광고 컴포넌트
 * 
 * 사용 전 index.html에 AdSense 스크립트 추가 필요:
 * <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
 */
export const AdSenseBanner = ({ 
  adSlot, 
  adFormat = "auto",
  fullWidthResponsive = true,
  className = ""
}: AdSenseBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // AdSense 광고 로드
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`w-full bg-secondary/30 p-4 rounded-lg text-center ${className}`}>
      <p className="text-xs text-muted-foreground mb-2">광고</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // TODO: 실제 Publisher ID로 교체
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

// TypeScript 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
