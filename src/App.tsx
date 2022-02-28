// @ts-nocheck
/* eslint-disable */
import React, { useState, useReducer } from "react";
import Map, {
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { useToggle, useAsync } from "react-use";
import { collection, getDocs } from "@firebase/firestore";
import { db } from "./initFirebase";
import "./App.css";
import BEM from "./helpers/BEM";
import AddStorage from "./AddStorage";
import Storage from "./Storage";
import { StorageType } from "./models";

const b = BEM("App");

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmVmb3JtYWwiLCJhIjoiY2phejF2YjhpN2tyMDM0cjE5OTdubmxudSJ9.q0lAGC0rpxDIGfT6NCYloQ";

function App() {
  const [forceRenderCounter, forceRender] = useReducer((x) => x + 1, 0);
  const [selectedStorage, setSelectedStorage] = useState<StorageType | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState({
    longitude: 4.86112597768216,
    latitude: 52.37672704027482,
  });
  const [newStorageMarker, setNewStorageMarker] = useState({});

  const {
    value: storages = [],
    // error,
    loading,
  } = useAsync(async () => {
    const storageCollection = collection(db, "storages");
    const storages = await getDocs(storageCollection);

    return storages.docs
      .map((doc) => ({ ...doc.data() }))
      .map((storage) => ({
        ...storage,
        createdAt: new Date(storage.createdAt),
        updatedAt: new Date(storage.updatedAt),
      }))
      .sort((a, b) => {
        console.log(a.createdAt, b.createdAt);
        return b.createdAt - a.createdAt;
      });
  }, [forceRenderCounter]);

  console.log(storages);

  const [, setUserCoords] = React.useState({
    latitude: 0,
    longitude: 0,
  });
  const [showPopup, togglePopup] = useToggle(false);
  const [isAdding, toggleAdding] = useToggle(false);

  // @ts-ignore
  return (
    <div className={b()}>
      <div className={b("sidebar")}>
        {isAdding ? (
          <AddStorage
            onLocationSelected={(location) => {
              setNewStorageMarker(location);
              setMapCenter(location);
            }}
            onCreate={() => {
              forceRender();
              toggleAdding(false);
            }}
          />
        ) : (
          <button onClick={() => toggleAdding(true)}> add new store</button>
        )}

        <div
          style={{
            opacity: loading ? 0.7 : 1,
          }}
        >
          {storages.map((storage) => (
            <Storage
              key={storage.id}
              storage={storage}
              isSelected={selectedStorage === storage}
              onSelect={(storage) => {
                console.log(storage);
                setSelectedStorage(storage);
                togglePopup(true);
                setMapCenter({
                  latitude: storage.latitude,
                  longitude: storage.longitude,
                });
              }}
            />
          ))}
        </div>
      </div>

      <div className={b("map")}>
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            ...mapCenter,
            zoom: 14,
          }}
          longitude={mapCenter.longitude}
          latitude={mapCenter.latitude}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          onMove={({ viewState }) => {
            setMapCenter({
              longitude: viewState.longitude,
              latitude: viewState.latitude,
            });
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

          {newStorageMarker.longitude &&
            newStorageMarker.latitude &&
            isAdding && (
              <Marker
                color={"#ff0000"}
                longitude={newStorageMarker.longitude}
                latitude={newStorageMarker.latitude}
              />
            )}

          {storages.map((storage) => {
            return (
              <Marker
                longitude={storage.longitude}
                latitude={storage.latitude}
                anchor="bottom"
                onClick={() => {
                  togglePopup(true);
                  setSelectedStorage(storage);
                }}
                style={{
                  cursor: "pointer",
                  //   width: '40px',
                  //   height: '40px',
                  //   backgroundImage: `url(${syringe})`,
                  //   backgroundSize: 'cover',
                  //   backgroundRepeat: 'no-repeat',
                  //   backgroundPosition: 'center',
                }}
              >
                {/*<img src="" alt=""/>*/}
              </Marker>
            );
          })}

          {showPopup && selectedStorage && (
            <Popup
              closeOnClick={false}
              offset={[0, -40]}
              longitude={selectedStorage.longitude}
              latitude={selectedStorage.latitude}
              anchor="bottom"
              onClose={() => {
                togglePopup(false);
              }}
            >
              {selectedStorage.address}
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}

export default App;
