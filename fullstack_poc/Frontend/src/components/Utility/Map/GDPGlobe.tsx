import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import React, { useEffect, useRef, useState } from 'react';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import { emitErrorNotification } from '@/lib/helpers';

import countryData from './country-data.json';

interface IGDPGlobeProps {
  campfireId?: string;
}

const GDPGlobe = ({ campfireId }: IGDPGlobeProps) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Globe when component mounts on client
  useEffect(() => {
    const initializeGlobe = async () => {
      if (isClient && globeRef.current && !globeInstance.current) {
        try {
          setErrorMessage('Loading Globe.gl library...');

          // Try loading Globe.gl with fallback strategies
          let Globe;
          try {
            const GlobeModule = await import('globe.gl');
            Globe = GlobeModule.default || GlobeModule;
          } catch (importError) {
            setErrorMessage('Trying CDN fallback...');

            // CDN fallback
            if (!window.Globe) {
              await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/globe.gl';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
              });
            }
            Globe = window.Globe;
          }

          if (!Globe) {
            throw new Error('Could not load Globe.gl library');
          }

          setErrorMessage('Initializing globe instance...');

          // Wait for DOM to be ready
          await new Promise((resolve) => setTimeout(resolve, 200));

          if (!globeRef.current) {
            throw new Error('Globe container element not available');
          }

          // GDP per capita calculation (avoiding countries with small pop)
          const getVal = (feat: any) =>
            feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

          // Filter out Antarctica and get max value for color scale
          const validCountries = countryData.features.filter(
            (d) => d.properties.ISO_A2 !== 'AQ',
          );
          const maxVal = Math.max(...validCountries.map(getVal));

          // Create color scale
          const colorScale = scaleSequentialSqrt(interpolateYlOrRd);
          colorScale.domain([0, maxVal]);

          globeInstance.current = new Globe(globeRef.current)
            .globeImageUrl('/images/earth-night.jpg')
            .backgroundImageUrl('/images/night-sky.png')
            .backgroundColor('#000011')
            .width(700)
            .height(400)
            .lineHoverPrecision(0);

          // Add data in a separate step
          setTimeout(() => {
            if (globeInstance.current && countryData.features) {
              try {
                globeInstance.current
                  .polygonsData(validCountries)
                  .polygonAltitude(0.06)
                  .polygonCapColor((feat: any) => colorScale(getVal(feat)))
                  .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
                  .polygonStrokeColor(() => '#111')
                  .polygonLabel(
                    ({ properties: d }: any) => `
                    <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
                    GDP: <i>${d.GDP_MD_EST || 'N/A'}</i> M$<br/>
                    Population: <i>${d.POP_EST ? d.POP_EST.toLocaleString() : 'N/A'}</i>
                  `,
                  )
                  .onPolygonHover((hoverD: any) => {
                    if (globeInstance.current) {
                      globeInstance.current
                        .polygonAltitude((d: any) =>
                          d === hoverD ? 0.12 : 0.06,
                        )
                        .polygonCapColor((d: any) =>
                          d === hoverD ? 'steelblue' : colorScale(getVal(d)),
                        );
                    }
                  })
                  .polygonsTransitionDuration(300);

                setErrorMessage('');
              } catch (dataError) {
                console.error('Error adding GDP data to globe:', dataError);
                setErrorMessage(
                  `Error loading globe data: ${dataError instanceof Error ? dataError.message : 'Unknown error'}`,
                );
              }
            }
          }, 500);
        } catch (error) {
          setErrorMessage(
            `Globe initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          emitErrorNotification('Failed to initialize GDP globe');
        }
      }
    };

    initializeGlobe();

    // Cleanup function
    return () => {
      if (globeInstance.current && globeInstance.current._destructor) {
        globeInstance.current._destructor();
        globeInstance.current = null;
      }
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="mt-20">
        <TabletLoader />
      </div>
    );
  }

  return (
    <div
      ref={globeRef}
      className="w-[700px] h-[400px]"
      style={{
        margin: '0 auto',
        background: '#000011', // Dark space background
        border: '1px solid #333', // Add border for debugging
      }}
    />
  );
};

export default GDPGlobe;
