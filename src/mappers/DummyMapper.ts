import { IMapper, } from "./IMapper";
import { ISecurityProvider } from "../security-provider";

export class DummyMapper implements IMapper {
  convertRequest(method: string, requestUrl: string, request: any) {
    return request;
  }
  convertResponse(requestUrl: string, response: any, securityProvider: ISecurityProvider, method?: string) {
    return response;
  }
}