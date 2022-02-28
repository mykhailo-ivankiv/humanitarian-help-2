import React, { useContext, createContext } from 'react';
import { splitAt } from 'ramda';
import { getSubstringEntriesIndices } from './helpers/string';

import './SearchHighlight.css';
import BEM from './helpers/BEM';

const b = BEM('SearchHighlight');

export const SearchHighlightContext = createContext('');

type Props = {
  text: string;
};

const SearchHighlight: React.FC<Props> = ({ text }) => {
  const searchQuery = useContext(SearchHighlightContext);
  const substringEntriesIndices = getSubstringEntriesIndices(text, searchQuery);

  return searchQuery === '' && substringEntriesIndices.length === 0
    ? text
    : substringEntriesIndices
        .reduce(
          ([result, offset], index) => {
            // @ts-ignore
            const last = result.pop();
            // @ts-ignore
            const [prefix, partWithSearchQueryAtStart] = splitAt(index - offset, last);
            const [query, suffix] = splitAt(searchQuery.length, partWithSearchQueryAtStart);

            // @ts-ignore
            result.push(prefix, query, suffix);

            return [result, index + searchQuery.length];
          },
          [[text], 0]
        )[0]
        // @ts-ignore
        .map((str: string, i: number) =>
          i % 2 === 0 ? (
            str
          ) : (
            <mark key={i} className={b()}>
              {str}
            </mark>
          )
        );
};

export default SearchHighlight;
