import {useContext, useReducer, useEffect} from 'react';
import PropTypes from 'prop-types';
import * as GitHub from '../../../github-client';

function Query({query, variables, normalize = data => data, children}) {
  const client = useContext(GitHub.Context);
  const [state, setState] = useReducer(
    (state, newState) => ({...state, ...newState}),
    {loaded: false, fetching: false, data: null, error: null}, // this initializes state
  );
  // the callback below runs when component is mounted and whenever the 'query' or 'variable' change
  useEffect(
    () => {
      setState({fetching: true});
      client
        .request(query, variables)
        .then(res =>
          setState({
            data: normalize(res),
            error: null,
            loaded: true,
            fetching: false,
          }),
        )
        .catch(error =>
          this.setState({
            error,
            data: null,
            loaded: false,
            fetching: false,
          }),
        );
      // below, the array is essentially componentDidUpdate.
      // If either 'query' or 'variables' change, then we can run this effect
    },
    [query, variables],
  );

  return children(state); // state is var in closure
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
};

export default Query;
