// @ts-nocheck
import React, { useState } from "react";
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
import { Formik, Form, Field } from "formik";
import Geocoder from "./Geocoder";
import "./App.css";
import "./Form.css";
import BEM from "./helpers/BEM";

const b = BEM("App");
const bForm = BEM("Form");

type Storage = {
  description: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmVmb3JtYWwiLCJhIjoiY2phejF2YjhpN2tyMDM0cjE5OTdubmxudSJ9.q0lAGC0rpxDIGfT6NCYloQ";

function App() {
  const [selectedStorage, setSelectedStorage] = useState<Storage | null>(null);
  const [mapCenter, setMapCenter] = useState({
    longitude: 4.86112597768216,
    latitude: 52.37672704027482,
  });
  const [newStorageMarker, setNewStorageMarker] = useState({});
  const {
    value: storages = [],
    error,
    loading,
  } = useAsync(async () => {
    const storageCollention = collection(db, "storages");
    const storages = await getDocs(storageCollention);

    return storages.docs.map((doc) => ({ ...doc.data() })) as Storage[];
  });

  const [userGeolocale, setUserCoords] = React.useState({
    latitude: 0,
    longitude: 0,
  });
  const [showPopup, togglePopup] = useToggle(false);

  // @ts-ignore
  return (
    <div className={b()}>
      <div className={b("sidebar")}>
        <button
          onClick={() => {
            setMapCenter({
              longitude: 4.86112597768216,
              latitude: 52.37672704027482,
            });
          }}
        >
          Canter
        </button>

        <Formik<Storage>
          initialValues={{
            name: "",
            description: "",
            // @ts-ignore
            address: "",
            longitude: null,
            latitude: null,
          }}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          {({ setFieldValue, values }) => (
            <Form className={bForm()}>
              <label className={bForm("field")}>
                <span className={bForm("label")}>Name:</span>
                <Field className={bForm("input")} name="name" />
              </label>

              <label className={bForm("field")}>
                <span className={bForm("label")}>Location:</span>
                <Geocoder
                  className={bForm("input")}
                  onSelect={(data) => {
                    console.log("Data!", data);
                    // @ts-ignore
                    const [longitude, latitude] = data.center;

                    setFieldValue("longitude", longitude);
                    setFieldValue("latitude", latitude);

                    setNewStorageMarker({ longitude, latitude })
                    setMapCenter({ longitude, latitude });
                  }}
                />
              </label>

              <label className={bForm("field")}>
                <span className={bForm("label")}>Description:</span>
                <Field
                  className={bForm("textarea")}
                  name="description"
                  as="textarea"
                />
              </label>

              <button type="submit">Add</button>
            </Form>
          )}
        </Formik>
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
          onMove={({viewState}) => {
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


          {newStorageMarker.longitude && newStorageMarker.latitude && (
            <Marker longitude={newStorageMarker.longitude} latitude={newStorageMarker.latitude} />
          )}

          {/*{storages.map((storage) => (*/}
          {/*  <Marker*/}
          {/*    longitude={4.86112597768216}*/}
          {/*    latitude={52.37672704027482}*/}
          {/*    anchor="bottom"*/}
          {/*    onClick={() => {*/}
          {/*      togglePopup();*/}
          {/*      setSelectedStorage(storage);*/}
          {/*    }}*/}
          {/*    // style={{*/}
          {/*    //   cursor: 'pointer',*/}
          {/*    //   width: '40px',*/}
          {/*    //   height: '40px',*/}
          {/*    //   backgroundImage: `url(${syringe})`,*/}
          {/*    //   backgroundSize: 'cover',*/}
          {/*    //   backgroundRepeat: 'no-repeat',*/}
          {/*    //   backgroundPosition: 'center',*/}
          {/*    // }}*/}
          {/*  >*/}
          {/*    /!*<img src="" alt=""/>*!/*/}
          {/*  </Marker>*/}
          {/*))}*/}

          {showPopup && selectedStorage && (
            <Popup
              closeOnClick={false}
              offset={[0, -40]}
              longitude={selectedStorage.location.longitude}
              latitude={selectedStorage.location.latitude}
              anchor="bottom"
              onClose={() => {
                togglePopup(false);
              }}
            >
              {selectedStorage.description}
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}

export default App;
