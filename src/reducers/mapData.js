import Action from '../constant/Action';

export default (state = {locations: []}, payload) => {
    const newState = Object.assign({}, state);
    newState.locations = Array.from(newState.locations);
    const locs = payload.locations;
    switch (payload.type) {
        case Action.ADD_LOCATION:
            if(Array.isArray(locs))
                newState.locations = newState.locations.concat(locs);
            else
                newState.locations.push(locs);
            return newState;
        default:
            return state;
    }
};
