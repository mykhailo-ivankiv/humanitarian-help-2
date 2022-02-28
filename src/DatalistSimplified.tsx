import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { test } from 'ramda';
import { useLatest, useToggle } from 'react-use';
import Popover from './Popover';
import { getFilteredIndexesMap } from './helpers/list';
import { escapeRegExp } from './helpers/string';

import './Datalist.css';
import BEM from './helpers/BEM';
const b = BEM('Datalist');

type Props<T = unknown> = {
  relatedEl: HTMLInputElement;
  onChange: (value: T) => void;
  data: T[];
  mapDataToLabel: (data: T) => string;
  isLoading: boolean;
};

// https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-onchange-event-in-react-js/46012210#46012210
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

/**
 * Datalist component try to mimic the native datalist component.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
 *
 * Important: This component is used native event handlers and in some cases modify the `relatedEl`
 *  In some cases it dispatch the `change` event on the `relatedEl`.
 */
const DatalistSimplified = <T,>({isLoading, relatedEl, onChange, data, mapDataToLabel }: Props<T>) => {
  const [isOpen, toggleOpen] = useToggle(false);

  const isOpenRef = useLatest(isOpen);
  const [, forceRender] = useReducer((x) => x + 1, 0);

  const optionsEl = useRef<HTMLDivElement>(null);
  const selectedOptionIndex = useRef<number>(-1);
  const selectedDataIndex = useRef<number>(-1);
  const filteredOptionsIndexes = useRef<number[]>([]);

  const updateView = useCallback(() => {
    forceRender();
    optionsEl.current?.children[selectedOptionIndex.current]?.scrollIntoView({ block: 'center' });
  }, []);

  const mappedData = useMemo<string[]>(() => {
    selectedDataIndex.current = -1
    selectedOptionIndex.current = -1;

    return data.map(mapDataToLabel);
  }, [data]);
  const latestDataRef = useLatest(data);
  const lastMappedDateRef = useLatest(mappedData);


  const handleChange = useCallback(
    (value) => {
      // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-onchange-event-in-react-js/46012210#46012210
      nativeInputValueSetter?.call(relatedEl, mapDataToLabel(value));
      relatedEl?.dispatchEvent(new Event('input', { bubbles: true }));

      toggleOpen(false);
      onChange(value);
    },
    [relatedEl]
  );

  useEffect(() => {
    optionsEl.current?.children[selectedOptionIndex.current]?.scrollIntoView({ block: 'center' });
  }, [isOpen]);

  useEffect(() => {
    [filteredOptionsIndexes.current, selectedOptionIndex.current] = getFilteredIndexesMap(
      mappedData,
      selectedDataIndex.current,
      () => true
    );

    updateView();
  }, [mappedData]);

  const inputEventHandler = useCallback((e: Event) => {
    const regex = new RegExp(escapeRegExp((e.target as HTMLInputElement)?.value), 'i');

    [filteredOptionsIndexes.current, selectedOptionIndex.current] = getFilteredIndexesMap(
      lastMappedDateRef.current,
      selectedDataIndex.current,
      (data) => test(regex, data)
    );

    if (!isOpenRef.current) toggleOpen(true);
    updateView();
  }, []);

  const keydownEventHandler = useCallback((e) => {
    if (!isOpenRef.current) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        toggleOpen(true);
      }

      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      if (selectedOptionIndex.current !== -1) handleChange(latestDataRef.current[selectedDataIndex.current]);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      selectedOptionIndex.current =
        selectedOptionIndex.current + 1 < filteredOptionsIndexes.current.length ? selectedOptionIndex.current + 1 : 0;

      selectedDataIndex.current = filteredOptionsIndexes.current[selectedOptionIndex.current];

      updateView();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedOptionIndex.current =
        selectedOptionIndex.current - 1 >= 0
          ? selectedOptionIndex.current - 1
          : filteredOptionsIndexes.current.length - 1;

      selectedDataIndex.current = filteredOptionsIndexes.current[selectedOptionIndex.current];
      updateView();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      toggleOpen(false);
    }
  }, []);

  const blurEventHandler = useCallback(() => toggleOpen(false), []);
  const focusEventHandler = useCallback(() => toggleOpen(true), []);
  const clickEventHandler = useCallback(() => toggleOpen(true), []);

  useEffect(() => {
    if (!relatedEl) return;

    relatedEl.addEventListener('input', inputEventHandler);
    relatedEl.addEventListener('keydown', keydownEventHandler);
    relatedEl.addEventListener('blur', blurEventHandler);
    relatedEl.addEventListener('focus', focusEventHandler);
    relatedEl.addEventListener('click', clickEventHandler);

    return () => {
      relatedEl.removeEventListener('input', inputEventHandler);
      relatedEl.removeEventListener('keydown', keydownEventHandler);
      relatedEl.removeEventListener('blur', blurEventHandler);
      relatedEl.removeEventListener('focus', focusEventHandler);
      relatedEl.removeEventListener('click', clickEventHandler);
    };
  }, [relatedEl]);

  if (!isOpen) return null;

  return (
    <Popover targetEl={relatedEl}>
      <div className={b({isLoading})} ref={optionsEl}>
          {filteredOptionsIndexes.current.map((dataIndex, optionIndex) => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={dataIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectedDataIndex.current = dataIndex;
                handleChange(data[dataIndex]);
              }}
              className={b('option', { selected: selectedOptionIndex.current === optionIndex })}
            >
              {mappedData[dataIndex]}
            </div>
          ))}
      </div>
    </Popover>
  );
};

export default DatalistSimplified;
