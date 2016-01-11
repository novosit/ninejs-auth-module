import Properties from 'ninejs/core/ext/Properties';
import { RemovableType } from 'ninejs/core/on';
import Frame from 'ninejs/modules/client/FullScreenFrame';
import { Router, Route } from 'ninejs/client/router';
import LoginScreen from "./LoginScreen";
export interface RouteArguments {
    route?: string;
    action?: (e: any) => any;
    [name: string]: any;
}
export interface PermissionsFunction {
    (permissions: string[]): boolean;
}
declare class Auth extends Properties {
    on(type: string, listener: (e?: any) => any): RemovableType;
    emit(type: string, data: any): any;
    loginScreen: LoginScreen;
    config: any;
    data: Properties;
    frame: Frame;
    router: Router;
    logout(): Promise<boolean>;
    register(route: string, action: (e: any) => any, permissions: string[], routeArguments: RouteArguments): Route;
    login(): Promise<{}>;
    enableLoginScreen(): Promise<void>;
    authenticationStatus(requiredPermissions: (string[] | PermissionsFunction)): Promise<boolean>;
    hasAllPermissions(permissions: string[]): boolean;
    hasPermission(permission: string): boolean;
    constructor(config: any, router: Router, frame: Frame);
    init(): Promise<void>;
}
export default Auth;
