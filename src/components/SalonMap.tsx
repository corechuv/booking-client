import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useI18n } from '../hooks/useI18n'
import LinkButton from './LinkButton'

const fallbackCoordinates: [number, number] = [52.52072, 13.38798]

const salonMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type SalonMapProps = {
  salonName?: string
  address?: string
  routeUrl?: string
}

function SalonMap({
  salonName = 'Mira Beauty Salon',
  address = 'Berlin, Friedrichstrasse 12',
  routeUrl = '',
}: SalonMapProps) {
  const { t } = useI18n()
  const [coordinates, setCoordinates] = useState<[number, number]>(fallbackCoordinates)

  useEffect(() => {
    let isCancelled = false
    const controller = new AbortController()

    const loadCoordinates = async () => {
      try {
        const query = encodeURIComponent(address)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>
        const first = payload[0]
        if (!first?.lat || !first?.lon || isCancelled) {
          return
        }

        const lat = Number.parseFloat(first.lat)
        const lon = Number.parseFloat(first.lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setCoordinates([lat, lon])
        }
      } catch {
        // Keep fallback coordinates if geocoding is unavailable.
      }
    }

    if (address.trim().length > 0) {
      void loadCoordinates()
    }

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [address])

  const searchUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    [address],
  )

  const directionsUrl = useMemo(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
    [address],
  )

  return (
    <div className="salon-map">
      <div className="salon-map__frame">
        <MapContainer
          key={`${coordinates[0]}:${coordinates[1]}`}
          center={coordinates}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={false}
          className="salon-map__container"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            detectRetina
            maxZoom={20}
          />
          <Marker position={coordinates} icon={salonMarkerIcon}>
            <Popup>{`${salonName}, ${address}`}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="salon-map__address">{address}</p>

      <div className="salon-map__actions">
        <LinkButton
          className="salon-map__link"
          href={routeUrl.trim() || searchUrl}
          target="_blank"
          rel="noreferrer"
          size="sm"
        >
          {t('map.openMap')}
        </LinkButton>
        <LinkButton
          className="salon-map__link"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          size="sm"
        >
          {t('map.openRoute')}
        </LinkButton>
      </div>
    </div>
  )
}

export default SalonMap
