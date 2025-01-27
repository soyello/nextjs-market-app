import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  setCustomValue?: (id: string, value: number) => void;
  detailPage?: boolean;
}

const KakaoMap = ({ latitude, longitude, setCustomValue, detailPage = false }: KakaoMapProps) => {
  const handleClick = (mouseEvent: kakao.maps.event.MouseEvent) => {
    if (detailPage) return;
    setCustomValue!('latitude', mouseEvent.latLng.getLat());
    setCustomValue!('longitude', mouseEvent.latLng.getLng());
  };

  return (
    <Map
      center={{ lat: latitude, lng: longitude }}
      style={{ width: '100%', height: '360px' }}
      onClick={(_, mouseEvnet) => handleClick(mouseEvnet)}
    >
      <MapMarker position={{ lat: latitude, lng: longitude }}>
        <div style={{ color: '#000' }}>Hello</div>
      </MapMarker>
    </Map>
  );
};

export default KakaoMap;
