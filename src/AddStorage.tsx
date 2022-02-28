// @ts-nocheck
import React from "react";
import { Formik, Form, Field } from "formik";
import { collection, addDoc } from "@firebase/firestore";
import { db } from "./initFirebase";
import Geocoder from "./Geocoder";
import "./Form.css";
import BEM from "./helpers/BEM";

const bForm = BEM("Form");

type Props = {
  onLocationSelected: (
    location: null | {
      latitude: number;
      longitude: number;
    }
  ) => void;
  onCreate: (storage: Storage) => void;
};

const AddStorage: React.FC<Props> = ({ onLocationSelected, onCreate }) => {
  return (
    <Formik<Storage>
      initialValues={{
        name: "",
        description: "",
        // @ts-ignore
        address: "",
        longitude: null,
        latitude: null,
      }}
      onSubmit={async (values) => {
        const storageCollection = collection(db, "storages");
        const doc = await addDoc(storageCollection, {
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        onCreate(doc);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
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
                // @ts-ignore
                const [longitude, latitude] = data.center;

                setFieldValue("longitude", longitude);
                setFieldValue("latitude", latitude);
                setFieldValue("address", data.place_name);

                onLocationSelected({ latitude, longitude });
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Add"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default AddStorage;
