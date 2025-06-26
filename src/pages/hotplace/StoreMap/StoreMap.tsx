import { useNaverMap } from '@/hooks/useNaverMap';
import { getNearbyCoupons } from '@/apis/coupon/getNearbyCoupons';
import type { PlaceInfo } from '@/types/brand';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import MapPopover from './MapPopover';
import { createMarkerClustering, type MarkerClusteringInstance } from '@/utils/markerClustering';
import { useState, useRef, useEffect, useCallback } from 'react';
import LoadingMooner from '@/pages/common/LoadingMooner';
import { getrawBackgroundColor } from '@/utils/brandColor';

interface StoreMapProps {
  className?: string;
  style?: React.CSSProperties;
  allBrandIds: number[];
  selectedIds: number[];
  onLoadingChange?: (loading: boolean) => void;
  onChangeSelectedIds?: (ids: number[]) => void;
}

interface StoreData {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  brandName: string;
}

// const pinColors = [
//   '#EC4899', // 핑크
//   '#3B82F6', // 블루
//   '#10B981', // 그린
//   '#F59E0B', // 옐로우
//   '#A78BFA', // 퍼플
//   '#EF4444', // 레드
// ];

export default function StoreMap({
  className = '',
  style = {},
  selectedIds,
  allBrandIds,
  onLoadingChange,
  onChangeSelectedIds,
}: StoreMapProps) {
  const [nearbyStores, setNearbyStores] = useState<StoreData[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.503325874722,
    lng: 127.04403462366,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { mapRef, isLoaded, isApiReady, mapInstance, addMarker } = useNaverMap({
    center: { lat: 37.503325874722, lng: 127.04403462366 },
    zoom: 7,
  });

  const markersRef = useRef<naver.maps.Marker[]>([]);
  const markerClusterRef = useRef<MarkerClusteringInstance | null>(null);
  const currentLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const mapEventListenersRef = useRef<naver.maps.MapEventListener[]>([]);
  const markersInitializedRef = useRef(false);

  const openPopover = useCallback((store: StoreData) => {
    setSelectedStore(store);
    setPopoverOpen(true);
  }, []);

  const closePopover = useCallback(() => {
    setSelectedStore(null);
    setPopoverOpen(false);
  }, []);

  // 매장 데이터 호출
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        onLoadingChange?.(true);
        if (!currentLocation) {
          setError('현재 위치 정보가 없습니다.');
          setLoading(false);
          return;
        }

        if (selectedIds.length === 0) {
          setNearbyStores([]);
          setLoading(false);
          return;
        }

        const response = await getNearbyCoupons(
          currentLocation.lat,
          currentLocation.lng,
          selectedIds,
        );

        if (Array.isArray(response)) {
          const stores: StoreData[] = response.map((place: PlaceInfo) => ({
            id: place.id,
            name: place.name,
            address: place.address,
            latitude: place.lat,
            longitude: place.lng,
            brandName: place.brandName,
          }));
          setNearbyStores(stores);
        } else {
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch {
        setError('매장 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    };

    fetchStores();
  }, [currentLocation, selectedIds]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('위치 조회 실패:', error);
        alert('위치 권한이 없거나 위치를 가져올 수 없습니다.');
        setError('위치 권한이 없거나 위치를 가져올 수 없습니다.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const safeCleanupMarkers = useCallback(() => {
    markersRef.current.forEach((marker, index) => {
      try {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      } catch (e) {
        console.warn(`마커 ${index + 1} 제거 중 오류:`, e);
      }
    });
    markersRef.current = [];

    if (currentLocationMarkerRef.current) {
      try {
        if (typeof currentLocationMarkerRef.current.setMap === 'function') {
          currentLocationMarkerRef.current.setMap(null);
        }
      } catch (e) {
        console.warn('현재 위치 마커 제거 중 오류:', e);
      }
      currentLocationMarkerRef.current = null;
    }

    mapEventListenersRef.current.forEach((listener) => {
      try {
        naver.maps.Event.removeListener(listener);
      } catch (e) {
        console.warn('이벤트 리스너 제거 중 오류:', e);
      }
    });
    mapEventListenersRef.current = [];

    if (markerClusterRef.current) {
      try {
        if (typeof markerClusterRef.current.setMap === 'function') {
          markerClusterRef.current.setMap(null);
        }
      } catch (e) {
        console.warn('클러스터 제거 중 오류:', e);
      }
      markerClusterRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isApiReady || !mapInstance) {
      markersInitializedRef.current = false;
      return;
    }

    if (markersInitializedRef.current && markersRef.current.length === nearbyStores.length) return;

    safeCleanupMarkers();

    try {
      if (currentLocation) {
        const locationMarker = addMarker({
          position: { lat: currentLocation.lat, lng: currentLocation.lng },
          title: '현재 위치',
          icon: {
            content: `
              <div style="
                width: 20px;
                height: 20px;
                background: var(--color-brand-red);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(221, 70, 64, 0.4);
                position: relative;
              ">
                <div style="
                  width: 6px;
                  height: 6px;
                  background: white;
                  border-radius: 50%;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                "></div>
              </div>
            `,
            anchor: new naver.maps.Point(10, 10),
          },
        });
        if (locationMarker) currentLocationMarkerRef.current = locationMarker;
      }

      nearbyStores.forEach((store) => {
        console.log(store.brandName);
        const fillColor = getrawBackgroundColor(store.brandName);
        console.log(fillColor);

        const dynamicPinSvg = `
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="${fillColor}"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        `;

        console.log(`Generated SVG with fill color: ${dynamicPinSvg}`);

        const marker = addMarker({
          position: { lat: store.latitude, lng: store.longitude },
          title: store.name,
          icon: {
            content: `
              <div style="
                width: 32px; height: 32px;
                display: flex; align-items: center; justify-content: center;
                border-radius: 50%;
              ">
                ${dynamicPinSvg}
              </div>
            `,
            anchor: new naver.maps.Point(16, 16),
            size: new naver.maps.Size(32, 32),
          },
        });
        if (marker) markersRef.current.push(marker);

        const clickListener = naver.maps.Event.addListener(marker, 'click', (e) => {
          e.domEvent?.stopPropagation();
          openPopover(store);
        });
        mapEventListenersRef.current.push(clickListener);

        const mouseoverListener = naver.maps.Event.addListener(marker, 'mouseover', () => {
          if (mapRef.current) mapRef.current.style.cursor = 'pointer';
        });
        const mouseoutListener = naver.maps.Event.addListener(marker, 'mouseout', () => {
          if (mapRef.current) mapRef.current.style.cursor = '';
        });
        mapEventListenersRef.current.push(mouseoverListener, mouseoutListener);
      });

      if (markersRef.current.length > 0 && mapInstance) {
        markerClusterRef.current = createMarkerClustering(mapInstance, markersRef.current);
      }

      const mapClickListener = naver.maps.Event.addListener(mapInstance, 'click', () => {
        closePopover();
      });
      mapEventListenersRef.current.push(mapClickListener);

      markersInitializedRef.current = true;
    } catch {
      markersInitializedRef.current = false;
    }
  }, [
    isLoaded,
    isApiReady,
    mapInstance,
    nearbyStores,
    currentLocation,
    addMarker,
    openPopover,
    closePopover,
    mapRef,
    safeCleanupMarkers,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingMooner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: '100%', height: '400px', ...style }}
      >
        <div className="text-center">
          <div className="text-red-500 text-sm mb-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-blue-500 hover:underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!isApiReady) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: '100%', height: '400px', ...style }}
      >
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          지도 API 연결 중...
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '500px', ...style }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      <MapControls
        loadingLocation={loadingLocation}
        onGetCurrentLocation={getCurrentLocation}
        brandIds={allBrandIds}
        selectedIds={selectedIds}
        onChangeSelectedIds={onChangeSelectedIds ?? (() => {})}
      />

      <MapLegend popupCount={nearbyStores.length} hasCurrentLocation={!!currentLocation} />

      {selectedStore && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <MapPopover
            store={selectedStore}
            showIndex={false}
            open={popoverOpen}
            onOpenChange={(open: boolean) => {
              if (!open) closePopover();
            }}
          >
            <div style={{ width: '1px', height: '1px', pointerEvents: 'auto' }} />
          </MapPopover>
        </div>
      )}
    </div>
  );
}
