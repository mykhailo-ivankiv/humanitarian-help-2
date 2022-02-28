// @ts-nocheck
import React from "react";
import "./Storage.css";
import BEM from "./helpers/BEM";
import { StorageType } from "./models";

const b = BEM("Storage");

type Props = {
  storage: StorageType;
  onSelect: (storage: StorageType) => void;
  isSelected: boolean;
};

const Storage: React.FC<Props> = ({ storage, isSelected, onSelect }) => {
  return (
    <div
      className={b({ selected: isSelected })}
      onClick={() => onSelect(storage)}
    >
      {storage.description}
    </div>
  );
};

export default Storage;
