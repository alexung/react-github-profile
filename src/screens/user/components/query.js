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

function usePrevious(value) {
  // reference to previousInputs
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useDeepCompareEffect(callback, inputs) {
  // the callback below runs when component is mounted and whenever the 'query' or 'variable' change
  // comparing previous inputs with new ones and, if they're changed, then run the query
  // IMPORTANT: no second arg means that this effect is run on EVERY render.
  // if the prevInputs and curInputs are different, it'll get the most current cleanupRef by setting it to the callback
  // else, it'll just return the most current cleanupRef, even if it's not callback
  const cleanupRef = useRef();
  useEffect(() => {
    if (!isEqual(previousInputs, inputs)) {
      cleanupRef.current = callback();
    }
    return cleanupRef.current;
  });
  // strange that you have to declare it below useEffect() even if it's used inside useEffect(), but alas
  const previousInputs = usePrevious(inputs);
}

function useQuery({query, variables, normalize = data => data}) {
  const client = useContext(GitHub.Context);
  const [state, safeSetState] = useSafeSetState({
    loaded: false,
    fetching: false,
    data: null,
    error: null,
  });

  // the callback below runs when component is mounted and whenever the 'query' or 'variable' change
  useDeepCompareEffect(
    () => {
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
    },
    [query, variables],
  );

  return state; // state is var in closure
}

// simple refactor so we can separate out Query and useQuery logic.
const Query = ({children, ...props}) => children(useQuery(props));

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
};

export default Query;
export {useQuery};
