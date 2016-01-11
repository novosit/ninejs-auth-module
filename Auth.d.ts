import { PromiseType } from 'ninejs/core/deferredUtils';
import { NineJs } from 'ninejs/modules/ninejs-server';
import { default as WebServer } from 'ninejs/modules/webserver/WebServer';
export interface Result {
    result: string;
}
export interface LoginResult extends Result {
    id?: string;
    [name: string]: any;
}
export interface AuthImpl {
    login(username: string, password: string, domain?: any, callback?: (data: any) => void): PromiseType<any>;
    usersByPermission(permissions: string[]): PromiseType<any>;
    users(): PromiseType<any>;
    permissions(): PromiseType<any>;
    getUser(username: string): PromiseType<any>;
}
declare class Auth implements AuthImpl {
    on(): any;
    emit(type: string, data: any): any;
    config: any;
    impl: AuthImpl;
    login(username: string, password: string, domain?: any, callback?: (data: any) => void): Promise<any>;
    usersByPermission(permissions: string[]): Promise<any>;
    users(): Promise<any>;
    permissions(): Promise<any>;
    getUser(username: string): Promise<any>;
    constructor(config: any, ninejs: NineJs, webserver: WebServer, impl: AuthImpl);
}
export default Auth;
