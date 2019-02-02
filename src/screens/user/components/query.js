import {useContext, useReducer, useEffect, useRef} from 'react';
import {isEqual} from 'lodash';
import PropTypes from 'prop-types';

import * as GitHub from '../../../github-client';

// taking out a hook from the main Query component (useSetState is a hook)
function useSetState(initialState) {
  const [state, setState] = useReducer(
    (state, newState) => ({...state, ...newState}),
    initialState, // this initializes state
  );
  return [state, setState];
}

// taking out a hook from the main Query component (useSafeSetState is a hook)
function useSafeSetState(initialState) {
  const [state, setState] = useSetState(initialState);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []); // because we're passing in empty arr as second arg to useEffect, it's only run once.  No variables to track.

  // checks for if the component is mounted and, if so, then it runs a setState on the mounted component
  const safeSetState = (...args) => mountedRef.current && setState(...args);
  return [state, safeSetState];
}

function Query({query, variables, normalize = data => data, children}) {
  const client = useContext(GitHub.Context);
  const [state, safeSetState] = useSafeSetState({
    loaded: false,
    fetching: false,
    data: null,
    error: null,
  });

  // the callback below runs when component is mounted and whenever the 'query' or 'variable' change
  useEffect(() => {
    // comparing previous inputs with new ones and, if they're changed, then run the query
    if (isEqual(previousInputs.current, [query, variables])) return;

    safeSetState({fetching: true});
    client
      .request(query, variables)
      .then(res =>
        safeSetState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        safeSetState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      );
    // ensured that effects are called every time by removing the [query, variables] as 2nd arg in useEffect
    // below, the array is essentially componentDidUpdate.
    // If either 'query' or 'variables' change, then we can run this effect
  });

  // reference to previousInputs
  const previousInputs = useRef();
  useEffect(() => {
    previousInputs.current = [query, variables];
  });
  return children(state); // state is var in closure
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
};

export default Query;
