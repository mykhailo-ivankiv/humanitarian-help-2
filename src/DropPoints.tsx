// @ts-nocheck
/* eslint-disable */
import React, { useState, useReducer, useMemo } from 'react'
import Map, { GeolocateControl, Marker, NavigationControl, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useToggle, useAsync } from 'react-use'
import { StorageType } from './models'
import './DropPoints.css'
import BEM from './helpers/BEM'
import { bbox, points } from '@turf/turf'

const b = BEM('DropPoints')

function DropPoints() {
  const [forceRenderCounter, forceRender] = useReducer((x) => x + 1, 0)
  const [selectedStorage, setSelectedStorage] = useState<StorageType | null>(null)
  const [mapCenter, setMapCenter] = useState({ longitude: 4.86112597768216, latitude: 52.37672704027482 })

  const {
    value: storages = [],
    // error,
    loading,
  } = useAsync(async () => {
    const docs = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/netherlands-humanitarian-drop-points`)
    return await docs.json()
  }, [forceRenderCounter])

  const [, setUserCoords] = React.useState({
    latitude: 0,
    longitude: 0,
  })
  const [showPopup, togglePopup] = useToggle(false)

  const bounds = useMemo(() => {
    if (storages.length === 0) return null

    const features = points(
      storages
        .filter(({ longitude, latitude }) => longitude && latitude)
        .map(({ longitude, latitude }) => [longitude, latitude]),
    )
    const box = bbox(features)
    const southWest = [box[0], box[1]]
    const northEast = [box[2], box[3]]

    return [southWest, northEast]
  }, [storages])

  if (loading) return <div>Loading...</div>

  // @ts-ignore
  return (
    <div className={b()}>
      <div className={b('map')}>
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          initialViewState={{ bounds }}
          longitude={mapCenter.longitude}
          latitude={mapCenter.latitude}
          style={{
            width: '100%',
            height: '100%',
            position: 'sticky',
            top: 0,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          onMove={({ viewState }) => {
            setMapCenter({
              longitude: viewState.longitude,
              latitude: viewState.latitude,
            })
          }}
        >
          <NavigationControl />
          <GeolocateControl
            onGeolocate={({ coords }) =>
              setUserCoords({
                latitude: coords.latitude,
                longitude: coords.longitude,
              })
            }
          />

          {storages.map((storage) => {
            return (
              <Marker
                color={storage.status === 'open' ? '#ff0000' : '#A9A9A9'}
                longitude={storage.longitude}
                latitude={storage.latitude}
                // anchor="bottom"
                onClick={() => {
                  togglePopup(true)
                  setSelectedStorage(storage)
                }}
                style={{ cursor: 'pointer' }}
              />
            )
          })}

          {showPopup && selectedStorage && (
            <Popup
              closeOnClick={false}
              offset={[0, -40]}
              longitude={selectedStorage.longitude}
              latitude={selectedStorage.latitude}
              anchor="bottom"
              onClose={() => {
                togglePopup(false)
              }}
            >
              <dl>
                <dt>Status:</dt>
                <dd>{selectedStorage.status}</dd>

                <dt>Address:</dt>
                <dd>{selectedStorage.address}</dd>

                <dt>Contact:</dt>
                <dd>{selectedStorage.contact}</dd>

                <dt>Reception time:</dt>
                <dd>{selectedStorage.receptionTime}</dd>
              </dl>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  )
}

export default DropPoints
