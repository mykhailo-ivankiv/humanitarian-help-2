// @ts-nocheck
/* eslint-disable */
import React, { useMemo } from 'react'
import Map, { GeolocateControl, Marker, NavigationControl, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAsync } from 'react-use'
import './DropPoints.css'
import BEM from './helpers/BEM'
import { bbox, points } from '@turf/turf'
import { Spin } from 'antd'
import 'antd/dist/antd.css'
import { useNavigate, useParams } from 'react-router-dom'

const b = BEM('DropPoints')

function DropPoints() {
  const navigate = useNavigate()
  const { storageId } = useParams()

  const { value: storages = [], loading } = useAsync(async () => {
    const docs = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/netherlands-humanitarian-drop-points`)
    return await docs.json()
  }, [])

  const selectedStorage = useMemo(() => {
    if (!storageId || storages?.length === 0) return null

    return storages.find((storage) => storage.id === storageId)
  }, [storages, storageId])

  const [, setUserCoords] = React.useState({
    latitude: 0,
    longitude: 0,
  })

  const bounds = useMemo(() => {
    if (!storages || storages.length === 0) return null

    const features = points(
      storages
        ?.filter(({ longitude, latitude }) => longitude && latitude)
        .map(({ longitude, latitude }) => [longitude, latitude]),
    )
    const box = bbox(features)
    const southWest = [box[0], box[1]]
    const northEast = [box[2], box[3]]

    return [southWest, northEast]
  }, [storages])

  return (
    <div className={b()}>
      <div className={b('map', { loading })}>
        {loading ? (
          <Spin className={b('map-spinner')} size="large" />
        ) : (
          <Map
            key={JSON.stringify(bounds)}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            initialViewState={
              selectedStorage
                ? {
                    longitude: selectedStorage.longitude,
                    latitude: selectedStorage.latitude,
                    zoom: 13,
                  }
                : {
                    bounds,
                    fitBoundsOptions: null,
                  }
            }
            style={{
              width: '100%',
              height: '100%',
              position: 'sticky',
              top: 0,
            }}
            mapStyle="mapbox://styles/mapbox/streets-v9"
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

            {storages?.map((storage) => {
              return (
                <Marker
                  key={storage.id}
                  color={storage.status === 'open' ? '#ff0000' : '#A9A9A9'}
                  longitude={storage.longitude}
                  latitude={storage.latitude}
                  // anchor="bottom"
                  onClick={() => {
                    navigate(`/${storage.id}`)
                  }}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}

            {selectedStorage && (
              <Popup
                closeOnClick={false}
                offset={[0, -40]}
                longitude={selectedStorage.longitude}
                latitude={selectedStorage.latitude}
                anchor="bottom"
                onClose={() => {
                  navigate(`/`)
                }}
              >
                {selectedStorage.status === 'open' ? (
                  <dl>
                    <dt>Address:</dt>
                    <dd>{selectedStorage.address}</dd>

                    <dt>Contact:</dt>
                    <dd>{selectedStorage.contact}</dd>

                    <dt>Reception time:</dt>
                    <dd>{selectedStorage.receptionTime}</dd>
                  </dl>
                ) : (
                  <span>Temporary not available</span>
                )}
              </Popup>
            )}
          </Map>
        )}
      </div>
    </div>
  )
}

export default DropPoints
