import Widget from 'ninejs/ui/Widget';
import Skin from 'ninejs/ui/Skin';
declare class LoginScreen extends Widget {
    skin: Skin;
    config: any;
    userNameText: HTMLInputElement;
    passwordText: HTMLInputElement;
    loginButton: HTMLInputElement;
    i18n(key: string): any;
    userNameValidation(value: string): boolean;
    passwordValidation(value: string): any;
    onUpdatedSkin(): void;
    constructor(_0: any, config: any);
}
export default LoginScreen;
