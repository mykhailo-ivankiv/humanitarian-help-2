import React, { useState, useRef } from "react";
import { useAsync, useDebounce } from "react-use";
import DatalistSimplified from "./DatalistSimplified";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibmVmb3JtYWwiLCJhIjoiY2phejF2YjhpN2tyMDM0cjE5OTdubmxudSJ9.q0lAGC0rpxDIGfT6NCYloQ";

const cachedGeocoder = {};

type Props<T> = {
  className: string;
  onSelect?: (result: T) => void;
  onTextChange?: (text: string) => void;
};

const Geocoder = <T,>({ className, onTextChange, onSelect }: Props<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  const [, cancel] = useDebounce(
    () => setDebouncedQuery(encodeURIComponent(query)),
    500,
    [query]
  );

  const { value: features = [], loading } = useAsync(async () => {
    // @ts-ignore
    if (cachedGeocoder[debouncedQuery]) return;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${debouncedQuery}.json?access_token=${MAPBOX_TOKEN}`
    );

    const features = (await response.json())?.features || [];

    // @ts-ignore
    cachedGeocoder[debouncedQuery] = features;
    return features;
  }, [debouncedQuery]);

  // @ts-ignore
  return (
    <>
      <input
        className={className}
        type="text"
        ref={inputRef}
        value={query}
        placeholder="Address"
        onChange={({ currentTarget }) => {
          setQuery(currentTarget.value);
          onTextChange?.(currentTarget.value);
        }}
      />

      {inputRef.current && (
        <DatalistSimplified
          isLoading={loading}
          relatedEl={inputRef.current}
          onChange={(data) => {
            // @ts-ignore
            onSelect?.(data);
          }}
          // @ts-ignore
          data={cachedGeocoder[query] || features}
          // @ts-ignore
          mapDataToLabel={({ place_name }) => place_name}
        />
      )}
    </>
  );
};

export default Geocoder;
