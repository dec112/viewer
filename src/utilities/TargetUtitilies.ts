import { TargetType } from "../constant/TargetType";
import { Call } from "../model/CallModel";
import ConfigService from "../service/ConfigService";

export interface Target {
  id: string,
  // language object
  // TODO: LanguageObjects should be strongly typed
  title: any,
  type: string,
  targetUri: string,
}

const getPossibility = (target: Target, newTargetUri: string): Target => {
  return {
    ...target,
    targetUri: newTargetUri,
  };
}

// always depends on the call, whether an alternative target can be used or not
export const getPossibleTargets = (call: Call): Target[] => {
  // if call does not have original target URI this means PSAP does not support
  // switching between targets
  if (!call.targetUri)
    return [];

  const targets: Target[] = ConfigService.get('alternativeTargets');
  const possible: Target[] = [];

  // one possible target is always the original target itself
  possible.push({
    id: TargetType.INITIAL,
    targetUri: call.callerUri,
    // TODO: use constant here
    title: 'DEC112',
    type: TargetType.INITIAL,
  });

  for (const t of targets) {
    switch (t.type) {
      case TargetType.PHONE:
        if (call.displayName)
          possible.push(getPossibility(t, t.targetUri.replace('{value}', call.displayName)));
        break;
    }
  }

  return possible;
}