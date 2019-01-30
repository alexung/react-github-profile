import { Component, useContext, useReducer, useEffect } from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'

function Query({ query, variables, children, normalize = data => data }) {
  const client = useContext(Github.Context);
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { loaded: false, fetching: false, data: null, error: null } // this initializes state
  );
  // the callback below runs when component is mounted and whenever the 'query' or 'variable' change
  useEffect(() => {
    setState({ fetching: true })
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
      )
    // below, the array is essentially componentDidUpdate.
    // If either 'query' or 'variables' change, then we can run this effect
  }, [query, variables]);

  return children(state); // state is var in closure
};

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

class Query extends Component {
  // static propTypes = {
  //   query: PropTypes.string.isRequired,
  //   variables: PropTypes.object,
  //   children: PropTypes.func.isRequired,
  //   normalize: PropTypes.func,
  // }
  // static defaultProps = {
  //   normalize: data => data,
  // }
  // static contextType = GitHub.Context

  // state = {loaded: false, fetching: false, data: null, error: null}

  // componentDidMount() {
  //   this._isMounted = true
  //   this.query()
  // }

  // componentDidUpdate(prevProps) {
  //   if (
  //     !isEqual(this.props.query, prevProps.query) ||
  //     !isEqual(this.props.variables, prevProps.variables)
  //   ) {
  //     this.query()
  //   }
  // }

  // componentWillUnmount() {
  //   this._isMounted = false
  // }

  // query() {
  //   this.setState({fetching: true})
  //   const client = this.context
  //   client
  //     .request(this.props.query, this.props.variables)
  //     .then(res =>
  //       this.safeSetState({
  //         data: this.props.normalize(res),
  //         error: null,
  //         loaded: true,
  //         fetching: false,
  //       }),
  //     )
  //     .catch(error =>
  //       this.safeSetState({
  //         error,
  //         data: null,
  //         loaded: false,
  //         fetching: false,
  //       }),
  //     )
  // }

  // safeSetState(...args) {
  //   this._isMounted && this.setState(...args)
  // }

  render() {
    return this.props.children(this.state)
  }
}

export default Query
