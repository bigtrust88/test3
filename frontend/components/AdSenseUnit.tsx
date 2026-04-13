/**
 * AdSenseUnit 컴포넌트
 * Google AdSense 광고 유닛
 */

'use client';

import { useEffect } from 'react';

interface AdSenseUnitProps {
  adSlot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  fullWidth?: boolean;
}

export function AdSenseUnit({
  adSlot,
  format = 'auto',
  fullWidth = false,
}: AdSenseUnitProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
          google_ad_client: 'ca-pub-3811219422484638',
          enable_page_level_ads: true,
        });
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const styleObj: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
  };

  if (fullWidth) {
    styleObj.width = '100%';
  }

  return (
    <div style={styleObj}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          width: fullWidth ? '100%' : '728px',
          height: format === 'vertical' ? '600px' : format === 'horizontal' ? '90px' : 'auto',
        }}
        data-ad-client="ca-pub-3811219422484638"
        data-ad-slot={adSlot}
        data-ad-format={format}
      />
    </div>
  );
}
