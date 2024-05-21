import { autoinject, computedFrom } from "aurelia-framework";

import {
  ValidationController,
  ValidationControllerFactory,
  ValidationRules,
  validateTrigger,
} from "aurelia-validation";

import { AuthService } from "./../auth.service";
import { logInAction } from "../../tools/actions/log-in-action";

@autoinject
export class LogIn {
  public validation: ValidationController;
  private authCode: string;
  public errors = {
    manual: false,
    oauth: false,
  };

  public email: string;
  public password: string;
  public rememberMe = true;
  public loginType = {
    email: true,
  };
  public sliderBtn: HTMLButtonElement;
  public emailInputWrapper: HTMLInputElement;

  constructor(
    private authService: AuthService,
    validationControllerFactory: ValidationControllerFactory
  ) {
    this.validation = validationControllerFactory.createForCurrentScope();
    this.validation.validateTrigger = validateTrigger.change;
    console.log(" ::>> this.validation >>>> ", this.validation);
  }

  public activate(params: { code?: string }): void {
    this.authCode = params?.code;
    this.initValidation();
  }

  private initValidation(): void {
    ValidationRules.ensure("email")
      .required()
      .when(() => this.loginType.email)
      .withMessage("Please enter an Email.")
      .email()
      .withMessage("Please enter a valid Email.")
      .ensure("password")
      .required()
      .withMessage("Please enter a Password.")
      .on(this);
  }

  public attached(): void {
    console.log(" ::>> this.authCode >>>> ", this.authCode);
    if (this.authCode) {
      this.errors = {
        manual: false,
        oauth: false,
      };
      this.triggerLogIn();
    }
  }

  private async triggerLogIn(): Promise<void> {
    try {
      const user = await this.authService.handleOAuthLogInCallback(
        this.authCode
      );
      console.log(" ::>> logged in successfully ");
      if (!user) {
        this.errors.oauth = true;
        this.handleFailure();
        return;
      }
      // this.router.navigate('dashboard');
    } catch (e) {
      console.error("Failed to signIn due to", e);
      this.errors.oauth = true;
      this.handleFailure();
    }
  }

  private handleFailure(): void {
    console.error("Something went wrong >>> ", this.errors);
    // const currentInstruction = this.router.currentInstruction;
    // const { config, params } = currentInstruction;
    // const pathWithoutQueryParams = this.router.generate(config.name, params);
    // this.router.navigate(pathWithoutQueryParams, { replace: true });
    this.authCode = null;
  }

  public manualLogIn(): void {
    console.log(" ::>> manualLogIn >>>> ", this.email, this.password);
    this.errors.manual = null;
    this.errors.oauth = null;
    this.validation.validate().then(async (validation) => {
      console.log(" ::>> validation >>>> ", this.validation);
      if (!validation.valid) return;
      this.authCode = "validuser";
      try {
        const user = await this.authService.authenticateWithCredentials(
          this.password,
          this.loginType.email ? this.email : null
        );
      } catch (e) {
        console.error("Failed to signIn due to", e);
        this.errors.manual = true;
        this.handleFailure();
        this.authCode = null;
      }
    });
  }

  public enableEmailLogIn(): void {
    this.loginType.email = true;
    this.emailInputWrapper.classList.remove("hidden");
    this.validation.reset();
  }

  public transitioned() {
    console.log(" ::>> transitioned >>>> ");
  }

  @computedFrom("authCode")
  public get actionsDisabled(): boolean {
    return !!this.authCode;
  }
}
