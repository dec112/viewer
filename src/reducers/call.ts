import Action from '../constant/Action';
import messageReducer from './message';
import { Call, AbstractCall } from '../model/CallModel';
import { ReplayInstruction } from '../model/ReplayInstructionModel';
import { CallReplay } from '../model/CallReplayModel';
import DebugService from '../service/DebugService';

export interface ICallState {
    all: Array<Call>,
    replays: Array<ReplayInstruction>,
    selected?: Call,
    callsInitialized: boolean,
}

function getById(arr: Array<AbstractCall>, callId: string): AbstractCall | undefined {
    return arr.find((x: AbstractCall) => x.callId === callId);
}

export function getCallById(state: ICallState, callId: string): Call | undefined {
    return getById(state.all, callId) as Call | undefined;
}

export function getCallReplayById(state: ICallState, callId: string): ReplayInstruction | undefined {
    return getById(state.replays, callId) as ReplayInstruction | undefined;
}

export function tryGetCallById(state: ICallState, callId: string, ifFound: (call: Call) => void) {
    const call = getCallById(state, callId);

    if (call)
        ifFound(call);
    else
        DebugService.getInstance().error(`Call reducer: Could not find callId "${callId}"`);
}

// addOrUpdate allows to add a single call, as well as an array of calls
function addOrUpdate(
    call: AbstractCall | Array<AbstractCall>,
    arr: Array<AbstractCall>,
) {
    if (!Array.isArray(call))
        call = [call];

    call.forEach((call: AbstractCall) => {
        const existing = getById(arr, call.callId);
        if (existing) {
            Object.assign(existing, call);
        }
        else
            arr.push(call);
    });
}

export default (state: ICallState = {
    all: [],
    replays: [],
    selected: undefined,
    callsInitialized: false,
}, payload: any): ICallState => {
    // Create new object, otherwise react will not re-render
    state = { ...state };

    switch (payload.type) {
        case Action.ADD_OR_UPDATE_CALL:
            addOrUpdate(payload.call, state.all);
            break;
        case Action.ADD_OR_UPDATE_CALL_REPLAY:
            addOrUpdate(payload.callReplay, state.replays);
            break;
        case Action.SELECT_CALL:
            state.selected = payload.call
            break;
        case Action.UPDATE_CALL_STATE:
            tryGetCallById(state, payload.callId, (call) => {
                call.stateId = payload.state;
            });
            break;
        case Action.UPDATE_DATA:
            tryGetCallById(state, payload.callId, (call) => {
                call.updateData(payload.data);
            });
            break;
        case Action.SET_DID_STATE:
            tryGetCallById(state, payload.callId, (call) => {
                call.didState = payload.state;
            });
            break;
        case Action.SET_CALLS_INITIALIZED:
            state.callsInitialized = payload.initialized;
            break;
        case Action.TIME_TRAVEL:
            const { callId, progress } = payload;

            const instructions = getCallReplayById(state, callId);
            const replay = getCallById(state, callId) as CallReplay;
            if (!instructions || !replay)
                break;

            replay.erase();

            const messages = instructions.messages;
            if (messages.length === 0)
                break;

            const first = messages[0];
            const last = messages[messages.length - 1];

            const diff = last.received.getTime() - first.received.getTime();
            const duration = diff * progress;
            const travelTo = new Date(first.received.getTime() + duration);

            replay.currentTime = travelTo;
            break;
        default:
            state = messageReducer(state, payload);
            break;
    }

    return state;
};
